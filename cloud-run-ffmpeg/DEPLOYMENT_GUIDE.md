# FFmpeg Cloud Run Service Deployment Guide

## Prerequisites

Before deploying the FFmpeg service, ensure you have:

1. **Google Cloud CLI installed**
   - Download from: https://cloud.google.com/sdk/docs/install
   - Or use: `curl https://sdk.cloud.google.com | bash`

2. **Docker installed**
   - Download from: https://docs.docker.com/get-docker/

3. **Authentication setup**
   - Your service account JSON file should be in the functions directory
   - Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json`

## Step-by-Step Deployment

### 1. Authenticate with Google Cloud

```bash
# Authenticate with your Google account
gcloud auth login

# Set your project
gcloud config set project static-groove-464313-t4

# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker
```

### 2. Navigate to the FFmpeg service directory

```bash
cd cloud-run-ffmpeg
```

### 3. Make the deployment script executable

```bash
# On Windows (PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# On Linux/Mac
chmod +x deploy.sh
```

### 4. Run the deployment script

```bash
# On Windows (use Git Bash or WSL)
bash deploy.sh

# On Linux/Mac
./deploy.sh
```

### 5. Update your .env file

After successful deployment, the script will output a service URL. Copy this URL and update your `.env` file:

```env
FFMPEG_SERVICE_URL=https://ffmpeg-video-merger-xxxxxxxxx-uc.a.run.app
```

## Manual Deployment (Alternative)

If the script doesn't work, you can deploy manually:

### 1. Build the Docker image

```bash
docker build -t gcr.io/static-groove-464313-t4/ffmpeg-video-merger .
```

### 2. Push to Google Container Registry

```bash
docker push gcr.io/static-groove-464313-t4/ffmpeg-video-merger
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy ffmpeg-video-merger \
    --image gcr.io/static-groove-464313-t4/ffmpeg-video-merger \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 3600 \
    --concurrency 10 \
    --max-instances 100 \
    --set-env-vars="STORAGE_BUCKET=static-groove-464313-t4.appspot.com"
```

## Verification

### 1. Test the health endpoint

```bash
curl https://your-service-url/health
```

Expected response:
```json
{"status": "healthy", "timestamp": "2024-01-XX..."}
```

### 2. Test the merge endpoint

```bash
curl -X POST https://your-service-url/merge-videos \
  -H "Content-Type: application/json" \
  -d '{
    "clipUrls": ["gs://bucket/video1.mp4", "gs://bucket/video2.mp4"],
    "outputFileName": "test-output.mp4"
  }'
```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   ```
   Error: (gcloud.auth.login) There was a problem with web authentication.
   ```
   **Solution**: Use `gcloud auth login --no-launch-browser` and follow the manual flow

2. **Docker Permission Error**
   ```
   Error: denied: Permission "artifactregistry.repositories.uploadArtifacts" denied
   ```
   **Solution**: Run `gcloud auth configure-docker` and ensure your account has proper permissions

3. **Service Account Permissions**
   Ensure your service account has these roles:
   - Cloud Run Admin
   - Storage Admin
   - Artifact Registry Writer

4. **Memory/CPU Limits**
   If videos are large, you may need to increase resources:
   ```bash
   gcloud run services update ffmpeg-video-merger \
     --region us-central1 \
     --memory 4Gi \
     --cpu 4
   ```

### Logs and Monitoring

```bash
# View service logs
gcloud run services logs read ffmpeg-video-merger --region us-central1

# Monitor service metrics
gcloud run services describe ffmpeg-video-merger --region us-central1
```

## Security Notes

- The service is deployed with `--allow-unauthenticated` for simplicity
- For production, consider implementing authentication
- Monitor usage and costs in Google Cloud Console

## Next Steps

After successful deployment:
1. Update your `.env` file with the service URL
2. Test the complete video generation pipeline
3. Monitor service performance and costs
4. Set up alerts for service health

---

**Service Configuration:**
- **Project**: static-groove-464313-t4
- **Region**: us-central1
- **Memory**: 2Gi
- **CPU**: 2
- **Timeout**: 3600s (1 hour)
- **Storage Bucket**: static-groove-464313-t4.appspot.com