/* eslint-disable max-len */
const { genAI } = require('./index');
const { z } = require('zod');

// Input/Output schemas
const PromptGenerationInput = z.object({
  imageAnalysis: z.object({
    labels: z.array(z.string()),
    objects: z.array(z.string()),
    summary: z.string()
  }).describe('Analysis of the reference image'),
  userPrompt: z.string().describe('User-provided prompt or theme for the video'),
  videoStyle: z.enum(['cinematic', 'documentary', 'artistic', 'commercial', 'social']).default('cinematic'),
  duration: z.number().min(5).max(30).default(10)
});

const PromptGenerationOutput = z.object({
  scenes: z.array(z.object({
    id: z.string(),
    prompt: z.string(),
    duration: z.number(),
    imagePrompt: z.string().optional()
  })),
  overallTheme: z.string(),
  totalDuration: z.number()
});

// Legacy input schema for backward compatibility
const LegacyPromptGenerationInput = z.object({
  imageAnalysis: z.string().describe('YAML analysis of the reference image'),
  userInstructions: z.string().describe('User-provided instructions for the scene')
});

const LegacyPromptGenerationOutput = z.object({
  image_prompt: z.string().describe('Stringified YAML with scene details'),
  aspect_ratio_image: z.string().describe('Aspect ratio: 3:2 or 2:3')
});

