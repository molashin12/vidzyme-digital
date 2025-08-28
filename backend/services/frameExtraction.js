const { z } = require('zod');
const axios = require('axios');

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

    // Get FFmpeg service URL from environment
    const ffmpegServiceUrl = process.env.FFMPEG_SERVICE_URL || 'https://your-ffmpeg-service-url';

    if (!ffmpegServiceUrl || ffmpegServiceUrl === 'https://your-ffmpeg-service-url') {
      throw new Error('FFMPEG_SERVICE_URL environment variable not configured');
    }

    // Call FFmpeg service for frame extraction
    const response = await axios.post(`${ffmpegServiceUrl}/extract-frame`, {
      videoUrl: validatedInput.videoUrl,
      framePosition: validatedInput.framePosition,
      outputFormat: validatedInput.outputFormat
    }, {
      timeout: 60000, // 60 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('Frame extraction successful:', response.data.frameUrl);
      return {
        success: true,
        frameUrl: response.data.frameUrl
      };
    } else {
      throw new Error(response.data.error || 'Frame extraction failed');
    }
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