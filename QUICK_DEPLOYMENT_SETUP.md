# Quick Setup Guide for FFmpeg Cloud Run Deployment

## Current Status ✅❌

- ✅ **Docker**: Installed (version 28.1.1)
- ❌ **Google Cloud CLI**: Not installed
- ✅ **Service Account**: JSON file added to .env
- ✅ **Project Configuration**: static-groove-464313-t4

## Option 1: Install Google Cloud CLI (Recommended)

### Windows Installation

1. **Download the installer**:
   - Go to: https://cloud.google.com/sdk/docs/install-sdk#windows
   - Download `GoogleCloudSDKInstaller.exe`

2. **Run the installer**:
   - Follow the installation wizard
   - Check "Add gcloud to PATH" during installation

3. **Restart your terminal** and verify:
   ```powershell
   gcloud --version
   ```

4. **Authenticate**:
   ```powershell
   gcloud auth login
   gcloud config set project static-groove-464313-t4
   gcloud auth configure-docker
   ```

5. **Deploy the service**:
   ```powershell
   cd cloud-run-ffmpeg
   bash deploy.sh
   ```

## Option 2: Use Google Cloud Console (Web-based)

If you prefer not to install CLI tools:

### 1. Build Docker Image Locally

```powershell
cd cloud-run-ffmpeg
docker build -t ffmpeg-video-merger .
```

### 2. Upload via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "Container Registry" or "Artifact Registry"
3. Create a new repository if needed
4. Follow the web interface to upload your Docker image

### 3. Deploy via Cloud Run Console

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click "Create Service"
3. Select your uploaded container image
4. Configure:
   - **Service name**: `ffmpeg-video-merger`
   - **Region**: `us-central1`
   - **Memory**: `2 GiB`
   - **CPU**: `2`
   - **Timeout**: `3600 seconds`
   - **Environment variables**:
     - `STORAGE_BUCKET`: `static-groove-464313-t4.appspot.com`

## Option 3: PowerShell Installation (Quick)

```powershell
# Install Google Cloud CLI via PowerShell
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

## After Deployment

### 1. Get the Service URL

After successful deployment, you'll get a URL like:
```
https://ffmpeg-video-merger-xxxxxxxxx-uc.a.run.app
```

### 2. Update Your .env File

Add the service URL to your `.env` file:
```env
FFMPEG_SERVICE_URL=https://ffmpeg-video-merger-xxxxxxxxx-uc.a.run.app
```

### 3. Test the Service

```powershell
# Test health endpoint
curl https://your-service-url/health

# Or use PowerShell
Invoke-RestMethod -Uri "https://your-service-url/health" -Method Get
```

## Troubleshooting

### If gcloud installation fails:
1. Run PowerShell as Administrator
2. Set execution policy: `Set-ExecutionPolicy RemoteSigned`
3. Try the manual installer download

### If Docker build fails:
1. Ensure Docker Desktop is running
2. Check available disk space
3. Try: `docker system prune` to free up space

### If authentication fails:
1. Ensure your service account JSON file path is correct in .env
2. Check that the service account has required permissions:
   - Cloud Run Admin
   - Storage Admin
   - Container Registry Service Agent

## Next Steps

1. **Choose your preferred option** (CLI installation recommended)
2. **Deploy the FFmpeg service**
3. **Update the FFMPEG_SERVICE_URL** in your .env file
4. **Test the complete video pipeline**

---

**Need Help?** 
- Check the detailed `DEPLOYMENT_GUIDE.md` in the `cloud-run-ffmpeg` folder
- Verify your service account permissions in Google Cloud Console
- Monitor deployment progress in Cloud Run console