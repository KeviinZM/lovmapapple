import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export interface Friend {
  uid: string;
  displayName: string;
  email: string;
  color: string;
  code: string; // Champ requis pour compatibilité avec l'interface existante
}

const FRIENDSHIPS_COLLECTION = 'friendships';

// Palette de 15 couleurs uniques pour les amis (excluant l'orange #FF6A2B réservé à l'utilisateur principal)
const FRIEND_COLORS = [
  '#2D7FF9', // Bleu
  '#4CAF50', // Vert
  '#673AB7', // Violet
  '#E91E63', // Rose
  '#00BCD4', // Cyan
  '#9C27B0', // Magenta
  '#3F51B5', // Indigo
  '#009688', // Teal
  '#FF9800', // Orange foncé (différent de l'orange utilisateur)
  '#795548', // Marron
  '#607D8B', // Bleu gris
  '#8BC34A', // Vert clair
  '#FFC107', // Jaune
  '#FF5722', // Rouge orange
  '#2196F3', // Bleu clair
];

// Fonction pour obtenir la prochaine couleur disponible
const getNextAvailableColor = (existingFriends: Friend[]): string => {
  const usedColors = new Set(existingFriends.map(f => f.color));
  
  // Trouver la première couleur non utilisée
  for (const color of FRIEND_COLORS) {
    if (!usedColors.has(color)) {
      return color;
    }
  }
  
  // Si toutes les couleurs sont utilisées, recommencer depuis le début
  // mais en évitant les doublons récents
  const lastUsedIndex = existingFriends.length % FRIEND_COLORS.length;
  return FRIEND_COLORS[lastUsedIndex];
};

// S'abonner aux changements d'amitiés
export const subscribeToFriendships = (
  userId: string,
  callback: (friends: Friend[]) => void
) => {
  return firestore()
    .collection(FRIENDSHIPS_COLLECTION)
    .where('status', '==', 'accepted')
    .onSnapshot(async (snapshot) => {
      try {
        const friends: Friend[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          // Vérifier si l'utilisateur actuel est impliqué dans cette amitié
          if (data.userId === userId || data.friendId === userId) {
            const isOwner = data.userId === userId;
            const otherUser = isOwner ? {
              uid: data.friendId,
              displayName: data.friendDisplayName || 'Ami',
              email: data.friendEmail || '',
            } : {
              uid: data.userId,
              displayName: data.userDisplayName || 'Ami',
              email: data.userEmail || '',
            };

            // Utiliser la couleur stockée dans l'amitié ou assigner une nouvelle
            let friendColor = data.friendColor;
            if (!friendColor) {
              // Si pas de couleur stockée, en assigner une nouvelle
              friendColor = getNextAvailableColor(friends);
            }

            friends.push({
              uid: otherUser.uid,
              displayName: otherUser.displayName,
              email: otherUser.email,
              color: friendColor,
              code: otherUser.uid.slice(0, 5).toUpperCase(), // Code basé sur l'UID pour compatibilité
            });
          }
        });

        callback(friends);
      } catch (error) {
        callback([]);
      }
    }, (error) => {
      callback([]);
    });
};

// Ajouter un ami par code
export const addFriendByCode = async (code: string): Promise<Friend> => {
  try {
    const current = auth().currentUser;
    if (!current) throw new Error('Utilisateur non connecté');
    
    console.log('🔥 addFriendByCode - Début, utilisateur:', current.uid);
    
    const codeTrim = (code || '').trim().toUpperCase();
    if (!codeTrim || codeTrim.length < 3) throw new Error('Code invalide');
    
    console.log('🔥 addFriendByCode - Code recherché:', codeTrim);
    
    // Trouver l'utilisateur par son code
    console.log('🔥 addFriendByCode - Recherche utilisateur par code...');
    const q = await firestore().collection('users').where('code', '==', codeTrim).limit(1).get();
    
    if (q.empty) {
      console.log('❌ addFriendByCode - Aucun utilisateur trouvé avec le code:', codeTrim);
      throw new Error('Aucun utilisateur avec ce code');
    }
    
    const doc = q.docs[0];
    console.log('✅ addFriendByCode - Utilisateur trouvé:', doc.id);
    
    if (doc.id === current.uid) {
      console.log('❌ addFriendByCode - Tentative d\'ajout de soi-même');
      throw new Error('Vous ne pouvez pas vous ajouter vous‑même');
    }
    
    const friendProfile = doc.data();
    console.log('🔥 addFriendByCode - Profil ami:', friendProfile);
    
    // Vérifier si l'amitié existe déjà
    console.log('🔥 addFriendByCode - Vérification amitié existante...');
    const existingFriendship = await firestore()
      .collection(FRIENDSHIPS_COLLECTION)
      .where('userId', '==', current.uid)
      .where('friendId', '==', doc.id)
      .limit(1)
      .get();
      
    if (!existingFriendship.empty) {
      console.log('❌ addFriendByCode - Amitié déjà existante');
      throw new Error('Cet ami est déjà dans votre liste');
    }
    
    // Récupérer la liste actuelle des amis pour déterminer la couleur
    const currentFriendsQuery = await firestore()
      .collection(FRIENDSHIPS_COLLECTION)
      .where('status', '==', 'accepted')
      .get();
    
    const currentFriends: Friend[] = [];
    currentFriendsQuery.docs.forEach(doc => {
      const data = doc.data();
      if (data.userId === current.uid || data.friendId === current.uid) {
        const isOwner = data.userId === current.uid;
        const otherUser = isOwner ? {
          uid: data.friendId,
          displayName: data.friendDisplayName || 'Ami',
          email: data.friendEmail || '',
        } : {
          uid: data.userId,
          displayName: data.userDisplayName || 'Ami',
          email: data.userEmail || '',
        };
        
        currentFriends.push({
          uid: otherUser.uid,
          displayName: otherUser.displayName,
          email: otherUser.email,
          color: data.friendColor || '#2D7FF9',
          code: otherUser.uid.slice(0, 5).toUpperCase(),
        });
      }
    });
    
    // Assigner la prochaine couleur disponible
    const newFriendColor = getNextAvailableColor(currentFriends);
    console.log('🎨 addFriendByCode - Couleur assignée:', newFriendColor);
    
    // Créer l'amitié
    const friendshipData = {
      userId: current.uid,
      friendId: doc.id,
      userDisplayName: current.displayName || 'Ami',
      userEmail: current.email || '',
      friendDisplayName: friendProfile.displayName || 'Ami',
      friendEmail: friendProfile.email || '',
      friendColor: newFriendColor, // Stocker la couleur assignée
      status: 'accepted',
      timestamp: firestore.FieldValue.serverTimestamp(),
    };
    
    console.log('🔥 addFriendByCode - Tentative de création friendship...');
    console.log('🔥 addFriendByCode - Données:', friendshipData);
    
    await firestore().collection(FRIENDSHIPS_COLLECTION).add(friendshipData);
    console.log('✅ addFriendByCode - Friendship créée avec succès');
    
    return {
      uid: doc.id,
      displayName: friendProfile.displayName || 'Ami',
      email: friendProfile.email || '',
      color: newFriendColor,
      code: friendProfile.code || doc.id.slice(0, 5).toUpperCase(),
    };
    
  } catch (error: any) {
    console.error('❌ addFriendByCode - Erreur complète:', error);
    
    // Gestion spécifique des erreurs Firestore
    if (error.code === 'permission-denied') {
      console.error('❌ addFriendByCode - Erreur de permission Firestore');
      throw new Error('Erreur de permission: Vérifiez que les règles Firestore sont correctement configurées');
    }
    
    if (error.code === 'unavailable') {
      console.error('❌ addFriendByCode - Service Firestore indisponible');
      throw new Error('Service temporairement indisponible, réessayez plus tard');
    }
    
    // Relancer l'erreur originale si c'est une erreur personnalisée
    if (error.message && !error.code) {
      throw error;
    }
    
    throw new Error(`Erreur lors de l'ajout d'ami: ${error.message || 'Erreur inconnue'}`);
  }
};

