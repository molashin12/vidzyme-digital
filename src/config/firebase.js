// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Updated to match the correct vidzyme project
const firebaseConfig = {
  apiKey: "AIzaSyCW-MCPKCpZpKTuNdtghu6rfXo_-WcFpGQ",
  authDomain: "vidzyme.firebaseapp.com",
  projectId: "vidzyme",
  storageBucket: "vidzyme.firebasestorage.app",
  messagingSenderId: "1099101673529",
  appId: "1:1099101673529:web:4aa36a2308bf0d582c95e8",
  measurementId: "G-28Q1GXWCKM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Ensure functions are connected to the correct region
if (process.env.NODE_ENV === 'development') {
  // For development, you can uncomment the line below to use emulator
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}
export const analytics = getAnalytics(app);

export default app;