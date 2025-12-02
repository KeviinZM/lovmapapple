import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import '@react-native-firebase/app';

// L'initialisation de Firebase est déléguée aux fichiers natifs:
// - Android: google-services.json (déjà présent)
// - iOS: GoogleService-Info.plist (à ajouter au projet iOS)
// Aucun appel explicite à initializeApp n'est requis.

export { auth, firestore };
