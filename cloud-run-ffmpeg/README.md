# FFmpeg Video Merger - Cloud Run Service

This is a Cloud Run service that merges multiple video clips into a single video using FFmpeg. It's designed to work with the Vidzyme video generation pipeline.

## Features

- Merge multiple video clips into a single video
- Download clips from Google Cloud Storage
- Upload final merged video back to Cloud Storage
- Automatic cleanup of temporary files
- Health check endpoint
- Scalable and serverless deployment

## Prerequisites

- Google Cloud Project with billing enabled
- Docker installed locally
- gcloud CLI installed and authenticated
- Google Cloud Storage bucket for video storage

## Environment Variables

- `STORAGE_BUCKET`: Name of your Google Cloud Storage bucket
- `PORT`: Port to run the service on (default: 8080)

## API Endpoints

### Health Check
```
GET /health
```

Returns the health status of the service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Merge Videos
```
POST /merge-videos
```

Merges multiple video clips into a single video.

**Request Body:**
```json
{
  "clipUrls": [
    "gs://your-bucket/clips/clip1.mp4",
    "gs://your-bucket/clips/clip2.mp4",
    "gs://your-bucket/clips/clip3.mp4"
  ],
  "outputFileName": "final-video.mp4"
}
```

**Response:**
```json
{
  "success": true,
  "finalVideoUrl": "gs://your-bucket/final-videos/final-video.mp4",
  "message": "Videos merged successfully"
}
```

**Error Response:**
```json
{
  "error": "Failed to merge videos",
  "details": "Error message details"
}
```

## Deployment

### Option 1: Using the deployment script

1. Update the configuration in `deploy.sh`:
   ```bash
   PROJECT_ID="your-project-id"
   SERVICE_NAME="ffmpeg-video-merger"
   REGION="us-central1"
   ```

2. Make the script executable and run it:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual deployment

1. Set your project ID:
   ```bash
   export PROJECT_ID="your-project-id"
   ```

2. Build the Docker image:
   ```bash
   docker build -t gcr.io/$PROJECT_ID/ffmpeg-video-merger .
   ```

3. Push to Google Container Registry:
   ```bash
   docker push gcr.io/$PROJECT_ID/ffmpeg-video-merger
   ```

4. Deploy to Cloud Run:
   ```bash
   gcloud run deploy ffmpeg-video-merger \
     --image gcr.io/$PROJECT_ID/ffmpeg-video-merger \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2 \
     --timeout 3600 \
     --concurrency 10 \
     --max-instances 100 \
     --set-env-vars="STORAGE_BUCKET=your-storage-bucket-name"
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export STORAGE_BUCKET="your-storage-bucket-name"
   export PORT=8080
   ```

3. Run the service:
   ```bash
   npm start
   ```

4. Test the health endpoint:
   ```bash
   curl http://localhost:8080/health
   ```

## Configuration

### Resource Limits

- **Memory**: 2Gi (can be adjusted based on video size and complexity)
- **CPU**: 2 vCPUs (can be adjusted for faster processing)
- **Timeout**: 3600 seconds (1 hour for long video processing)
- **Concurrency**: 10 (number of concurrent requests per instance)
- **Max Instances**: 100 (can be adjusted based on expected load)

### FFmpeg Settings

The service uses the following FFmpeg settings for optimal quality and performance:

- **Video Codec**: libx264
- **Preset**: fast (balance between speed and compression)
- **CRF**: 23 (good quality)
- **Audio Codec**: aac
- **Audio Bitrate**: 128k
- **Movflags**: +faststart (for web streaming)

## Integration with Firebase Functions

This service is designed to be called from Firebase Cloud Functions. Here's an example of how to call it:

```javascript
const axios = require('axios');

async function mergeVideoClips(clipUrls, outputFileName) {
  const cloudRunUrl = 'https://your-service-url.run.app';
  
  try {
    const response = await axios.post(`${cloudRunUrl}/merge-videos`, {
      clipUrls,
      outputFileName
    }, {
      timeout: 3600000 // 1 hour timeout
    });
    
    return response.data.finalVideoUrl;
  } catch (error) {
    console.error('Error merging videos:', error);
    throw error;
  }
}
```

## Monitoring and Logging

- Logs are available in Google Cloud Logging
- Monitor performance and errors in Google Cloud Monitoring
- Set up alerts for failed requests or high latency

## Security

- The service is deployed with `--allow-unauthenticated` for simplicity
- For production, consider implementing authentication
- Use IAM roles to control access to Cloud Storage

## Troubleshooting

### Common Issues

1. **Out of memory errors**: Increase memory allocation in deployment
2. **Timeout errors**: Increase timeout or optimize FFmpeg settings
3. **Storage access errors**: Check IAM permissions for Cloud Storage
4. **FFmpeg errors**: Check video format compatibility

### Debugging

1. Check Cloud Run logs:
   ```bash
   gcloud logs read --service=ffmpeg-video-merger
   ```

2. Test locally with sample videos
3. Verify Cloud Storage permissions
4. Check FFmpeg installation in container

## Cost Optimization

- Use appropriate CPU and memory settings
- Set reasonable max instances to control costs
- Monitor usage and adjust resources as needed
- Consider using preemptible instances for non-critical workloads