# SssS - UGC Automation Platform

## API Specification Document

## 1. Overview

This document provides comprehensive API specifications for the SssS UGC automation platform. The platform uses Firebase Cloud Functions for serverless backend operations and Firebase SDK for client-side integrations.

**Base URL**: `https://us-central1-{project-id}.cloudfunctions.net`
**Authentication**: Firebase Auth tokens required for all protected endpoints
**Content Type**: `application/json`
**API Version**: v1

## 2. Authentication

### 2.1 Firebase Authentication

All API calls to protected endpoints require a valid Firebase Auth token in the request headers:

```
Authorization: Bearer {firebase-auth-token}
```

**Token Acquisition (Client-side):**

```javascript
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
```

### 2.2 Authentication Endpoints

**User Registration**

```
POST /auth/register (Firebase SDK)
```

Request Body:

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

Response:

```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false
  }
}
```

**User Login**

```
POST /auth/login (Firebase SDK)
```

Request Body:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:

```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": true
  },
  "token": "firebase-auth-token"
}
```

## 3. Video Generation API

### 3.1 Generate Video

**Endpoint**: `POST /generateVideo`
**Authentication**: Required
**Description**: Initiates video generation process for uploaded product images

**Request Parameters:**

| Parameter       | Type   | Required | Description                           | Validation                      |
| --------------- | ------ | -------- | ------------------------------------- | ------------------------------- |
| productImageUrl | string | Yes      | Firebase Storage URL of product image | Valid gs\:// URL                |
| prompt          | string | Yes      | Video generation instructions         | 10-500 characters               |
| aspectRatio     | string | Yes      | Video aspect ratio                    | "16:9", "9:16", "1:1"           |
| duration        | number | Yes      | Video duration in seconds             | 15-60                           |
| videoCount      | number | Yes      | Number of videos to generate          | 1-5                             |
| style           | string | No       | Video style preference                | "ugc", "professional", "casual" |

**Request Example:**

```json
{
  "productImageUrl": "gs://ssss-storage/images/product-123.jpg",
  "prompt": "Create an engaging UGC-style video showcasing this skincare product's benefits for young adults",
  "aspectRatio": "9:16",
  "duration": 30,
  "videoCount": 2,
  "style": "ugc"
}
```

**Response:**

```json
{
  "success": true,
  "requestIds": ["req_123", "req_124"],
  "message": "2 video(s) queued for generation",
  "estimatedCompletionTime": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

```json
// Monthly limit exceeded
{
  "success": false,
  "error": "resource-exhausted",
  "message": "Monthly video generation limit exceeded",
  "details": {
    "currentUsage": 10,
    "monthlyLimit": 10,
    "resetDate": "2024-02-01T00:00:00Z"
  }
}

// Invalid parameters
{
  "success": false,
  "error": "invalid-argument",
  "message": "Invalid aspect ratio provided",
  "details": {
    "field": "aspectRatio",
    "allowedValues": ["16:9", "9:16", "1:1"]
  }
}
```

### 3.2 Get Video Status

**Endpoint**: `GET /getVideoStatus/{requestId}`
**Authentication**: Required
**Description**: Retrieves current status of video generation request

**Path Parameters:**

| Parameter | Type   | Description                 |
| --------- | ------ | --------------------------- |
| requestId | string | Video generation request ID |

**Response:**

```json
{
  "success": true,
  "video": {
    "id": "req_123",
    "status": "processing",
    "progress": 65,
    "title": "Skincare Product UGC Video",
    "aspectRatio": "9:16",
    "duration": 30,
    "createdAt": "2024-01-15T09:00:00Z",
    "estimatedCompletion": "2024-01-15T10:30:00Z",
    "videoUrl": null,
    "thumbnailUrl": null
  }
}
```

**Status Values:**

* `pending`: Request queued for processing

* `processing`: Video generation in progress

* `completed`: Video successfully generated

* `failed`: Generation failed

## 4. User Management API

### 4.1 Get User Statistics

**Endpoint**: `POST /getUserStats`
**Authentication**: Required
**Description**: Retrieves user's video generation statistics and usage information

**Request Body:** Empty `{}`

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalVideos": 25,
    "completedVideos": 22,
    "pendingVideos": 2,
    "failedVideos": 1,
    "currentMonthUsage": 8,
    "monthlyLimit": 10,
    "remainingVideos": 2,
    "plan": {
      "type": "free",
      "features": ["basic_generation", "standard_quality"]
    },
    "usageHistory": {
      "2024-01": 8,
      "2023-12": 10,
      "2023-11": 7
    }
  }
}
```

