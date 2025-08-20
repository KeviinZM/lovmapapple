import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Friend } from '../types';

const FRIENDSHIPS_COLLECTION = 'friendships';

export const subscribeToFriendships = (
  userId: string,
  callback: (friends: Friend[]) => void
) => {
  // Surveiller les amitiés dans les deux directions
  const unsubscribe1 = firestore()
    .collection(FRIENDSHIPS_COLLECTION)
    .where('userId', '==', userId)
    .where('status', '==', 'accepted')
    .onSnapshot(async (snapshot1) => {
      
      const unsubscribe2 = firestore()
        .collection(FRIENDSHIPS_COLLECTION)
        .where('friendId', '==', userId)
        .where('status', '==', 'accepted')
        .onSnapshot(async (snapshot2) => {
          
          try {
            const friends: Friend[] = [];
            
            // Traiter les amitiés où l'utilisateur est le userId
            for (const doc of snapshot1.docs) {
              const data = doc.data();
              const otherUserId = data.friendId;
              
              console.log(`🔍 Récupération du profil de l'ami (userId): ${otherUserId}`);
              
              try {
                // Récupérer le profil de l'ami individuellement
                const userDoc = await firestore().collection('users').doc(otherUserId).get();
                
                if (userDoc.exists()) {
                  const userProfile = userDoc.data();
                  console.log(`✅ Profil trouvé pour ${otherUserId}:`, userProfile);
                  
                  // Utiliser le profil actuel de l'ami pour avoir son vrai pseudo
                  const displayName = userProfile?.pseudo || userProfile?.displayName || 'Utilisateur';
                  console.log(`📝 Nom affiché pour ${otherUserId}: ${displayName}`);

                  // Utiliser la couleur stockée dans l'amitié OU assigner une nouvelle si pas de couleur
                  let friendColor = data.friendColor;
                  if (!friendColor) {
                    // Si pas de couleur stockée, en assigner une nouvelle depuis Firestore
                    try {
                      friendColor = await getNextAvailableColorFromFirestore();
                      // Mettre à jour l'amitié avec la nouvelle couleur
                      await doc.ref.update({ friendColor: friendColor });
                      console.log(`🎨 Nouvelle couleur assignée pour ${otherUserId}: ${friendColor}`);
                    } catch (updateError) {
                      console.warn(`⚠️ Impossible de mettre à jour la couleur pour ${otherUserId}:`, updateError);
                      // Fallback : utiliser une couleur par défaut
                      friendColor = '#2D7FF9';
                    }
                  }

                  friends.push({
                    uid: otherUserId,
                    displayName: displayName,
                    email: userProfile?.email || '',
                    color: friendColor, // Utiliser la couleur (stockée ou nouvellement assignée)
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
                    color: data.friendColor || '#2D7FF9', // Utiliser la couleur stockée ou une couleur par défaut
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
                  color: data.friendColor || '#2D7FF9', // Utiliser la couleur stockée ou une couleur par défaut
                  code: otherUserId.slice(0, 5).toUpperCase(),
                  createdAt: new Date(),
                });
              }
            }
            
            // Traiter les amitiés où l'utilisateur est le friendId
            for (const doc of snapshot2.docs) {
              const data = doc.data();
              const otherUserId = data.userId;
              
              console.log(`🔍 Récupération du profil de l'ami (friendId): ${otherUserId}`);
              
              try {
                // Récupérer le profil de l'ami individuellement
                const userDoc = await firestore().collection('users').doc(otherUserId).get();
                
                if (userDoc.exists()) {
                  const userProfile = userDoc.data();
                  console.log(`✅ Profil trouvé pour ${otherUserId}:`, userProfile);
                  
                  // Utiliser le profil actuel de l'ami pour avoir son vrai pseudo
                  const displayName = userProfile?.pseudo || userProfile?.displayName || 'Utilisateur';
                  console.log(`📝 Nom affiché pour ${otherUserId}: ${displayName}`);

                  // Utiliser la couleur stockée dans l'amitié OU assigner une nouvelle si pas de couleur
                  let friendColor = data.friendColor;
                  if (!friendColor) {
                    // Si pas de couleur stockée, en assigner une nouvelle depuis Firestore
                    try {
                      friendColor = await getNextAvailableColorFromFirestore();
                      // Mettre à jour l'amitié avec la nouvelle couleur
                      await doc.ref.update({ friendColor: friendColor });
                      console.log(`🎨 Nouvelle couleur assignée pour ${otherUserId}: ${friendColor}`);
                    } catch (updateError) {
                      console.warn(`⚠️ Impossible de mettre à jour la couleur pour ${otherUserId}:`, updateError);
                      // Fallback : utiliser une couleur par défaut
                      friendColor = '#2D7FF9';
                    }
                  }

                  friends.push({
                    uid: otherUserId,
                    displayName: displayName,
                    email: userProfile?.email || '',
                    color: friendColor, // Utiliser la couleur (stockée ou nouvellement assignée)
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
                    color: data.friendColor || '#2D7FF9', // Utiliser la couleur stockée ou une couleur par défaut
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
                  color: data.friendColor || '#2D7FF9', // Utiliser la couleur stockée ou une couleur par défaut
                  code: otherUserId.slice(0, 5).toUpperCase(),
                  createdAt: new Date(),
                });
              }
            }

            callback(friends);
          } catch (error) {
            console.error('Erreur dans subscribeToFriendships:', error);
            callback([]);
          }
        });
        
        // Retourner une fonction de nettoyage qui arrête les deux listeners
        return () => {
          unsubscribe1();
          unsubscribe2();
        };
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
    
    // Créer l'amitié avec une couleur unique
    const friendColor = await getNextAvailableColorFromFirestore();
    
    await firestore()
      .collection(FRIENDSHIPS_COLLECTION)
      .add({
        userId: current.uid,
        friendId: friendProfile.uid,
        friendDisplayName: friendProfile.displayName || friendProfile.email?.split('@')[0] || 'Utilisateur',
        friendEmail: friendProfile.email || '',
        friendColor: friendColor, // Utiliser la couleur unique vérifiée dans Firestore
        status: 'accepted',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    
    return {
      uid: doc.id,
      displayName: friendProfile.pseudo || friendProfile.displayName || 'Utilisateur',
      email: friendProfile.email || '',
      color: friendColor,
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

// Fonction pour obtenir la prochaine couleur disponible en vérifiant Firestore
export const getNextAvailableColorFromFirestore = async (): Promise<string> => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');

  try {
    // Récupérer toutes les amitiés où l'utilisateur est impliqué
    const friendshipsQuery = await firestore()
      .collection(FRIENDSHIPS_COLLECTION)
      .where('userId', '==', current.uid)
      .get();

    const reverseFriendshipsQuery = await firestore()
      .collection(FRIENDSHIPS_COLLECTION)
      .where('friendId', '==', current.uid)
      .get();

    // Collecter toutes les couleurs utilisées
    const usedColors = new Set<string>();
    
    // Couleurs des amis que j'ai ajoutés
    friendshipsQuery.docs.forEach(doc => {
      const data = doc.data();
      if (data.friendColor) {
        usedColors.add(data.friendColor);
      }
    });

    // Couleurs des amis qui m'ont ajouté
    reverseFriendshipsQuery.docs.forEach(doc => {
      const data = doc.data();
      if (data.friendColor) {
        usedColors.add(data.friendColor);
      }
    });

    // Palette de couleurs disponibles
    const palette = ['#2D7FF9', '#FFC107', '#4CAF50', '#673AB7', '#E91E63', '#00BCD4', '#9C27B0', '#3F51B5', '#009688'];
    
    // Trouver la première couleur non utilisée
    for (const color of palette) {
      if (!usedColors.has(color)) {
        return color;
      }
    }

    // Si toutes les couleurs sont utilisées, générer une couleur aléatoire
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    return randomColor;
  } catch (error) {
    console.error('Erreur lors de la vérification des couleurs:', error);
    // Fallback vers une couleur par défaut
    return '#2D7FF9';
  }
};
