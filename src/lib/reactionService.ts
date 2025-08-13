import firestore from '@react-native-firebase/firestore';
import { auth } from './firebase';

// Types pour les réactions
export interface Reaction {
  id: string;
  lovId: string;
  userId: string;
  userEmail: string;
  emoji: string;
  timestamp: Date;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  hasReacted: boolean; // Si l'utilisateur actuel a réagi avec cet émoji
}

export interface UserReaction {
  emoji: string;
  timestamp: Date;
}

// Collection Firestore pour les réactions
const REACTIONS_COLLECTION = 'reactions';

// Émojis disponibles avec leurs significations
export const AVAILABLE_EMOJIS = [
  { emoji: '❤️', meaning: 'J\'adore ce lieu !' },
  { emoji: '🔥', meaning: 'Endroit chaud !' },
  { emoji: '👍', meaning: 'Sympa !' },
  { emoji: '😍', meaning: 'Magnifique !' },
  { emoji: '💯', meaning: 'Parfait !' },
  { emoji: '😎', meaning: 'Style !' },
  { emoji: '⭐', meaning: 'Recommandé !' },
  { emoji: '💪', meaning: 'Endroit fort !' },
];

// Ajouter une réaction (ou la retirer si elle existe déjà)
export const toggleReaction = async (lovId: string, emoji: string): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('Utilisateur non connecté');

    const reactionRef = firestore()
      .collection(REACTIONS_COLLECTION)
      .doc(`${lovId}_${user.uid}_${emoji}`);

    const reactionDoc = await reactionRef.get();

    if (reactionDoc.exists()) {
      // La réaction existe, la supprimer
      await reactionRef.delete();
    } else {
      // Ajouter la nouvelle réaction
      const reaction: Omit<Reaction, 'id'> = {
        lovId,
        userId: user.uid,
        userEmail: user.email || '',
        emoji,
        timestamp: new Date(),
      };
      await reactionRef.set(reaction);
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la réaction:', error);
    throw error;
  }
};

// Récupérer toutes les réactions d'un lieu avec compteurs
export const getReactionsWithCounts = async (lovId: string): Promise<ReactionCount[]> => {
  try {
    const user = auth().currentUser;
    const userId = user?.uid;

    const reactionsSnapshot = await firestore()
      .collection(REACTIONS_COLLECTION)
      .where('lovId', '==', lovId)
      .get();

    // Compter les réactions par émoji
    const emojiCounts: Record<string, number> = {};
    const userReactions: Set<string> = new Set();

    reactionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const emoji = data.emoji;
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
      
      // Vérifier si l'utilisateur actuel a réagi
      if (data.userId === userId) {
        userReactions.add(emoji);
      }
    });

    // Créer la liste des réactions avec compteurs
    return AVAILABLE_EMOJIS.map(({ emoji }) => ({
      emoji,
      count: emojiCounts[emoji] || 0,
      hasReacted: userReactions.has(emoji),
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des réactions:', error);
    return AVAILABLE_EMOJIS.map(({ emoji }) => ({
      emoji,
      count: 0,
      hasReacted: false,
    }));
  }
};

// S'abonner aux réactions d'un lieu en temps réel
export const subscribeToReactions = (
  lovId: string,
  callback: (reactions: ReactionCount[]) => void
) => {
  return firestore()
    .collection(REACTIONS_COLLECTION)
    .where('lovId', '==', lovId)
    .onSnapshot(async (snapshot) => {
      try {
        const reactions = await getReactionsWithCounts(lovId);
        callback(reactions);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des réactions:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Erreur lors de l\'abonnement aux réactions:', error);
      callback([]);
    });
};

// Récupérer les réactions d'un utilisateur sur un lieu
export const getUserReactionsOnLov = async (lovId: string): Promise<UserReaction[]> => {
  try {
    const user = auth().currentUser;
    if (!user) return [];

    const reactionsSnapshot = await firestore()
      .collection(REACTIONS_COLLECTION)
      .where('lovId', '==', lovId)
      .where('userId', '==', user.uid)
      .get();

    return reactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        emoji: data.emoji,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réactions utilisateur:', error);
    return [];
  }
};

// Supprimer toutes les réactions d'un lieu (pour la suppression d'un LOV)
export const deleteAllReactionsForLov = async (lovId: string): Promise<void> => {
  try {
    const reactionsSnapshot = await firestore()
      .collection(REACTIONS_COLLECTION)
      .where('lovId', '==', lovId)
      .get();

    const batch = firestore().batch();
    reactionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Erreur lors de la suppression des réactions:', error);
    throw error;
  }
};
