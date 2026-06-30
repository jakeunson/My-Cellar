/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for project: my-cellar-9cf6d
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalTestOnly",
  authDomain: "my-cellar-9cf6d.firebaseapp.com",
  projectId: "my-cellar-9cf6d",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "my-cellar-9cf6d.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_SENDER_ID || "123456789",
  appId: env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase & Firestore
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

