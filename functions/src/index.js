// Load environment variables
require('dotenv').config();

const { configureGenkit } = require('@genkit-ai/core');
const { googleAI } = require('@genkit-ai/googleai');
const { vertexAI } = require('@genkit-ai/vertexai');

// Configure Genkit with all required plugins
const ai = configureGenkit({
  logLevel: 'debug',
  plugins: [
    // Google AI plugin for Gemini models
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY
    }),

    // Vertex AI plugin for advanced AI models (Imagen, Veo, etc.)
    vertexAI({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || 'static-groove-464313-t4',
      location: 'us-central1'
    })
  ]
});

module.exports = { ai };

// Genkit flows are automatically registered when required
// No need to export anything for the new Genkit version
