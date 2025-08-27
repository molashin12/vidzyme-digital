const { z } = require('zod');
const { analyzeImage } = require('./imageAnalysis');
const { generatePrompts, generateImagePrompt } = require('./promptGeneration');
const { generateImages } = require('./imageGeneration');
const { generateVideoPrompts } = require('./videoPromptGeneration');
const { generateVideos } = require('./videoGeneration');
// Removed sequentialVideoGenerationFlow import to avoid circular dependency

// Input/Output schemas for the main orchestration flow
const VideoCreationInput = z.object({
  imageUrl: z.string().url().describe('URL of the input image'),
  userPrompt: z.string().describe('User-provided prompt or theme for the video'),
  videoStyle: z.enum(['cinematic', 'documentary', 'artistic', 'commercial', 'social']).default('cinematic'),
  duration: z.number().min(5).max(30).default(10),
  aspectRatio: z.enum(['1:1', '4:3', '16:9', '9:16']).default('16:9'),
  quality: z.enum(['standard', 'high']).default('high'),
  userId: z.string().describe('User ID for tracking and storage'),
  enableFrameContinuity: z.boolean().optional().default(true).describe('Enable frame-to-frame continuity for seamless video transitions'),
});

const VideoCreationOutput = z.object({
  success: z.boolean(),
  videoId: z.string(),
  finalVideoUrl: z.string().optional(),
  scenes: z.array(z.object({
    id: z.string(),
    imageUrl: z.string(),
    videoUrl: z.string(),
    duration: z.number(),
  })),
  metadata: z.object({
    totalDuration: z.number(),
    totalScenes: z.number(),
    processingTime: z.number(),
    imageAnalysis: z.object({
      labels: z.array(z.string()),
      summary: z.string(),
    }),
    theme: z.string(),
    style: z.string(),
    quality: z.string(),
  }),
  error: z.string().optional(),
});

