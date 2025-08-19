import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { deleteAllReactionsForLov } from './reactionService';
import { UserProfile, Friend, Fck, FckEmoji, FckLocationType } from '../types';

const FCKS_COLLECTION = 'fcks';
const USERS_COLLECTION = 'users';


const generateUserCode = (uid: string): string => {
  const raw = (uid || '').replace(/[^A-Za-z0-9]/g, '');
  return raw.slice(0, 5).toUpperCase();
};

export const ensureUserProfile = async (customDisplayName?: string): Promise<UserProfile> => {
  const current = auth().currentUser;
  if (!current) {
    throw new Error('Utilisateur non connecté - veuillez réessayer');
  }

  const uid = current.uid;
  const usersRef = firestore().collection('users');
  const userRef = usersRef.doc(uid);

  // Retry automatique en cas d'erreur temporaire
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      // Vérifier d'abord si le profil existe déjà
      const doc = await userRef.get();
      
      if (doc.exists()) {
        // Profil existant, le retourner
        const existingProfile = doc.data() as UserProfile;
        return {
          ...existingProfile,
          createdAt: existingProfile.createdAt ? (existingProfile.createdAt instanceof Date ? existingProfile.createdAt : new Date()) : new Date(),
          updatedAt: new Date(),
        };
      }
      
             // Profil inexistant, le créer avec le pseudo personnalisé
       const profile: UserProfile = {
         uid,
         pseudo: customDisplayName || current.email?.split('@')[0] || 'Utilisateur', // Pseudo personnalisé
         email: current.email,
         code: generateUserCode(uid),
         createdAt: new Date(),
         updatedAt: new Date(),
       };
      
             // Log pour vérifier que le pseudo est bien stocké
       console.log('🔍 Création du profil avec:', {
         uid,
         pseudo: profile.pseudo,
         customDisplayName,
         email: current.email
       });
      
      await userRef.set(profile as any);
  
      return profile;
    } catch (error: any) {
      retryCount++;
      
      // Si c'est une erreur temporaire et qu'on peut retry
      if (error.code === 'firestore/unavailable' && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        continue;
      }
      
      // Erreur fatale ou plus de retry
      throw new Error(`Erreur lors de la création du profil: ${error.message}`);
    }
  }
  
  throw new Error('Nombre maximum de tentatives atteint');
};

export const getMyCode = async (): Promise<string> => {
  const prof = await ensureUserProfile();
  return prof.code;
};




export const addFck = async (params: {
  latitude: number;
  longitude: number;
  emoji: FckEmoji;
  locationType: FckLocationType;
  addressLabel: string;
  city?: string;
  partnerName?: string;
  rating: number;
  userColor?: string;
}): Promise<string> => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');

  // Récupérer le profil utilisateur pour avoir son pseudo
  let userPseudo = 'Utilisateur';
  try {
    const userProfile = await ensureUserProfile();
    userPseudo = userProfile.pseudo || 'Utilisateur';
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
  }

  const payload = {
    latitude: params.latitude,
    longitude: params.longitude,
    emoji: params.emoji,
    locationType: params.locationType,
    addressLabel: params.addressLabel,
    city: params.city || null,
    partnerName: params.partnerName || null,
    rating: params.rating,
    userId: current.uid,
    userEmail: current.email || 'Anonyme',
    userColor: params.userColor || '#FF6A2B',
    userPseudo: userPseudo, // Ajouter le pseudo de l'utilisateur
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  const ref = await firestore().collection(FCKS_COLLECTION).add(payload);
  return ref.id;
};

