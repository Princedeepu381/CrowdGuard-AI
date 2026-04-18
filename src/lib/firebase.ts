// Firebase configuration for CrowdGuard-AI
// Uses Firebase Realtime Database to persist incident logs in real-time
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForCrowdGuardAI00000000000",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crowdguard-ai-demo.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://crowdguard-ai-demo-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crowdguard-ai-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crowdguard-ai-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef",
};

// Initialise Firebase only once (Vite HMR guard)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db: Database = getDatabase(app);

// Initialize Analytics conditionally (may not be supported in some environments/extensions)
let analytics: Analytics | null = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };
export default app;
