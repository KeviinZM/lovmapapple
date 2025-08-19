import firestore from '@react-native-firebase/firestore';
import { auth } from './firebase';
import { ReactionCount, EmojiData } from '../types';


export interface Reaction {
  id: string;
  lovId: string;
  userId: string;
  userEmail: string;
  emoji: string;
  timestamp: Date;
}

export interface UserReaction {
  emoji: string;
  timestamp: Date;
}


const REACTIONS_COLLECTION = 'reactions';


export const AVAILABLE_EMOJIS: EmojiData[] = [
  { emoji: '❤️', label: 'J\'adore ce lieu !' },
  { emoji: '🔥', label: 'Endroit chaud !' },
  { emoji: '👍', label: 'Sympa !' },
  { emoji: '😍', label: 'Magnifique !' },
  { emoji: '💯', label: 'Parfait !' },
  { emoji: '😎', label: 'Style !' },
  { emoji: '⭐', label: 'Recommandé !' },
  { emoji: '💪', label: 'Endroit fort !' },
];


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
    throw error;
  }
};


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
    return AVAILABLE_EMOJIS.map(({ emoji }) => ({
      emoji,
      count: 0,
      hasReacted: false,
    }));
  }
};


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
      callback([]);
    });
};


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
    return [];
  }
};


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
    throw error;
  }
};
