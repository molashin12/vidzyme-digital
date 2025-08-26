# Veo 3 Video Generation Guide

This guide covers the implementation of Google's Veo 3 video generation model in the Vidzyme platform, enabling advanced image-to-video generation capabilities.

## Overview

Veo 3 is Google's latest video generation model that creates high-quality videos from text prompts and reference images. Our implementation uses the Google GenAI SDK to integrate Veo 3 into the Genkit-based video generation flow.

## Key Features

### 🎬 **Image-to-Video Generation**
- Convert static images into dynamic 5-second videos
- Maintain visual consistency with the reference image
- Support for various image formats (PNG, JPEG, WebP)

### 🚀 **Multiple Model Options**
- **veo-3.0-generate-preview**: High quality, longer processing time
- **veo-3.0-fast-generate-preview**: Faster generation with good quality

### 📐 **Aspect Ratio Support**
- **16:9**: Landscape format (1920x1080)
- **9:16**: Portrait format (1080x1920)

### 👥 **Person Generation Control**
- **allow_all**: Generate any people (text-to-video only)
- **allow_adult**: Generate adult people only
- **dont_allow**: No people in generated videos

## Updated Input Schema

```javascript
const VideoGenerationInput = z.object({
  scenes: z.array(z.object({
    id: z.string(),
    imageUrl: z.string(),                    // Required: Reference image URL
    videoPrompt: z.string(),                 // Video description
    duration: z.number().optional(),         // Not used in Veo 3 (fixed ~5s)
    transitions: z.string().optional(),      // For future use
    negativePrompt: z.string().optional(),   // NEW: What to avoid
  })),
  overallTheme: z.string(),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
  quality: z.enum(['standard', 'high']).default('high'),
  model: z.enum([
    'veo-3.0-generate-preview', 
    'veo-3.0-fast-generate-preview'
  ]).default('veo-3.0-generate-preview'),
  personGeneration: z.enum([
    'allow_all', 
    'allow_adult', 
    'dont_allow'
  ]).default('allow_adult'),
});
```

## Usage Examples

### Basic Image-to-Video

```javascript
const videoRequest = {
  scenes: [
    {
      id: 'scene-1',
      imageUrl: 'https://storage.googleapis.com/bucket/kitten.jpg',
      videoPrompt: 'Panning wide shot of a calico kitten sleeping in the sunshine',
      negativePrompt: 'blurry, low quality, distorted'
    }
  ],
  overallTheme: 'Peaceful nature scene',
  aspectRatio: '16:9',
  quality: 'high',
  model: 'veo-3.0-generate-preview',
  personGeneration: 'allow_adult'
};
```

### Fast Generation for Social Media

```javascript
const socialVideoRequest = {
  scenes: [
    {
      id: 'social-scene',
      imageUrl: 'https://storage.googleapis.com/bucket/product.jpg',
      videoPrompt: 'Product showcase with smooth rotation and elegant lighting',
      negativePrompt: 'jerky movement, poor lighting'
    }
  ],
  overallTheme: 'Product marketing',
  aspectRatio: '9:16',  // Perfect for Instagram/TikTok
  quality: 'standard',
  model: 'veo-3.0-fast-generate-preview',
  personGeneration: 'dont_allow'
};
```

### Multiple Scene Generation

```javascript
const multiSceneRequest = {
  scenes: [
    {
      id: 'intro',
      imageUrl: 'https://storage.googleapis.com/bucket/landscape1.jpg',
      videoPrompt: 'Cinematic drone shot revealing mountain landscape at golden hour'
    },
    {
      id: 'detail',
      imageUrl: 'https://storage.googleapis.com/bucket/landscape2.jpg', 
      videoPrompt: 'Close-up of wildflowers swaying in gentle breeze'
    },
    {
      id: 'finale',
      imageUrl: 'https://storage.googleapis.com/bucket/landscape3.jpg',
      videoPrompt: 'Wide establishing shot of serene lake reflecting sunset colors'
    }
  ],
  overallTheme: 'Nature documentary',
  aspectRatio: '16:9',
  quality: 'high'
};
```

## API Integration Details

### Authentication
The implementation uses Google Cloud authentication through the `GoogleGenAI` client:

```javascript
const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({});
```

### Async Operation Handling
Veo 3 video generation is asynchronous and requires polling:

```javascript
// Start video generation
let operation = await genAI.models.generateVideos({
  model: 'veo-3.0-generate-preview',
  prompt: enhancedPrompt,
  image: {
    imageBytes: imageBytes,
    mimeType: 'image/png',
  },
  aspectRatio: '16:9',
  personGeneration: 'allow_adult',
});

// Poll until complete
while (!operation.done) {
  console.log('Waiting for video generation...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  operation = await genAI.operations.getVideosOperation({ operation });
}

// Download the result
if (operation.response?.generatedVideos?.length > 0) {
  const videoFile = operation.response.generatedVideos[0].video;
  await genAI.files.download({
    file: videoFile,
    downloadPath: localPath,
  });
}
```

