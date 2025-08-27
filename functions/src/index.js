// Load environment variables
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');
const { VertexAI } = require('@google-cloud/vertexai');
const { GoogleAuth } = require('google-auth-library');

// Initialize Google GenAI client
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY
});

// Initialize Vertex AI client
const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT || 'vidzyme',
  location: 'us-central1'
});

// Initialize Google Auth for Vertex AI
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

// Export clients for use in other modules
module.exports = {
  genAI,
  vertexAI,
  auth
};