### 4.2 Update User Profile

**Endpoint**: `POST /updateUserProfile`
**Authentication**: Required
**Description**: Updates user profile information

**Request Body:**

```json
{
  "displayName": "John Smith",
  "preferences": {
    "defaultAspectRatio": "9:16",
    "defaultDuration": 30,
    "emailNotifications": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Smith",
    "preferences": {
      "defaultAspectRatio": "9:16",
      "defaultDuration": 30,
      "emailNotifications": true
    }
  }
}
```

## 5. File Management API

### 5.1 Get Upload URL

**Endpoint**: `POST /getUploadUrl`
**Authentication**: Required
**Description**: Generates signed URL for direct file upload to Firebase Storage

**Request Body:**

```json
{
  "fileName": "product-image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2048576
}
```

**Response:**

```json
{
  "success": true,
  "uploadUrl": "https://storage.googleapis.com/upload/storage/v1/b/bucket/o?uploadType=resumable&upload_id=xyz",
  "fileUrl": "gs://ssss-storage/images/user123/product-image-uuid.jpg",
  "expiresAt": "2024-01-15T10:00:00Z"
}
```

### 5.2 Delete File

**Endpoint**: `POST /deleteFile`
**Authentication**: Required
**Description**: Deletes file from Firebase Storage

**Request Body:**

