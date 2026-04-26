import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listAllTypes() {
  const querySnapshot = await getDocs(collection(db, "movies"));
  const types = new Set();
  querySnapshot.forEach((doc) => {
    types.add(doc.data().type);
    console.log(doc.data().title, " => ", doc.data().type);
  });
  console.log("Unique types:", Array.from(types));
}

listAllTypes().catch(console.error);
