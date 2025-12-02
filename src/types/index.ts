

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Interface pour le profil utilisateur
export interface UserProfile {
  uid: string;
  pseudo: string; // Pseudo choisi par l'utilisateur
  email: string | null;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour les amis
export interface Friend {
  uid: string;
  displayName: string;
  email: string | null;
  color: string; // couleur unique pour l'affichage
  code: string; // code unique basé sur l'UID
  createdAt: Date;
  updatedAt?: Date;
}

// Interface pour les réactions
export interface ReactionCount {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

// Interface pour les emojis disponibles
export interface EmojiData {
  emoji: string;
  label: string;
}

// Types pour les FCKs
export type FckEmoji = 'aubergine' | 'peche';
export type FckLocationType = 'address' | 'city';

export interface Fck {
  id: string;
  latitude: number;
  longitude: number;
  emoji: FckEmoji;
  locationType: FckLocationType;
  addressLabel: string;
  city?: string | null;
  partnerName?: string | null;
  rating: number;
  userId: string;
  userEmail: string;
  userColor: string;
  createdAt: Date;
  userPseudo?: string; // pseudo de l'utilisateur qui a créé le FCK
}

// Types pour les notifications
export interface NotificationPreferences {
  newLoves: boolean;
  newFriendships: boolean;
  newReactions: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface NotificationData {
  id: string;
  type: 'newLove' | 'newFriendship' | 'newReaction';
  title: string;
  message: string;
  userId: string;
  userPseudo: string;
  timestamp: Date;
  read: boolean;
  data?: {
    loveId?: string;
    friendId?: string;
    reactionId?: string;
  };
}
