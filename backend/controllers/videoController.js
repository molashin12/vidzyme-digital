const { z } = require('zod');
const { getFirestore, getStorageBucket, admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
// const fetch = require('node-fetch'); // Removed - using axios instead
const { GoogleGenerativeAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// Import the complete orchestration pipeline
const { createVideo, VideoCreationInput, VideoCreationOutput } = require('../services/orchestration');
const { analyzeImage } = require('../services/imageAnalysis');
const { generatePrompts } = require('../services/promptGeneration');
const { generateImageFromPrompt } = require('../services/imageGeneration');
const { generateVideoPrompts } = require('../services/videoPromptGeneration');
const { extractFrames } = require('../services/frameExtraction');

// Helper functions to get Firebase services when needed
const getDB = () => getFirestore();
const getBucket = () => getStorageBucket();

// Input/Output schemas
const VideoGenerationInput = z.object({
  videoPrompt: z.string(),
  generatedImageUrl: z.string(),
  aspectRatio: z.enum(['16:9']).default('16:9'),
  numberOfVideos: z.number().min(1).max(2),
  personGeneration: z.enum(['allow_all', 'allow_adult', 'dont_allow']).default('allow_adult')
});

const VideoGenerationOutput = z.object({
  finalVideoUrl: z.string(),
  duration: z.number(),
  numberOfVideos: z.number(),
  processingTime: z.number(),
  metadata: z.object({
    width: z.number(),
    height: z.number(),
    format: z.string(),
    size: z.number(),
    fps: z.number()
  })
});

// Complete video creation pipeline (main endpoint)
const createVideoComplete = async (req, res) => {
  try {
    console.log('Starting complete video creation pipeline...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user.uid);

    // Add userId to the input
    const inputWithUserId = {
      ...req.body,
      userId: req.user.uid
    };

    // Validate input using the orchestration schema
    const validatedInput = VideoCreationInput.parse(inputWithUserId);
    
    // Run the complete video creation pipeline
    const result = await createVideo(validatedInput);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json({
        error: {
          message: result.error || 'Failed to create video',
          status: 500
        }
      });
    }
    
  } catch (error) {
    console.error('Complete video creation error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to create video',
        status: 500
      }
    });
  }
};

// Generate video with Genkit (legacy endpoint)
const generateVideoWithGenkit = async (req, res) => {
  try {
    console.log('Starting video generation with Genkit...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user.uid);

    // Validate input
    const validatedInput = VideoGenerationInput.parse(req.body);
    
    // Generate videos
    const result = await generateVideos(validatedInput);
    
    // Save video metadata to Firestore
    const videoDoc = {
      userId: req.user.uid,
      videoUrl: result.finalVideoUrl,
      prompt: validatedInput.videoPrompt,
      imageUrl: validatedInput.generatedImageUrl,
      duration: result.duration,
      numberOfVideos: result.numberOfVideos,
      processingTime: result.processingTime,
      metadata: result.metadata,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    };
    
    const docRef = await getDB().collection('videos').add(videoDoc);
    
    res.status(200).json({
      success: true,
      videoId: docRef.id,
      ...result
    });
    
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to generate video',
        status: 500
      }
    });
  }
};

