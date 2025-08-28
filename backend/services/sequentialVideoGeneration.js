const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const { getStorageBucket } = require('../config/firebase');
const { combineVideosLocally } = require('./localFFmpeg');
const { extractFrameLocally } = require('./localFrameExtraction');
const { generateVideoPrompts } = require('./videoPromptGeneration');

// Get Firebase Storage bucket
const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vidzyme.firebasestorage.app';

// Input/Output schemas
const SequentialVideoGenerationInput = z.object({
  initialVideoPrompt: z.string(),
  generatedImageUrl: z.string(),
  userInstructions: z.string(),
  imageAnalysis: z.string(),
  aspectRatio: z.enum(['16:9']).default('16:9'),
  totalDuration: z.number().min(8).max(64), // 8-64 seconds (1-8 segments)
  personGeneration: z.enum(['allow_adult']).default('allow_adult')
});

const SequentialVideoGenerationOutput = z.object({
  finalVideoUrl: z.string(),
  duration: z.number(),
  numberOfVideos: z.number(),
  processingTime: z.number(),
  segmentUrls: z.array(z.string()),
  metadata: z.object({
    width: z.number(),
    height: z.number(),
    format: z.string(),
    size: z.number(),
    fps: z.number()
  })
});

/**
 * Generate continuation prompt based on previous video context
 * @param {string} originalPrompt - The original video prompt
 * @param {string} userInstructions - User's original instructions
 * @param {number} segmentNumber - Current segment number (1-based)
 * @param {number} totalSegments - Total number of segments
 * @returns {Promise<string>} Continuation prompt
 */
async function generateContinuationPrompt(originalPrompt, userInstructions, segmentNumber, totalSegments) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are a UGC (User-Generated Content) AI agent specialized in creating continuation prompts for sequential video segments.

Your task: Generate a continuation video prompt that seamlessly follows the previous video segment while maintaining the same UGC style, character, and setting.

Key requirements:
- Maintain the same character, setting, and overall tone from the original prompt
- Create natural progression in the dialogue and actions
- Keep the amateur iPhone video style consistent
- Ensure the continuation feels like the same person continuing their conversation
- Use the same format: dialogue, action, camera, emotion, type
- Avoid repetition of the exact same dialogue or actions
- Progress the narrative naturally while staying focused on the product

Output format:
dialogue: [continuation of casual conversation]
action: [natural follow-up character actions]
camera: [same amateur iPhone video style]
emotion: [authentic emotional progression]
type: veo3_fast`;

    const userPrompt = `Create a continuation prompt for video segment ${segmentNumber} of ${totalSegments}.

Original video prompt:
${originalPrompt}

User's original instructions:
${userInstructions}

This is segment ${segmentNumber}, so the character should continue their conversation naturally from where the previous segment left off. The character should still be talking about the same product but with new dialogue and slightly different actions to show progression.

Generate a continuation prompt that feels like a natural follow-up to the original scene.`;

    const result = await geminiModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    const response = await result.response;
    const responseText = response.text();

    console.log(`Generated continuation prompt for segment ${segmentNumber}:`, responseText);

    // Extract and validate the continuation prompt
    let continuationPrompt = responseText.trim();

    // If the response doesn't contain the expected format, create a fallback
    if (!continuationPrompt.includes('dialogue:') || !continuationPrompt.includes('action:')) {
      console.warn('Continuation prompt does not contain expected format, creating fallback');
      continuationPrompt = `dialogue: and another thing about this product... it's really amazing\naction: character continues showing product with different angle\ncamera: amateur iphone selfie video, uneven framing, natural lighting\nemotion: enthusiastic, authentic\ntype: veo3_fast`;
    }

    return continuationPrompt;
  } catch (error) {
    console.error('Error generating continuation prompt:', error);
    throw new Error(`Failed to generate continuation prompt: ${error.message}`);
  }
}

/**
 * Generate a single video segment using Veo 3
 * @param {string} videoPrompt - The video prompt to use
 * @param {string} imageUrl - URL of the reference image
 * @param {string} aspectRatio - Video aspect ratio
 * @param {string} personGeneration - Person generation setting
 * @param {number} segmentIndex - Index of the current segment
 * @returns {Promise<string>} URL of the generated video
 */
