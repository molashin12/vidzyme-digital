const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { getStorageBucket } = require('../config/firebase');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Extract frame from video using local FFmpeg
 * @param {string} videoUrl - URL of the video to extract frame from
 * @param {string|number} framePosition - Position of frame ('first', 'last', or time in seconds)
 * @param {string} outputFormat - Output format ('jpg' or 'png')
 * @returns {Promise<string>} - URL of the extracted frame
 */
async function extractFrameLocally(videoUrl, framePosition = 'last', outputFormat = 'jpg') {
  return new Promise((resolve, reject) => {
    // Create worker thread for FFmpeg processing
    const worker = new Worker(__filename, {
      workerData: {
        videoUrl,
        framePosition,
        outputFormat,
        isWorker: true
      }
    });

    worker.on('message', (result) => {
      if (result.success) {
        resolve(result.frameUrl);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

/**
 * Worker thread function for frame extraction
 */
async function processFrameExtractionInWorker() {
  try {
    const { videoUrl, framePosition, outputFormat } = workerData;
    
    // Create temporary directory for processing
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download video to temporary file
    const tempVideoFile = path.join(tempDir, `temp_video_${Date.now()}.mp4`);
    const response = await axios({
      method: 'GET',
      url: videoUrl,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(tempVideoFile);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Create output filename
    const outputFileName = `frame-${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(tempDir, outputFileName);

    // Extract frame using FFmpeg
    await new Promise((resolve, reject) => {
      const command = ffmpeg(tempVideoFile);
      
      // Set frame position
      if (framePosition === 'first') {
        command.seekInput(0);
      } else if (framePosition === 'last') {
        // Get video duration first, then seek to near the end
        command.ffprobe((err, metadata) => {
          if (err) {
            reject(err);
            return;
          }
          
          const duration = metadata.format.duration;
          const seekTime = Math.max(0, duration - 0.1); // 0.1 seconds before end
          
          ffmpeg(tempVideoFile)
            .seekInput(seekTime)
            .frames(1)
            .output(outputPath)
            .on('end', () => {
              console.log('Frame extraction completed');
              resolve();
            })
            .on('error', (err) => {
              console.error('FFmpeg error:', err);
              reject(err);
            })
            .run();
        });
        return;
      } else if (typeof framePosition === 'number') {
        command.seekInput(framePosition);
      }
      
      // For 'first' and numeric positions
      if (framePosition !== 'last') {
        command
          .frames(1)
          .output(outputPath)
          .on('end', () => {
            console.log('Frame extraction completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      }
    });

    // Upload frame to Firebase Storage
    const bucket = getStorageBucket();
    const firebaseFileName = `extracted-frames/${outputFileName}`;
    const file = bucket.file(firebaseFileName);
    
    await bucket.upload(outputPath, {
      destination: firebaseFileName,
      metadata: {
        contentType: `image/${outputFormat}`
      }
    });
    
    // Make file publicly accessible
    await file.makePublic();
    
    // Get public URL
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vidzyme.firebasestorage.app';
    const frameUrl = `https://storage.googleapis.com/${bucketName}/${firebaseFileName}`;
    
    // Clean up temporary files
    if (fs.existsSync(tempVideoFile)) {
      fs.unlinkSync(tempVideoFile);
    }
    
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    
    parentPort.postMessage({ success: true, frameUrl });
    
  } catch (error) {
    console.error('Worker error:', error);
    parentPort.postMessage({ success: false, error: error.message });
  }
}

// Handle worker thread execution
if (!isMainThread && workerData && workerData.isWorker) {
  processFrameExtractionInWorker();
}

module.exports = {
  extractFrameLocally
};