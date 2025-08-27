const { genAI } = require('./index');
const axios = require('axios');
const { z } = require('zod');

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
  const { imageUrl, analysisType } = ImageAnalysisInput.parse(input);

  try {
    console.log(`Analyzing image: ${imageUrl}`);

    // Convert image to base64
    const base64Image = await imageUrlToBase64(imageUrl);

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision-latest' });

    let prompt;

    if (analysisType === 'comprehensive') {
      prompt = `Analyze this image comprehensively and provide:
1. A list of main objects/subjects visible
2. A list of descriptive labels/tags
3. A detailed summary of what's shown

Format your response as JSON with these fields:
- objects: array of main objects/subjects
- labels: array of descriptive tags
- summary: detailed description

Be thorough and accurate in your analysis.`;
    } else {
      prompt = `Analyze the given image and determine if it primarily depicts a product or a character, or BOTH.

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
    }

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

    if (analysisType === 'comprehensive') {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(text);
        return {
          labels: parsed.labels || [],
          objects: parsed.objects || [],
          summary: parsed.summary || text
        };
      } catch (parseError) {
        // If JSON parsing fails, extract information manually
        const lines = text.split('\n');
        const labels = [];
        const objects = [];
        const summary = text;

        // Simple extraction logic
        lines.forEach((line) => {
          if (line.toLowerCase().includes('object') || line.toLowerCase().includes('subject')) {
            const match = line.match(/["']([^"']+)["']/g);
            if (match) {
              objects.push(...match.map((m) => m.replace(/["']/g, '')));
            }
          }
          if (line.toLowerCase().includes('label') || line.toLowerCase().includes('tag')) {
            const match = line.match(/["']([^"']+)["']/g);
            if (match) {
              labels.push(...match.map((m) => m.replace(/["']/g, '')));
            }
          }
        });

        return {
          labels: labels.length > 0 ? labels : ['image', 'visual content'],
          objects: objects.length > 0 ? objects : ['main subject'],
          summary: summary
        };
      }
    } else {
      return {
        labels: ['analyzed'],
        objects: ['content'],
        summary: 'Image analyzed for product/character detection',
        analysis: text
      };
    }
  } catch (error) {
    console.error('Error in image analysis:', error);

    // Return fallback analysis
    return {
      labels: ['error'],
      objects: ['unknown'],
      summary: 'Error: Unable to analyze image due to technical issues',
      analysis: analysisType !== 'comprehensive' ? 'Error: Unable to analyze image due to technical issues' : undefined
    };
  }
}

module.exports = {
  analyzeImage,
  ImageAnalysisInput,
  ImageAnalysisOutput
};
