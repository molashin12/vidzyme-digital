// Simple test to debug authentication issues
const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Firebase config (same as frontend)
const firebaseConfig = {
  apiKey: "AIzaSyCW-MCPKCpZpKTuNdtghu6rfXo_-WcFpGQ",
  authDomain: "vidzyme.firebaseapp.com",
  projectId: "vidzyme",
  storageBucket: "vidzyme.appspot.com",
  messagingSenderId: "1099101673529",
  appId: "1:1099101673529:web:4aa36a2308bf0d582c95e8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');

async function testAuth() {
  try {
    console.log('Testing authentication and function call...');
    
    // Sign in anonymously
    const userCredential = await signInAnonymously(auth);
    console.log('Signed in anonymously:', userCredential.user.uid);
    
    // Get ID token
    const idToken = await userCredential.user.getIdToken();
    console.log('Got ID token, length:', idToken.length);
    
    // Call function
    const getUserStats = httpsCallable(functions, 'getUserStats');
    const result = await getUserStats();
    
    console.log('Function call successful:', result.data);
    
  } catch (error) {
    console.error('Test failed:', error.code, error.message);
  }
}

testAuth();