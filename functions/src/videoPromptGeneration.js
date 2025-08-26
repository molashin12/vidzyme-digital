const { z } = require('zod');
const { defineFlow } = require('@genkit-ai/flow');

// Input/Output schemas
const VideoPromptGenerationInput = z.object({
  imageAnalysis: z.string().describe('Description of the reference image'),
  userInstructions: z.string().describe('User-provided instructions for the video'),
  totalDuration: z.number().optional().describe('Total video duration in seconds'),
  perVideoLength: z.number().optional().default(8).describe('Length per video in seconds'),
  aspectRatio: z.string().optional().describe('Preferred aspect ratio'),
  model: z.string().optional().describe('Preferred model'),
  dialogueScript: z.string().optional().describe('User-provided dialogue script'),
});

const VideoPromptGenerationOutput = z.object({
  scenes: z.array(z.object({
    video_prompt: z.string().describe('Complete video prompt with dialogue, action, camera, emotion, and type'),
    aspect_ratio_video: z.string().describe('Video aspect ratio: 16:9 or 9:16'),
    model: z.string().describe('Model to use: veo3_fast or veo3'),
  })),
});

// Define the video prompt generation flow
const videoPromptGenerationFlow = defineFlow(
  {
    name: 'videoPromptGeneration',
    inputSchema: VideoPromptGenerationInput,
    outputSchema: VideoPromptGenerationOutput,
  },
  async (input) => {
    const { imageAnalysis, userInstructions, totalDuration, perVideoLength, aspectRatio, model, dialogueScript } = input;
    
    try {
      const geminiModel = ai.model('vertexai/gemini-1.5-pro');
      
      const systemPrompt = `You are a UGC (User-Generated Content) AI agent.
Your task: Take the reference image or the product in the reference image and place it into realistic, casual scenes as if captured by everyday content creators or influencers.
All outputs must feel natural, candid, and unpolished -- avoiding professional or overly staged looks. This means:
Everyday realism with authentic, relatable settings
Amateur-quality iPhone photo/video style
Slightly imperfect framing and lighting
Candid poses and genuine expressions
Visible imperfections (blemishes, messy hair, uneven skin, texture flaws)
Real-world environments left as-is (clutter, busy backgrounds)
We need these videos to look natural and real. So in the prompts, have the Camera parameter always use keywords like these: unremarkable amateur iPhone photos, reddit image, snapchat video, Casual iPhone selfie, slightly uneven framing, Authentic share, slightly blurry, amateur quality phone photo
If the dialogue is not provided by the user or you are explicitly asked to create it, generate a casual, conversational line under 150 characters, as if a person were speaking naturally to a friend while talking about the product. Avoid overly formal or sales-like language. The tone should feel authentic, spontaneous, and relatable, matching the UGC style. Use ... to indicate pauses, and avoid special characters like em dashes or hyphens.
A - Ask:
Generate only video generation instructions for AI models (no image prompts).
Infer aspect ratios from vertical/horizontal context; default to vertical if unspecified.
**Scene count rule:**
Read the user's requested total video duration and the per-video length (in seconds).
Calculate the required number of videos by dividing total duration by per-video length, rounding **up** to the nearest integer.
Output **exactly that many scenes**.
Never output more or fewer scenes than requested.
G - Guidance:
Always follow UGC-style casual realism principles listed above.
Ensure diversity in gender, ethnicity, and hair color when applicable. Default to actors in 21 to 38 years old unless specified otherwise.
Use provided scene list when available.
Do not use double quotes in any part of the prompts.
E - Examples:
good_examples:
{
  "scenes": [
    {
      "video_prompt": "dialogue: so TikTok made me buy this... honestly its the best tasting fruit beer in sydney and they donate profits to charity...\naction: character sits in drivers seat of a parked car, holding the beer can casually while speaking\ncamera: amateur iphone selfie video, uneven framing, natural daylight\nemotion: very happy, casual excitement\ntype: veo3_fast",
      "aspect_ratio_video": "9:16",
      "model": "veo3_fast"
    }
  ]
}
N - Notation:
Final output is a scenes array at the root level.
The array must contain **exactly scene_count** objects, where scene_count is the user-calculated number.
T - Tools:
Think Tool: Double-check output for completeness, text accuracy, adherence to UGC realism, and that only video outputs are returned.`;
      
      // Calculate scene count
      const sceneCount = totalDuration ? Math.ceil(totalDuration / perVideoLength) : 3;
      
      const userPrompt = `Your task: Create video prompts as guided by your system guidelines.

Make sure that the reference image is depicted as ACCURATELY as possible in the resulting images, especially all text.

For each of the scenes, make sure the dialogue runs continuously and makes sense. And always have the character just talk about the product and its benefits based on what you understand about the brand, and how it's used. So if it's a drink, talk about the taste; if it's a bag, talk about the design; if it's tech, talk about its features, and so on.

If the character will mention the brand name, only do so in the FIRST scene.

Unless stated by the user, do not have the character open or eat or use the product. They are just showing it to the camera.

If the number of videos is not stated, generate 3 scenes.

***
These are the user's instructions:
${userInstructions}

***
Count of videos to create: ${sceneCount}. Each video will be ${perVideoLength} seconds long, so calculate how many videos you need to generate based on the user's desired total duration.

***
Description of the reference image/s. Just use this to understand who the product or character is, don't use it as basis for the dialogue.
${imageAnalysis}

***
The user's preferred aspect ratio: ${aspectRatio || 'inferred based on their message above, default is vertical if not given'}.
The user's preferred model: ${model || 'inferred based on their message above, default is veo3_fast if not given'}.
The user's preferred dialogue script: ${dialogueScript || 'inferred based on their message above, suggest a script'}.

***
Use the Think tool to double check your output.`;
      
      const response = await geminiModel.generate({
        messages: [
          { role: 'system', content: [{ text: systemPrompt }] },
          { role: 'user', content: [{ text: userPrompt }] }
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        },
      });
      
      const responseText = response.text;
      
      // Parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
        
        // Ensure we have the correct number of scenes
        if (!parsedResponse.scenes || parsedResponse.scenes.length !== sceneCount) {
          throw new Error(`Expected ${sceneCount} scenes, got ${parsedResponse.scenes?.length || 0}`);
        }
        
        // Validate and normalize each scene
        const normalizedScenes = parsedResponse.scenes.map((scene, index) => {
          return {
            video_prompt: scene.video_prompt || [
              'dialogue: check this out... this product is amazing',
              'action: character holds product naturally while speaking to camera',
              'camera: amateur iphone selfie video, uneven framing, natural lighting',
              'emotion: excited, authentic',
              'type: veo3_fast'
            ].join('\n'),
            aspect_ratio_video: scene.aspect_ratio_video || aspectRatio || '9:16',
            model: scene.model || model || 'veo3_fast'
          };
        });
        
        return {
          scenes: normalizedScenes
        };
        
      } catch (parseError) {
        console.warn('Failed to parse JSON response, creating fallback scenes');
        
        // Create fallback scenes
        const fallbackScenes = Array.from({ length: sceneCount }, (_, index) => ({
          video_prompt: `dialogue: hey everyone... so I wanted to show you this amazing product\naction: character holds product naturally while speaking to camera\ncamera: amateur iphone selfie video, uneven framing, natural lighting\nemotion: excited, authentic\ntype: veo3_fast`,
          aspect_ratio_video: aspectRatio || '9:16',
          model: model || 'veo3_fast'
        }));
        
        return {
          scenes: fallbackScenes
        };
      }
      
    } catch (error) {
      console.error('Video prompt generation error:', error);
      throw new Error(`Failed to generate video prompts: ${error.message}`);
    }
  }
);

module.exports = { videoPromptGenerationFlow };