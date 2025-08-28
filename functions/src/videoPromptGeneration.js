/* eslint-disable max-len */
const { z } = require('zod');
const { genAI } = require('./index');

// Input/Output schemas
const VideoPromptGenerationInput = z.object({
  generatedImageUrl: z.string().describe('URL of the generated image from previous step'),
  userInstructions: z.string().describe('User-provided instructions for the video'),
  imageAnalysis: z.string().describe('Description of the reference image'),
  aspectRatio: z.string().describe('Aspect ratio from UI: 16:9 or 9:16')
});

const VideoPromptGenerationOutput = z.object({
  video_prompt: z.string().describe('UGC-style video prompt with casual dialogue and amateur iPhone video style description'),
  aspect_ratio_video: z.string().describe('Video aspect ratio: 16:9 or 9:16')
});

// Video prompt generation function
async function generateVideoPrompts(input) {
  const { generatedImageUrl, userInstructions, imageAnalysis, aspectRatio } = VideoPromptGenerationInput.parse(input);

  try {
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are a UGC (User-Generated Content) AI agent.
Your task: Generate a single UGC-style video prompt that creates realistic, casual scenes as if captured by everyday content creators or influencers.
All outputs must feel natural, candid, and unpolished -- avoiding professional or overly staged looks. This means:
- Everyday realism with authentic, relatable settings
- Amateur-quality iPhone photo/video style
- Slightly imperfect framing and lighting
- Candid poses and genuine expressions
- Visible imperfections (blemishes, messy hair, uneven skin, texture flaws)
- Real-world environments left as-is (clutter, busy backgrounds)

Camera parameters should always use keywords like: unremarkable amateur iPhone photos, reddit image, snapchat video, Casual iPhone selfie, slightly uneven framing, Authentic share, slightly blurry, amateur quality phone photo

Generate casual, conversational dialogue under 150 characters, as if a person were speaking naturally to a friend while talking about the product. Avoid overly formal or sales-like language. The tone should feel authentic, spontaneous, and relatable, matching the UGC style. Use ... to indicate pauses, and avoid special characters like em dashes or hyphens.

Output format:
dialogue: [casual conversation about the product]
action: [natural character actions with the product]
camera: [amateur iPhone video style description]
emotion: [authentic emotional state]
type: veo3_fast

Ensure diversity in gender, ethnicity, and hair color when applicable. Default to actors in 21 to 38 years old unless specified otherwise.
Do not use double quotes in any part of the prompts.`;

    const userPrompt = `Your task: Create a single UGC-style video prompt as guided by your system guidelines.

Make sure that the generated image is depicted as ACCURATELY as possible in the resulting video, especially all text and visual elements.

Have the character talk about the product and its benefits based on what you understand about the brand, and how it's used. So if it's a drink, talk about the taste; if it's a bag, talk about the design; if it's tech, talk about its features, and so on.

Unless stated by the user, do not have the character open or eat or use the product. They are just showing it to the camera.

***
User's instructions:
${userInstructions}

***
Description of the reference image analysis:
${imageAnalysis}

***
Generated image URL (this is the image that should be used in the video):
${generatedImageUrl}

***
Aspect ratio: ${aspectRatio}

***
Generate a single video prompt following the format specified above.`;

    const result = await geminiModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500
      }
    });

    const response = await result.response;
    const responseText = response.text();

    console.log('Generated video prompt response:', responseText);

    // Extract video prompt from response (it should be in the specified format)
    let videoPrompt = responseText.trim();

    // If the response doesn't contain the expected format, create a fallback
    if (!videoPrompt.includes('dialogue:') || !videoPrompt.includes('action:') || !videoPrompt.includes('camera:')) {
      console.warn('Response does not contain expected format, creating fallback prompt');
      videoPrompt = `dialogue: hey everyone... check out this amazing product I found\naction: character holds product naturally while speaking to camera\ncamera: amateur iphone selfie video, uneven framing, natural lighting\nemotion: excited, authentic\ntype: veo3_fast`;
    }

    return {
      video_prompt: videoPrompt,
      aspect_ratio_video: aspectRatio
    };
  } catch (error) {
    console.error('Video prompt generation error:', error);
    throw new Error(`Failed to generate video prompt: ${error.message}`);
  }
}

module.exports = {
  generateVideoPrompts,
  VideoPromptGenerationInput,
  VideoPromptGenerationOutput
};
