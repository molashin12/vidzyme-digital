const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 540
});

// Load environment variables
require('dotenv').config();

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

// Import all direct API functions
const { analyzeImage } = require('./src/imageAnalysis');
const { generatePrompts, generateImagePrompt } = require('./src/promptGeneration');
const { generateImages, generateImageFromPrompt } = require('./src/imageGeneration');
const { generateVideoPrompts } = require('./src/videoPromptGeneration');
const { generateVideos } = require('./src/videoGeneration');
const { createVideo } = require('./src/orchestration');

// Export Cloud Functions
exports.imageAnalysis = withCors(async (req, res) => {
  const result = await analyzeImage(req.body.imageUrl);
  res.json(result);
});

exports.promptGeneration = withCors(async (req, res) => {
  const result = await generatePrompts(req.body);
  res.json(result);
});

exports.imageGeneration = withCors(async (req, res) => {
  const result = await generateImages(req.body);
  res.json(result);
});

exports.videoPromptGeneration = withCors(async (req, res) => {
  const result = await generateVideoPrompts(req.body);
  res.json(result);
});

exports.videoGeneration = withCors(async (req, res) => {
  const result = await generateVideos(req.body);
  res.json(result);
});

// Main video creation endpoint
exports.videoCreation = withCors(async (req, res) => {
  const result = await createVideo(req.body);
  res.json(result);
});

// Legacy endpoint for frontend compatibility
exports.createVideoWithGenkit = withCors(async (req, res) => {
  try {
    console.log('Request method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    
    // For httpsCallable, data is nested under req.body.data
    const requestData = req.body.data || req.body;
    console.log('Parsed request data:', JSON.stringify(requestData, null, 2));
    
    const result = await createVideo(requestData);
    // Wrap response in data field for frontend compatibility
    res.json({ data: result });
  } catch (error) {
    console.error('Error in createVideoWithGenkit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Individual prompt generation endpoint for backward compatibility
exports.generateImagePrompt = withCors(async (req, res) => {
  const result = await generateImagePrompt(req.body);
  res.json(result);
});