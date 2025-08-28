const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getStorageBucket } = require('../config/firebase');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Combine multiple videos using local FFmpeg
 * @param {string[]} videoUrls - Array of video URLs to combine
 * @param {string} aspectRatio - Video aspect ratio (e.g., '16:9')
 * @returns {Promise<string>} - URL of the combined video
 */
async function combineVideosLocally(videoUrls, aspectRatio) {
  return new Promise((resolve, reject) => {
    // Create worker thread for FFmpeg processing
    const worker = new Worker(__filename, {
      workerData: {
        videoUrls,
        aspectRatio,
        isWorker: true
      }
    });

    worker.on('message', (result) => {
      if (result.success) {
        resolve(result.videoUrl);
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
 * Worker thread function for FFmpeg processing
 */
async function processVideosInWorker() {
  try {
    const { videoUrls, aspectRatio } = workerData;
    
    // Create temporary directory for processing
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download videos to temporary files
    const tempFiles = [];
    const axios = require('axios');
    
    for (let i = 0; i < videoUrls.length; i++) {
      const tempFile = path.join(tempDir, `temp_video_${i}_${Date.now()}.mp4`);
      const response = await axios({
        method: 'GET',
        url: videoUrls[i],
        responseType: 'stream'
      });
      
      const writer = fs.createWriteStream(tempFile);
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      tempFiles.push(tempFile);
    }

    // Get video dimensions based on aspect ratio
    const dimensions = getVideoDimensions(aspectRatio);
    
    // Create output filename
    const outputFileName = `combined-video-${uuidv4()}.mp4`;
    const outputPath = path.join(tempDir, outputFileName);

    // Combine videos using FFmpeg
    await new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      // Add input files
      tempFiles.forEach(file => {
        command.input(file);
      });
      
      // Set output options
      command
        .complexFilter([
          // Scale all videos to same size
          ...tempFiles.map((_, i) => `[${i}:v]scale=${dimensions.width}:${dimensions.height}:force_original_aspect_ratio=decrease,pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`),
          // Concatenate videos
          `${tempFiles.map((_, i) => `[v${i}][${i}:a]`).join('')}concat=n=${tempFiles.length}:v=1:a=1[outv][outa]`
        ])
        .outputOptions([
          '-map', '[outv]',
          '-map', '[outa]',
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-preset', 'fast',
          '-crf', '23'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log('FFmpeg processing completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${Math.round(progress.percent || 0)}% done`);
        })
        .run();
    });

    // Upload combined video to Firebase Storage
    const bucket = getStorageBucket();
    const firebaseFileName = `combined-videos/${outputFileName}`;
    const file = bucket.file(firebaseFileName);
    
    await bucket.upload(outputPath, {
      destination: firebaseFileName,
      metadata: {
        contentType: 'video/mp4'
      }
    });
    
    // Make file publicly accessible
    await file.makePublic();
    
    // Get public URL
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vidzyme.firebasestorage.app';
    const videoUrl = `https://storage.googleapis.com/${bucketName}/${firebaseFileName}`;
    
    // Clean up temporary files
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    
    parentPort.postMessage({ success: true, videoUrl });
    
  } catch (error) {
    console.error('Worker error:', error);
    parentPort.postMessage({ success: false, error: error.message });
  }
}

/**
 * Get video dimensions based on aspect ratio
 * @param {string} aspectRatio - Aspect ratio (e.g., '16:9')
 * @returns {Object} - Width and height
 */
function getVideoDimensions(aspectRatio) {
  const ratios = {
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 720, height: 1280 },
    '1:1': { width: 720, height: 720 },
    '4:3': { width: 960, height: 720 }
  };
  
  return ratios[aspectRatio] || ratios['16:9'];
}

// Handle worker thread execution
if (!isMainThread && workerData && workerData.isWorker) {
  processVideosInWorker();
}

module.exports = {
  combineVideosLocally,
  getVideoDimensions
};