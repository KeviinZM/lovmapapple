import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { deleteAllReactionsForLov } from './reactionService';
import { Friend } from './friendshipService';
import { UserProfile } from '../types';

// Legacy: types et API pour "locations" non utilisés dans l'app actuelle ont été retirés

export type FckEmoji = 'aubergine' | 'peche';
export type FckLocationType = 'address' | 'city';

export interface Fck {
  id: string;
  latitude: number;
  longitude: number;
  emoji: FckEmoji;
  locationType: FckLocationType;
  addressLabel: string; // adresse ou ville affichée
  city?: string | null; // ville normalisée pour l'affichage
  partnerName?: string | null;
  rating: number; // 1..5
  userId: string;
  userEmail: string;
  userColor: string; // couleur du créateur (pour le badge)
  createdAt: Date;
}

const FCKS_COLLECTION = 'fcks';
const USERS_COLLECTION = 'users';

export const ensureUserProfile = async (customDisplayName?: string): Promise<UserProfile> => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');
  const uid = current.uid;
  const ref = firestore().collection(USERS_COLLECTION).doc(uid);
  
  console.log('🔥 ensureUserProfile - Début, UID:', uid);
  console.log('🔥 ensureUserProfile - Référence Firestore:', ref.path);
  console.log('🔥 ensureUserProfile - Custom displayName:', customDisplayName);

  // Génère un code déterministe (5 premiers caractères de l'UID)
  const raw = (uid || '').replace(/[^A-Za-z0-9]/g, '');
  const code = raw.slice(0, 5).toUpperCase();

  // Vérifier si c'est un utilisateur Google qui n'a pas encore défini son pseudo
  const isGoogleUser = current.providerData.some(provider => provider.providerId === 'google.com');
  
  // Priorité : customDisplayName > current.displayName > null
  const displayName = customDisplayName || current.displayName || null;
  const needsInitialDisplayName = isGoogleUser && !displayName;

  const profile: UserProfile = {
    uid,
    displayName,
    email: current.email || null,
    code,
    hasSetInitialDisplayName: !needsInitialDisplayName, // true si déjà défini, false si Google sans pseudo
  };

  // set merge: true pour créer/compléter de façon idempotent
  console.log('🔥 ensureUserProfile - Tentative d\'écriture Firestore...');
  console.log('🔥 ensureUserProfile - Données à écrire:', profile);
  
  try {
    await ref.set(profile as any, { merge: true });
    console.log('✅ ensureUserProfile - Écriture Firestore réussie');
  } catch (error) {
    console.error('❌ ensureUserProfile - Erreur Firestore:', error);
    throw error;
  }
  
  return profile;
};

// Fonction pour mettre à jour le profil utilisateur dans Firestore
export const updateUserProfile = async (updates: Partial<Pick<UserProfile, 'displayName' | 'email' | 'hasSetInitialDisplayName'>>): Promise<void> => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');
  const uid = current.uid;
  const ref = firestore().collection(USERS_COLLECTION).doc(uid);
  
  // Vérifier si on peut modifier le displayName
  if (updates.displayName) {
    const currentProfile = await ref.get();
    const hasSetInitial = currentProfile.data()?.hasSetInitialDisplayName;
    
    if (hasSetInitial) {
      throw new Error('Le changement de pseudo n\'est autorisé qu\'à la première connexion');
    }
    
    // Marquer que l'utilisateur a défini son pseudo initial
    updates.hasSetInitialDisplayName = true;
  }
  
  console.log('🔥 updateUserProfile - UID:', uid);
  console.log('🔥 updateUserProfile - Updates:', updates);
  console.log('🔥 updateUserProfile - Référence Firestore:', ref.path);
  
  // Mise à jour du profil dans Firestore
  await ref.update(updates);
  console.log('✅ updateUserProfile - Mise à jour Firestore réussie');
  
  // Si le displayName a changé, mettre à jour aussi dans les friendships
  if (updates.displayName) {
    console.log('🔄 Mise à jour du displayName dans les friendships...');
    
    // Trouver tous les documents friendships où cet utilisateur est l'ami
    const friendshipsQuery = firestore()
      .collection('friendships')
      .where('friendId', '==', uid);
    
    const friendshipsSnap = await friendshipsQuery.get();
    console.log(`📊 Trouvé ${friendshipsSnap.size} friendships à mettre à jour`);
    
    // Mettre à jour chaque friendship
    const batch = firestore().batch();
    friendshipsSnap.forEach(doc => {
      const friendshipRef = firestore().collection('friendships').doc(doc.id);
      batch.update(friendshipRef, { 
        friendDisplayName: updates.displayName,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
    });
    
    if (friendshipsSnap.size > 0) {
      await batch.commit();
      console.log('✅ Friendships mises à jour avec succès');
    } else {
      console.log('ℹ️ Aucune friendship à mettre à jour');
    }
  }
};

export const getMyCode = async (): Promise<string> => {
  const prof = await ensureUserProfile();
  return prof.code;
};

// Ajouter un FCK
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
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  const ref = await firestore().collection(FCKS_COLLECTION).add(payload);
  return ref.id;
};