### Image Processing
Reference images are downloaded and converted to bytes:

```javascript
async function downloadImageAsBytes(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
```

## Output Format

The video generation flow returns:

```javascript
{
  generatedVideos: [
    {
      sceneId: 'scene-1',
      videoUrl: 'https://storage.googleapis.com/bucket/video.mp4',
      duration: 5,  // Veo 3 generates ~5 second videos
      prompt: 'Enhanced prompt with quality settings',
      status: 'completed',
      metadata: {
        width: 1920,
        height: 1080,
        format: 'mp4',
        size: 15728640,  // File size in bytes
        fps: 24
      }
    }
  ],
  totalVideos: 1,
  processingTime: 45000,  // Time in milliseconds
  finalVideoUrl: 'https://storage.googleapis.com/bucket/combined.mp4'  // If multiple scenes
}
```

## Best Practices

### 🎯 **Prompt Engineering**
- Be specific about camera movements ("panning", "zooming", "static")
- Include lighting descriptions ("golden hour", "soft lighting")
- Specify motion type ("gentle", "dynamic", "smooth")
- Use cinematic terms ("wide shot", "close-up", "establishing shot")

### 🖼️ **Image Requirements**
- Use high-quality reference images (minimum 512x512)
- Ensure images are publicly accessible URLs
- Supported formats: PNG, JPEG, WebP
- Avoid heavily compressed or low-resolution images

### ⚡ **Performance Optimization**
- Use `veo-3.0-fast-generate-preview` for quicker results
- Process scenes sequentially to avoid rate limits
- Implement proper error handling for failed generations
- Cache successful results to avoid regeneration

### 🎬 **Quality Enhancement**
- Use negative prompts to avoid unwanted elements
- Match aspect ratio to intended use case
- Consider person generation settings for content policy
- Test different quality settings for optimal results

## Error Handling

Common issues and solutions:

### Image Download Failures
```javascript
try {
  const imageBytes = await downloadImageAsBytes(scene.imageUrl);
} catch (error) {
  console.error(`Failed to download image: ${error.message}`);
  // Handle fallback or skip scene
}
```

### Generation Timeouts
```javascript
const maxWaitTime = 300000; // 5 minutes
const startTime = Date.now();

while (!operation.done && (Date.now() - startTime) < maxWaitTime) {
  await new Promise(resolve => setTimeout(resolve, 10000));
  operation = await genAI.operations.getVideosOperation({ operation });
}

if (!operation.done) {
  throw new Error('Video generation timed out');
}
```

### Rate Limiting
```javascript
// Process scenes sequentially with delays
for (const scene of scenes) {
  try {
    await generateVideoForScene(scene);
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    if (error.message.includes('rate limit')) {
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 30000));
      // Retry logic here
    }
  }
}
```

## Migration from Veo 2

### Key Changes
1. **SDK**: Switched from Vertex AI SDK to Google GenAI SDK
2. **Models**: Updated to `veo-3.0-generate-preview` and `veo-3.0-fast-generate-preview`
3. **Aspect Ratios**: Removed support for 1:1 and 4:3 (Veo 3 limitation)
4. **Duration**: Fixed at ~5 seconds (no longer configurable)
5. **Image Input**: Now requires byte arrays instead of URLs
6. **Async Handling**: Improved polling mechanism for operations

### Backward Compatibility
The input schema maintains backward compatibility while adding new optional fields. Existing integrations will continue to work with default values.

## Troubleshooting

### Common Issues

1. **"No video generated in response"**
   - Check if the reference image is accessible
   - Verify prompt doesn't violate content policies
   - Ensure proper authentication

2. **"Failed to download image"**
   - Verify image URL is publicly accessible
   - Check image format is supported
   - Ensure stable internet connection

3. **"Operation timed out"**
   - Increase timeout duration
   - Try using fast generation model
   - Check Google Cloud quotas

4. **"Rate limit exceeded"**
   - Implement exponential backoff
   - Reduce concurrent requests
   - Consider upgrading API quotas

## Monitoring and Analytics

Track key metrics:
- Generation success rate
- Average processing time
- Error types and frequency
- Storage usage for generated videos
- User engagement with generated content

## Future Enhancements

- **Audio Integration**: Add background music and sound effects
- **Advanced Transitions**: Implement smooth scene transitions
- **Batch Processing**: Optimize for large-scale video generation
- **Real-time Preview**: Show generation progress to users
- **Custom Duration**: When Veo 3 supports variable durations

---

*For technical support or questions about Veo 3 integration, refer to the [Google GenAI documentation](https://ai.google.dev/docs) or contact the development team.*