export const subscribeToFcks = (callback: (fcks: Fck[]) => void) => {
  const current = auth().currentUser;
  if (!current) {
    callback([]);
    return () => {};
  }

  let friendsUnsubscribe: (() => void) | null = null;
  let fcksUnsubscribe: (() => void) | null = null;
  let isCancelled = false;

  // Fonction de nettoyage centralisée
  const cleanup = () => {
    if (isCancelled) return;
    isCancelled = true;
    
    if (friendsUnsubscribe) {
      friendsUnsubscribe();
      friendsUnsubscribe = null;
    }
    if (fcksUnsubscribe) {
      fcksUnsubscribe();
      fcksUnsubscribe = null;
    }
  };

  // Abonnement aux amis
  friendsUnsubscribe = firestore()
    .collection('friendships')
    .where('status', '==', 'accepted')
    .onSnapshot(async (friendsSnapshot) => {
      if (isCancelled) return;
      
      try {
        // Construire la liste des UIDs autorisés (utilisateur + amis)
        const authorizedUserIds = new Set<string>([current.uid]);
        
        friendsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.userId === current.uid) {
            authorizedUserIds.add(data.friendId);
          } else if (data.friendId === current.uid) {
            authorizedUserIds.add(data.userId);
          }
        });



        // Nettoyer l'abonnement précédent aux FCKs
        if (fcksUnsubscribe) {
          fcksUnsubscribe();
        }

        // Maintenant récupérer seulement les points des utilisateurs autorisés
        fcksUnsubscribe = firestore()
          .collection(FCKS_COLLECTION)
          .where('userId', 'in', Array.from(authorizedUserIds))
          .orderBy('createdAt', 'desc')
          .onSnapshot(async (fcksSnapshot) => {
            if (isCancelled) return;
            
            if (fcksSnapshot && fcksSnapshot.docs) {
              try {
                // Récupérer les profils des utilisateurs pour avoir leurs pseudos
                const userIds = [...new Set(fcksSnapshot.docs.map(d => d.data().userId))];
                const userProfiles = new Map<string, UserProfile>();
                
                // Récupérer tous les profils en une seule requête
                if (userIds.length > 0) {
                  const profilesQuery = await firestore()
                    .collection('users')
                    .where(firestore.FieldPath.documentId(), 'in', userIds)
                    .get();
                  
                  profilesQuery.docs.forEach(doc => {
                    userProfiles.set(doc.id, doc.data() as UserProfile);
                  });
                }
                
                const list = fcksSnapshot.docs.map(d => {
                  const data = d.data();
                  const userProfile = userProfiles.get(data.userId);
                  
                                     return {
                     id: d.id,
                     ...data,
                     createdAt: data.createdAt?.toDate() || new Date(),
                     // Enrichir avec le pseudo de l'utilisateur
                     userPseudo: userProfile?.pseudo || 'Utilisateur',
                   };
                }) as (Fck & { userPseudo: string })[];
                
                callback(list);
              } catch (error) {
                if (isCancelled) return;
                console.error('❌ subscribeToFcks - Erreur lors de l\'enrichissement des profils:', error);
                // Fallback : retourner les FCKs sans enrichissement
                             const list = fcksSnapshot.docs.map(d => ({
                 id: d.id,
                 ...d.data(),
                 createdAt: d.data().createdAt?.toDate() || new Date(),
                 userPseudo: 'Utilisateur',
               })) as (Fck & { userPseudo: string })[];
              
              callback(list);
              }
            } else {
              callback([]);
            }
          }, (error) => {
            if (isCancelled) return;
            console.error('❌ subscribeToFcks - Erreur lors de la récupération des points:', error);
            callback([]);
          });

      } catch (error) {
        if (isCancelled) return;
        console.error('❌ subscribeToFcks - Erreur lors de la récupération des amis:', error);
        callback([]);
      }
    }, (error) => {
      if (isCancelled) return;
      console.error('❌ subscribeToFcks - Erreur lors de la récupération des amis:', error);
      callback([]);
    });

  // Retourner la fonction de nettoyage
  return cleanup;
};

