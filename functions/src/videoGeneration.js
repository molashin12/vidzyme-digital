/* eslint-disable max-len */
const { z } = require('zod');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fetch = require('node-fetch');
const { vertexAI } = require('./index');

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vidzyme.firebasestorage.app';

// Input/Output schemas
const VideoGenerationInput = z.object({
  scenes: z.array(z.object({
    id: z.string(),
    imageUrl: z.string(),
    videoPrompt: z.string(),
    duration: z.number().optional(),
    transitions: z.string().optional(),
    negativePrompt: z.string().optional(),
    referenceFrameUrl: z.string().optional().describe('Reference frame URL for video continuity')
  })),
  overallTheme: z.string(),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
  quality: z.enum(['standard', 'high']).default('high'),
  model: z.enum(['veo-3.0-generate-preview', 'veo-3.0-fast-generate-preview']).default('veo-3.0-generate-preview'),
  personGeneration: z.enum(['allow_all', 'allow_adult', 'dont_allow']).default('allow_adult'),
  enableFrameContinuity: z.boolean().optional().default(false).describe('Enable frame-to-frame continuity')
});

const VideoGenerationOutput = z.object({
  generatedVideos: z.array(z.object({
    sceneId: z.string(),
    videoUrl: z.string(),
    duration: z.number(),
    prompt: z.string(),
    status: z.enum(['completed', 'failed', 'processing']),
    metadata: z.object({
      width: z.number(),
      height: z.number(),
      format: z.string(),
      size: z.number(),
      fps: z.number()
    })
  })),
  totalVideos: z.number(),
  processingTime: z.number(),
  finalVideoUrl: z.string().optional()
});

// Main video generation function
async function generateVideos(input) {
  const { scenes, overallTheme, aspectRatio, quality, model, personGeneration } = input;
  const startTime = Date.now();

  try {
    const generatedVideos = [];

    // Process each scene sequentially to avoid rate limits
    for (const scene of scenes) {
      try {
        console.log(`Generating video for scene: ${scene.id}`);

        // Enhance the video prompt
        const enhancedPrompt = enhanceVideoPrompt(scene.videoPrompt, overallTheme, quality);

        // Use reference frame if provided, otherwise use the original image
        const imageUrl = scene.referenceFrameUrl || scene.imageUrl;
        console.log(`Using image for video generation: ${imageUrl}`);

        // Download and convert image to base64
        const imageBase64 = await downloadImageAsBase64(imageUrl);

        // Get the generative model from Vertex AI
        const generativeModel = vertexAI.getGenerativeModel({
          model: model,
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7
          }
        });

        // Prepare the request for video generation
        const request = {
          contents: [{
            role: 'user',
            parts: [
              {
                text: enhancedPrompt
              },
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            aspectRatio: aspectRatio,
            personGeneration: personGeneration
          }
        };

        if (scene.negativePrompt) {
          request.contents[0].parts.push({
            text: `Negative prompt: ${scene.negativePrompt}`
          });
        }

        // Generate video using Vertex AI Veo 3
        const result = await generativeModel.generateContent(request);

        if (result.response && result.response.candidates && result.response.candidates[0]) {
          const candidate = result.response.candidates[0];

          // Look for video data in the response
          let videoData = null;
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('video/')) {
              videoData = part.inlineData.data;
              break;
            }
          }

          if (videoData) {
            // Save video to Google Cloud Storage
            const fileName = `generated-videos/${scene.id}-${uuidv4()}.mp4`;
            const file = storage.bucket(bucketName).file(fileName);

            const videoBuffer = Buffer.from(videoData, 'base64');

            await file.save(videoBuffer, {
              metadata: {
                contentType: 'video/mp4',
                metadata: {
                  sceneId: scene.id,
                  prompt: enhancedPrompt,
                  aspectRatio: aspectRatio,
                  generatedAt: new Date().toISOString(),
                  theme: overallTheme,
                  model: model
                }
              }
            });

            // Make the file publicly accessible
            await file.makePublic();

            const videoUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

            // Get video metadata
            const [metadata] = await file.getMetadata();
            const dimensions = getVideoDimensions(aspectRatio);

            generatedVideos.push({
              sceneId: scene.id,
              videoUrl: videoUrl,
              duration: scene.duration || 5, // Default 5 seconds
              prompt: enhancedPrompt,
              status: 'completed',
              metadata: {
                width: dimensions.width,
                height: dimensions.height,
                format: 'mp4',
                size: parseInt(metadata.size) || 0,
                fps: 24
              }
            });

            console.log(`Video generated successfully for scene: ${scene.id}`);
          } else {
            throw new Error('No video data found in response');
          }
        } else {
          throw new Error('No valid response from video generation model');
        }
      } catch (error) {
        console.error(`Error generating video for scene ${scene.id}:`, error);

        // Add failed entry
        generatedVideos.push({
          sceneId: scene.id,
          videoUrl: '',
          duration: scene.duration || 5,
          prompt: scene.videoPrompt,
          status: 'failed',
          metadata: {
            width: 0,
            height: 0,
            format: 'mp4',
            size: 0,
            fps: 24
          }
        });
      }
    }

    const processingTime = Date.now() - startTime;

    // Optionally combine videos into a single final video
    let finalVideoUrl;
    const successfulVideos = generatedVideos.filter((v) => v.status === 'completed');

    if (successfulVideos.length > 1) {
      try {
        finalVideoUrl = await combineVideos(successfulVideos, overallTheme);
      } catch (combineError) {
        console.warn('Failed to combine videos:', combineError.message);
      }
    } else if (successfulVideos.length === 1) {
      finalVideoUrl = successfulVideos[0].videoUrl;
    }

    return {
      generatedVideos,
      totalVideos: generatedVideos.length,
      processingTime,
      finalVideoUrl
    };
  } catch (error) {
    console.error('Video generation error:', error);
    throw new Error(`Failed to generate videos: ${error.message}`);
  }
}

// Helper function to enhance video prompts
function enhanceVideoPrompt(basePrompt, theme, quality) {
  const qualityEnhancements = {
    standard: 'smooth motion, clear video quality',
    high: 'ultra smooth motion, cinematic quality, professional video production, 4K quality'
  };

  return `${basePrompt}. Theme: ${theme}. ${qualityEnhancements[quality]}. Smooth camera movements, professional cinematography.`;
}

// Helper function to download image as base64
async function downloadImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error(`Failed to download image from ${imageUrl}: ${error.message}`);
  }
}

// Helper function to get video dimensions for Veo 3
function getVideoDimensions(aspectRatio) {
  const dimensions = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 }
  };

  return dimensions[aspectRatio] || dimensions['16:9'];
}

// Helper function to combine multiple videos
async function combineVideos(videos, theme) {
  try {
    // Call the Cloud Run FFmpeg service to combine videos
    const ffmpegServiceUrl = process.env.FFMPEG_SERVICE_URL || 'https://ffmpeg-service-url';

    const response = await axios.post(`${ffmpegServiceUrl}/combine-videos`, {
      videos: videos.map((v) => ({
        url: v.videoUrl,
        duration: v.duration,
        sceneId: v.sceneId
      })),
      outputSettings: {
        format: 'mp4',
        quality: 'high',
        transitions: true,
        theme: theme
      }
    }, {
      timeout: 300000 // 5 minutes timeout
    });

    return response.data.combinedVideoUrl;
  } catch (error) {
    console.error('Error combining videos:', error);
    throw new Error(`Failed to combine videos: ${error.message}`);
  }
}

module.exports = {
  generateVideos,
  VideoGenerationInput,
  VideoGenerationOutput
};
