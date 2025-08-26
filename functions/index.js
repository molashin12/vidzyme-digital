const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 540
});

// Load environment variables
require('dotenv').config();

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
exports.imageAnalysis = onRequest(async (req, res) => {
  try {
    const result = await imageAnalysisFlow(req.body);
    res.json(result);
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.promptGeneration = onRequest(async (req, res) => {
  try {
    const result = await promptGenerationFlow(req.body);
    res.json(result);
  } catch (error) {
    console.error('Prompt generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.imageGeneration = onRequest(async (req, res) => {
  try {
    const result = await imageGenerationFlow(req.body);
    res.json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.videoPromptGeneration = onRequest(async (req, res) => {
  try {
    const result = await videoPromptGenerationFlow(req.body);
    res.json(result);
  } catch (error) {
    console.error('Video prompt generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.videoGeneration = onRequest(async (req, res) => {
  try {
    const result = await videoGenerationFlow(req.body);
    res.json(result);
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.sequentialVideoGeneration = onRequest(async (req, res) => {
  try {
    const result = await sequentialVideoGenerationFlow(req.body);
    res.json(result);
  } catch (error) {
    console.error('Sequential video generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.videoCreation = onRequest(async (req, res) => {
  try {
    const result = await videoCreationFlow(req.body);
    res.json(result);
  } catch (error) {
    console.error('Video creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.frameExtraction = onRequest(async (req, res) => {
  try {
    const result = await frameExtractionFlow(req.body);
    res.json(result);
  } catch (error) {
    console.error('Frame extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});