// Supprimer un ami
export const removeFriend = async (friendUid: string): Promise<void> => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');
  
  // Trouver et supprimer l'amitié
  const friendshipQuery = await firestore()
    .collection(FRIENDSHIPS_COLLECTION)
    .where('userId', '==', current.uid)
    .where('friendId', '==', friendUid)
    .limit(1)
    .get();
    
  if (!friendshipQuery.empty) {
    await friendshipQuery.docs[0].ref.delete();
  }
  
  // Vérifier s'il y a une amitié dans l'autre sens
  const reverseFriendshipQuery = await firestore()
    .collection(FRIENDSHIPS_COLLECTION)
    .where('userId', '==', friendUid)
    .where('friendId', '==', current.uid)
    .limit(1)
    .get();
    
  if (!reverseFriendshipQuery.empty) {
    await reverseFriendshipQuery.docs[0].ref.delete();
  }
};

// Fonction pour réassigner les couleurs aux amis existants (utile pour corriger les doublons)
export const reassignFriendColors = async (): Promise<void> => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');
  
  try {
    console.log('🎨 reassignFriendColors - Début de la réassignation des couleurs');
    
    // Récupérer toutes les amitiés de l'utilisateur
    const friendshipsQuery = await firestore()
      .collection(FRIENDSHIPS_COLLECTION)
      .where('status', '==', 'accepted')
      .get();
    
    const userFriendships: Array<{docId: string, data: any}> = [];
    
    friendshipsQuery.docs.forEach(doc => {
      const data = doc.data();
      if (data.userId === current.uid || data.friendId === current.uid) {
        userFriendships.push({ docId: doc.id, data });
      }
    });
    
    console.log('🎨 reassignFriendColors - Amitiés trouvées:', userFriendships.length);
    
    // Réassigner les couleurs en évitant les doublons
    const usedColors = new Set<string>();
    const batch = firestore().batch();
    
    for (const friendship of userFriendships) {
      let newColor = friendship.data.friendColor;
      
      // Si pas de couleur ou couleur déjà utilisée, en assigner une nouvelle
      if (!newColor || usedColors.has(newColor)) {
        newColor = getNextAvailableColor([]);
        // Ajouter temporairement cette couleur à la liste des utilisées
        usedColors.add(newColor);
        
        // Mettre à jour le document
        const docRef = firestore().collection(FRIENDSHIPS_COLLECTION).doc(friendship.docId);
        batch.update(docRef, { friendColor: newColor });
        
        console.log('🎨 reassignFriendColors - Couleur réassignée pour', friendship.data.friendDisplayName || 'Ami', ':', newColor);
      } else {
        usedColors.add(newColor);
      }
    }
    
    // Appliquer toutes les mises à jour
    await batch.commit();
    console.log('✅ reassignFriendColors - Réassignation terminée avec succès');
    
  } catch (error: any) {
    console.error('❌ reassignFriendColors - Erreur:', error);
    throw new Error(`Erreur lors de la réassignation des couleurs: ${error.message}`);
  }
};

// Fonction pour obtenir la palette de couleurs disponibles (utile pour le débogage)
export const getAvailableFriendColors = (): string[] => {
  return [...FRIEND_COLORS];
};
