const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const cors = require('cors')({ origin: true });

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 540
});

// Load environment variables
require('dotenv').config();

// Initialize Genkit configuration
require('./src/index');

// CORS middleware wrapper
function withCors(handler) {
  return onRequest(async (req, res) => {
    return cors(req, res, async () => {
      try {
        await handler(req, res);
      } catch (error) {
        console.error('Function error:', error);
        res.status(500).json({ error: error.message });
      }
    });
  });
}

// Import all flows
const { imageAnalysisFlow } = require('./src/imageAnalysis');
const { promptGenerationFlow } = require('./src/promptGeneration');
const { imageGenerationFlow } = require('./src/imageGeneration');
const { videoPromptGenerationFlow } = require('./src/videoPromptGeneration');
const { videoGenerationFlow } = require('./src/videoGeneration');
const { sequentialVideoGenerationFlow } = require('./src/sequentialVideoGeneration');
const { videoCreationFlow } = require('./src/orchestration');
const { frameExtractionFlow } = require('./src/frameExtraction');

// Export Cloud Functions
exports.imageAnalysis = withCors(async (req, res) => {
  const result = await imageAnalysisFlow(req.body);
  res.json(result);
});

exports.promptGeneration = withCors(async (req, res) => {
  const result = await promptGenerationFlow(req.body);
  res.json(result);
});

exports.imageGeneration = withCors(async (req, res) => {
  const result = await imageGenerationFlow(req.body);
  res.json(result);
});

exports.videoPromptGeneration = withCors(async (req, res) => {
  const result = await videoPromptGenerationFlow(req.body);
  res.json(result);
});

exports.videoGeneration = withCors(async (req, res) => {
  const result = await videoGenerationFlow(req.body);
  res.json(result);
});

exports.sequentialVideoGeneration = withCors(async (req, res) => {
  const result = await sequentialVideoGenerationFlow(req.body);
  res.json(result);
});

exports.videoCreation = withCors(async (req, res) => {
  const result = await videoCreationFlow(req.body);
  res.json(result);
});

exports.frameExtraction = withCors(async (req, res) => {
  const result = await frameExtractionFlow(req.body);
  res.json(result);
});

// Export createVideoWithGenkit for frontend compatibility
exports.createVideoWithGenkit = withCors(async (req, res) => {
  const result = await videoCreationFlow(req.body);
  res.json(result);
});