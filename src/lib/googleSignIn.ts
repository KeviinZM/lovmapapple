import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configuration Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '927171505332-n30sheipr5bc86mi6bqa4kjgm2pgids1.apps.googleusercontent.com', // Web Client ID
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
  // logs verbeux retirés
};

// Fonction principale de connexion Google
export const signInWithGoogle = async () => {
  try {
    // logs verbeux retirés
    
    // Vérifier que Google Play Services est disponible
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // logs verbeux retirés
    
    // Tenter la connexion
    const userInfo = await GoogleSignin.signIn();
    
    return userInfo;
  } catch (error: any) {
    // logging réduit
    
    // Gestion spécifique des erreurs
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Connexion annulée par l\'utilisateur');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services non disponible');
    } else if (error.code === 'DEVELOPER_ERROR') {
      throw new Error('Erreur de configuration développeur. Vérifiez les Client IDs.');
    } else {
      throw new Error(`Erreur Google Sign-In: ${error.message}`);
    }
  }
};

// Fonction de déconnexion
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    // logging réduit
    throw error;
  }
};
