const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ffmpeg = require('fluent-ffmpeg');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.STORAGE_BUCKET || 'your-storage-bucket';
const bucket = storage.bucket(bucketName);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Frame extraction endpoint
app.post('/extract-frame', async (req, res) => {
  const { videoUrl, framePosition = 'last', outputFormat = 'jpg' } = req.body;
  
  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }
  
  const tempDir = `/tmp/${uuidv4()}`;
  const videoFileName = `video_${uuidv4()}.mp4`;
  const frameFileName = `frame_${uuidv4()}.${outputFormat}`;
  const videoPath = path.join(tempDir, videoFileName);
  const framePath = path.join(tempDir, frameFileName);
  
  try {
    // Create temporary directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    console.log(`Starting frame extraction from: ${videoUrl}`);
    
    // Download video
    await downloadFromGCS(videoUrl, videoPath);
    
    // Extract frame
    await extractFrameWithFFmpeg(videoPath, framePath, framePosition);
    
    console.log('Frame extracted successfully, uploading to Cloud Storage...');
    
    // Upload frame to Cloud Storage
    const frameUrl = await uploadToGCS(framePath, `extracted-frames/${frameFileName}`);
    
    console.log(`Frame extraction completed: ${frameUrl}`);
    
    // Clean up temporary files
    cleanupTempDir(tempDir);
    
    res.status(200).json({
      success: true,
      frameUrl,
      message: 'Frame extracted successfully'
    });
    
  } catch (error) {
    console.error('Error extracting frame:', error);
    
    // Clean up temporary files on error
    cleanupTempDir(tempDir);
    
    res.status(500).json({
      error: 'Failed to extract frame',
      details: error.message
    });
  }
});

// Sequential video concatenation with smooth transitions
app.post('/concatenate-sequential-videos', async (req, res) => {
  const { clipUrls, outputFileName, transitions = true, crossfadeDuration = 0.5 } = req.body;
  
  if (!clipUrls || !Array.isArray(clipUrls) || clipUrls.length === 0) {
    return res.status(400).json({ error: 'clipUrls array is required' });
  }
  
  if (!outputFileName) {
    return res.status(400).json({ error: 'outputFileName is required' });
  }
  
  const tempDir = `/tmp/${uuidv4()}`;
  const outputPath = path.join(tempDir, outputFileName);
  
  try {
    // Create temporary directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    console.log(`Starting sequential video concatenation for ${clipUrls.length} clips with transitions: ${transitions}`);
    
    // Download all video clips
    const localClipPaths = [];
    for (let i = 0; i < clipUrls.length; i++) {
      const clipUrl = clipUrls[i];
      const localPath = path.join(tempDir, `clip_${i}.mp4`);
      
      console.log(`Downloading clip ${i + 1}/${clipUrls.length}: ${clipUrl}`);
      await downloadFromGCS(clipUrl, localPath);
      localClipPaths.push(localPath);
    }
    
    console.log('All clips downloaded, starting FFmpeg concatenation...');
    
    // Concatenate videos with smooth transitions
    if (transitions && localClipPaths.length > 1) {
      await concatenateVideosWithTransitions(localClipPaths, outputPath, crossfadeDuration);
    } else {
      await mergeVideosWithFFmpeg(localClipPaths, outputPath);
    }
    
    console.log('Videos concatenated successfully, uploading to Cloud Storage...');
    
    // Upload concatenated video to Cloud Storage
    const finalVideoUrl = await uploadToGCS(outputPath, `final-videos/${outputFileName}`);
    
    console.log(`Sequential video concatenation completed: ${finalVideoUrl}`);
    
    // Clean up temporary files
    cleanupTempDir(tempDir);
    
    res.status(200).json({
      success: true,
      finalVideoUrl,
      message: 'Sequential videos concatenated successfully with smooth transitions'
    });
    
  } catch (error) {
    console.error('Error concatenating sequential videos:', error);
    
    // Clean up temporary files on error
    cleanupTempDir(tempDir);
    
    res.status(500).json({
      error: 'Failed to concatenate sequential videos',
      details: error.message
    });
  }
});