// Main video creation function
async function createVideo(input) {
    const {
      imageUrl,
      userPrompt,
      videoStyle,
      duration,
      aspectRatio,
      quality,
      userId,
      enableFrameContinuity
    } = input;
    
    const startTime = Date.now();
    const videoId = `video_${userId}_${Date.now()}`;
    
    try {
      console.log(`Starting video creation flow for user: ${userId}`);
      
      // Step 1: Analyze the input image
      console.log('Step 1: Analyzing input image...');
      const imageAnalysis = await analyzeImage({
        imageUrl,
        analysisType: 'comprehensive',
      });
      
      console.log('Image analysis completed:', {
        labels: imageAnalysis.labels.length,
        objects: imageAnalysis.objects.length,
        summary: imageAnalysis.summary.substring(0, 100) + '...',
      });
      
      // Step 2: Generate prompts and scene planning
      console.log('Step 2: Generating prompts and planning scenes...');
      const promptGeneration = await generatePrompts({
        imageAnalysis: {
          labels: imageAnalysis.labels,
          objects: imageAnalysis.objects,
          summary: imageAnalysis.summary,
        },
        userPrompt,
        videoStyle,
        duration,
      });
      
      console.log('Prompt generation completed:', {
        scenes: promptGeneration.scenes.length,
        theme: promptGeneration.overallTheme,
      });
      
      // Step 3: Generate images for each scene
      console.log('Step 3: Generating images for scenes...');
      const imageGeneration = await generateImages({
        scenes: promptGeneration.scenes.map(scene => ({
          id: scene.id,
          imagePrompt: scene.imagePrompt,
          description: scene.description,
        })),
        style: mapVideoStyleToImageStyle(videoStyle),
        aspectRatio,
        quality,
      });
      
      console.log('Image generation completed:', {
        totalImages: imageGeneration.totalImages,
        processingTime: imageGeneration.processingTime,
      });
      
      // Step 4: Generate video prompts
      console.log('Step 4: Generating video prompts...');
      const videoPromptGeneration = await generateVideoPrompts({
        imageAnalysis: imageAnalysis.summary,
        userInstructions: userPrompt,
        totalDuration: duration,
        perVideoLength: 8,
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
        model: 'veo3_fast',
        dialogueScript: undefined,
      });
      
      console.log('Video prompt generation completed:', {
        scenes: videoPromptGeneration.scenes.length,
      });
      
      // Step 5: Generate videos from images
      console.log('Step 5: Generating videos from images...');
      
      const scenesData = videoPromptGeneration.scenes.map((videoScene, index) => {
        const imageScene = promptGeneration.scenes[index];
        const generatedImage = imageGeneration.generatedImages.find(
          img => img.sceneId === imageScene?.id
        );
        return {
          id: imageScene?.id || `scene_${index}`,
          imageUrl: generatedImage?.imageUrl || '',
          videoPrompt: videoScene.video_prompt,
          duration: 8, // Fixed duration from video prompt generation
          transitions: imageScene?.transitions,
        };
      });
      
      let videoGeneration;
      
      // Use standard video generation (sequential generation removed to avoid circular dependency)
      console.log('Using standard video generation...');
      videoGeneration = await generateVideos({
        scenes: scenesData,
        overallTheme: promptGeneration.overallTheme,
        aspectRatio: videoPromptGeneration.scenes[0]?.aspect_ratio_video || aspectRatio,
        quality,
        model: videoPromptGeneration.scenes[0]?.model || 'veo-3.0-fast-generate-preview',
        enableFrameContinuity: enableFrameContinuity && scenesData.length > 1,
      });
      
      console.log('Video generation completed:', {
        totalVideos: videoGeneration.totalVideos,
        processingTime: videoGeneration.processingTime,
        finalVideoUrl: videoGeneration.finalVideoUrl,
      });
      
      // Prepare the final response
      const totalProcessingTime = Date.now() - startTime;
      const successfulVideos = videoGeneration.generatedVideos.filter(
        v => v.status === 'completed'
      );
      
      const scenes = successfulVideos.map(video => {
        const scene = promptGeneration.scenes.find(s => s.id === video.sceneId);
        const image = imageGeneration.generatedImages.find(i => i.sceneId === video.sceneId);
        
        return {
          id: video.sceneId,
          imageUrl: image?.imageUrl || '',
          videoUrl: video.videoUrl,
          duration: video.duration,
        };
      });
      
      const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);
      
      // Store metadata in Firestore for tracking
      await storeVideoMetadata(videoId, {
        userId,
        input,
        imageAnalysis,
        promptGeneration,
        imageGeneration,
        videoPromptGeneration,
        videoGeneration,
        processingTime: totalProcessingTime,
        createdAt: new Date(),
      });
      
      return {
        success: true,
        videoId,
        finalVideoUrl: videoGeneration.finalVideoUrl,
        scenes,
        metadata: {
          totalDuration,
          totalScenes: scenes.length,
          processingTime: totalProcessingTime,
          imageAnalysis: {
            labels: imageAnalysis.labels.slice(0, 5).map(l => l.description),
            summary: imageAnalysis.summary,
          },
          theme: promptGeneration.overallTheme,
          style: videoStyle,
          quality,
        },
      };
      
    } catch (error) {
      console.error('Video creation flow error:', error);
      
      // Store error metadata
      await storeVideoMetadata(videoId, {
        userId,
        input,
        error: error.message,
        processingTime: Date.now() - startTime,
        createdAt: new Date(),
        status: 'failed',
      });
      
      return {
        success: false,
        videoId,
        scenes: [],
        metadata: {
          totalDuration: 0,
          totalScenes: 0,
          processingTime: Date.now() - startTime,
          imageAnalysis: {
            labels: [],
            summary: '',
          },
          theme: '',
          style: videoStyle,
          quality,
        },
        error: error.message,
      };
    }
}

// Helper function to map video style to image style
function mapVideoStyleToImageStyle(videoStyle) {
  const styleMapping = {
    cinematic: 'cinematic',
    documentary: 'photographic',
    artistic: 'artistic',
    commercial: 'digital_art',
    social: 'digital_art',
  };
  
  return styleMapping[videoStyle] || 'cinematic';
}

// Helper function to store video metadata in Firestore
async function storeVideoMetadata(videoId, metadata) {
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    await db.collection('videos').doc(videoId).set(metadata);
    console.log(`Metadata stored for video: ${videoId}`);
  } catch (error) {
    console.error('Error storing video metadata:', error);
    // Don't throw error as this is not critical for the main flow
  }
}

module.exports = { createVideo, VideoCreationInput, VideoCreationOutput };