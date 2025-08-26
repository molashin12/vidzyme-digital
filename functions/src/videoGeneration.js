/* eslint-disable max-len */
const { z } = require('zod');
const { defineFlow } = require('@genkit-ai/flow');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const fetch = require('node-fetch');

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vidzyme-digital.appspot.com';

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

// Define the video generation flow
const videoGenerationFlow = defineFlow(
    {
      name: 'videoGeneration',
      inputSchema: VideoGenerationInput,
      outputSchema: VideoGenerationOutput
    },
    async (input) => {
      const { scenes, overallTheme, aspectRatio, quality, model, personGeneration } = input;
      const startTime = Date.now();

      try {
      // Initialize Google GenAI client
        const genAI = new GoogleGenAI({});
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

            // Download and convert image to bytes
            const imageBytes = await downloadImageAsBytes(imageUrl);

            // Generate video using Veo 3
            let operation = await genAI.models.generateVideos({
              model: model,
              prompt: enhancedPrompt,
              negativePrompt: scene.negativePrompt,
              image: {
                imageBytes: imageBytes,
                mimeType: 'image/png'
              },
              aspectRatio: aspectRatio,
              personGeneration: personGeneration
            });

            // Poll the operation status until the video is ready
            while (!operation.done) {
              console.log(`Waiting for video generation to complete for scene: ${scene.id}...`);
              await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
              operation = await genAI.operations.getVideosOperation({ operation });
            }

            if (operation.response && operation.response.generatedVideos && operation.response.generatedVideos.length > 0) {
              const videoFile = operation.response.generatedVideos[0].video;

              // Download the video file using Google GenAI SDK
              const fileName = `generated-videos/${scene.id}-${uuidv4()}.mp4`;
              const localPath = `/tmp/${fileName}`;

              // Download video file to local storage first
              await genAI.files.download({
                file: videoFile,
                downloadPath: localPath
              });

              // Read the downloaded file and upload to Google Cloud Storage
              const fs = require('fs').promises;
              const videoData = await fs.readFile(localPath);

              const file = storage.bucket(bucketName).file(fileName);

              await file.save(videoData, {
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

              // Clean up temporary file
              try {
                await fs.unlink(localPath);
              } catch (cleanupError) {
                console.warn('Failed to cleanup temporary file:', cleanupError);
              }

              // Make the file publicly accessible
              await file.makePublic();

              const videoUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

              // Get video metadata
              const [metadata] = await file.getMetadata();
              const dimensions = getVideoDimensions(aspectRatio);

              generatedVideos.push({
                sceneId: scene.id,
                videoUrl: videoUrl,
                duration: 5, // Veo 3 generates ~5 second videos
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
              throw new Error('No video generated in response');
            }
          } catch (error) {
            console.error(`Error generating video for scene ${scene.id}:`, error);

            // Add failed entry
            generatedVideos.push({
              sceneId: scene.id,
              videoUrl: '',
              duration: 5,
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
);

// Helper function to enhance video prompts
function enhanceVideoPrompt(basePrompt, theme, quality) {
  const qualityEnhancements = {
    standard: 'smooth motion, clear video quality',
    high: 'ultra smooth motion, cinematic quality, professional video production, 4K quality'
  };

  return `${basePrompt}. Theme: ${theme}. ${qualityEnhancements[quality]}. Smooth camera movements, professional cinematography.`;
}

// Helper function to download image as bytes
async function downloadImageAsBytes(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
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

module.exports = { videoGenerationFlow };
