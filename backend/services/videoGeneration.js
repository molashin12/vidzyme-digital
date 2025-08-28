const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
// const fetch = require('node-fetch'); // Removed - using axios instead
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs'); // Still needed for other operations
const path = require('path'); // Still needed for other operations
const { getStorageBucket } = require('../config/firebase');

// Get Firebase Storage bucket
const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vidzyme.firebasestorage.app';

// Input/Output schemas
const VideoGenerationInput = z.object({
  videoPrompt: z.string(),
  generatedImageUrl: z.string(),
  aspectRatio: z.enum(['16:9']).default('16:9'), // Veo 3 currently only supports 16:9
  numberOfVideos: z.number().min(1).max(8), // Number of sequential 8-second videos to generate
  personGeneration: z.enum(['allow_adult']).default('allow_adult') // Veo 3 Image-to-video only supports 'allow_adult'
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

/**
 * Main video generation function using Veo 3
 * @param {Object} input - Video generation parameters
 * @returns {Object} Generated video data with metadata
 */
async function generateVideos(input) {
  const { videoPrompt, generatedImageUrl, aspectRatio, numberOfVideos, personGeneration } = VideoGenerationInput.parse(input);
  const startTime = Date.now();
  const model = 'veo-3.0-fast-generate-preview';

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
          aspectRatio: '16:9', // Veo 3 currently only supports 16:9
          personGeneration: personGeneration
        }
      });

      console.log('Initial operation object:', JSON.stringify(operation, null, 2));

      // Poll the operation status until the video is ready
      let pollAttempts = 0;
      const maxPollAttempts = 60; // 10 minutes maximum (60 * 10 seconds)

      while (!operation.done && pollAttempts < maxPollAttempts) {
        console.log(`Waiting for video ${i + 1} generation to complete... (attempt ${pollAttempts + 1}/${maxPollAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        pollAttempts++;

        // Poll the operation status using the proper SDK method
        try {
          operation = await ai.operations.getVideosOperation({ operation });
          console.log(`Operation status update:`, JSON.stringify({ done: operation.done, name: operation.name }, null, 2));
        } catch (error) {
          console.warn(`Failed to poll operation status: ${error.message}`);
          // Continue with the loop, don't break on polling errors
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

        // Download the video using direct HTTP request and stream directly to Firebase Storage
        console.log(`Downloading video from URI for video ${i + 1}`);
        
        // Define file variable outside try block
        const bucket = getStorageBucket();
        const file = bucket.file(fileName);
        
        try {
          const videoUri = generatedVideo.video.uri;
          console.log('Video URI:', videoUri);
          
          // Download video data using axios with API key as query parameter
          const downloadUrl = `${videoUri}&key=${process.env.GEMINI_API_KEY}`;
          const response = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 300000 // 5 minutes timeout
          });
          
          if (!response.data) {
            throw new Error('No video data received from download');
          }
          
          console.log(`Downloaded video data: ${response.data.byteLength} bytes`);
          
          const videoBuffer = Buffer.from(response.data);
          
          await file.save(videoBuffer, {
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
          
          console.log(`Video ${i + 1} uploaded directly to Firebase Storage`);
          
          // Make the file publicly accessible
          await file.makePublic();
        } catch (error) {
          console.log('Video download/upload error:', error.message);
          console.log('Video object:', JSON.stringify(generatedVideo.video, null, 2));
          throw error;
        }

        const videoUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
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

/**
 * Helper function to extract last frame from video using FFmpeg
 * @param {string} videoUrl - URL of the video
 * @param {number} videoIndex - Index of the video for logging
 * @returns {string} URL of the extracted frame
 */
async function extractLastFrame(videoUrl, videoIndex) {
  try {
    // Call the Cloud Run FFmpeg service to extract last frame
    const ffmpegServiceUrl = process.env.FFMPEG_SERVICE_URL;

    if (!ffmpegServiceUrl) {
      throw new Error('FFMPEG_SERVICE_URL environment variable is not set');
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

/**
 * Helper function to download image as base64 with MIME type detection
 * @param {string} imageUrl - URL of the image to download
 * @returns {Object} Object containing base64 data and MIME type
 */
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
      // Fallback: detect from URL extension
      const urlLower = imageUrl.toLowerCase();
      if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (urlLower.includes('.png')) {
        mimeType = 'image/png';
      } else if (urlLower.includes('.webp')) {
        mimeType = 'image/webp';
      } else {
        mimeType = 'image/jpeg'; // Default fallback
      }
    }
    
    return { base64, mimeType };
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error(`Failed to download image from ${imageUrl}: ${error.message}`);
  }
}

/**
 * Helper function to get video dimensions for Veo 3
 * @param {string} aspectRatio - Aspect ratio of the video
 * @returns {Object} Width and height dimensions
 */
function getVideoDimensions(aspectRatio) {
  const dimensions = {
    '16:9': { width: 1280, height: 720 }, // Veo 3 outputs 720p
    '9:16': { width: 720, height: 1280 }
  };

  return dimensions[aspectRatio] || dimensions['16:9'];
}

/**
 * Helper function to combine multiple videos
 * @param {Array} videoUrls - Array of video URLs to combine
 * @param {string} aspectRatio - Aspect ratio for the final video
 * @returns {string} URL of the combined video
 */
async function combineVideos(videoUrls, aspectRatio) {
  try {
    // Call the Cloud Run FFmpeg service to combine videos
    const ffmpegServiceUrl = process.env.FFMPEG_SERVICE_URL;

    if (!ffmpegServiceUrl) {
      throw new Error('FFMPEG_SERVICE_URL environment variable is not set');
    }

    // Generate unique output filename
    const outputFileName = `combined-video-${Date.now()}.mp4`;

    const response = await axios.post(`${ffmpegServiceUrl}/concatenate-sequential-videos`, {
      clipUrls: videoUrls,
      outputFileName: outputFileName,
      transitions: false // No transitions for seamless concatenation
    }, {
      timeout: 600000 // 10 minutes timeout for longer videos
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

module.exports = {
  generateVideos,
  extractLastFrame,
  VideoGenerationInput,
  VideoGenerationOutput
};