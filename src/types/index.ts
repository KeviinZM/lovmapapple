

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Interface pour le profil utilisateur
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  code: string; // code unique pour être ajouté
  hasSetInitialDisplayName?: boolean; // flag pour autoriser le premier changement
}