export const getUserFcks = async (userId: string): Promise<Fck[]> => {
  const current = auth().currentUser;
  if (!current) {
    return [];
  }

  // Vérifier que l'utilisateur peut voir les points de cet utilisateur
  if (userId !== current.uid) {
    // Vérifier si c'est un ami
    const friendshipQuery = await firestore()
      .collection('friendships')
      .where('status', '==', 'accepted')
      .get();

    let isFriend = false;
    friendshipQuery.docs.forEach(doc => {
      const data = doc.data();
      if ((data.userId === current.uid && data.friendId === userId) ||
          (data.friendId === current.uid && data.userId === userId)) {
        isFriend = true;
      }
    });

    if (!isFriend) {
      return [];
    }
  }

  const snap = await firestore()
    .collection(FCKS_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
    
  // Récupérer le profil de l'utilisateur pour avoir son pseudo
  let userProfile: UserProfile | null = null;
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    if (userDoc.exists()) {
      userProfile = userDoc.data() as UserProfile;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
  }
    
     return snap.docs.map(d => ({
     id: d.id,
     ...d.data(),
     createdAt: d.data().createdAt?.toDate() || new Date(),
     userPseudo: userProfile?.pseudo || 'Utilisateur',
   })) as Fck[];
};

export const subscribeToUserFcks = (userId: string, callback: (fcks: Fck[]) => void) => {
  return firestore()
    .collection(FCKS_COLLECTION)
    .where('userId', '==', userId)
    .onSnapshot(async (snap) => {
      if (snap && snap.docs) {
        try {
          // Récupérer le profil de l'utilisateur pour avoir son pseudo
          const userDoc = await firestore().collection('users').doc(userId).get();
          const userProfile = userDoc.exists() ? (userDoc.data() as UserProfile) : null;
          
                     const list = snap.docs.map(d => ({
             id: d.id,
             ...d.data(),
             createdAt: d.data().createdAt?.toDate() || new Date(),
             userPseudo: userProfile?.pseudo || 'Utilisateur',
           })) as Fck[];
          
          callback(list);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil utilisateur:', error);
          // Fallback : retourner les FCKs sans enrichissement
                 const list = snap.docs.map(d => ({
           id: d.id,
           ...d.data(),
           createdAt: d.data().createdAt?.toDate() || new Date(),
           userPseudo: 'Utilisateur',
         })) as Fck[];
          
        callback(list);
        }
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Erreur lors de la récupération des FCKs:', error);
      callback([]);
    });
};

export const updateFck = async (
  fckId: string,
  updates: Partial<Pick<Fck, 'emoji' | 'rating' | 'partnerName' | 'addressLabel' | 'city' | 'latitude' | 'longitude' | 'locationType' | 'userColor'>>
) => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');
  const ref = firestore().collection(FCKS_COLLECTION).doc(fckId);
  // Nettoie les champs undefined (Firestore ne les accepte pas)
  const clean: Record<string, any> = {};
  Object.entries(updates || {}).forEach(([k, v]) => {
    if (v !== undefined) clean[k] = v; // garde null si explicitement fourni
  });
  if (Object.keys(clean).length === 0) return; // rien à mettre à jour
  await ref.update({ ...clean, updatedAt: firestore.FieldValue.serverTimestamp() });
};

export const deleteFck = async (fckId: string) => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');
  const ref = firestore().collection(FCKS_COLLECTION).doc(fckId);
  const doc = await ref.get();
      if (!doc.exists()) throw new Error('FCK introuvable');
  const data = doc.data();
  if (data?.userId !== current.uid) throw new Error('Non autorisé');
  
  // Supprimer d'abord toutes les réactions associées
  await deleteAllReactionsForLov(fckId);
  
  // Puis supprimer le LOV
  await ref.delete();
};


