const { z } = require('zod');
const { extractFrameLocally } = require('./localFrameExtraction');

// Input schema for frame extraction
const FrameExtractionInput = z.object({
  videoUrl: z.string().describe('URL of the video to extract frame from'),
  framePosition: z.union([
    z.literal('first'),
    z.literal('last'),
    z.number()
  ]).optional().default('last').describe('Position of frame to extract: "first", "last", or time in seconds'),
  outputFormat: z.enum(['jpg', 'png']).optional().default('jpg').describe('Output image format')
});

// Output schema for frame extraction
const FrameExtractionOutput = z.object({
  success: z.boolean().describe('Whether frame extraction was successful'),
  frameUrl: z.string().optional().describe('URL of the extracted frame'),
  error: z.string().optional().describe('Error message if extraction failed')
});

// Frame extraction function
const extractFrame = async (input) => {
  try {
    // Validate input
    const validatedInput = FrameExtractionInput.parse(input);
    
    console.log('Starting frame extraction:', {
      videoUrl: validatedInput.videoUrl,
      framePosition: validatedInput.framePosition,
      outputFormat: validatedInput.outputFormat
    });

    console.log(`Extracting frame from video using local FFmpeg...`);
    
    // Use local FFmpeg service for frame extraction
    const frameUrl = await extractFrameLocally(
      validatedInput.videoUrl,
      validatedInput.framePosition,
      validatedInput.outputFormat
    );
    
    console.log('Frame extraction successful:', frameUrl);
    return {
      success: true,
      frameUrl: frameUrl
    };
  } catch (error) {
    console.error('Frame extraction error:', error);

    return {
      success: false,
      error: error.message || 'Unknown error during frame extraction'
    };
  }
};

module.exports = {
  extractFrame,
  FrameExtractionInput,
  FrameExtractionOutput
};