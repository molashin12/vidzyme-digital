// Test script to verify authentication fix
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Updated Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCW-MCPKCpZpKTuNdtghu6rfXo_-WcFpGQ",
  authDomain: "static-groove-464313-t4.firebaseapp.com",
  projectId: "static-groove-464313-t4",
  storageBucket: "static-groove-464313-t4.appspot.com",
  messagingSenderId: "1099101673529",
  appId: "1:1099101673529:web:4aa36a2308bf0d582c95e8",
  measurementId: "G-28Q1GXWCKM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');

async function testAuthenticationFix() {
  console.log('=== Testing Authentication Fix ===');
  
  try {
    // Test with the user's credentials
    console.log('Attempting to sign in...');
    const userCredential = await signInWithEmailAndPassword(auth, 'mohammedlashin159@gmail.com', 'your-password-here');
    const user = userCredential.user;
    
    console.log('✅ Sign in successful!');
    console.log('User UID:', user.uid);
    console.log('User Email:', user.email);
    
    // Get ID token
    const idToken = await user.getIdToken();
    console.log('✅ ID Token obtained, length:', idToken.length);
    
    // Test function call
    console.log('Testing getUserStats function...');
    const getUserStats = httpsCallable(functions, 'getUserStats');
    const result = await getUserStats();
    
    console.log('✅ Function call successful!');
    console.log('Result:', result.data);
    
    console.log('\n🎉 Authentication fix verified! The issue has been resolved.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.code, error.message);
    
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      console.log('\n📝 Note: Please update the password in this test script or use your actual credentials.');
    } else if (error.code === 'functions/unauthenticated') {
      console.log('\n🔍 The authentication issue persists. Additional debugging needed.');
    }
  }
}

// Run the test
testAuthenticationFix().then(() => {
  console.log('\nTest completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});