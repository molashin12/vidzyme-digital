# Windows Deployment Guide for FFmpeg Cloud Run Service

## Issue: Bash Not Available

The error you encountered indicates that bash/WSL is not properly configured on your Windows system:
```
WSL (10) ERROR: CreateProcessCommon:559: execvpe(/bin/bash) failed: No such file or directory
```

## Solution Options

### Option 1: Use PowerShell Script (Recommended)

I've created a PowerShell equivalent of the bash script:

```powershell
# Navigate to the cloud-run-ffmpeg directory
cd D:\CODING\Vidzyme-digital\cloud-run-ffmpeg

# Run the PowerShell deployment script
.\deploy.ps1
```

**If you get execution policy errors:**
```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again:
.\deploy.ps1
```

### Option 2: Manual PowerShell Commands

If you prefer to run commands step by step:

```powershell
# 1. Set project
gcloud config set project static-groove-464313-t4

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Configure Docker
gcloud auth configure-docker

# 4. Build and deploy
docker build -t ffmpeg-video-merger .
docker tag ffmpeg-video-merger gcr.io/static-groove-464313-t4/ffmpeg-video-merger
docker push gcr.io/static-groove-464313-t4/ffmpeg-video-merger

# 5. Deploy to Cloud Run
gcloud run deploy ffmpeg-video-merger `
    --image gcr.io/static-groove-464313-t4/ffmpeg-video-merger `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated `
    --memory 2Gi `
    --cpu 2 `
    --timeout 3600 `
    --concurrency 10 `
    --max-instances 100 `
    --set-env-vars "STORAGE_BUCKET=static-groove-464313-t4.appspot.com"
```

### Option 3: Install Google Cloud CLI First

If you haven't installed Google Cloud CLI yet:

1. **Download the installer:**
   - Go to: https://cloud.google.com/sdk/docs/install-sdk#windows
   - Download `GoogleCloudSDKInstaller.exe`

2. **Install and authenticate:**
   ```powershell
   # After installation, restart PowerShell and run:
   gcloud auth login
   gcloud config set project static-groove-464313-t4
   ```

3. **Then use Option 1 or 2 above**

### Option 4: Use Git Bash (Alternative)

If you have Git for Windows installed:

```bash
# Open Git Bash and navigate to the directory
cd /d/CODING/Vidzyme-digital/cloud-run-ffmpeg

# Run the original bash script
bash deploy.sh
```

## After Successful Deployment

1. **Copy the service URL** from the deployment output
2. **Update your .env file:**
   ```env
   FFMPEG_SERVICE_URL=https://ffmpeg-video-merger-xxxxxxxxx-uc.a.run.app
   ```

3. **Test the service:**
   ```powershell
   # Test health endpoint
   Invoke-RestMethod -Uri "https://your-service-url/health" -Method Get
   ```

## Troubleshooting

### If gcloud is not recognized:
- Restart PowerShell after installing Google Cloud CLI
- Check if the installation added gcloud to your PATH
- Try running from a new PowerShell window

### If Docker commands fail:
- Ensure Docker Desktop is running
- Check if you're logged into Docker
- Try: `docker system prune` to free up space

### If authentication fails:
- Run: `gcloud auth login`
- Ensure your service account has the required permissions
- Check that your .env file has the correct service account path

## Next Steps

Once deployed successfully:
1. Update the `FFMPEG_SERVICE_URL` in your `.env` file
2. Test the complete video generation pipeline
3. Monitor the service in Google Cloud Console

---

**Choose the option that works best for your setup!**