export const subscribeToFcks = (callback: (fcks: Fck[]) => void) => {
  const current = auth().currentUser;
  if (!current) {
    console.log('❌ subscribeToFcks - Utilisateur non connecté');
    callback([]);
    return () => {};
  }

  console.log('🔥 subscribeToFcks - Début pour utilisateur:', current.uid);

  // Récupérer d'abord la liste des amis de l'utilisateur
  const friendsUnsubscribe = firestore()
    .collection('friendships')
    .where('status', '==', 'accepted')
    .onSnapshot(async (friendsSnapshot) => {
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

        console.log('🔥 subscribeToFcks - UIDs autorisés:', Array.from(authorizedUserIds));

        // Maintenant récupérer seulement les points des utilisateurs autorisés
        const fcksUnsubscribe = firestore()
          .collection(FCKS_COLLECTION)
          .where('userId', 'in', Array.from(authorizedUserIds))
          .orderBy('createdAt', 'desc')
          .onSnapshot((fcksSnapshot) => {
            if (fcksSnapshot && fcksSnapshot.docs) {
              const list = fcksSnapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate() || new Date(),
              })) as Fck[];
              
              console.log('🔥 subscribeToFcks - Points récupérés:', list.length);
              callback(list);
            } else {
              callback([]);
            }
          }, (error) => {
            console.error('❌ subscribeToFcks - Erreur lors de la récupération des points:', error);
            callback([]);
          });

        // Retourner la fonction de nettoyage
        return () => {
          friendsUnsubscribe();
          fcksUnsubscribe();
        };
      } catch (error) {
        console.error('❌ subscribeToFcks - Erreur lors de la récupération des amis:', error);
        callback([]);
        return friendsUnsubscribe;
      }
    }, (error) => {
      console.error('❌ subscribeToFcks - Erreur lors de la récupération des amis:', error);
      callback([]);
    });

  // Retourner la fonction de nettoyage
  return () => {
    friendsUnsubscribe();
  };
};

export const getUserFcks = async (userId: string): Promise<Fck[]> => {
  const current = auth().currentUser;
  if (!current) {
    console.log('❌ getUserFcks - Utilisateur non connecté');
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
      console.log('❌ getUserFcks - Utilisateur non autorisé à voir les points de:', userId);
      return [];
    }
  }

  const snap = await firestore()
    .collection(FCKS_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
    
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() || new Date(),
  })) as Fck[];
};

