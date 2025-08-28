/* eslint-disable max-len */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { z } = require('zod');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Input/Output schemas for image analysis
const ImageAnalysisInput = z.object({
  imageUrl: z.string().url().describe('URL of the image to analyze'),
  analysisType: z.enum(['comprehensive', 'product', 'character']).default('comprehensive')
});

const ImageAnalysisOutput = z.object({
  labels: z.array(z.string()),
  objects: z.array(z.string()),
  summary: z.string(),
  analysis: z.string().optional()
});

// Convert image URL to base64
async function imageUrlToBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to fetch and convert image');
  }
}

// Main image analysis function
async function analyzeImage(input) {
  const { imageUrl } = ImageAnalysisInput.parse(input);

  try {
    console.log(`Analyzing image: ${imageUrl}`);

    // Convert image to base64
    const base64Image = await imageUrlToBase64(imageUrl);

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return {
      labels: ['analyzed'],
      objects: ['content'],
      summary: 'Image analyzed for product/character detection',
      analysis: text
    };
  } catch (error) {
    console.error('Error in image analysis:', error);

    // Return fallback analysis
    return {
      labels: ['error'],
      objects: ['unknown'],
      summary: 'Error: Unable to analyze image due to technical issues',
      analysis: 'Error: Unable to analyze image due to technical issues'
    };
  }
}

module.exports = {
  analyzeImage,
  ImageAnalysisInput,
  ImageAnalysisOutput
};