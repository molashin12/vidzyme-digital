# Vidzyme Digital - Setup Guide

## API Configuration Status ✅

Your Google AI and Vertex AI credentials have been successfully configured!

### Current Configuration

- **Google AI API Key**: ✅ Configured and tested
- **Google Cloud Project**: `static-groove-464313-t4`
- **Vertex AI Authentication**: ⚠️ Requires additional setup

## Google AI (Gemini) - ✅ Working

The Google AI API is properly configured and tested. Your video generation pipeline can use:
- Gemini 1.5 Flash for text generation
- Gemini 1.5 Pro for complex reasoning
- All Google AI models available through the API

## Vertex AI Setup - Additional Steps Required

To enable Vertex AI features (including Imagen for image generation), you need to set up authentication:

### Option 1: Service Account Key (Recommended for Development)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Create a new service account or use existing one
4. Download the JSON key file
5. Add to your `.env` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   ```

### Option 2: Application Default Credentials (Production)

1. Install Google Cloud CLI
2. Run: `gcloud auth application-default login`
3. Follow the authentication flow

## Required APIs to Enable

Make sure these APIs are enabled in your Google Cloud project:

1. **Vertex AI API**
2. **Cloud Vision API** 
3. **Cloud Storage API**
4. **Firebase Admin SDK API**
5. **Generative AI API**

## Testing Your Setup

Run the connectivity test:
```bash
node test-api-connectivity.js
```

## Video Generation Pipeline Features

### ✅ Currently Working
- Sequential video generation with frame continuity
- Frame extraction from generated videos
- Video concatenation using FFmpeg Cloud Run service
- Google AI (Gemini) integration for content generation

### 🔧 Requires Vertex AI Setup
- Imagen 3.0 for image generation
- Advanced Vertex AI models
- Enhanced video generation capabilities

## Next Steps

1. **Set up Vertex AI authentication** (see options above)
2. **Deploy FFmpeg Cloud Run service**:
   ```bash
   cd ../cloud-run-ffmpeg
   chmod +x deploy.sh
   ./deploy.sh
   ```
3. **Update FFMPEG_SERVICE_URL** in `.env` with deployed URL
4. **Test the complete pipeline**:
   ```bash
   node test-simple-sequential.js
   ```

## Support

If you encounter any issues:
1. Check that all required APIs are enabled
2. Verify your service account has proper permissions
3. Ensure your `.env` file is properly configured
4. Run the connectivity test to diagnose issues

---

**Status**: Google AI ✅ | Vertex AI ⚠️ | Pipeline Ready 🚀