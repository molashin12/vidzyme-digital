# Vidzyme Backend Server

This is the Express.js backend server for the Vidzyme video generation platform. It replaces Firebase Functions to avoid timeout issues while maintaining Firebase for authentication, database, and storage.

## Features

- **Video Generation**: AI-powered video generation using Google's Veo 3 model
- **Authentication**: Firebase Auth integration with JWT token verification
- **File Storage**: Google Cloud Storage for video and image files
- **Database**: Firestore for metadata and user data
- **Rate Limiting**: Built-in rate limiting for API protection
- **Security**: Helmet.js for security headers and CORS configuration

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the `.env` file and configure the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Google AI API
GEMINI_API_KEY=your-genai-api-key

# Cloud Run FFmpeg Service
CLOUD_RUN_FFMPEG_URL=your-ffmpeg-service-url
```

### 3. Firebase Service Account

To get the Firebase credentials:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Use the values from the JSON file in your `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health information

### Authentication
- `POST /api/auth/verify` - Verify Firebase ID token
- `GET /api/auth/profile` - Get user profile

### Video Generation
- `POST /api/video/generate-with-genkit` - Generate video with AI
- `GET /api/video/list` - List user's videos
- `DELETE /api/video/:videoId` - Delete a video
- `GET /api/video/status/:operationId` - Check video generation status

### File Operations
- `POST /api/video/extract-frames` - Extract frames from video
- `POST /api/video/analyze-image` - Analyze image content
- `POST /api/video/generate-image` - Generate images
- `POST /api/video/generate-prompt` - Generate prompts

## Authentication

All video endpoints require Firebase authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Configurable in `server.js`

## File Upload Limits

- Maximum file size: 50MB
- Supported formats: Images and videos
- Files are processed in memory and temporarily stored

## Deployment

### Local Development

```bash
npm run dev
```

### Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production Firebase credentials
3. Set up proper CORS origins
4. Deploy to your preferred hosting platform (Railway, Heroku, etc.)

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Verify Firebase credentials are correct
   - Check that the service account has proper permissions

2. **Video Generation Timeouts**
   - Ensure Google AI API key is valid
   - Check Cloud Run FFmpeg service is running

3. **CORS Errors**
   - Update `FRONTEND_URL` in environment variables
   - Check CORS configuration in `server.js`

### Logs

The server uses Morgan for HTTP request logging and console.log for application logs. In production, consider using a proper logging service.

## Migration from Firebase Functions

This backend replaces the Firebase Functions implementation to avoid timeout issues. The main differences:

- No 540-second timeout limit
- Better error handling and logging
- Improved scalability
- Direct Express.js routing

The frontend needs to be updated to call these new endpoints instead of Firebase Functions.