// Main video generation function
async function generateVideos(input) {
  const { videoPrompt, generatedImageUrl, aspectRatio, numberOfVideos, personGeneration } = input;
  const startTime = Date.now();
  const model = 'veo-3.0-generate-preview';

  try {
    const videoUrls = [];
    let currentImageUrl = generatedImageUrl;

    // Initialize Google GenAI client
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    // Generate videos sequentially
    for (let i = 0; i < numberOfVideos; i++) {
      console.log(`Generating video ${i + 1} of ${numberOfVideos}`);

      // Download and convert image to base64
      const imageData = await downloadImageAsBase64(currentImageUrl);

      // Generate 8-second video using Veo 3 with image input
      let operation = await ai.models.generateVideos({
        model: model,
        prompt: videoPrompt,
        image: {
          imageBytes: imageData.base64,
          mimeType: imageData.mimeType
        },
        config: {
          aspectRatio: '16:9',
          personGeneration: personGeneration
        }
      });

      console.log('Initial operation object:', JSON.stringify(operation, null, 2));

      // Poll the operation status until the video is ready
      let pollAttempts = 0;
      const maxPollAttempts = 60; // 10 minutes maximum

      while (!operation.done && pollAttempts < maxPollAttempts) {
        console.log(`Waiting for video ${i + 1} generation to complete... (attempt ${pollAttempts + 1}/${maxPollAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        pollAttempts++;

        // Poll the operation status using the proper SDK method
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
          console.log(`Operation status update:`, JSON.stringify({ done: operation.done, name: operation.name }, null, 2));
        } catch (error) {
          console.warn(`Failed to poll operation status: ${error.message}`);
        }
      }

      if (pollAttempts >= maxPollAttempts && !operation.done) {
        throw new Error(`Video generation timed out after ${maxPollAttempts * 10} seconds`);
      }

      console.log('Operation completed:', JSON.stringify(operation, null, 2));

      if (operation.response && operation.response.generatedVideos && operation.response.generatedVideos[0]) {
        const generatedVideo = operation.response.generatedVideos[0];

        console.log('Generated video object:', JSON.stringify(generatedVideo, null, 2));

        // Check if video property exists
        if (!generatedVideo.video) {
          throw new Error(`Video property not found in generated video object. Available properties: ${Object.keys(generatedVideo).join(', ')}`);
        }

        // Create a unique filename for this video segment
        const fileName = `generated-videos/video-${i + 1}-${uuidv4()}.mp4`;

        // Download the video using the correct method
        const tempLocalPath = path.join(__dirname, '..', 'temp', `temp-video-${i + 1}-${Date.now()}.mp4`);
        
        // Ensure temp directory exists
        const tempDir = path.dirname(tempLocalPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        await ai.files.download({
          file: generatedVideo.video,
          downloadPath: tempLocalPath
        });

        // Upload to Cloud Storage
        const file = getBucket().file(fileName);
        await file.save(fs.readFileSync(tempLocalPath), {
          metadata: {
            contentType: 'video/mp4',
            metadata: {
              videoIndex: i + 1,
              prompt: videoPrompt,
              aspectRatio: aspectRatio,
              generatedAt: new Date().toISOString(),
              model: model
            }
          }
        });

        // Clean up temp file
        fs.unlinkSync(tempLocalPath);

        // Make the file publicly accessible
        await file.makePublic();

        const videoUrl = `https://storage.googleapis.com/${getBucket().name}/${fileName}`;
        videoUrls.push(videoUrl);

        console.log(`Video ${i + 1} generated successfully: ${videoUrl}`);

        // Extract last frame for next video (if not the last video)
        if (i < numberOfVideos - 1) {
          currentImageUrl = await extractLastFrame(videoUrl, i + 1);
          console.log(`Extracted last frame for next video: ${currentImageUrl}`);
        }
      } else {
        throw new Error(`No valid response from video generation model for video ${i + 1}`);
      }
    }

    // Combine all videos into final video
    const finalVideoUrl = await combineVideos(videoUrls, aspectRatio);
    const dimensions = getVideoDimensions(aspectRatio);
    const totalDuration = numberOfVideos * 8; // 8 seconds per video

    const processingTime = Date.now() - startTime;

    return {
      finalVideoUrl,
      duration: totalDuration,
      numberOfVideos,
      processingTime,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        format: 'mp4',
        size: 0, // Will be updated after final video is created
        fps: 24
      }
    };
  } catch (error) {
    console.error('Video generation error:', error);
    throw new Error(`Failed to generate videos: ${error.message}`);
  }
}

// Helper function to extract last frame from video using FFmpeg
async function extractLastFrame(videoUrl, videoIndex) {
  try {
    const ffmpegServiceUrl = process.env.CLOUD_RUN_FFMPEG_URL;

    if (!ffmpegServiceUrl) {
      throw new Error('CLOUD_RUN_FFMPEG_URL environment variable is not set');
    }

    const response = await axios.post(`${ffmpegServiceUrl}/extract-frame`, {
      videoUrl: videoUrl,
      framePosition: 'last',
      outputFormat: 'png'
    }, {
      timeout: 60000 // 1 minute timeout
    });

    if (!response.data.frameUrl) {
      throw new Error('No frame URL returned from FFmpeg service');
    }

    return response.data.frameUrl;
  } catch (error) {
    console.error(`Error extracting last frame from video ${videoIndex}:`, error);
    throw new Error(`Failed to extract last frame: ${error.message}`);
  }
}

// Helper function to download image as base64 with MIME type detection
async function downloadImageAsBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    const buffer = Buffer.from(response.data);
    const base64 = buffer.toString('base64');
    
    // Get MIME type from response headers or detect from URL
    let mimeType = response.headers['content-type'];
    if (!mimeType) {
      const urlLower = imageUrl.toLowerCase();
      if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (urlLower.includes('.png')) {
        mimeType = 'image/png';
      } else if (urlLower.includes('.webp')) {
        mimeType = 'image/webp';
      } else {
        mimeType = 'image/jpeg';
      }
    }
    
    return { base64, mimeType };
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error(`Failed to download image from ${imageUrl}: ${error.message}`);
  }
}

// Helper function to get video dimensions for Veo 3
function getVideoDimensions(aspectRatio) {
  const dimensions = {
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 720, height: 1280 }
  };

  return dimensions[aspectRatio] || dimensions['16:9'];
}

