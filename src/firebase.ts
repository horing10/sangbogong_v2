import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration loaded from firebase-applet-config.json
const firebaseConfig = {
  projectId: "causal-robot-mxjg4",
  appId: "1:359724986740:web:d1d6426cb0320f24a5bc21",
  apiKey: "AIzaSyDvAwgxFCxlNvmvyv_Twjru6TaHha6Byi8",
  authDomain: "causal-robot-mxjg4.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-b8468db3-70ee-41d3-9d7a-2261a50c2d89",
  storageBucket: "causal-robot-mxjg4.firebasestorage.app",
  messagingSenderId: "359724986740"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the database ID from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
