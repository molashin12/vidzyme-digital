const { genAI } = require('./index');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const fs = require('fs');
const fetch = require('node-fetch');

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vidzyme.firebasestorage.app';

// Input/Output schemas
const ImageGenerationInput = z.object({
  scenes: z.array(z.object({
    id: z.string(),
    imagePrompt: z.string(),
    description: z.string().optional(),
    referenceImage: z.object({
      imageUrl: z.string().optional(),
      base64Data: z.string().optional(),
      mimeType: z.string().default('image/png')
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

/**
 * Generate images using Gemini 2.5 Flash Image Preview model
 * @param {Object} input - Image generation parameters
 * @returns {Object} Generated images with metadata
 */
async function generateImages(input) {
  const { scenes, style, aspectRatio, quality, sampleCount } = ImageGenerationInput.parse(input);
  const startTime = Date.now();

  try {
    console.log(`Generating ${scenes.length} images using Gemini 2.5 Flash Image Preview...`);

    const generatedImages = [];
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

    // Process each scene
    for (const scene of scenes) {
      try {
        console.log(`Processing scene: ${scene.id}`);

        // Enhance the prompt based on style and quality
        const enhancedPrompt = enhancePromptForStyle(scene.imagePrompt, style, quality);

        // Prepare the content array for Gemini
        const content = [{ text: enhancedPrompt }];

        // Add reference image if provided
        if (scene.referenceImage) {
          let base64Image;
          let mimeType = scene.referenceImage.mimeType || 'image/png';

          if (scene.referenceImage.base64Data) {
            base64Image = scene.referenceImage.base64Data;
          } else if (scene.referenceImage.imageUrl) {
            const downloadResult = await downloadImageAsBase64(scene.referenceImage.imageUrl);
            base64Image = downloadResult.base64Data;
            mimeType = downloadResult.mimeType;
          }

          if (base64Image) {
            content.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            });
          }
        }

        // Generate multiple images if sampleCount > 1
        for (let i = 0; i < sampleCount; i++) {
          console.log(`Generating image ${i + 1}/${sampleCount} for scene ${scene.id}`);

          const response = await model.generateContent({
            contents: content
          });

          // Process the response
          const result = await response.response;

          for (const part of result.candidates[0].content.parts) {
            if (part.text) {
              console.log('Generated text response:', part.text);
            } else if (part.inlineData) {
              const imageData = part.inlineData.data;
              const buffer = Buffer.from(imageData, 'base64');

              // Upload to Google Cloud Storage
              const fileName = `generated-images/${scene.id}-${i}-${uuidv4()}.png`;
              const file = storage.bucket(bucketName).file(fileName);

              await file.save(buffer, {
                metadata: {
                  contentType: 'image/png',
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
              const dimensions = getImageDimensions(aspectRatio);

              generatedImages.push({
                sceneId: scene.id,
                imageUrl: imageUrl,
                prompt: enhancedPrompt,
                metadata: {
                  width: dimensions.width,
                  height: dimensions.height,
                  format: 'png',
                  size: parseInt(metadata.size) || 0
                }
              });

              console.log(`Image saved: ${imageUrl}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error generating image for scene ${scene.id}:`, error);
        throw new Error(`Failed to generate image for scene ${scene.id}: ${error.message}`);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`Generated ${generatedImages.length} images in ${processingTime}ms`);

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

/**
 * Generate a single image with reference image support
 * @param {string} prompt - Text prompt for image generation
 * @param {string} referenceImagePath - Path to reference image file
 * @param {string} outputPath - Path to save generated image
 * @returns {string} Path to generated image
 */
async function generateImageWithReference(prompt, referenceImagePath, outputPath) {
  try {
    console.log('Generating image with reference using Gemini 2.5 Flash Image Preview...');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

    // Read reference image
    const imageData = fs.readFileSync(referenceImagePath);
    const base64Image = imageData.toString('base64');

    const content = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Image
        }
      }
    ];

    const response = await model.generateContent({
      contents: content
    });

    const result = await response.response;

    // Save generated image
    for (const part of result.candidates[0].content.parts) {
      if (part.text) {
        console.log('Generated text response:', part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(outputPath, buffer);
        console.log(`Image saved as ${outputPath}`);
        return outputPath;
      }
    }

    throw new Error('No image data received from Gemini');
  } catch (error) {
    console.error('Error generating image with reference:', error);
    throw error;
  }
}

/**
 * Generate image from URL reference (following user's example)
 * @param {string} prompt - Text prompt for image generation
 * @param {string} imageUrl - URL of reference image
 * @param {string} outputPath - Path to save generated image
 * @returns {string} Path to generated image
 */
async function generateImageFromUrl(prompt, imageUrl, outputPath) {
  try {
    console.log('Generating image from URL reference using Gemini 2.5 Flash Image Preview...');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

    // Download and convert image to base64
    const downloadResult = await downloadImageAsBase64(imageUrl);

    const content = [
      { text: prompt },
      {
        inlineData: {
          mimeType: downloadResult.mimeType,
          data: downloadResult.base64Data
        }
      }
    ];

    const response = await model.generateContent({
      contents: content
    });

    const result = await response.response;

    // Save generated image
    for (const part of result.candidates[0].content.parts) {
      if (part.text) {
        console.log('Generated text response:', part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(outputPath, buffer);
        console.log(`Image saved as ${outputPath}`);
        return outputPath;
      }
    }

    throw new Error('No image data received from Gemini');
  } catch (error) {
    console.error('Error generating image from URL:', error);
    throw error;
  }
}

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

// Helper function to download image from URL and convert to base64
async function downloadImageAsBase64(imageUrl) {
  try {
    console.log(`Downloading image from: ${imageUrl}`);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return {
      base64Data: buffer.toString('base64'),
      mimeType: contentType
    };
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

module.exports = {
  generateImages,
  generateImageWithReference,
  generateImageFromUrl,
  enhancePromptForStyle,
  getImageDimensions,
  downloadImageAsBase64,
  ImageGenerationInput,
  ImageGenerationOutput
};
