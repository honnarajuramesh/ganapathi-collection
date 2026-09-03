import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYZD7x8q2xv0FlIyXohj9YkTooiIPmoqk",
  authDomain: "ganapathi-collection.firebaseapp.com",
  projectId: "ganapathi-collection",
  storageBucket: "ganapathi-collection.firebasestorage.app",
  messagingSenderId: "703499224045",
  appId: "1:703499224045:web:266a461157ab835acc1de4",
  measurementId: "G-402PM5WSX4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);