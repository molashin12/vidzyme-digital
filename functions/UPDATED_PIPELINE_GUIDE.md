# Updated Video Generation Pipeline Guide

## Overview

The video generation pipeline has been updated to include a dedicated **Video Prompt Generation** step, creating a more robust and authentic UGC (User-Generated Content) video creation process.

## Pipeline Architecture

The updated pipeline now consists of **5 sequential steps**:

### Step 1: Image Analysis
- **Flow**: `imageAnalysisFlow`
- **Purpose**: Analyzes the input product image using Vertex AI Vision
- **Input**: Product image URL
- **Output**: Image description, labels, and confidence scores
- **Model**: `vertexai/gemini-1.5-pro-vision`

### Step 2: Prompt Generation (Image)
- **Flow**: `promptGenerationFlow`
- **Purpose**: Generates image prompts and scene planning
- **Input**: Image analysis results, user prompt, video parameters
- **Output**: Scene descriptions, image prompts, and overall theme
- **Model**: `vertexai/gemini-1.5-pro`

### Step 3: Image Generation
- **Flow**: `imageGenerationFlow`
- **Purpose**: Generates images for each scene using Imagen 3.0
- **Input**: Scene prompts, style, aspect ratio, quality settings
- **Output**: Generated images stored in Google Cloud Storage
- **Model**: `vertexai/imagen-3.0-generate-001`

### Step 4: Video Prompt Generation (NEW)
- **Flow**: `videoPromptGenerationFlow`
- **Purpose**: Generates UGC-style video prompts with authentic dialogue
- **Input**: Image analysis, user instructions, duration, aspect ratio
- **Output**: Video prompts with natural dialogue and amateur camera styling
- **Model**: `vertexai/gemini-1.5-pro`
- **Key Features**:
  - Authentic UGC dialogue
  - Amateur iPhone camera keywords
  - Continuous dialogue flow
  - Product benefit focus
  - Brand name mention (first scene only)

### Step 5: Video Generation
- **Flow**: `videoGenerationFlow`
- **Purpose**: Generates videos using Veo 3 models
- **Input**: Generated images + video prompts from Step 4
- **Output**: Generated videos stored in Google Cloud Storage
- **Models**: `veo-3.0-generate-preview` or `veo-3.0-fast-generate-preview`

## Key Improvements

### 1. Dedicated Video Prompt Generation
- **Before**: Video prompts were generated alongside image prompts in Step 2
- **After**: Dedicated Step 4 focuses exclusively on video prompt creation
- **Benefit**: More sophisticated and authentic UGC-style video prompts

### 2. Enhanced UGC Authenticity
- Natural, conversational dialogue
- Amateur camera styling keywords
- Realistic social media aesthetics
- Continuous narrative flow across scenes

### 3. Improved Prompt Quality
- Video prompts are generated with full context from image analysis
- User instructions are properly integrated
- Scene-specific dialogue that makes sense
- Product benefits are naturally highlighted

## System and User Prompts

The video prompt generation step uses sophisticated system and user prompts:

### System Prompt Features:
- UGC-style content guidelines
- Authentic dialogue generation
- Amateur camera styling
- Product showcase instructions
- Brand mention rules (first scene only)

### User Prompt Integration:
- Takes user's video instructions
- Infers video count based on duration
- Respects aspect ratio preferences
- Incorporates model selection
- Suggests dialogue scripts

## Technical Implementation

### Updated Orchestration Flow

```javascript
// Step 4: Generate video prompts
const videoPromptGeneration = await videoPromptGenerationFlow({
  imageAnalysis: imageAnalysis.summary,
  userInstructions: userPrompt,
  totalDuration: duration,
  perVideoLength: 8,
  aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
  model: 'veo3_fast',
  dialogueScript: undefined,
});

// Step 5: Generate videos using prompts from Step 4
const videoGeneration = await videoGenerationFlow({
  scenes: videoPromptGeneration.scenes.map((videoScene, index) => {
    const imageScene = promptGeneration.scenes[index];
    const generatedImage = imageGeneration.generatedImages.find(
      img => img.sceneId === imageScene?.id
    );
    return {
      id: imageScene?.id || `scene_${index}`,
      imageUrl: generatedImage?.imageUrl || '',
      videoPrompt: videoScene.video_prompt, // From Step 4
      duration: 8,
      transitions: imageScene?.transitions,
    };
  }),
  aspectRatio: videoPromptGeneration.scenes[0]?.aspect_ratio_video || aspectRatio,
  model: videoPromptGeneration.scenes[0]?.model || 'veo-3.0-fast-generate-preview',
});
```

### Metadata Storage

The pipeline now stores metadata for all 5 steps:

```javascript
await storeVideoMetadata(videoId, {
  userId,
  input,
  imageAnalysis,        // Step 1
  promptGeneration,     // Step 2
  imageGeneration,      // Step 3
  videoPromptGeneration, // Step 4 (NEW)
  videoGeneration,      // Step 5
  processingTime: totalProcessingTime,
  createdAt: new Date(),
});
```

## Input Parameters

The pipeline accepts the following input parameters:

```javascript
{
  imageUrl: string,           // Product image URL
  userPrompt: string,         // User's video instructions
  videoStyle: enum,           // 'cinematic' | 'documentary' | 'artistic' | 'commercial' | 'social'
  duration: number,           // Total video duration (5-30 seconds)
  aspectRatio: enum,          // '1:1' | '4:3' | '16:9' | '9:16'
  quality: enum,              // 'standard' | 'high'
  userId: string              // User identifier
}
```

## Output Structure

The pipeline returns:

```javascript
{
  success: boolean,
  videoId: string,
  finalVideoUrl: string,
  scenes: [
    {
      id: string,
      imageUrl: string,
      videoUrl: string,
      duration: number
    }
  ],
  metadata: {
    totalDuration: number,
    totalScenes: number,
    processingTime: number,
    imageAnalysis: {
      labels: string[],
      summary: string
    },
    theme: string,
    style: string,
    quality: string
  }
}
```

## Testing

Two test files are available:

1. **`test-updated-pipeline.js`**: Full integration test (requires Firebase)
2. **`test-pipeline-structure.js`**: Structure validation test (no dependencies)

### Running Tests

```bash
# Structure test (recommended for development)
node test-pipeline-structure.js

# Full integration test (requires Firebase setup)
node test-updated-pipeline.js
```

## Benefits of the Updated Pipeline

1. **Better Separation of Concerns**: Image and video prompt generation are now separate
2. **Enhanced UGC Quality**: Dedicated focus on authentic social media content
3. **Improved Dialogue**: Natural, continuous conversation across scenes
4. **Better Context**: Video prompts have full access to image analysis results
5. **Flexible Integration**: Easy to modify video prompt generation without affecting other steps
6. **Comprehensive Metadata**: Full tracking of all pipeline steps

## Cloud Functions Integration

The updated pipeline is deployed as Cloud Functions:

- `genkitVideoCreation`: Main orchestration flow
- `genkitVideoPromptGeneration`: Standalone video prompt generation
- `createVideoWithGenkit`: HTTP-callable function for frontend integration

## Next Steps

1. Deploy the updated pipeline to production
2. Monitor video quality improvements
3. Gather user feedback on UGC authenticity
4. Consider A/B testing against the previous pipeline
5. Optimize video prompt templates based on usage patterns

---

*This updated pipeline provides a more sophisticated and authentic UGC video generation experience while maintaining the robust architecture and error handling of the original system.*