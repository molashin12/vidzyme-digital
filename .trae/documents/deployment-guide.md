# SssS - UGC Automation Platform
## Deployment Guide

## 1. Prerequisites

### 1.1 Required Software

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Firebase CLI**: Latest version
- **Git**: For version control
- **Code Editor**: VS Code recommended

### 1.2 Required Accounts

- **Google Cloud Platform Account**: For Firebase services
- **Firebase Project**: Created and configured
- **External Video API Account**: For video generation service
- **Domain Name** (Optional): For custom domain hosting

### 1.3 System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 8GB recommended
- **Storage**: At least 2GB free space
- **Internet**: Stable broadband connection

## 2. Environment Setup

### 2.1 Install Node.js and npm

**Windows:**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:
```bash
node --version
npm --version
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2 Install Firebase CLI

```bash
npm install -g firebase-tools

# Verify installation
firebase --version
```

### 2.3 Clone Repository

```bash
git clone https://github.com/your-username/ssss-ugc-platform.git
cd ssss-ugc-platform
```

## 3. Firebase Project Setup

### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `ssss-ugc-platform`
4. Enable Google Analytics (recommended)
5. Select or create Analytics account
6. Click "Create project"

### 3.2 Enable Firebase Services

**Authentication:**
1. Go to Authentication > Sign-in method
2. Enable Email/Password provider
3. Configure authorized domains

**Firestore Database:**
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (will configure security rules later)
4. Select database location (choose closest to your users)

**Storage:**
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode"
4. Select storage location

**Hosting:**
1. Go to Hosting
2. Click "Get started"
3. Follow the setup instructions

**Functions:**
1. Go to Functions
2. Click "Get started"
3. Upgrade to Blaze plan (required for external API calls)

### 3.3 Configure Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select the following features:
# - Firestore
# - Functions
# - Hosting
# - Storage

# Choose existing project: ssss-ugc-platform
```

### 3.4 Firebase Configuration

1. Go to Project Settings > General
2. Scroll down to "Your apps"
3. Click "Add app" > Web app
4. Register app name: "SssS Web App"
5. Copy the Firebase config object

**Create `.env` file in project root:**
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

# External API Configuration
VIDEO_GENERATION_API_KEY=your-video-api-key
VIDEO_GENERATION_API_URL=https://api.video-service.com
WEBHOOK_SECRET=your-webhook-secret

# Environment
NODE_ENV=production
```

## 4. Local Development Setup

### 4.1 Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 4.2 Configure Firestore Security Rules

**Create `firestore.rules`:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own video requests
    match /videoRequests/{requestId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can read/write their own generated videos
    match /generatedVideos/{videoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4.3 Configure Storage Security Rules

**Create `storage.rules`:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload images to their own folder
    match /images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read videos from their own folder
    match /videos/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read thumbnails from their own folder
    match /thumbnails/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4.4 Set Environment Variables for Functions

```bash
# Set Firebase Functions environment variables
firebase functions:config:set \
  video.api_key="your-video-api-key" \
  video.api_url="https://api.video-service.com" \
  webhook.secret="your-webhook-secret"

# Download config for local development
firebase functions:config:get > functions/.runtimeconfig.json
```

### 4.5 Start Local Development

**Terminal 1 - Firebase Emulators:**
```bash
firebase emulators:start
```

**Terminal 2 - React Development Server:**
```bash
npm start
```

**Access Points:**
- Web App: http://localhost:3000
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001
- Storage Emulator: http://localhost:9199

## 5. Production Deployment

### 5.1 Build Production Assets

```bash
# Build React application
npm run build

# Test production build locally
npm install -g serve
serve -s build
```

### 5.2 Deploy Firebase Functions

```bash
# Deploy functions only
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:generateVideo
```

### 5.3 Deploy Firestore Rules and Indexes

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### 5.4 Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 5.5 Deploy Web Application

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything at once
firebase deploy
```

### 5.6 Verify Deployment

1. **Check Functions:**
   ```bash
   firebase functions:log
   ```

2. **Test Web App:**
   - Visit your Firebase Hosting URL
   - Test user registration and login
   - Test video generation workflow

3. **Monitor Performance:**
   - Check Firebase Console > Performance
   - Monitor function execution times
   - Check error rates

## 6. Custom Domain Setup (Optional)

### 6.1 Add Custom Domain

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS verification steps

### 6.2 Configure DNS

**For domain registrar (e.g., GoDaddy, Namecheap):**
```
Type: A
Name: @
Value: 151.101.1.195

Type: A
Name: @
Value: 151.101.65.195

Type: CNAME
Name: www
Value: your-project.web.app
```

### 6.3 SSL Certificate

Firebase automatically provisions SSL certificates for custom domains. This process may take up to 24 hours.

## 7. Environment-Specific Configurations

### 7.1 Development Environment

**`.env.development`:**
```env
REACT_APP_FIREBASE_PROJECT_ID=ssss-ugc-dev
REACT_APP_USE_EMULATORS=true
REACT_APP_API_BASE_URL=http://localhost:5001
```

### 7.2 Staging Environment

**`.env.staging`:**
```env
REACT_APP_FIREBASE_PROJECT_ID=ssss-ugc-staging
REACT_APP_USE_EMULATORS=false
REACT_APP_API_BASE_URL=https://us-central1-ssss-ugc-staging.cloudfunctions.net
```

### 7.3 Production Environment

