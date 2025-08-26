/* eslint-disable max-len */
const { z } = require('zod');
const { defineFlow } = require('@genkit-ai/flow');
const { ai } = require('./index');

// Input/Output schemas for image analysis
const ImageAnalysisInput = z.object({
  imageUrl: z.string().url().describe('URL of the image to analyze')
});

const ImageAnalysisOutput = z.object({
  analysis: z.string().describe('YAML formatted analysis of the image')
});

// Define the image analysis flow
const imageAnalysisFlow = defineFlow(
    {
      name: 'imageAnalysis',
      inputSchema: ImageAnalysisInput,
      outputSchema: ImageAnalysisOutput
    },
    async (input) => {
      const { imageUrl } = input;

      try {
        console.log(`Analyzing image: ${imageUrl}`);

        // Use Vertex AI Vision API for image analysis
        const model = ai.model('vertexai/gemini-1.5-pro-vision');

        const prompt = `Analyze the given image and determine if it primarily depicts a product or a character, or BOTH.

- If the image is of a product, return the analysis in YAML format with the following fields:
brand_name: (Name of the brand shown in the image, if visible or inferable)
color_scheme:
  - hex: (Hex code of each prominent color used)
    name: (Descriptive name of the color)
font_style: (Describe the font family or style used: serif/sans-serif, bold/thin, etc.)
visual_description: (A full sentence or two summarizing what is seen in the image, ignoring the background)

- If the image is of a character, return the analysis in YAML format with the following fields:
character_name: (Name of the character if visible or inferable)
color_scheme:
  - hex: (Hex code of each prominent color used on the character)
    name: (Descriptive name of the color)
outfit_style: (Description of clothing style, accessories, or notable features)
visual_description: (A full sentence or two summarizing what the character looks like, ignoring the background)

Only return the YAML. Do not explain or add any other comments. If it is BOTH, return both descriptions as guided above in YAML format. Describe the product precisely do not miss any description please.`;

        const response = await model.generate({
          messages: [{
            role: 'user',
            content: [{
              text: prompt
            }, {
              media: {
                url: imageUrl,
                contentType: 'image/jpeg'
              }
            }]
          }]
        });

        // Return the YAML analysis directly
        const analysis = {
          analysis: response.text || 'Unable to analyze image'
        };

        console.log('Image analysis completed successfully');
        return analysis;
      } catch (error) {
        console.error('Error in image analysis:', error);

        // Return fallback analysis
        return {
          analysis: 'Error: Unable to analyze image due to technical issues'
        };
      }
    }
);

module.exports = { imageAnalysisFlow };
