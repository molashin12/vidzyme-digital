# Reference Image Generation Guide

This guide explains how to use the updated Image Generation flow with reference image support using Vertex AI's Imagen 3.0 API.

## Overview

The updated image generation flow now supports two types of reference image customization:

1. **Subject Customization** (`REFERENCE_TYPE_SUBJECT`): Use a reference image to maintain consistency of specific subjects (people, objects, products) across generated images.
2. **Instruct Customization** (`REFERENCE_TYPE_RAW`): Transform or stylize a reference image according to text instructions.

## Input Schema Updates

### New Reference Image Fields

```javascript
referenceImage: {
  imageUrl: string (optional),           // URL to reference image
  base64Data: string (optional),         // Base64-encoded image data
  referenceType: enum,                   // 'REFERENCE_TYPE_SUBJECT' or 'REFERENCE_TYPE_RAW'
  referenceId: number (default: 1),      // ID to reference in prompt [1], [2], etc.
  subjectType: string (optional),        // For subject customization: 'PERSON', 'OBJECT', etc.
  imageDescription: string (optional),   // Description of the reference image
}
```

### New Parameters

- `sampleCount`: Number of images to generate per scene (1-4)

## Usage Examples

### 1. Subject Customization

Use this when you want to maintain a specific subject (like a product or person) across different scenes:

```javascript
const input = {
  scenes: [{
    id: 'product-scene',
    imagePrompt: 'Place the bottle [1] on a marble countertop with soft lighting',
    description: 'Product placement with reference bottle',
    referenceImage: {
      imageUrl: 'https://example.com/my-product.jpg',
      referenceType: 'REFERENCE_TYPE_SUBJECT',
      referenceId: 1,
      subjectType: 'OBJECT',
      imageDescription: 'Premium glass bottle with gold label'
    }
  }],
  style: 'photographic',
  aspectRatio: '16:9',
  quality: 'high',
  sampleCount: 2
};
```

### 2. Instruct Customization

Use this to transform or stylize an existing image:

```javascript
const input = {
  scenes: [{
    id: 'style-transform',
    imagePrompt: 'Transform the subject in image [1] to have a watercolor painting style',
    description: 'Artistic transformation',
    referenceImage: {
      base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...', // Your base64 image
      referenceType: 'REFERENCE_TYPE_RAW',
      referenceId: 1
    }
  }],
  style: 'artistic',
  aspectRatio: '1:1',
  quality: 'high',
  sampleCount: 1
};
```

### 3. Multiple Reference Images (Concept)

While the current schema supports one reference image per scene, you can create multiple scenes with different reference IDs:

```javascript
const input = {
  scenes: [
    {
      id: 'person-scene',
      imagePrompt: 'Show the person [1] in a professional office setting',
      referenceImage: {
        imageUrl: 'https://example.com/person.jpg',
        referenceType: 'REFERENCE_TYPE_SUBJECT',
        referenceId: 1,
        subjectType: 'PERSON',
        imageDescription: 'Business professional in suit'
      }
    },
    {
      id: 'product-scene',
      imagePrompt: 'Display the product [2] on a clean white background',
      referenceImage: {
        imageUrl: 'https://example.com/product.jpg',
        referenceType: 'REFERENCE_TYPE_SUBJECT',
        referenceId: 2,
        subjectType: 'OBJECT',
        imageDescription: 'Sleek electronic device'
      }
    }
  ],
  // ... other parameters
};
```

## Reference ID Usage in Prompts

- Use `[1]`, `[2]`, etc. in your prompts to reference specific images
- The `referenceId` field must match the number in brackets
- Example: "Place the bottle [1] next to the person [2] on a table"

## Best Practices

### Image Requirements
- **Size limit**: 10 MB maximum
- **Formats**: PNG, JPEG, WebP
- **Quality**: Higher quality reference images produce better results

### Prompt Writing
- Be specific about placement and context
- Use descriptive language for the scene
- Include the reference ID in brackets where the subject should appear

### Subject Types
Common subject types for `REFERENCE_TYPE_SUBJECT`:
- `PERSON`: For people and characters
- `OBJECT`: For products, items, tools
- `ANIMAL`: For pets and animals
- `VEHICLE`: For cars, bikes, etc.
- `BUILDING`: For architecture and structures

### Error Handling
- Provide fallback descriptions in `imageDescription`
- Use try-catch blocks when calling the flow
- Monitor API quotas and rate limits

## API Integration

The flow now uses Vertex AI's Imagen 3.0 API (`imagen-3.0-capability-002`) which provides:
- Enhanced image quality
- Better reference image understanding
- Improved prompt following
- Support for complex compositions

## Output Changes

- Each scene can now generate multiple images (based on `sampleCount`)
- Images are stored with enhanced metadata including reference information
- File naming includes image index for multiple generations

## Migration from Previous Version

If you're upgrading from the previous Imagen 2 implementation:

1. **Optional Migration**: Reference image fields are optional, so existing code continues to work
2. **Enhanced Output**: Be prepared to handle multiple images per scene
3. **New Dependencies**: Ensure `node-fetch` and `google-auth-library` are installed
4. **API Changes**: The flow now uses direct API calls instead of the Genkit Imagen plugin

## Troubleshooting

### Common Issues
1. **Image Download Failures**: Ensure reference image URLs are publicly accessible
2. **Base64 Encoding**: Verify base64 data is properly formatted
3. **Reference ID Mismatch**: Ensure prompt references match `referenceId` values
4. **API Quotas**: Monitor Vertex AI usage and quotas

### Error Messages
- "Failed to download image": Check image URL accessibility
- "Imagen API error": Verify project permissions and API enablement
- "Invalid reference ID": Ensure prompt contains correct bracket notation

## Example Integration

Here's how to integrate this into your application:

```javascript
const { imageGenerationFlow } = require('./src/genkit/flows/imageGeneration');

async function generateWithReference(userPrompt, referenceImageUrl) {
  try {
    const result = await imageGenerationFlow({
      scenes: [{
        id: 'user-scene',
        imagePrompt: userPrompt,
        description: 'User-generated scene with reference',
        referenceImage: {
          imageUrl: referenceImageUrl,
          referenceType: 'REFERENCE_TYPE_SUBJECT',
          referenceId: 1,
          subjectType: 'OBJECT',
          imageDescription: 'User-provided reference subject'
        }
      }],
      style: 'photographic',
      aspectRatio: '16:9',
      quality: 'high',
      sampleCount: 1
    });
    
    return result.generatedImages;
  } catch (error) {
    console.error('Generation failed:', error);
    throw error;
  }
}
```

This enhanced image generation capability opens up new possibilities for consistent branding, product visualization, and creative content generation with reference-based customization.