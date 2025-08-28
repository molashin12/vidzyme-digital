const { z } = require('zod');
const { analyzeImage } = require('./imageAnalysis');
const { generatePrompts } = require('./promptGeneration');
const { generateImageFromPrompt } = require('./imageGeneration');
const { generateVideoPrompts } = require('./videoPromptGeneration');
const { generateVideos } = require('./videoGeneration');
const admin = require('firebase-admin');

// Input/Output schemas for the main orchestration flow
const VideoCreationInput = z.object({
  imageUrl: z.string().url().describe('URL of the input image (also used as reference image)'),
  userPrompt: z.string().describe('User-provided prompt or theme for the video'),
  duration: z.number().min(8).max(64).default(8).describe('Video duration in seconds (must be multiple of 8)'),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
  userId: z.string().describe('User ID for tracking and storage')
});

const VideoCreationOutput = z.object({
  success: z.boolean(),
  videoId: z.string(),
  finalVideoUrl: z.string().optional(),
  duration: z.number(),
  numberOfVideos: z.number(),
  metadata: z.object({
    totalDuration: z.number(),
    processingTime: z.number(),
    imageAnalysis: z.object({
      labels: z.array(z.string()),
      summary: z.string()
    }),
    theme: z.string()
  }),
  error: z.string().optional()
});

/**
 * Main video creation function that orchestrates the entire pipeline
 * @param {Object} input - Video creation parameters
 * @returns {Object} Video creation result with metadata
 */
async function createVideo(input) {
  // Validate and parse input using Zod schema
  const {
    imageUrl,
    userPrompt,
    duration,
    aspectRatio,
    userId
  } = VideoCreationInput.parse(input);

  // Use imageUrl as referenceImageUrl
  const referenceImageUrl = imageUrl;

  const startTime = Date.now();
  const videoId = `video_${userId}_${Date.now()}`;

  try {
    console.log(`Starting video creation flow for user: ${userId}`);

    // Step 1: Analyze the input image
    console.log('Step 1: Analyzing input image...');
    const imageAnalysis = await analyzeImage({
      imageUrl,
      analysisType: 'comprehensive'
    });

    console.log('Image analysis completed:', {
      labels: imageAnalysis.labels.length,
      objects: imageAnalysis.objects.length,
      summary: imageAnalysis.summary.substring(0, 100) + '...'
    });

    // Step 2: Generate image prompt
    console.log('Step 2: Generating image prompt...');
    const promptGeneration = await generatePrompts({
      imageAnalysis: {
        labels: imageAnalysis.labels,
        objects: imageAnalysis.objects,
        summary: imageAnalysis.summary
      },
      userPrompt
    });

    console.log('Image prompt generation completed:', {
      imagePrompt: promptGeneration.image_prompt.substring(0, 100) + '...'
    });

    // Step 3: Generate image using prompt from promptGeneration and reference image
    console.log('Step 3: Generating image using generated prompt and reference image...');

    // Use the image_prompt from promptGeneration output
    const imagePrompt = promptGeneration.image_prompt;

    if (!imagePrompt) {
      throw new Error('No image prompt generated from promptGeneration step');
    }

    console.log('Using image prompt:', imagePrompt);
    console.log('Reference image URL:', referenceImageUrl);

    const imageGeneration = await generateImageFromPrompt(
        imagePrompt,
        referenceImageUrl
    );

    const generatedImageUrl = imageGeneration.imageUrl;

    console.log('Image generation completed:', {
      imageUrl: generatedImageUrl
    });

    // Step 4: Generate video prompt
    console.log('Step 4: Generating video prompt...');
    const videoPromptGeneration = await generateVideoPrompts({
      imageAnalysis: imageAnalysis.summary,
      userInstructions: userPrompt,
      generatedImageUrl: generatedImageUrl,
      aspectRatio: aspectRatio
    });

    console.log('Video prompt generation completed:', {
      videoPrompt: videoPromptGeneration.video_prompt.substring(0, 100) + '...',
      aspectRatio: videoPromptGeneration.aspect_ratio_video
    });

    // Step 5: Generate sequential videos
    console.log('Step 5: Generating sequential videos...');

    // Calculate number of 8-second videos needed
    const numberOfVideos = Math.ceil(duration / 8);

    console.log(`Generating ${numberOfVideos} videos of 8 seconds each for total duration of ${duration} seconds...`);
    const videoGeneration = await generateVideos({
      videoPrompt: videoPromptGeneration.video_prompt,
      generatedImageUrl: generatedImageUrl,
      aspectRatio: aspectRatio,
      numberOfVideos: numberOfVideos
    });

    console.log('Video generation completed:', {
      numberOfVideos: videoGeneration.numberOfVideos,
      duration: videoGeneration.duration,
      finalVideoUrl: videoGeneration.finalVideoUrl
    });

    // Prepare the final response
    const totalProcessingTime = Date.now() - startTime;

    // Store metadata in Firestore for tracking
    await storeVideoMetadata({
      videoId,
      userId,
      userPrompt,
      imageUrl,
      aspectRatio,
      duration: videoGeneration.duration,
      numberOfVideos: videoGeneration.numberOfVideos,
      processingTime: totalProcessingTime,
      finalVideoUrl: videoGeneration.finalVideoUrl,
      createdAt: new Date()
    });

    const result = {
      success: true,
      videoId,
      duration: videoGeneration.duration,
      numberOfVideos: videoGeneration.numberOfVideos,
      metadata: {
        totalDuration: videoGeneration.duration,
        processingTime: totalProcessingTime,
        imageAnalysis: {
          labels: imageAnalysis.labels.slice(0, 5).map((l) => l.description),
          summary: imageAnalysis.summary
        },
        theme: promptGeneration.image_prompt.substring(0, 100) + '...'
      }
    };

    // Only include finalVideoUrl if it exists
    if (videoGeneration.finalVideoUrl) {
      result.finalVideoUrl = videoGeneration.finalVideoUrl;
    }

    return result;
  } catch (error) {
    console.error('Video creation flow error:', error);

    // Store error metadata
    await storeVideoMetadata({
      videoId,
      userId,
      userPrompt,
      imageUrl,
      aspectRatio,
      error: error.message,
      processingTime: Date.now() - startTime,
      createdAt: new Date(),
      status: 'failed'
    });

    return {
      success: false,
      videoId,
      duration: 0,
      numberOfVideos: 0,
      metadata: {
        totalDuration: 0,
        processingTime: Date.now() - startTime,
        imageAnalysis: {
          labels: [],
          summary: ''
        },
        theme: ''
      },
      error: error.message
    };
  }
}

/**
 * Helper function to store video metadata in Firestore
 * @param {Object} metadata - Video metadata to store
 */
async function storeVideoMetadata(metadata) {
  try {
    const db = admin.firestore();

    await db.collection('videos').doc(metadata.videoId).set(metadata);
    console.log(`Metadata stored for video: ${metadata.videoId}`);
  } catch (error) {
    console.error('Error storing video metadata:', error);
    // Don't throw error as this is not critical for the main flow
  }
}

module.exports = { createVideo, VideoCreationInput, VideoCreationOutput };