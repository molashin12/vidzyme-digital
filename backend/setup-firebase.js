const admin = require('firebase-admin');
require('dotenv').config();

// Test Firebase Admin SDK setup
async function testFirebaseSetup() {
  try {
    console.log('🔥 Testing Firebase Admin SDK setup...');
    
    // Check if environment variables are set
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.log('\n📝 To set up Firebase Admin SDK:');
      console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
      console.log('2. Click "Generate new private key"');
      console.log('3. Download the JSON file');
      console.log('4. Copy the values to your .env file:');
      console.log('   - project_id → FIREBASE_PROJECT_ID');
      console.log('   - private_key → FIREBASE_PRIVATE_KEY (keep the quotes and \\n)');
      console.log('   - client_email → FIREBASE_CLIENT_EMAIL');
      return;
    }
    
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });
    }
    
    // Test Firestore connection
    console.log('📊 Testing Firestore connection...');
    const db = admin.firestore();
    const testDoc = await db.collection('_test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Backend connection test'
    });
    console.log('✅ Firestore connection successful');
    
    // Test Storage connection
    console.log('🗄️  Testing Storage connection...');
    const bucket = admin.storage().bucket();
    const [exists] = await bucket.exists();
    if (exists) {
      console.log('✅ Storage bucket connection successful');
    } else {
      console.log('⚠️  Storage bucket not found, but connection is working');
    }
    
    // Test Auth connection
    console.log('🔐 Testing Auth connection...');
    const auth = admin.auth();
    // Just check if we can access the auth service
    await auth.listUsers(1); // List 1 user to test connection
    console.log('✅ Auth connection successful');
    
    // Clean up test document
    await db.collection('_test').doc('connection').delete();
    
    console.log('\n🎉 All Firebase services are properly configured!');
    console.log('🚀 You can now start the backend server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Firebase setup error:', error.message);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n🔧 Credential Error Solutions:');
      console.log('1. Check that FIREBASE_PRIVATE_KEY includes quotes and \\n characters');
      console.log('2. Verify FIREBASE_CLIENT_EMAIL is correct');
      console.log('3. Ensure the service account has proper permissions');
    }
    
    if (error.code === 'auth/project-not-found') {
      console.log('\n🔧 Project Error Solutions:');
      console.log('1. Verify FIREBASE_PROJECT_ID matches your Firebase project');
      console.log('2. Check that the project exists in Firebase Console');
    }
  }
}

// Run the test
if (require.main === module) {
  testFirebaseSetup().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { testFirebaseSetup };