// Main video merging endpoint
app.post('/merge-videos', async (req, res) => {
  const { clipUrls, outputFileName } = req.body;
  
  if (!clipUrls || !Array.isArray(clipUrls) || clipUrls.length === 0) {
    return res.status(400).json({ error: 'clipUrls array is required' });
  }
  
  if (!outputFileName) {
    return res.status(400).json({ error: 'outputFileName is required' });
  }
  
  const tempDir = `/tmp/${uuidv4()}`;
  const outputPath = path.join(tempDir, outputFileName);
  
  try {
    // Create temporary directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    console.log(`Starting video merge process for ${clipUrls.length} clips`);
    
    // Download all video clips
    const localClipPaths = [];
    for (let i = 0; i < clipUrls.length; i++) {
      const clipUrl = clipUrls[i];
      const localPath = path.join(tempDir, `clip_${i}.mp4`);
      
      console.log(`Downloading clip ${i + 1}/${clipUrls.length}: ${clipUrl}`);
      await downloadFromGCS(clipUrl, localPath);
      localClipPaths.push(localPath);
    }
    
    console.log('All clips downloaded, starting FFmpeg merge...');
    
    // Merge videos using FFmpeg
    await mergeVideosWithFFmpeg(localClipPaths, outputPath);
    
    console.log('Videos merged successfully, uploading to Cloud Storage...');
    
    // Upload merged video to Cloud Storage
    const finalVideoUrl = await uploadToGCS(outputPath, `final-videos/${outputFileName}`);
    
    console.log(`Video merge completed: ${finalVideoUrl}`);
    
    // Clean up temporary files
    cleanupTempDir(tempDir);
    
    res.status(200).json({
      success: true,
      finalVideoUrl,
      message: 'Videos merged successfully'
    });
    
  } catch (error) {
    console.error('Error merging videos:', error);
    
    // Clean up temporary files on error
    cleanupTempDir(tempDir);
    
    res.status(500).json({
      error: 'Failed to merge videos',
      details: error.message
    });
  }
});

// Download file from Google Cloud Storage
async function downloadFromGCS(gcsUrl, localPath) {
  try {
    // Extract file path from GCS URL (gs://bucket/path/to/file)
    const filePath = gcsUrl.replace(`gs://${bucketName}/`, '');
    const file = bucket.file(filePath);
    
    // Download file
    await file.download({ destination: localPath });
    
    console.log(`Downloaded ${gcsUrl} to ${localPath}`);
  } catch (error) {
    console.error(`Error downloading ${gcsUrl}:`, error);
    throw new Error(`Failed to download ${gcsUrl}: ${error.message}`);
  }
}

// Upload file to Google Cloud Storage
async function uploadToGCS(localPath, gcsPath) {
  try {
    const file = bucket.file(gcsPath);
    
    // Determine content type based on file extension
    const ext = path.extname(localPath).toLowerCase();
    let contentType = 'video/mp4';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }
    
    await file.save(fs.readFileSync(localPath), {
      metadata: {
        contentType
      }
    });
    
    console.log(`Uploaded ${localPath} to gs://${bucketName}/${gcsPath}`);
    return `gs://${bucketName}/${gcsPath}`;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    throw new Error(`Failed to upload ${localPath}: ${error.message}`);
  }
}

