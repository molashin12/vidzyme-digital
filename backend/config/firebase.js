const admin = require('firebase-admin');
require('dotenv').config();

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * @returns {admin.app.App} Firebase Admin app instance
 */
function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // For development, use Application Default Credentials or service account
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use service account file if available
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'vidzyme',
        storageBucket: `${process.env.FIREBASE_PROJECT_ID || 'vidzyme'}.firebasestorage.app`
      });
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Use environment variables
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
      });
    } else {
      // For development without credentials, initialize with minimal config
      console.warn('⚠️  No Firebase credentials found. Running in development mode with limited functionality.');
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'vidzyme',
        storageBucket: `${process.env.FIREBASE_PROJECT_ID || 'vidzyme'}.firebasestorage.app`
      });
    }

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;

  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    console.warn('⚠️  Continuing without Firebase Admin SDK. Some features may not work.');
    // Don't throw error to allow server to start
    return null;
  }
}

/**
 * Get Firestore database instance
 * @returns {admin.firestore.Firestore} Firestore instance
 */
function getFirestore() {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return admin.firestore();
}

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth} Auth instance
 */
function getAuth() {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return admin.auth();
}

/**
 * Get Firebase Storage instance
 * @returns {admin.storage.Storage} Storage instance
 */
function getStorage() {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return admin.storage();
}

/**
 * Get Firebase Storage bucket
 * @returns {admin.storage.Bucket} Storage bucket instance
 */
function getStorageBucket() {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return admin.storage().bucket();
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<admin.auth.DecodedIdToken>} Decoded token
 */
async function verifyIdToken(idToken) {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return admin.auth().verifyIdToken(idToken);
}

/**
 * Create custom token for user
 * @param {string} uid - User ID
 * @param {object} additionalClaims - Additional claims
 * @returns {Promise<string>} Custom token
 */
async function createCustomToken(uid, additionalClaims = {}) {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return admin.auth().createCustomToken(uid, additionalClaims);
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  getStorage,
  getStorageBucket,
  verifyIdToken,
  createCustomToken,
  admin
};