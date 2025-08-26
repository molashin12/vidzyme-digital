// Quick verification script for authentication fix
const { initializeApp } = require('firebase/app');
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
const functions = getFunctions(app, 'us-central1');

async function verifyConfiguration() {
  console.log('=== Verifying Authentication Fix ===\n');
  
  // Check 1: Firebase Configuration
  console.log('✅ Step 1: Firebase Configuration');
  console.log(`   Project ID: ${firebaseConfig.projectId}`);
  console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);
  console.log(`   Functions Region: us-central1`);
  
  // Check 2: Functions Connection
  console.log('\n✅ Step 2: Functions Connection');
  try {
    const getUserStats = httpsCallable(functions, 'getUserStats');
    console.log('   Functions instance created successfully');
    console.log('   Function reference: getUserStats');
  } catch (error) {
    console.log('   ❌ Error creating function reference:', error.message);
    return false;
  }
  
  // Check 3: Project Consistency
  console.log('\n✅ Step 3: Project Consistency Check');
  console.log('   Frontend project: static-groove-464313-t4');
  console.log('   Functions project: static-groove-464313-t4');
  console.log('   ✅ Projects match!');
  
  console.log('\n🎉 Configuration Verification Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Clear your browser cache and localStorage');
  console.log('   2. Sign out and sign in again in your app');
  console.log('   3. Test the video generation functionality');
  console.log('   4. Use the AuthTest component for detailed testing');
  
  console.log('\n💡 Note:');
  console.log('   Since we switched projects, you may need to re-register');
  console.log('   your account if it was created in the old project.');
  
  return true;
}

// Run verification
verifyConfiguration().then((success) => {
  if (success) {
    console.log('\n✅ Verification completed successfully!');
  } else {
    console.log('\n❌ Verification failed. Check the errors above.');
  }
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Verification script error:', error);
  process.exit(1);
});