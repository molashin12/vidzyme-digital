# UGC-Style Video Prompt Generation Guide

## Overview

The UGC (User-Generated Content) Video Prompt Generation flow creates authentic, casual video prompts that mimic real social media content from everyday creators and influencers. This system generates realistic, unpolished video scenes that feel natural and relatable.

## Key Features

### 🎯 Authentic UGC Style
- **Everyday realism** with authentic, relatable settings
- **Amateur-quality iPhone** photo/video style
- **Slightly imperfect** framing and lighting
- **Candid poses** and genuine expressions
- **Visible imperfections** (natural skin texture, messy hair)
- **Real-world environments** left as-is (clutter, busy backgrounds)

### 📱 Camera Keywords
Always uses authentic camera descriptions:
- "unremarkable amateur iPhone photos"
- "reddit image"
- "snapchat video"
- "Casual iPhone selfie"
- "slightly uneven framing"
- "Authentic share"
- "slightly blurry"
- "amateur quality phone photo"

### 💬 Natural Dialogue
- Casual, conversational lines under 150 characters
- Authentic, spontaneous, and relatable tone
- Uses "..." for natural pauses
- Avoids formal or sales-like language
- Product-focused but genuine recommendations

## Input Schema

```javascript
const VideoPromptGenerationInput = {
  imageAnalysis: string,        // Description of the reference image/product
  userInstructions: string,     // User's specific requirements
  totalDuration?: number,       // Total video duration in seconds (optional)
  perVideoLength?: number,      // Length per video in seconds (default: 8)
  aspectRatio?: string,         // '9:16' (vertical) or '16:9' (horizontal)
  model?: string,              // 'veo3_fast' or 'veo3' (default: veo3_fast)
  dialogueScript?: string      // Optional custom dialogue guidance
}
```

## Output Schema

```javascript
const VideoPromptGenerationOutput = {
  scenes: [
    {
      video_prompt: string,        // Complete video generation prompt
      aspect_ratio_video: string,  // '9:16' or '16:9'
      model: string               // 'veo3_fast' or 'veo3'
    }
  ]
}
```

## Scene Count Calculation

The system automatically calculates the number of scenes based on:
- **Total Duration** ÷ **Per-Video Length** = **Scene Count** (rounded up)
- If no duration specified, defaults to **3 scenes**
- Each scene represents one video segment

### Examples:
- 24 seconds total ÷ 8 seconds per video = 3 scenes
- 30 seconds total ÷ 10 seconds per video = 3 scenes
- 25 seconds total ÷ 8 seconds per video = 4 scenes (rounded up)

## Usage Examples

### Basic TikTok-Style Video
```javascript
const input = {
  imageAnalysis: 'A young woman holding a colorful energy drink can with "BOOST" branding.',
  userInstructions: 'Create a casual TikTok-style video showing someone trying this energy drink for the first time.',
  totalDuration: 24,
  perVideoLength: 8,
  aspectRatio: '9:16',
  model: 'veo3_fast'
};
```

### Product Review Style
```javascript
const input = {
  imageAnalysis: 'Sleek black wireless headphones with "SoundMax Pro" branding.',
  userInstructions: 'Create an honest product review video where someone talks about these headphones.',
  totalDuration: 30,
  perVideoLength: 10,
  aspectRatio: '9:16',
  dialogueScript: 'Talk about the sound quality, battery life, and comfort'
};
```

### Quick Instagram Story
```javascript
const input = {
  imageAnalysis: 'A trendy reusable water bottle with motivational quotes.',
  userInstructions: 'Create a quick Instagram story style video showing off this water bottle.',
  aspectRatio: '9:16'
  // No duration specified - defaults to 3 scenes
};
```

## Generated Prompt Structure

Each video prompt includes:

```
dialogue: [Natural, casual conversation about the product]
action: [Specific character actions and product interaction]
camera: [Amateur iPhone video style description]
emotion: [Authentic emotional state]
type: [Model type - veo3_fast or veo3]
```

### Example Output:
```javascript
{
  "scenes": [
    {
      "video_prompt": "dialogue: so TikTok made me buy this... honestly its the best tasting fruit beer in sydney and they donate profits to charity...\naction: character sits in drivers seat of a parked car, holding the beer can casually while speaking\ncamera: amateur iphone selfie video, uneven framing, natural daylight\nemotion: very happy, casual excitement\ntype: veo3_fast",
      "aspect_ratio_video": "9:16",
      "model": "veo3_fast"
    }
  ]
}
```

## Best Practices

### 📝 Prompt Engineering
- Focus on **authentic product benefits** (taste, design, features)
- Mention **brand name only in the first scene**
- Keep dialogue **under 150 characters**
- Use **natural speech patterns** with pauses

### 🎬 Scene Variety
- Different **camera angles** and **settings**
- Varied **emotional states** (excited, thoughtful, casual)
- Multiple **interaction styles** (holding, showing, demonstrating)
- Diverse **demographics** (age 21-38, varied ethnicity)

### 📱 Platform Optimization
- **Vertical (9:16)** for TikTok, Instagram Reels, YouTube Shorts
- **Horizontal (16:9)** for YouTube, Facebook
- **Fast model (veo3_fast)** for quick generation
- **Standard model (veo3)** for higher quality

## Integration with Video Generation

The generated prompts are designed to work seamlessly with the Veo 3 video generation flow:

```javascript
// 1. Generate UGC-style prompts
const promptResult = await videoPromptGenerationFlow(promptInput);

// 2. Use prompts for video generation
for (const scene of promptResult.scenes) {
  const videoInput = {
    prompt: scene.video_prompt,
    aspectRatio: scene.aspect_ratio_video,
    model: scene.model,
    duration: 5, // Veo 3 generates ~5 second videos
    personGeneration: 'allow_adult'
  };
  
  const video = await videoGenerationFlow(videoInput);
}
```

## Error Handling

The flow includes robust error handling:
- **JSON parsing fallbacks** for malformed responses
- **Default values** for missing parameters
- **Validation** of scene count and format
- **Graceful degradation** for API failures

## Deployment

The flow is deployed as a Cloud Function:
```
exports.genkitVideoPromptGeneration = onCallGenkit({}, videoPromptGenerationFlow);
```

Access via:
- **Function name**: `genkitVideoPromptGeneration`
- **Region**: `us-central1`
- **Runtime**: Node.js with Genkit framework

## Testing

Use the provided test file to validate functionality:
```bash
node test-ugc-video-prompts.js
```

Test scenarios include:
- Basic UGC prompt generation
- Product review style
- Quick social media posts
- Horizontal format videos
- Scene count calculations

## Future Enhancements

- **Multi-language support** for global markets
- **Brand voice customization** for different companies
- **Trend integration** with current social media trends
- **A/B testing** for prompt effectiveness
- **Analytics integration** for performance tracking

---

*This UGC-style video prompt generation creates authentic, relatable content that resonates with modern social media audiences while maintaining product focus and brand authenticity.*