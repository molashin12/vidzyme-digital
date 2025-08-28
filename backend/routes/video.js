const express = require('express');
const multer = require('multer');
const { verifyToken } = require('./auth');
const videoController = require('../controllers/videoController');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// All video routes require authentication
router.use(verifyToken);

// Video generation endpoints
router.post('/create-complete', videoController.createVideoComplete); // New complete pipeline endpoint
router.post('/generate', videoController.generateVideo);
router.post('/generate-with-genkit', videoController.generateVideoWithGenkit);
router.post('/generate-sequential', videoController.generateSequentialVideo);

// Frame extraction and analysis
router.post('/extract-frames', upload.single('video'), videoController.extractFrames);
router.post('/analyze-image', upload.single('image'), videoController.analyzeImage);

// Prompt generation
router.post('/generate-prompt', videoController.generatePrompt);
router.post('/generate-video-prompt', videoController.generateVideoPrompt);

// Image generation
router.post('/generate-image', videoController.generateImage);

// Video status and management
router.get('/status/:operationId', videoController.getVideoStatus);
router.get('/list', videoController.listUserVideos);
router.delete('/:videoId', videoController.deleteVideo);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          message: 'File too large. Maximum size is 50MB.',
          status: 400
        }
      });
    }
  }
  next(error);
});

module.exports = router;