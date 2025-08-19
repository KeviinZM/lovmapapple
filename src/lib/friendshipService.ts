import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Friend } from '../types';

const FRIENDSHIPS_COLLECTION = 'friendships';


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
        
        // Traiter chaque amitié
        for (const doc of snapshot.docs) {
          const data = doc.data();
          
          // Vérifier si l'utilisateur actuel est impliqué dans cette amitié
          if (data.userId === userId || data.friendId === userId) {
            const otherUserId = data.userId === userId ? data.friendId : data.userId;
            
            console.log(`🔍 Récupération du profil de l'ami: ${otherUserId}`);
            
            try {
              // Récupérer le profil de l'ami individuellement
              const userDoc = await firestore().collection('users').doc(otherUserId).get();
              
              if (userDoc.exists()) {
                const userProfile = userDoc.data();
                console.log(`✅ Profil trouvé pour ${otherUserId}:`, userProfile);
                
                // Utiliser le profil actuel de l'ami pour avoir son vrai pseudo
                const displayName = userProfile?.pseudo || userProfile?.displayName || 'Utilisateur';
                console.log(`📝 Nom affiché pour ${otherUserId}: ${displayName}`);

                // Utiliser la couleur stockée dans l'amitié ou assigner une nouvelle
                let friendColor = data.friendColor;
                if (!friendColor) {
                  friendColor = getNextAvailableColor(friends);
                }

                friends.push({
                  uid: otherUserId,
                  displayName: displayName,
                  email: userProfile?.email || '',
                  color: friendColor,
                  code: userProfile?.code || otherUserId.slice(0, 5).toUpperCase(),
                  createdAt: userProfile?.createdAt?.toDate() || new Date(),
                });
                
                console.log(`✅ Ami ajouté à la liste: ${displayName} (${otherUserId})`);
              } else {
                console.warn(`⚠️ Profil non trouvé pour ${otherUserId}`);
                
                // Fallback : utiliser les données de base de l'amitié
                friends.push({
                  uid: otherUserId,
                  displayName: data.friendDisplayName || 'Utilisateur',
                  email: data.friendEmail || '',
                  color: data.friendColor || getNextAvailableColor(friends),
                  code: otherUserId.slice(0, 5).toUpperCase(),
                  createdAt: new Date(),
                });
              }
            } catch (profileError) {
              console.error(`❌ Erreur lors de la récupération du profil de ${otherUserId}:`, profileError);
              
              // Fallback : utiliser les données de base de l'amitié
              friends.push({
                uid: otherUserId,
                displayName: data.friendDisplayName || 'Utilisateur',
                email: data.friendEmail || '',
                color: data.friendColor || getNextAvailableColor(friends),
                code: otherUserId.slice(0, 5).toUpperCase(),
                createdAt: new Date(),
              });
            }
          }
        }

        callback(friends);
      } catch (error) {
        console.error('Erreur dans subscribeToFriendships:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Erreur snapshot friendships:', error);
      callback([]);
    });
};


export const addFriendByCode = async (code: string): Promise<Friend> => {
  try {
    const current = auth().currentUser;
    if (!current) throw new Error('Utilisateur non connecté');
    
    const codeTrim = (code || '').trim().toUpperCase();
    if (!codeTrim || codeTrim.length < 3) throw new Error('Code invalide');
    
    // Trouver l'utilisateur par son code
    const q = await firestore().collection('users').where('code', '==', codeTrim).limit(1).get();
    
    if (q.empty) {
      throw new Error('Aucun utilisateur avec ce code');
    }
    
    const doc = q.docs[0];
    
    if (doc.id === current.uid) {
      throw new Error('Vous ne pouvez pas vous ajouter vous‑même');
    }
    
    const friendProfile = doc.data();
    
    // Vérifier si l'amitié existe déjà
    const existingFriendship = await firestore()
      .collection(FRIENDSHIPS_COLLECTION)
      .where('userId', '==', current.uid)
      .where('friendId', '==', doc.id)
      .limit(1)
      .get();
      
    if (!existingFriendship.empty) {
      throw new Error('Cet ami est déjà dans votre liste');
    }
    
    // Récupérer la liste actuelle des amis pour déterminer la couleur
    const currentFriendsQuery = await firestore()
      .collection(FRIENDSHIPS_COLLECTION)
      .where('status', '==', 'accepted')
      .get();
    
    const currentFriends: Friend[] = [];
    const currentFriendIds = new Set<string>();
    
    currentFriendsQuery.docs.forEach(doc => {
      const data = doc.data();
      if (data.userId === current.uid || data.friendId === current.uid) {
        const otherUserId = data.userId === current.uid ? data.friendId : data.userId;
        currentFriendIds.add(otherUserId);
        
        currentFriends.push({
          uid: otherUserId,
          displayName: 'Utilisateur', // Sera mis à jour par subscribeToFriendships
          email: '',
          color: data.friendColor || '#2D7FF9',
          code: otherUserId.slice(0, 5).toUpperCase(),
          createdAt: new Date(),
        });
      }
    });
    
    // Assigner la prochaine couleur disponible
    const newFriendColor = getNextAvailableColor(currentFriends);
    
    // Créer l'amitié avec les informations actuelles
    const friendshipData = {
      userId: current.uid,
      friendId: doc.id,
      userDisplayName: current.displayName || 'Utilisateur',
      userEmail: current.email || '',
      friendDisplayName: friendProfile.pseudo || friendProfile.displayName || 'Utilisateur',
      friendEmail: friendProfile.email || '',
      friendColor: newFriendColor,
      status: 'accepted',
      timestamp: firestore.FieldValue.serverTimestamp(),
    };
    
    await firestore().collection(FRIENDSHIPS_COLLECTION).add(friendshipData);
    
    return {
      uid: doc.id,
      displayName: friendProfile.pseudo || friendProfile.displayName || 'Utilisateur',
      email: friendProfile.email || '',
      color: newFriendColor,
      code: friendProfile.code || doc.id.slice(0, 5).toUpperCase(),
      createdAt: friendProfile.createdAt?.toDate() || new Date(),
    };
    
  } catch (error: any) {
    // Gestion spécifique des erreurs Firestore
    if (error.code === 'permission-denied') {
      throw new Error('Erreur de permission: Vérifiez que les règles Firestore sont correctement configurées');
    }
    
    if (error.code === 'unavailable') {
      throw new Error('Service temporairement indisponible, réessayez plus tard');
    }
    
    // Relancer l'erreur originale si c'est une erreur personnalisée
    if (error.message && !error.code) {
      throw error;
    }
    
    throw new Error(`Erreur lors de l'ajout d'ami: ${error.message || 'Erreur inconnue'}`);
  }
};


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


