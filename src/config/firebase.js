// Firebase v9 SDK สำหรับ React Native
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDLEf1Z5HPTfQBNRXQ4zR0Mto9Ju2mjRwU",
  authDomain: "mobileapp-a7a40.firebaseapp.com",
  databaseURL: "https://mobileapp-a7a40-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mobileapp-a7a40",
  storageBucket: "mobileapp-a7a40.firebasestorage.app",
  messagingSenderId: "616340107062",
  appId: "1:616340107062:web:e52eb9d35b8f3e21a30d97",
  measurementId: "G-SR1L39P711"
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);

// เริ่มต้น Auth สำหรับ React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// เริ่มต้น Firestore
const db = getFirestore(app);

// เริ่มต้น Storage
const storage = getStorage(app);

export { app, auth, db, storage };