export const subscribeToUserFcks = (userId: string, callback: (fcks: Fck[]) => void) => {
  return firestore()
    .collection(FCKS_COLLECTION)
    .where('userId', '==', userId)
    .onSnapshot((snap) => {
      if (snap && snap.docs) {
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate() || new Date(),
        })) as Fck[];
        callback(list);
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

// Fonction pour supprimer complètement le compte utilisateur
export const deleteUserAccount = async (password?: string): Promise<void> => {
  const current = auth().currentUser;
  if (!current) throw new Error('Utilisateur non connecté');
  const uid = current.uid;

  console.log('🗑️ Début de la suppression du compte utilisateur:', uid);

  try {
    // 0. Réauthentification si nécessaire (pour les opérations sensibles)
    if (password) {
      console.log('🔐 Réauthentification...');
      const email = current.email;
      if (!email) throw new Error('Email non disponible pour la réauthentification');
      
      const credential = auth.EmailAuthProvider.credential(email, password);
      await current.reauthenticateWithCredential(credential);
      console.log('✅ Réauthentification réussie');
    }

    // 1. Supprimer tous les FCKs de l'utilisateur
    console.log('🗑️ Suppression des FCKs...');
    const userFcks = await getUserFcks(uid);
    const batch = firestore().batch();
    
    userFcks.forEach(fck => {
      const fckRef = firestore().collection(FCKS_COLLECTION).doc(fck.id);
      // Supprimer d'abord les réactions associées
      batch.delete(fckRef);
    });
    
    if (userFcks.length > 0) {
      await batch.commit();
      console.log(`🗑️ ${userFcks.length} FCKs supprimés`);
    }

    // 2. Supprimer toutes les réactions de l'utilisateur
    console.log('🗑️ Suppression des réactions...');
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
      console.log(`🗑️ ${reactionsSnap.size} réactions supprimées`);
    }

    // 3. Supprimer toutes les friendships où l'utilisateur apparaît (propriétaire OU ami)
    console.log('🗑️ Suppression des friendships...');
    
    // 3a. Friendships où l'utilisateur est propriétaire
    const friendshipsOwnerQuery = firestore()
      .collection('friendships')
      .where('userId', '==', uid);
    
    const friendshipsOwnerSnap = await friendshipsOwnerQuery.get();
    console.log(`📊 Trouvé ${friendshipsOwnerSnap.size} friendships où l'utilisateur est propriétaire`);
    
    // 3b. Friendships où l'utilisateur est ami
    const friendshipsFriendQuery = firestore()
      .collection('friendships')
      .where('friendId', '==', uid);
    
    const friendshipsFriendSnap = await friendshipsFriendQuery.get();
    console.log(`📊 Trouvé ${friendshipsFriendSnap.size} friendships où l'utilisateur est ami`);
    
    // 3c. Supprimer toutes les friendships en une seule fois
    const allFriendships = [...friendshipsOwnerSnap.docs, ...friendshipsFriendSnap.docs];
    const friendshipsBatch = firestore().batch();
    
    if (allFriendships.length > 0) {
      allFriendships.forEach(doc => {
        const friendshipRef = firestore().collection('friendships').doc(doc.id);
        friendshipsBatch.delete(friendshipRef);
      });
      
      await friendshipsBatch.commit();
      console.log(`🗑️ ${allFriendships.length} friendships supprimées au total`);
    } else {
      console.log('ℹ️ Aucune friendship à supprimer');
    }

    // 4. Supprimer le profil utilisateur
    console.log('🗑️ Suppression du profil utilisateur...');
    const userRef = firestore().collection(USERS_COLLECTION).doc(uid);
    await userRef.delete();

    // 5. Supprimer le compte Firebase Authentication
    console.log('🗑️ Suppression du compte Firebase Auth...');
    await current.delete();

    console.log('✅ Compte utilisateur supprimé avec succès');
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression du compte:', error);
    
    // Gestion spécifique de l'erreur de réauthentification
    if (error?.code === 'auth/requires-recent-login') {
      throw new Error('Réauthentification requise. Veuillez saisir votre mot de passe.');
    }
    
    throw new Error(`Impossible de supprimer le compte: ${error?.message || 'Erreur inconnue'}`);
  }
};

// Fonction utilitaire pour obtenir tous les points visibles par l'utilisateur connecté
export const getVisibleFcks = async (): Promise<Fck[]> => {
  const current = auth().currentUser;
  if (!current) {
    console.log('❌ getVisibleFcks - Utilisateur non connecté');
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

    console.log('🔥 getVisibleFcks - UIDs autorisés:', Array.from(authorizedUserIds));

    // Récupérer les points des utilisateurs autorisés
    const fcksQuery = await firestore()
      .collection(FCKS_COLLECTION)
      .where('userId', 'in', Array.from(authorizedUserIds))
      .orderBy('createdAt', 'desc')
      .get();

    const fcks = fcksQuery.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    })) as Fck[];

    console.log('🔥 getVisibleFcks - Points récupérés:', fcks.length);
    return fcks;

  } catch (error) {
    console.error('❌ getVisibleFcks - Erreur:', error);
    return [];
  }
};
