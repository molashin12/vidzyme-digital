/* eslint-disable max-len */
const { z } = require('zod');
const { defineFlow } = require('@genkit-ai/flow');
const { ai } = require('./index');

// Input/Output schemas
const PromptGenerationInput = z.object({
  imageAnalysis: z.string().describe('YAML analysis of the reference image'),
  userInstructions: z.string().describe('User-provided instructions for the scene')
});

const PromptGenerationOutput = z.object({
  image_prompt: z.string().describe('Stringified YAML with scene details'),
  aspect_ratio_image: z.string().describe('Aspect ratio: 3:2 or 2:3')
});

// Define the prompt generation flow
const promptGenerationFlow = defineFlow(
    {
      name: 'promptGeneration',
      inputSchema: PromptGenerationInput,
      outputSchema: PromptGenerationOutput
    },
    async (input) => {
      const { imageAnalysis, userInstructions } = input;

      try {
        const model = ai.model('vertexai/gemini-1.5-pro');

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
        "scenes": [
          {
            "image_prompt": "action: character holds product naturally\ncharacter: infer from the reference image\nproduct: show product with all visible text clear and accurate\nsetting: infer from the image or from user instruction\ncamera: amateur iPhone photo, casual selfie, uneven framing, slightly blurry\nstyle: candid UGC look, no filters, imperfections intact\ntext_accuracy: preserve all visible text exactly as in reference image"}
        ],
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

        const response = await model.generate({
          messages: [
            { role: 'system', content: [{ text: systemPrompt }] },
            { role: 'user', content: [{ text: userPrompt }] }
          ],
          config: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        });

        const responseText = response.text;

        // Parse JSON response
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);

          // Return the expected format
          return {
            image_prompt: parsedResponse.image_prompt || 'action: character holds product naturally\ncharacter: infer from the reference image\nproduct: show product with all visible text clear and accurate\nsetting: casual real-world environment\ncamera: amateur iPhone photo, casual selfie, uneven framing, slightly blurry\nstyle: candid UGC look, no filters, imperfections intact\ntext_accuracy: preserve all visible text exactly as in reference image',
            aspect_ratio_image: parsedResponse.aspect_ratio_image || '2:3'
          };
        } catch (parseError) {
        // Fallback if JSON parsing fails
          console.warn('Failed to parse JSON response, creating fallback');
          return {
            image_prompt: 'action: character holds product naturally\ncharacter: infer from the reference image\nproduct: show product with all visible text clear and accurate\nsetting: casual real-world environment\ncamera: amateur iPhone photo, casual selfie, uneven framing, slightly blurry\nstyle: candid UGC look, no filters, imperfections intact\ntext_accuracy: preserve all visible text exactly as in reference image',
            aspect_ratio_image: '2:3'
          };
        }
      } catch (error) {
        console.error('Prompt generation error:', error);
        throw new Error(`Failed to generate prompts: ${error.message}`);
      }
    }
);

module.exports = { promptGenerationFlow };