```json
{
  "fileUrl": "gs://ssss-storage/images/user123/product-image-uuid.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## 6. Video Library API

### 6.1 Get User Videos

**Endpoint**: `POST /getUserVideos`
**Authentication**: Required
**Description**: Retrieves paginated list of user's generated videos

**Request Body:**

```json
{
  "page": 1,
  "limit": 20,
  "status": "completed",
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "search": "skincare"
}
```

**Response:**

```json
{
  "success": true,
  "videos": [
    {
      "id": "video_123",
      "title": "Skincare Product UGC Video",
      "status": "completed",
      "aspectRatio": "9:16",
      "duration": 30,
      "videoUrl": "gs://ssss-storage/videos/video_123.mp4",
      "thumbnailUrl": "gs://ssss-storage/thumbnails/video_123.jpg",
      "fileSize": 5242880,
      "createdAt": "2024-01-15T09:00:00Z",
      "completedAt": "2024-01-15T09:05:00Z",
      "prompt": "Create engaging UGC video for skincare product"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 6.2 Delete Video

**Endpoint**: `POST /deleteVideo`
**Authentication**: Required
**Description**: Deletes generated video and associated files

**Request Body:**

```json
{
  "videoId": "video_123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

## 7. Webhook Endpoints

### 7.1 Video Generation Webhook

**Endpoint**: `POST /webhooks/videoGeneration`
**Authentication**: API Key
**Description**: Receives updates from external video generation service

**Request Headers:**

```
X-API-Key: {webhook-api-key}
Content-Type: application/json
```

**Request Body:**

```json
{
  "requestId": "req_123",
  "status": "completed",
  "videoUrl": "https://external-service.com/videos/generated-video.mp4",
  "thumbnailUrl": "https://external-service.com/thumbnails/thumbnail.jpg",
  "duration": 30,
  "fileSize": 5242880,
  "metadata": {
    "resolution": "1080x1920",
    "fps": 30,
    "codec": "h264"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## 8. Error Handling

### 8.1 Standard Error Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "error-code",
  "message": "Human-readable error message",
  "details": {
    "field": "fieldName",
    "code": "validation-error",
    "additionalInfo": "..."
  },
  "timestamp": "2024-01-15T09:00:00Z",
  "requestId": "req_uuid"
}
```

### 8.2 Common Error Codes

| Error Code           | HTTP Status | Description                                   |
| -------------------- | ----------- | --------------------------------------------- |
| `unauthenticated`    | 401         | Invalid or missing authentication token       |
| `permission-denied`  | 403         | User lacks permission for requested operation |
| `invalid-argument`   | 400         | Invalid request parameters                    |
| `resource-exhausted` | 429         | Rate limit or quota exceeded                  |
| `not-found`          | 404         | Requested resource not found                  |
| `already-exists`     | 409         | Resource already exists                       |
| `internal`           | 500         | Internal server error                         |
| `unavailable`        | 503         | Service temporarily unavailable               |

## 9. Rate Limiting

### 9.1 Rate Limit Rules

| Endpoint                 | Rate Limit   | Window   |
| ------------------------ | ------------ | -------- |
| `/generateVideo`         | 5 requests   | 1 minute |
| `/getUserStats`          | 60 requests  | 1 minute |
| `/getUserVideos`         | 100 requests | 1 minute |
| `/getUploadUrl`          | 20 requests  | 1 minute |
| Authentication endpoints | 10 requests  | 1 minute |

### 9.2 Rate Limit Headers

Response headers for rate-limited endpoints:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1642248000
X-RateLimit-Window: 60
```

### 9.3 Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "resource-exhausted",
  "message": "Rate limit exceeded",
  "details": {
    "limit": 5,
    "window": 60,
    "resetTime": "2024-01-15T09:01:00Z"
  }
}
```

## 10. SDK Integration Examples

### 10.1 JavaScript/React Integration

```javascript
// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
const auth = getAuth(app);

// Generate video
const generateVideo = httpsCallable(functions, 'generateVideo');

async function createVideo(videoData) {
  try {
    const result = await generateVideo(videoData);
    console.log('Video generation started:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

// Get user stats
const getUserStats = httpsCallable(functions, 'getUserStats');

async function fetchUserStats() {
  try {
    const result = await getUserStats({});
    return result.data.stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}
```

### 10.2 React Native Integration

```javascript
// React Native Firebase integration
import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';

// Generate video
async function generateVideo(videoData) {
  try {
    const generateVideoFunction = functions().httpsCallable('generateVideo');
    const result = await generateVideoFunction(videoData);
    return result.data;
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

// Real-time video status updates
import firestore from '@react-native-firebase/firestore';

function subscribeToVideoUpdates(videoId, callback) {
  return firestore()
    .collection('generatedVideos')
    .doc(videoId)
    .onSnapshot(callback);
}
```

## 11. Testing

### 11.1 API Testing with Postman

**Environment Variables:**

```json
{
  "baseUrl": "https://us-central1-ssss-platform.cloudfunctions.net",
  "authToken": "{{firebase-auth-token}}",
  "userId": "{{current-user-id}}"
}
```

**Pre-request Script for Authentication:**

```javascript
// Get Firebase auth token
const authToken = pm.environment.get("authToken");
if (authToken) {
  pm.request.headers.add({
    key: "Authorization",
    value: `Bearer ${authToken}`
  });
}
```

### 11.2 Unit Testing

```javascript
// Jest test example
import { generateVideo } from '../functions/index';
import { mockFirebaseAdmin } from '../test/mocks';

describe('generateVideo function', () => {
  beforeEach(() => {
    mockFirebaseAdmin();
  });

  test('should generate video successfully', async () => {
    const mockData = {
      productImageUrl: 'gs://bucket/image.jpg',
      prompt: 'Test prompt',
      aspectRatio: '9:16',
      duration: 30,
      videoCount: 1
    };

    const mockContext = {
      auth: { uid: 'test-user' }
    };

    const result = await generateVideo(mockData, mockContext);
    
    expect(result.success).toBe(true);
    expect(result.requestIds).toHaveLength(1);
  });
});
```

## 12. Monitoring and Analytics

### 12.1 API Metrics

**Key Performance Indicators:**

* Request latency (p50, p95, p99)

* Error rate by endpoint

* Request volume by endpoint

* Authentication success rate

* Video generation success rate

### 12.2 Custom Metrics

```javascript
// Custom metrics in Cloud Functions
const { Logging } = require('@google-cloud/logging');
const logging = new Logging();

function logCustomMetric(metricName, value, labels = {}) {
  const log = logging.log('api-metrics');
  const metadata = {
    resource: { type: 'cloud_function' },
    labels: {
      function_name: process.env.FUNCTION_NAME,
      ...labels
    }
  };
  
  const entry = log.entry(metadata, {
    metric: metricName,
    value: value,
    timestamp: new Date().toISOString()
  });
  
  log.write(entry);
}
```

### 12.3 Health Check Endpoint

**Endpoint**: `GET /health`
**Authentication**: None
**Description**: Service health check

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T09:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "storage": "healthy",
    "external_apis": "healthy"
  },
  "uptime": 86400
}
```

