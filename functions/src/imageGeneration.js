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
  imagePrompt: z.string().describe('Generated image prompt from promptGeneration step'),
  referenceImageUrl: z.string().url().describe('URL of the user-uploaded reference image')
});

const ImageGenerationOutput = z.object({
  imageUrl: z.string().describe('URL of the generated image'),
  prompt: z.string().describe('The prompt used for generation'),
  metadata: z.object({
    width: z.number(),
    height: z.number(),
    format: z.string(),
    size: z.number()
  })
});

/**
 * Generate images using Gemini 2.5 Flash Image Preview model
 * Integrates with promptGeneration.js output and user reference image
 * @param {Object} input - Image generation parameters
 * @returns {Object} Generated images with metadata
 */
async function generateImages(input) {
  const startTime = Date.now();

  try {
    const { imagePrompt, referenceImageUrl } = ImageGenerationInput.parse(input);

    console.log('Generating image using Gemini 2.5 Flash Image Preview...');
    console.log('Image prompt:', imagePrompt);
    console.log('Reference image URL:', referenceImageUrl);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

    // Prepare content parts
    const parts = [{ text: imagePrompt }];

    // Add reference image if provided
    if (referenceImageUrl) {
      try {
        const downloadResult = await downloadImageAsBase64(referenceImageUrl);
        parts.push({
          inline_data: {
            mime_type: downloadResult.mimeType,
            data: downloadResult.base64Data
          }
        });
        console.log('Reference image added to generation request');
      } catch (error) {
        console.warn('Failed to download reference image, proceeding without it:', error.message);
      }
    }

    console.log('Generating image...');
    const response = await model.generateContent({
      contents: [{
        parts: parts
      }]
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
        const fileName = `generated-images/image-${uuidv4()}.png`;
        const file = storage.bucket(bucketName).file(fileName);

        await file.save(buffer, {
          metadata: {
            contentType: 'image/png',
            metadata: {
              prompt: imagePrompt,
              generatedAt: new Date().toISOString(),
              hasReferenceImage: !!referenceImageUrl
            }
          }
        });

        // Make the file publicly accessible
        await file.makePublic();

        const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        // Get image metadata
        const [metadata] = await file.getMetadata();

        // Default dimensions (will be updated when we get actual image dimensions)
        const dimensions = { width: 1024, height: 1024 };

        const processingTime = Date.now() - startTime;
        console.log(`Generated image in ${processingTime}ms: ${imageUrl}`);

        return {
          imageUrl: imageUrl,
          prompt: imagePrompt,
          metadata: {
            width: dimensions.width,
            height: dimensions.height,
            format: 'png',
            size: parseInt(metadata.size) || 0
          }
        };
      }
    }

    throw new Error('No image was generated from the model response');
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
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
      contents: [{
        parts: content
      }]
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
      contents: [{
        parts: content
      }]
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
    '9:16': { width: 576, height: 1024 },
    '2:3': { width: 683, height: 1024 }, // Vertical photo format
    '3:2': { width: 1024, height: 683 } // Horizontal photo format
  };

  return dimensions[aspectRatio] || dimensions['2:3'];
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

/**
 * Generate image from prompt generation output with reference image
 * This is the main function to be called from the orchestration
 * @param {string} imagePrompt - YAML prompt from promptGeneration.js
 * @param {string} aspectRatio - Aspect ratio from promptGeneration.js
 * @param {string} referenceImageUrl - User uploaded reference image URL
 * @returns {Object} Generated image data
 */
async function generateImageFromPrompt(imagePrompt, referenceImageUrl) {
  try {
    const input = {
      imagePrompt: imagePrompt,
      referenceImageUrl: referenceImageUrl
    };

    const result = await generateImages(input);

    return result;
  } catch (error) {
    console.error('Error in generateImageFromPrompt:', error);
    throw error;
  }
}

module.exports = {
  generateImages,
  generateImageFromPrompt,
  generateImageWithReference,
  generateImageFromUrl,
  enhancePromptForStyle,
  getImageDimensions,
  downloadImageAsBase64,
  ImageGenerationInput,
  ImageGenerationOutput
};
