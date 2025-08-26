const { z } = require('zod');
const { defineFlow } = require('@genkit-ai/flow');
const { ai } = require('./index');
const { videoGenerationFlow } = require('./videoGeneration');
const { frameExtractionFlow } = require('./frameExtraction');
const axios = require('axios');

// Input schema for sequential video generation
const SequentialVideoGenerationInput = z.object({
  scenes: z.array(z.object({
    id: z.string(),
    imageUrl: z.string(),
    videoPrompt: z.string(),
    duration: z.number().optional().default(8),
    transitions: z.string().optional(),
    negativePrompt: z.string().optional(),
  })),
  overallTheme: z.string(),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
  quality: z.enum(['standard', 'high']).default('high'),
  model: z.enum(['veo-3.0-generate-preview', 'veo-3.0-fast-generate-preview']).default('veo-3.0-generate-preview'),
  personGeneration: z.enum(['allow_all', 'allow_adult', 'dont_allow']).default('allow_adult'),
  enableFrameContinuity: z.boolean().default(true).describe('Enable frame-to-frame continuity'),
});

// Output schema for sequential video generation
const SequentialVideoGenerationOutput = z.object({
  generatedVideos: z.array(z.object({
    sceneId: z.string(),
    videoUrl: z.string(),
    duration: z.number(),
    prompt: z.string(),
    status: z.enum(['completed', 'failed', 'processing']),
    referenceFrameUrl: z.string().optional(),
    extractedFrameUrl: z.string().optional(),
    metadata: z.object({
      width: z.number(),
      height: z.number(),
      format: z.string(),
      size: z.number(),
      fps: z.number(),
    }),
  })),
  totalVideos: z.number(),
  processingTime: z.number(),
  finalVideoUrl: z.string().optional(),
  continuityFrames: z.array(z.object({
    fromSceneId: z.string(),
    toSceneId: z.string(),
    frameUrl: z.string(),
  })),
});

// Sequential video generation flow with frame continuity
const sequentialVideoGenerationFlow = defineFlow(
  {
    name: 'sequentialVideoGeneration',
    inputSchema: SequentialVideoGenerationInput,
    outputSchema: SequentialVideoGenerationOutput,
  },
  async (input) => {
    const { scenes, overallTheme, aspectRatio, quality, model, personGeneration, enableFrameContinuity } = input;
    const startTime = Date.now();
    
    try {
      console.log(`Starting sequential video generation for ${scenes.length} scenes with frame continuity: ${enableFrameContinuity}`);
      
      const generatedVideos = [];
      const continuityFrames = [];
      let previousFrameUrl = null;
      
      // Process each scene sequentially
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const isFirstScene = i === 0;
        const isLastScene = i === scenes.length - 1;
        
        console.log(`Processing scene ${i + 1}/${scenes.length}: ${scene.id}`);
        
        try {
          // Prepare scene with reference frame for continuity
          const sceneWithContinuity = {
            ...scene,
            referenceFrameUrl: enableFrameContinuity && !isFirstScene ? previousFrameUrl : undefined,
          };
          
          // Generate video for current scene
          const videoResult = await videoGenerationFlow({
            scenes: [sceneWithContinuity],
            overallTheme,
            aspectRatio,
            quality,
            model,
            personGeneration,
            enableFrameContinuity,
          });
          
          if (videoResult.generatedVideos.length > 0) {
            const generatedVideo = videoResult.generatedVideos[0];
            
            if (generatedVideo.status === 'completed') {
              console.log(`Video generated successfully for scene: ${scene.id}`);
              
              // Extract last frame for next video (if not the last scene)
              let extractedFrameUrl = null;
              if (enableFrameContinuity && !isLastScene) {
                console.log(`Extracting last frame from scene: ${scene.id}`);
                
                const frameResult = await frameExtractionFlow({
                  videoUrl: generatedVideo.videoUrl,
                  framePosition: 'last',
                  outputFormat: 'jpg',
                });
                
                if (frameResult.success && frameResult.frameUrl) {
                  extractedFrameUrl = frameResult.frameUrl;
                  previousFrameUrl = extractedFrameUrl;
                  
                  // Track continuity frame
                  if (i < scenes.length - 1) {
                    continuityFrames.push({
                      fromSceneId: scene.id,
                      toSceneId: scenes[i + 1].id,
                      frameUrl: extractedFrameUrl,
                    });
                  }
                  
                  console.log(`Frame extracted successfully: ${extractedFrameUrl}`);
                } else {
                  console.warn(`Failed to extract frame from scene: ${scene.id}`);
                }
              }
              
              // Add to results
              generatedVideos.push({
                ...generatedVideo,
                referenceFrameUrl: sceneWithContinuity.referenceFrameUrl,
                extractedFrameUrl,
              });
              
            } else {
              console.error(`Video generation failed for scene: ${scene.id}`);
              generatedVideos.push({
                ...generatedVideo,
                referenceFrameUrl: sceneWithContinuity.referenceFrameUrl,
                extractedFrameUrl: null,
              });
            }
          } else {
            throw new Error(`No video generated for scene: ${scene.id}`);
          }
          
        } catch (error) {
          console.error(`Error processing scene ${scene.id}:`, error);
          
          // Add failed entry
          generatedVideos.push({
            sceneId: scene.id,
            videoUrl: '',
            duration: scene.duration || 8,
            prompt: scene.videoPrompt,
            status: 'failed',
            referenceFrameUrl: previousFrameUrl,
            extractedFrameUrl: null,
            metadata: {
              width: 0,
              height: 0,
              format: 'mp4',
              size: 0,
              fps: 24,
            },
          });
        }
      }
      
      const processingTime = Date.now() - startTime;
      
      // Combine all successful videos into final video
      let finalVideoUrl;
      const successfulVideos = generatedVideos.filter(v => v.status === 'completed');
      
      if (successfulVideos.length > 1) {
        try {
          console.log(`Combining ${successfulVideos.length} videos into final video...`);
          finalVideoUrl = await combineSequentialVideos(successfulVideos, overallTheme);
          console.log(`Final video created: ${finalVideoUrl}`);
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
        finalVideoUrl,
        continuityFrames,
      };
      
    } catch (error) {
      console.error('Sequential video generation error:', error);
      throw new Error(`Failed to generate sequential videos: ${error.message}`);
    }
  }
);

// Helper function to combine sequential videos with smooth transitions
async function combineSequentialVideos(videos, theme) {
  try {
    // Call the Cloud Run FFmpeg service to concatenate videos with smooth transitions
    const ffmpegServiceUrl = process.env.FFMPEG_SERVICE_URL || 'https://ffmpeg-service-url';
    
    if (!ffmpegServiceUrl || ffmpegServiceUrl === 'https://ffmpeg-service-url') {
      throw new Error('FFMPEG_SERVICE_URL environment variable not configured');
    }
    
    const response = await axios.post(`${ffmpegServiceUrl}/concatenate-sequential-videos`, {
      clipUrls: videos.map(v => v.videoUrl),
      outputFileName: `sequential-video-${Date.now()}.mp4`,
      transitions: true,
      crossfadeDuration: 0.5, // 0.5 second crossfade between videos
    }, {
      timeout: 300000, // 5 minutes timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      return response.data.finalVideoUrl;
    } else {
      throw new Error(response.data.error || 'Video concatenation failed');
    }
    
  } catch (error) {
    console.error('Error concatenating sequential videos:', error);
    throw new Error(`Failed to concatenate sequential videos: ${error.message}`);
  }
}

module.exports = {
  sequentialVideoGenerationFlow,
  SequentialVideoGenerationInput,
  SequentialVideoGenerationOutput
};