export const deleteUserAccount = async (password?: string): Promise<void> => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');
  const uid = current.uid;

  try {
    // 0. Réauthentification si nécessaire (pour les opérations sensibles)
    if (password) {
      const email = current.email;
      if (!email) throw new Error('Email non disponible pour la réauthentification');
      
      const credential = auth.EmailAuthProvider.credential(email, password);
      await current.reauthenticateWithCredential(credential);
    }

    // 1. Supprimer tous les FCKs de l'utilisateur
    const userFcks = await getUserFcks(uid);
    const batch = firestore().batch();
    
    userFcks.forEach(fck => {
      const fckRef = firestore().collection(FCKS_COLLECTION).doc(fck.id);
      // Supprimer d'abord les réactions associées
      batch.delete(fckRef);
    });
    
    if (userFcks.length > 0) {
      await batch.commit();
    }

    // 2. Supprimer toutes les réactions de l'utilisateur
    const reactionsQuery = firestore()
      .collection('reactions')
      .where('userId', '==', uid);
    
    const reactionsSnap = await reactionsQuery.get();
    const reactionsBatch = firestore().batch();
    
    reactionsSnap.forEach(doc => {
      const reactionRef = firestore().collection('reactions').doc(doc.id);
      reactionsBatch.delete(reactionRef);
    });
    
    if (reactionsSnap.size > 0) {
      await reactionsBatch.commit();
    }

    // 3. Supprimer toutes les friendships où l'utilisateur apparaît (propriétaire OU ami)
    
    // 3a. Friendships où l'utilisateur est propriétaire
    const friendshipsOwnerQuery = firestore()
      .collection('friendships')
      .where('userId', '==', uid);
    
    const friendshipsOwnerSnap = await friendshipsOwnerQuery.get();
    
    // 3b. Friendships où l'utilisateur est ami
    const friendshipsFriendQuery = firestore()
      .collection('friendships')
      .where('friendId', '==', uid);
    
    const friendshipsFriendSnap = await friendshipsFriendQuery.get();
    
    // 3c. Supprimer toutes les friendships en une seule fois
    const allFriendships = [...friendshipsOwnerSnap.docs, ...friendshipsFriendSnap.docs];
    const friendshipsBatch = firestore().batch();
    
    if (allFriendships.length > 0) {
      allFriendships.forEach(doc => {
        const friendshipRef = firestore().collection('friendships').doc(doc.id);
        friendshipsBatch.delete(friendshipRef);
      });
      
      await friendshipsBatch.commit();
    }

    // 4. Supprimer le profil utilisateur
    const userRef = firestore().collection(USERS_COLLECTION).doc(uid);
    await userRef.delete();

    // 5. Supprimer le compte Firebase Authentication
    await current.delete();
  } catch (error: any) {
    // Gestion spécifique de l'erreur de réauthentification
    if (error?.code === 'auth/requires-recent-login') {
      throw new Error('Réauthentification requise. Veuillez saisir votre mot de passe.');
    }
    
    throw new Error(`Impossible de supprimer le compte: ${error?.message || 'Erreur inconnue'}`);
  }
};


export const getVisibleFcks = async (): Promise<Fck[]> => {
  const current = auth().currentUser;
  if (!current) {
    return [];
  }

  try {
    // Récupérer d'abord la liste des amis
    const friendsQuery = await firestore()
      .collection('friendships')
      .where('status', '==', 'accepted')
      .get();

    // Construire la liste des UIDs autorisés (utilisateur + amis)
    const authorizedUserIds = new Set<string>([current.uid]);
    
    friendsQuery.docs.forEach(doc => {
      const data = doc.data();
      if (data.userId === current.uid) {
        authorizedUserIds.add(data.friendId);
      } else if (data.friendId === current.uid) {
        authorizedUserIds.add(data.userId);
      }
    });

    // Récupérer les points des utilisateurs autorisés
    const fcksQuery = await firestore()
      .collection(FCKS_COLLECTION)
      .where('userId', 'in', Array.from(authorizedUserIds))
      .orderBy('createdAt', 'desc')
      .get();

    // Récupérer les profils des utilisateurs pour avoir leurs pseudos
    const userIds = [...new Set(fcksQuery.docs.map(d => d.data().userId))];
    const userProfiles = new Map<string, UserProfile>();
    
    if (userIds.length > 0) {
      try {
        const profilesQuery = await firestore()
          .collection('users')
          .where(firestore.FieldPath.documentId(), 'in', userIds)
          .get();
        
        profilesQuery.docs.forEach(doc => {
          userProfiles.set(doc.id, doc.data() as UserProfile);
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des profils utilisateurs:', error);
      }
    }

    const fcks = fcksQuery.docs.map(d => {
      const data = d.data();
      const userProfile = userProfiles.get(data.userId);
      
             return {
       id: d.id,
         ...data,
       createdAt: d.data().createdAt?.toDate() || new Date(),
         userPseudo: userProfile?.pseudo || 'Utilisateur',
       };
    }) as Fck[];

    return fcks;

  } catch (error) {
    console.error('Erreur getVisibleFcks:', error);
    return [];
  }
};