async function generateVideoSegment(videoPrompt, imageUrl, aspectRatio, personGeneration, segmentIndex) {
  const model = 'veo-3.0-fast-generate-preview';
  
  try {
    console.log(`Generating video segment ${segmentIndex + 1}...`);
    
    // Initialize Google GenAI client
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

    // Download and convert image to base64
    const imageData = await downloadImageAsBase64(imageUrl);

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

    console.log(`Initial operation for segment ${segmentIndex + 1}:`, JSON.stringify(operation, null, 2));

    // Poll the operation status until the video is ready
    let pollAttempts = 0;
    const maxPollAttempts = 60; // 10 minutes maximum

    while (!operation.done && pollAttempts < maxPollAttempts) {
      console.log(`Waiting for segment ${segmentIndex + 1} generation... (attempt ${pollAttempts + 1}/${maxPollAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      pollAttempts++;

      try {
        operation = await ai.operations.getVideosOperation({ operation });
        console.log(`Segment ${segmentIndex + 1} status:`, JSON.stringify({ done: operation.done, name: operation.name }, null, 2));
      } catch (error) {
        console.warn(`Failed to poll operation status for segment ${segmentIndex + 1}: ${error.message}`);
      }
    }

    if (pollAttempts >= maxPollAttempts && !operation.done) {
      throw new Error(`Video segment ${segmentIndex + 1} generation timed out after ${maxPollAttempts * 10} seconds`);
    }

    console.log(`Segment ${segmentIndex + 1} operation completed:`, JSON.stringify(operation, null, 2));

    if (operation.response && operation.response.generatedVideos && operation.response.generatedVideos[0]) {
      const generatedVideo = operation.response.generatedVideos[0];

      if (!generatedVideo.video) {
        throw new Error(`Video property not found in generated video object for segment ${segmentIndex + 1}`);
      }

      // Create a unique filename for this video segment
      const fileName = `sequential-videos/segment-${segmentIndex + 1}-${uuidv4()}.mp4`;

      // Upload video to Firebase Storage
      const bucket = getStorageBucket();
      const file = bucket.file(fileName);
      
      const videoUri = generatedVideo.video.uri;
      console.log(`Segment ${segmentIndex + 1} video URI:`, videoUri);
      
      // Download video data using axios with API key as query parameter
      const downloadUrl = `${videoUri}&key=${process.env.GEMINI_API_KEY}`;
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 300000 // 5 minutes timeout
      });
      
      if (!response.data) {
        throw new Error(`No video data received for segment ${segmentIndex + 1}`);
      }
      
      console.log(`Downloaded segment ${segmentIndex + 1} data: ${response.data.byteLength} bytes`);
      
      const videoBuffer = Buffer.from(response.data);
      
      await file.save(videoBuffer, {
        metadata: {
          contentType: 'video/mp4',
          metadata: {
            segmentIndex: segmentIndex + 1,
            prompt: videoPrompt,
            aspectRatio: aspectRatio,
            generatedAt: new Date().toISOString(),
            model: model
          }
        }
      });
      
      console.log(`Segment ${segmentIndex + 1} uploaded to Firebase Storage`);
      
      // Make the file publicly accessible
      await file.makePublic();

      const videoUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      console.log(`Segment ${segmentIndex + 1} generated successfully: ${videoUrl}`);
      
      return videoUrl;
    } else {
      throw new Error(`No valid response from video generation model for segment ${segmentIndex + 1}`);
    }
  } catch (error) {
    console.error(`Error generating video segment ${segmentIndex + 1}:`, error);
    throw new Error(`Failed to generate video segment ${segmentIndex + 1}: ${error.message}`);
  }
}

/**
 * Main sequential video generation function
 * @param {Object} input - Sequential video generation parameters
 * @returns {Object} Generated sequential video data with metadata
 */
async function generateSequentialVideo(input) {
  const { 
    initialVideoPrompt, 
    generatedImageUrl, 
    userInstructions, 
    imageAnalysis, 
    aspectRatio, 
    totalDuration, 
    personGeneration 
  } = SequentialVideoGenerationInput.parse(input);
  
  const startTime = Date.now();
  const numberOfSegments = Math.ceil(totalDuration / 8); // Each segment is 8 seconds
  
  console.log(`Starting sequential video generation: ${numberOfSegments} segments for ${totalDuration} seconds`);
  
  try {
    const segmentUrls = [];
    let currentImageUrl = generatedImageUrl;
    let currentPrompt = initialVideoPrompt;
    
    // Generate each video segment
    for (let i = 0; i < numberOfSegments; i++) {
      console.log(`\n=== Generating Segment ${i + 1} of ${numberOfSegments} ===`);
      
      // For segments after the first, generate a continuation prompt
      if (i > 0) {
        console.log(`Generating continuation prompt for segment ${i + 1}...`);
        currentPrompt = await generateContinuationPrompt(
          initialVideoPrompt, 
          userInstructions, 
          i + 1, 
          numberOfSegments
        );
      }
      
      // Generate the video segment
      const segmentUrl = await generateVideoSegment(
        currentPrompt,
        currentImageUrl,
        aspectRatio,
        personGeneration,
        i
      );
      
      segmentUrls.push(segmentUrl);
      
      // Extract last frame for next segment (except for the last segment)
      if (i < numberOfSegments - 1) {
        console.log(`Extracting last frame from segment ${i + 1} for next segment...`);
        currentImageUrl = await extractFrameLocally(segmentUrl, 'last', 'png');
        console.log(`Extracted frame URL: ${currentImageUrl}`);
      }
    }
    
    // Combine all segments into final video
    console.log(`\n=== Combining ${numberOfSegments} segments into final video ===`);
    const finalVideoUrl = await combineVideosLocally(segmentUrls, aspectRatio);
    
    const dimensions = getVideoDimensions(aspectRatio);
    const processingTime = Date.now() - startTime;
    
    console.log(`Sequential video generation completed in ${processingTime}ms`);
    console.log(`Final video URL: ${finalVideoUrl}`);
    
    return {
      finalVideoUrl,
      duration: totalDuration,
      numberOfVideos: numberOfSegments,
      processingTime,
      segmentUrls,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        format: 'mp4',
        size: 0, // Will be updated after final video is created
        fps: 24
      }
    };
  } catch (error) {
    console.error('Sequential video generation error:', error);
    throw new Error(`Failed to generate sequential video: ${error.message}`);
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
    
    return {
      base64,
      mimeType
    };
  } catch (error) {
    console.error('Error downloading image as base64:', error);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Get video dimensions based on aspect ratio
 * @param {string} aspectRatio - Video aspect ratio
 * @returns {Object} Width and height dimensions
 */
function getVideoDimensions(aspectRatio) {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1920, height: 1080 };
    default:
      return { width: 1920, height: 1080 };
  }
}

module.exports = {
  generateSequentialVideo,
  generateContinuationPrompt,
  SequentialVideoGenerationInput,
  SequentialVideoGenerationOutput
};