// Merge videos using FFmpeg
function mergeVideosWithFFmpeg(inputPaths, outputPath) {
  return new Promise((resolve, reject) => {
    if (inputPaths.length === 1) {
      // If only one clip, just copy it
      fs.copyFileSync(inputPaths[0], outputPath);
      resolve();
      return;
    }
    
    // Create FFmpeg command
    let command = ffmpeg();
    
    // Add all input files
    inputPaths.forEach(inputPath => {
      command = command.input(inputPath);
    });
    
    // Configure output
    command
      .outputOptions([
        '-c:v libx264',
        '-preset fast',
        '-crf 23',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
      ])
      .complexFilter([
        // Create concat filter for seamless merging
        inputPaths.map((_, i) => `[${i}:v][${i}:a]`).join('') + 
        `concat=n=${inputPaths.length}:v=1:a=1[outv][outa]`
      ], ['outv', 'outa'])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${Math.round(progress.percent || 0)}% done`);
      })
      .on('end', () => {
        console.log('FFmpeg processing finished successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(new Error(`FFmpeg processing failed: ${err.message}`));
      })
      .run();
  });
}

// Concatenate videos with smooth crossfade transitions
function concatenateVideosWithTransitions(inputPaths, outputPath, crossfadeDuration = 0.5) {
  return new Promise((resolve, reject) => {
    if (inputPaths.length === 0) {
      reject(new Error('No input videos provided'));
      return;
    }
    
    if (inputPaths.length === 1) {
      // If only one video, just copy it
      fs.copyFileSync(inputPaths[0], outputPath);
      resolve();
      return;
    }
    
    // Create FFmpeg command for crossfade transitions
    let command = ffmpeg();
    
    // Add all input files
    inputPaths.forEach(inputPath => {
      command = command.input(inputPath);
    });
    
    // Build complex filter for crossfade transitions
    const filterParts = [];
    let currentOutput = '[0:v][0:a]';
    
    for (let i = 1; i < inputPaths.length; i++) {
      const nextInput = `[${i}:v][${i}:a]`;
      const videoOutput = i === inputPaths.length - 1 ? '[outv]' : `[v${i}]`;
      const audioOutput = i === inputPaths.length - 1 ? '[outa]' : `[a${i}]`;
      
      // Add crossfade video transition
      filterParts.push(
        `${currentOutput.split('][')[0]}]${nextInput.split('][')[0]}]xfade=transition=fade:duration=${crossfadeDuration}:offset=0${videoOutput}`
      );
      
      // Add crossfade audio transition
      filterParts.push(
        `${currentOutput.split('][')[1]}${nextInput.split('][')[1]}acrossfade=d=${crossfadeDuration}${audioOutput}`
      );
      
      currentOutput = `${videoOutput}${audioOutput}`;
    }
    
    // Configure output with transitions
    command
      .outputOptions([
        '-c:v libx264',
        '-preset fast',
        '-crf 23',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
      ])
      .complexFilter(filterParts, ['outv', 'outa'])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg crossfade command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Crossfade processing: ${Math.round(progress.percent || 0)}% done`);
      })
      .on('end', () => {
        console.log('FFmpeg crossfade processing finished successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg crossfade error:', err);
        reject(new Error(`FFmpeg crossfade processing failed: ${err.message}`));
      })
      .run();
  });
}

// Extract frame from video using FFmpeg
function extractFrameWithFFmpeg(videoPath, framePath, framePosition = 'last') {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(videoPath);
    
    if (framePosition === 'last') {
      // Extract the last frame
      command
        .seekInput('99%')
        .frames(1)
        .output(framePath)
        .outputOptions([
          '-vf scale=1024:1024:force_original_aspect_ratio=decrease,pad=1024:1024:(ow-iw)/2:(oh-ih)/2',
          '-q:v 2'
        ]);
    } else if (framePosition === 'first') {
      // Extract the first frame
      command
        .seekInput(0)
        .frames(1)
        .output(framePath)
        .outputOptions([
          '-vf scale=1024:1024:force_original_aspect_ratio=decrease,pad=1024:1024:(ow-iw)/2:(oh-ih)/2',
          '-q:v 2'
        ]);
    } else if (typeof framePosition === 'number') {
      // Extract frame at specific time (in seconds)
      command
        .seekInput(framePosition)
        .frames(1)
        .output(framePath)
        .outputOptions([
          '-vf scale=1024:1024:force_original_aspect_ratio=decrease,pad=1024:1024:(ow-iw)/2:(oh-ih)/2',
          '-q:v 2'
        ]);
    } else {
      reject(new Error('Invalid framePosition. Use "first", "last", or a number (seconds)'));
      return;
    }
    
    command
      .on('start', (commandLine) => {
        console.log('FFmpeg frame extraction command:', commandLine);
      })
      .on('end', () => {
        console.log('Frame extraction finished successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg frame extraction error:', err);
        reject(new Error(`Frame extraction failed: ${err.message}`));
      })
      .run();
  });
}

// Clean up temporary directory
function cleanupTempDir(tempDir) {
  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`Cleaned up temporary directory: ${tempDir}`);
    }
  } catch (error) {
    console.error(`Error cleaning up ${tempDir}:`, error);
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`FFmpeg video merger service running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});