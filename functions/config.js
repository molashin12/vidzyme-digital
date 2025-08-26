const { configureGenkit } = require('genkit');
const { firebase } = require('@genkit-ai/firebase');
const { googleAI } = require('@genkit-ai/googleai');
const { vertexAI } = require('@genkit-ai/vertexai');

// Configure Genkit with Firebase, Google AI, and Vertex AI plugins
configureGenkit({
  plugins: [
    firebase(),
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    }),
    vertexAI({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      location: 'us-central1',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

module.exports = {
  // Export any shared configuration if needed
};