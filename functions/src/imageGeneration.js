/* eslint-disable max-len */
const { z } = require('zod');
const { defineFlow } = require('@genkit-ai/flow');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vidzyme-digital.appspot.com';

// Input/Output schemas
const ImageGenerationInput = z.object({
  scenes: z.array(z.object({
    id: z.string(),
    imagePrompt: z.string(),
    description: z.string(),
    referenceImage: z.object({
      imageUrl: z.string().optional(),
      base64Data: z.string().optional(),
      referenceType: z.enum(['REFERENCE_TYPE_SUBJECT', 'REFERENCE_TYPE_RAW']).default('REFERENCE_TYPE_SUBJECT'),
      referenceId: z.number().default(1),
      subjectType: z.string().optional(), // For subject customization
      imageDescription: z.string().optional() // For subject customization
    }).optional()
  })),
  style: z.enum(['photographic', 'digital_art', 'cinematic', 'artistic']).default('cinematic'),
  aspectRatio: z.enum(['1:1', '4:3', '16:9', '9:16']).default('16:9'),
  quality: z.enum(['standard', 'high']).default('high'),
  sampleCount: z.number().min(1).max(4).default(1)
});

const ImageGenerationOutput = z.object({
  generatedImages: z.array(z.object({
    sceneId: z.string(),
    imageUrl: z.string(),
    prompt: z.string(),
    metadata: z.object({
      width: z.number(),
      height: z.number(),
      format: z.string(),
      size: z.number()
    })
  })),
  totalImages: z.number(),
  processingTime: z.number()
});

// Define the image generation flow
const imageGenerationFlow = defineFlow(
    {
      name: 'imageGeneration',
      inputSchema: ImageGenerationInput,
      outputSchema: ImageGenerationOutput
    },
    async (input) => {
      const { scenes, style, aspectRatio, quality, sampleCount } = input;
      const startTime = Date.now();

      try {
        const generatedImages = [];

        // Process each scene in parallel (with concurrency limit)
        const concurrencyLimit = 3;
        const chunks = [];
        for (let i = 0; i < scenes.length; i += concurrencyLimit) {
          chunks.push(scenes.slice(i, i + concurrencyLimit));
        }

        for (const chunk of chunks) {
          const chunkPromises = chunk.map(async (scene) => {
            try {
            // Enhance the prompt based on style
              const enhancedPrompt = enhancePromptForStyle(scene.imagePrompt, style, quality);

              // Prepare request body for Imagen 3.0 API
              const requestBody = await prepareImagenRequest(scene, enhancedPrompt, sampleCount);

              // Generate image using Imagen 3.0 API
              const response = await callImagenAPI(requestBody);

              // Process generated images from Imagen 3.0 response
              const sceneResults = [];

              for (let i = 0; i < response.predictions.length; i++) {
                const prediction = response.predictions[i];
                const imageData = Buffer.from(prediction.bytesBase64Encoded, 'base64');

                // Upload to Google Cloud Storage
                const fileName = `generated-images/${scene.id}-${i}-${uuidv4()}.png`;
                const file = storage.bucket(bucketName).file(fileName);

                await file.save(imageData, {
                  metadata: {
                    contentType: prediction.mimeType || 'image/png',
                    metadata: {
                      sceneId: scene.id,
                      prompt: enhancedPrompt,
                      style: style,
                      aspectRatio: aspectRatio,
                      generatedAt: new Date().toISOString(),
                      imageIndex: i
                    }
                  }
                });

                // Make the file publicly accessible
                await file.makePublic();

                const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

                // Get image metadata
                const [metadata] = await file.getMetadata();

                sceneResults.push({
                  sceneId: scene.id,
                  imageUrl: imageUrl,
                  prompt: enhancedPrompt,
                  metadata: {
                    width: getImageDimensions(aspectRatio).width,
                    height: getImageDimensions(aspectRatio).height,
                    format: 'png',
                    size: parseInt(metadata.size) || 0
                  }
                });
              }

              return sceneResults;
            } catch (error) {
              console.error(`Error generating image for scene ${scene.id}:`, error);
              throw new Error(`Failed to generate image for scene ${scene.id}: ${error.message}`);
            }
          });

          const chunkResults = await Promise.all(chunkPromises);
          // Flatten results since each scene can return multiple images
          chunkResults.forEach((sceneResults) => {
            generatedImages.push(...sceneResults);
          });
        }

        const processingTime = Date.now() - startTime;

        return {
          generatedImages,
          totalImages: generatedImages.length,
          processingTime
        };
      } catch (error) {
        console.error('Image generation error:', error);
        throw new Error(`Failed to generate images: ${error.message}`);
      }
    }
);

// Helper function to enhance prompts based on style
function enhancePromptForStyle(basePrompt, style, quality) {
  const styleEnhancements = {
    photographic: 'professional photography, high resolution, sharp focus, realistic lighting',
    digital_art: 'digital art, concept art style, detailed illustration, vibrant colors',
    cinematic: 'cinematic composition, dramatic lighting, film quality, professional cinematography',
    artistic: 'artistic interpretation, creative composition, expressive style, unique perspective'
  };

  const qualityEnhancements = {
    standard: 'good quality, clear details',
    high: 'ultra high quality, 4K resolution, masterpiece, highly detailed, professional grade'
  };

  return `${basePrompt}, ${styleEnhancements[style]}, ${qualityEnhancements[quality]}`;
}

// Helper function to get image dimensions based on aspect ratio
function getImageDimensions(aspectRatio) {
  const dimensions = {
    '1:1': { width: 1024, height: 1024 },
    '4:3': { width: 1024, height: 768 },
    '16:9': { width: 1024, height: 576 },
    '9:16': { width: 576, height: 1024 }
  };

  return dimensions[aspectRatio] || dimensions['16:9'];
}

// Helper function to prepare Imagen 3.0 API request
async function prepareImagenRequest(scene, enhancedPrompt, sampleCount) {
  const requestBody = {
    instances: [
      {
        prompt: enhancedPrompt
      }
    ],
    parameters: {
      sampleCount: sampleCount
    }
  };

  // Add reference image if provided
  if (scene.referenceImage) {
    let base64Image;

    if (scene.referenceImage.base64Data) {
      base64Image = scene.referenceImage.base64Data;
    } else if (scene.referenceImage.imageUrl) {
      // Download image from URL and convert to base64
      base64Image = await downloadImageAsBase64(scene.referenceImage.imageUrl);
    }

    if (base64Image) {
      const referenceImageConfig = {
        referenceType: scene.referenceImage.referenceType,
        referenceId: scene.referenceImage.referenceId,
        referenceImage: {
          bytesBase64Encoded: base64Image
        }
      };

      // Add subject configuration for subject customization
      if (scene.referenceImage.referenceType === 'REFERENCE_TYPE_SUBJECT') {
        referenceImageConfig.subjectImageConfig = {
          subjectType: scene.referenceImage.subjectType || 'OBJECT',
          imageDescription: scene.referenceImage.imageDescription || 'Reference subject'
        };
      }

      requestBody.instances[0].referenceImages = [referenceImageConfig];
    }
  }

  return requestBody;
}

// Helper function to download image from URL and convert to base64
async function downloadImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

// Helper function to call Imagen 3.0 API
async function callImagenAPI(requestBody) {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const authClient = await auth.getClient();
    const projectId = await auth.getProjectId();

    const accessToken = await authClient.getAccessToken();

    const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-capability-002:predict`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Imagen API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Imagen API:', error);
    throw error;
  }
}

module.exports = { imageGenerationFlow };
