import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from '@env';

// Configuration Firebase sécurisée via variables d'environnement
// Force l'utilisation des variables pour éviter l'optimisation Babel
const apiKey = FIREBASE_API_KEY;
const projectId = FIREBASE_PROJECT_ID;

export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

// Export des services Firebase (utilisés partout)
export { auth, firestore };