// Main prompt generation function
async function generatePrompts(input) {
  const { imageAnalysis, userPrompt, videoStyle, duration } = PromptGenerationInput.parse(input);

  try {
    console.log('Generating prompts for video creation...');

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const systemPrompt = `You are an expert video prompt generator for AI video creation. Your task is to create detailed scene prompts based on image analysis and user requirements.

Given:
- Image analysis with objects, labels, and summary
- User prompt/theme
- Video style: ${videoStyle}
- Total duration: ${duration} seconds

Create 3-5 scenes that tell a cohesive story. Each scene should:
1. Be 2-4 seconds long
2. Have a clear, detailed prompt for AI video generation
3. Build upon the previous scene for continuity
4. Incorporate elements from the image analysis
5. Match the specified video style

Return your response as JSON with this structure:
{
  "scenes": [
    {
      "id": "scene_1",
      "prompt": "detailed scene description",
      "duration": 3
    }
  ],
  "overallTheme": "brief theme description",
  "totalDuration": ${duration}
}

Make prompts cinematic and detailed for best AI video results.`;

    const userMessage = `Create video scenes based on this analysis:

Image Objects: ${imageAnalysis.objects.join(', ')}
Image Labels: ${imageAnalysis.labels.join(', ')}
Image Summary: ${imageAnalysis.summary}

User Theme/Prompt: ${userPrompt}

Generate engaging ${videoStyle} style scenes that incorporate the image elements and user's vision.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userMessage }
    ]);

    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(text);

      // Validate and ensure proper structure
      const scenes = parsed.scenes || [];
      let totalDur = 0;

      const validatedScenes = scenes.map((scene, index) => {
        const sceneDuration = scene.duration || Math.floor(duration / scenes.length);
        totalDur += sceneDuration;

        return {
          id: scene.id || `scene_${index + 1}`,
          prompt: scene.prompt || `Scene ${index + 1} based on ${userPrompt}`,
          duration: sceneDuration
        };
      });

      return {
        scenes: validatedScenes,
        overallTheme: parsed.overallTheme || `${videoStyle} video based on ${userPrompt}`,
        totalDuration: Math.min(totalDur, duration)
      };
    } catch (parseError) {
      console.warn('Failed to parse JSON response, creating fallback scenes');

      // Create fallback scenes
      const sceneCount = Math.min(4, Math.max(2, Math.floor(duration / 3)));
      const sceneDuration = Math.floor(duration / sceneCount);

      const fallbackScenes = [];
      for (let i = 0; i < sceneCount; i++) {
        fallbackScenes.push({
          id: `scene_${i + 1}`,
          prompt: `${videoStyle} scene ${i + 1}: ${userPrompt} featuring ${imageAnalysis.objects.join(' and ')}`,
          duration: sceneDuration
        });
      }

      return {
        scenes: fallbackScenes,
        overallTheme: `${videoStyle} video: ${userPrompt}`,
        totalDuration: duration
      };
    }
  } catch (error) {
    console.error('Prompt generation error:', error);
    throw new Error(`Failed to generate prompts: ${error.message}`);
  }
}

// Legacy function for backward compatibility
async function generateImagePrompt(input) {
  const { imageAnalysis, userInstructions } = LegacyPromptGenerationInput.parse(input);

  try {
    console.log('Generating image prompt (legacy mode)...');

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const systemPrompt = `## SYSTEM PROMPT: Image Prompt Generator
Default: If the user's instructions are not very detailed, just default the prompt to: put this (product) into the scene with the (character).
If the user wants UGC authentic casual content: Use **casual UGC-style scenes** unless the user specifies otherwise, and follow the instructions below.
If the user explicitly requests a different style or setting, follow their instructions.
Your task: Take the reference image or the product in the reference image and place it into realistic, casual scenes as if captured by everyday content creators or influencers.
All outputs must feel **natural, candid, and unpolished** - avoiding professional or overly staged looks. This means:
- Everyday realism with authentic, relatable settings - Amateur-quality iPhone photo style
- Slightly imperfect framing and lighting
- Candid poses and genuine expressions
- Visible imperfections (blemishes, messy hair, uneven skin, texture flaws)
- Real-world environments left as-is (clutter, busy backgrounds)
- Always preserve all visible product **text accurately** (logos, slogans, packaging claims). Never invent extra claims or numbers.

**Camera parameter** must always include casual realism descriptors such as:
unremarkable amateur iPhone photos, reddit image, snapchat photo, Casual iPhone selfie, slightly uneven framing,
Authentic share, slightly blurry, Amateur quality phone photo
**Dialogue/video generation is not required. Only image prompts are generated.**
Avoid mentioning the name of any copyrighted characters in the prompt
A - Ask:
Generate **image generation instructions only** for AI models based on the user's request, ensuring exact YAML format.
Default to **vertical aspect ratio** if unspecified. Always include both:
\`image_prompt\` (stringified YAML with scene details) \`aspect_ratio_image\` ("3:2" or "2:3")
G Guidance:
Always follow UGC-style casual realism principles listed above.
- Ensure diversity in gender, ethnicity, and hair color when applicable. Default to actors in 21 to 38 years old unless specified otherwise.
- Default to casual real-world environments unless a setting is explicitly specified.
- Avoid double quotes in the image prompts.

E - Examples:
  good_examples:
    - |
      {
        "image_prompt": "action: character holds product naturally\ncharacter: infer from the reference image\nproduct: show product with all visible text clear and accurate\nsetting: infer from the image or from user instruction\ncamera: amateur iPhone photo, casual selfie, uneven framing, slightly blurry\nstyle: candid UGC look, no filters, imperfections intact\ntext_accuracy: preserve all visible text exactly as in reference image",
        "aspect_ratio_image": "2:3"
      }
bad_examples:
  - Altering or fabricating product packaging text

N Notation:
Final output is an object containing only: \`image_prompt\` → stringified YAML
\`aspect_ratio_image\` → "3:2" or "2:3" (default vertical → 2:3)

T- Tools
Think Tool: Double-check output for completeness, text accuracy, adherence to UGC realism, and that **only image outputs** are returned.`;

    const userPrompt = `Your task: Create 1 image prompt as guided by your system guidelines.
Make sure that the reference image is depicted as ACCURATELY as possible in the resulting images, especially all text.
***
These are the user's instructions
${userInstructions}
***
Description of the reference image:
${imageAnalysis}
***
The user's preferred aspect ratio: inferred based on their message above, default is vertical if not given
***
Use the Think tool to double check your output`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(text);

      return {
        image_prompt: parsed.image_prompt || 'action: character holds product naturally\ncharacter: infer from the reference image\nproduct: show product with all visible text clear and accurate\nsetting: casual real-world environment\ncamera: amateur iPhone photo, casual selfie, uneven framing, slightly blurry\nstyle: candid UGC look, no filters, imperfections intact\ntext_accuracy: preserve all visible text exactly as in reference image',
        aspect_ratio_image: parsed.aspect_ratio_image || '2:3'
      };
    } catch (parseError) {
      console.warn('Failed to parse JSON response, creating fallback');
      return {
        image_prompt: 'action: character holds product naturally\ncharacter: infer from the reference image\nproduct: show product with all visible text clear and accurate\nsetting: casual real-world environment\ncamera: amateur iPhone photo, casual selfie, uneven framing, slightly blurry\nstyle: candid UGC look, no filters, imperfections intact\ntext_accuracy: preserve all visible text exactly as in reference image',
        aspect_ratio_image: '2:3'
      };
    }
  } catch (error) {
    console.error('Image prompt generation error:', error);
    throw new Error(`Failed to generate image prompt: ${error.message}`);
  }
}

module.exports = {
  generatePrompts,
  generateImagePrompt,
  PromptGenerationInput,
  PromptGenerationOutput,
  LegacyPromptGenerationInput,
  LegacyPromptGenerationOutput
};