**`.env.production`:**
```env
REACT_APP_FIREBASE_PROJECT_ID=ssss-ugc-platform
REACT_APP_USE_EMULATORS=false
REACT_APP_API_BASE_URL=https://us-central1-ssss-ugc-platform.cloudfunctions.net
```

## 8. CI/CD Pipeline Setup

### 8.1 GitHub Actions Workflow

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd functions && npm ci
    
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: ssss-ugc-platform
        channelId: live
```

### 8.2 Setup GitHub Secrets

1. Go to GitHub repository > Settings > Secrets
2. Add the following secrets:
   - `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON
   - `FIREBASE_TOKEN`: Firebase CI token

**Generate Firebase CI token:**
```bash
firebase login:ci
```

## 9. Monitoring and Logging

### 9.1 Enable Firebase Performance Monitoring

```javascript
// Add to src/index.js
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

### 9.2 Setup Error Tracking

**Install Sentry (optional):**
```bash
npm install @sentry/react @sentry/tracing
```

**Configure Sentry:**
```javascript
// src/index.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 9.3 Function Monitoring

```javascript
// functions/index.js
const { Logging } = require('@google-cloud/logging');
const logging = new Logging();

function logInfo(message, data = {}) {
  console.log(message, data);
  
  const log = logging.log('ssss-platform');
  const metadata = {
    resource: { type: 'cloud_function' },
    severity: 'INFO'
  };
  
  const entry = log.entry(metadata, { message, ...data });
  log.write(entry);
}
```

## 10. Security Hardening

### 10.1 Firebase Security Rules Audit

```bash
# Test security rules
firebase emulators:start --only firestore
npm run test:security
```

### 10.2 API Security

**Rate Limiting in Functions:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 10.3 Environment Variables Security

1. Never commit `.env` files to version control
2. Use Firebase Functions config for sensitive data
3. Rotate API keys regularly
4. Use least privilege principle for service accounts

## 11. Performance Optimization

### 11.1 Frontend Optimization

**Code Splitting:**
```javascript
// Lazy load components
const VideoGenerator = lazy(() => import('./components/VideoGenerator'));
const VideoLibrary = lazy(() => import('./components/VideoLibrary'));
```

**Bundle Analysis:**
```bash
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### 11.2 Backend Optimization

**Function Cold Start Reduction:**
```javascript
// Keep functions warm
const functions = require('firebase-functions');

exports.keepWarm = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    console.log('Keeping functions warm');
    return null;
  });
```

### 11.3 Database Optimization

**Firestore Indexes:**
```json
{
  "indexes": [
    {
      "collectionGroup": "generatedVideos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## 12. Backup and Recovery

### 12.1 Firestore Backup

```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket/firestore-backup

# Import Firestore data
gcloud firestore import gs://your-backup-bucket/firestore-backup
```

### 12.2 Storage Backup

```bash
# Sync Storage bucket
gsutil -m rsync -r -d gs://your-storage-bucket gs://your-backup-bucket
```

### 12.3 Automated Backup

**Cloud Scheduler + Cloud Functions:**
```javascript
exports.backupFirestore = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .onRun(async (context) => {
    const { Firestore } = require('@google-cloud/firestore');
    const firestore = new Firestore();
    
    const bucket = 'your-backup-bucket';
    const timestamp = new Date().toISOString().split('T')[0];
    
    await firestore.export({
      outputUriPrefix: `gs://${bucket}/firestore-backup-${timestamp}`,
      collectionIds: ['users', 'videoRequests', 'generatedVideos']
    });
    
    console.log('Backup completed successfully');
  });
```

## 13. Troubleshooting

### 13.1 Common Issues

**Build Errors:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Firebase Deployment Issues:**
```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login to Firebase
firebase logout
firebase login
```

**Function Timeout Issues:**
```javascript
// Increase timeout in functions
exports.generateVideo = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onCall(async (data, context) => {
    // Function code
  });
```

### 13.2 Debug Commands

```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only generateVideo

# View real-time logs
firebase functions:log --follow

# Debug locally
firebase emulators:start --inspect-functions
```

### 13.3 Performance Issues

**Monitor Function Performance:**
```javascript
const { performance } = require('perf_hooks');

exports.generateVideo = functions.https.onCall(async (data, context) => {
  const start = performance.now();
  
  try {
    // Function logic
    const result = await processVideo(data);
    
    const duration = performance.now() - start;
    console.log(`Function executed in ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`Function failed after ${duration}ms:`, error);
    throw error;
  }
});
```

## 14. Maintenance

### 14.1 Regular Updates

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update Firebase CLI
npm install -g firebase-tools@latest
```

### 14.2 Security Updates

```bash
# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (use with caution)
npm audit fix --force
```

### 14.3 Database Maintenance

```javascript
// Clean up old data
exports.cleanupOldData = functions.pubsub
  .schedule('0 3 * * 0') // Weekly on Sunday at 3 AM
  .onRun(async (context) => {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago
    
    const oldRequests = await db
      .collection('videoRequests')
      .where('createdAt', '<', cutoffDate)
      .where('status', 'in', ['completed', 'failed'])
      .get();
    
    const batch = db.batch();
    oldRequests.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Cleaned up ${oldRequests.size} old requests`);
  });
```

This deployment guide provides comprehensive instructions for setting up, deploying, and maintaining the SssS UGC automation platform. Follow the steps in order for a successful deployment.