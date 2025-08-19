import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { initializeApp } from '@react-native-firebase/app';


const FIREBASE_API_KEY = 'AIzaSyCUTTnMVDtjbBprFa1sKPz2SWBe8B_0FII';
const FIREBASE_AUTH_DOMAIN = 'lovmap-3cd2c.firebaseapp.com';
const FIREBASE_PROJECT_ID = 'lovmap-3cd2c';
const FIREBASE_STORAGE_BUCKET = 'lovmap-3cd2c.firebasestorage.app';
const FIREBASE_MESSAGING_SENDER_ID = '533439795027';
const FIREBASE_APP_ID = '1:533439795027:android:94d80bfa34408f4a6ddba6';


export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};


try {
  initializeApp(firebaseConfig);
  console.log('✅ Firebase initialisé avec succès');
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Erreur lors de l\'initialisation Firebase:', error);
  }
}


export { auth, firestore };