// Helper function to combine multiple videos
async function combineVideos(videoUrls, aspectRatio) {
  try {
    const ffmpegServiceUrl = process.env.CLOUD_RUN_FFMPEG_URL;

    if (!ffmpegServiceUrl) {
      throw new Error('CLOUD_RUN_FFMPEG_URL environment variable is not set');
    }

    const outputFileName = `combined-video-${Date.now()}.mp4`;

    const response = await axios.post(`${ffmpegServiceUrl}/concatenate-sequential-videos`, {
      clipUrls: videoUrls,
      outputFileName: outputFileName,
      transitions: false
    }, {
      timeout: 600000 // 10 minutes timeout
    });

    if (!response.data.finalVideoUrl) {
      throw new Error('No final video URL returned from FFmpeg service');
    }

    return response.data.finalVideoUrl;
  } catch (error) {
    console.error('Error combining videos:', error);
    throw new Error(`Failed to combine videos: ${error.message}`);
  }
}

// Additional controller methods for other endpoints
const generateVideo = async (req, res) => {
  res.status(501).json({
    error: {
      message: 'This endpoint is deprecated. Use /generate-with-genkit instead.',
      status: 501
    }
  });
};

const generateSequentialVideo = async (req, res) => {
  // This can be implemented later if needed
  res.status(501).json({
    error: {
      message: 'Sequential video generation not implemented yet.',
      status: 501
    }
  });
};

const extractFramesEndpoint = async (req, res) => {
  try {
    const { videoUrl, framePosition = 'last', outputFormat = 'png' } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }

    const result = await extractFrames({ videoUrl, framePosition, outputFormat });
    res.status(200).json(result);
  } catch (error) {
    console.error('Frame extraction error:', error);
    res.status(500).json({ error: error.message });
  }
};

const analyzeImageEndpoint = async (req, res) => {
  try {
    const { imageUrl, analysisType = 'comprehensive' } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const result = await analyzeImage({ imageUrl, analysisType });
    res.status(200).json(result);
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: error.message });
  }
};

const generatePromptEndpoint = async (req, res) => {
  try {
    const { imageAnalysis, userPrompt } = req.body;
    
    if (!imageAnalysis || !userPrompt) {
      return res.status(400).json({ error: 'imageAnalysis and userPrompt are required' });
    }

    const result = await generatePrompts({ imageAnalysis, userPrompt });
    res.status(200).json(result);
  } catch (error) {
    console.error('Prompt generation error:', error);
    res.status(500).json({ error: error.message });
  }
};

const generateVideoPromptEndpoint = async (req, res) => {
  try {
    const { imageAnalysis, userInstructions, generatedImageUrl, aspectRatio = '16:9' } = req.body;
    
    if (!imageAnalysis || !userInstructions || !generatedImageUrl) {
      return res.status(400).json({ error: 'imageAnalysis, userInstructions, and generatedImageUrl are required' });
    }

    const result = await generateVideoPrompts({ 
      imageAnalysis, 
      userInstructions, 
      generatedImageUrl, 
      aspectRatio 
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Video prompt generation error:', error);
    res.status(500).json({ error: error.message });
  }
};

const generateImageEndpoint = async (req, res) => {
  try {
    const { imagePrompt, referenceImageUrl } = req.body;
    
    if (!imagePrompt || !referenceImageUrl) {
      return res.status(400).json({ error: 'imagePrompt and referenceImageUrl are required' });
    }

    const result = await generateImageFromPrompt(imagePrompt, referenceImageUrl);
    res.status(200).json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getVideoStatus = async (req, res) => {
  res.status(501).json({
    error: {
      message: 'Video status checking not implemented yet.',
      status: 501
    }
  });
};

const listUserVideos = async (req, res) => {
  try {
    const videosRef = getDB().collection('videos')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50);
    
    const snapshot = await videosRef.get();
    const videos = [];
    
    snapshot.forEach(doc => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      videos,
      total: videos.length
    });
  } catch (error) {
    console.error('Error listing user videos:', error);
    res.status(500).json({
      error: {
        message: 'Failed to list videos',
        status: 500
      }
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Get video document
    const videoDoc = await getDB().collection('videos').doc(videoId).get();
    
    if (!videoDoc.exists) {
      return res.status(404).json({
        error: {
          message: 'Video not found',
          status: 404
        }
      });
    }
    
    const videoData = videoDoc.data();
    
    // Check if user owns the video
    if (videoData.userId !== req.user.uid) {
      return res.status(403).json({
        error: {
          message: 'Unauthorized to delete this video',
          status: 403
        }
      });
    }
    
    // Delete from Firestore
    await getDB().collection('videos').doc(videoId).delete();
    
    res.status(200).json({
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete video',
        status: 500
      }
    });
  }
};

module.exports = {
  createVideoComplete,
  generateVideo,
  generateVideoWithGenkit,
  generateSequentialVideo,
  extractFrames: extractFramesEndpoint,
  analyzeImage: analyzeImageEndpoint,
  generatePrompt: generatePromptEndpoint,
  generateVideoPrompt: generateVideoPromptEndpoint,
  generateImage: generateImageEndpoint,
  getVideoStatus,
  listUserVideos,
  deleteVideo
};