// src/firebase/config.ts (تغيير الامتداد من .js إلى .ts)

// استيراد الوظائف الأساسية من Firebase مع أنواع البيانات
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// تكوين تطبيق Firebase الخاص بك
const firebaseConfig = {
  
  apiKey: "AIzaSyD4YntC3iYp6A2U0HZtwCziY5ABnamobYE",
  authDomain: "bakker-e803d.firebaseapp.com",
  projectId: "bakker-e803d",
  storageBucket: "bakker-e803d.firebasestorage.app",
  messagingSenderId: "77098358966",
  appId: "1:77098358966:web:ca71300b956371e3032e17",
  measurementId: "G-7TKV1TBQ10"
};

// تعريف المتغيرات مع أنواع البيانات
let firebaseApp: FirebaseApp;
let analytics: Analytics | null = null;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (typeof window !== 'undefined' && !getApps().length) {
  // تهيئة Firebase
  firebaseApp = initializeApp(firebaseConfig);
  
  // تهيئة Analytics (فقط في المتصفح)
  analytics = getAnalytics(firebaseApp);
  
  // تهيئة خدمات Firebase الأخرى
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
  storage = getStorage(firebaseApp);
} else {
  // في حالة SSR، نتجنب تهيئة analytics
  firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
  storage = getStorage(firebaseApp);
}

// تصدير الكائنات التي سيتم استخدامها في باقي التطبيق
export { firebaseApp, analytics, db, auth, storage };