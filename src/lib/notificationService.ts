import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { 
  AndroidImportance, 
  AndroidStyle, 
  AndroidColor,
  EventType,
  TriggerType,
  AndroidCategory
} from '@notifee/react-native';
import { NotificationPreferences, NotificationData } from '../types';

const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';
const NOTIFICATIONS_HISTORY_KEY = 'notifications_history';

// Configuration par défaut des notifications
const DEFAULT_PREFERENCES: NotificationPreferences = {
  newLoves: true,
  newFriendships: true,
  newReactions: true,
  sound: true,
  vibration: true,
};

/**
 * Configure le système de notifications au démarrage de l'application
 */
export const configurePushNotifications = async () => {
  try {
    console.log('🔔 Configuration des notifications en cours...');
    
    // Demander les permissions pour Android
    const permission = await notifee.requestPermission();
    console.log('🔔 Permission demandée:', permission);
    
    // Créer le canal de notification pour Android
    const channel = await notifee.createChannel({
      id: 'lovmap-notifications',
      name: 'LOVMAP Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
      lights: true,
      lightColor: AndroidColor.RED,
    });
    
    console.log('🔔 Canal de notification créé:', channel);

    console.log('🔔 Notifications configurées avec succès');
  } catch (error) {
    console.error('🔔 Erreur lors de la configuration des notifications:', error);
  }
};

/**
 * Récupère les préférences de notification de l'utilisateur
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const preferences = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (preferences) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(preferences) };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Sauvegarde les préférences de notification de l'utilisateur
 */
export const saveNotificationPreferences = async (preferences: NotificationPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
    
    // TODO: Synchroniser avec Firestore quand l'utilisateur sera connecté
    // if (user) {
    //   await firestore().collection('users').doc(user.uid).update({
    //     notificationPreferences: preferences
    //   });
    // }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences:', error);
  }
};

/**
 * Récupère l'historique des notifications
 */
export const getNotificationsHistory = async (): Promise<NotificationData[]> => {
  try {
    const history = await AsyncStorage.getItem(NOTIFICATIONS_HISTORY_KEY);
    if (history) {
      const parsedHistory = JSON.parse(history);
      // Convertir les timestamps en objets Date
      return parsedHistory.map((notification: any) => ({
        ...notification,
        timestamp: new Date(notification.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
};

/**
 * Ajoute une notification à l'historique
 */
export const addNotificationToHistory = async (notification: Omit<NotificationData, 'id'>): Promise<void> => {
  try {
    const history = await getNotificationsHistory();
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
    };
    
    // Ajouter au début de l'historique
    const updatedHistory = [newNotification, ...history];
    
    // Garder seulement les 100 dernières notifications
    if (updatedHistory.length > 100) {
      updatedHistory.splice(100);
    }
    
    await AsyncStorage.setItem(NOTIFICATIONS_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Erreur lors de l\'ajout à l\'historique:', error);
  }
};

/**
 * Marque une notification comme lue
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const history = await getNotificationsHistory();
    const updatedHistory = history.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    
    await AsyncStorage.setItem(NOTIFICATIONS_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
  }
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const history = await getNotificationsHistory();
    const updatedHistory = history.map(notification => ({
      ...notification,
      read: true
    }));
    
    await AsyncStorage.setItem(NOTIFICATIONS_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications:', error);
  }
};

/**
 * Supprime une notification de l'historique
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const history = await getNotificationsHistory();
    const updatedHistory = history.filter(notification => notification.id !== notificationId);
    
    await AsyncStorage.setItem(NOTIFICATIONS_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  }
};

/**
 * Efface tout l'historique des notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_HISTORY_KEY);
  } catch (error) {
    console.error('Erreur lors de l\'effacement de l\'historique:', error);
  }
};

/**
 * Récupère le nombre de notifications non lues
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const history = await getNotificationsHistory();
    return history.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error);
    return 0;
  }
};

/**
 * Envoie une notification locale
 */
export const sendLocalNotification = async (
  title: string,
  message: string,
  data?: any
): Promise<void> => {
  try {
    const preferences = await getNotificationPreferences();
    
    // Vérifier si les notifications sont activées
    if (!preferences.newLoves && !preferences.newFriendships && !preferences.newReactions) {
      return;
    }

    // Créer la notification
    await notifee.displayNotification({
      title,
      body: message,
      data,
      android: {
        channelId: 'lovmap-notifications',
        importance: AndroidImportance.HIGH,
        sound: preferences.sound ? 'default' : undefined,
        vibrationPattern: preferences.vibration ? [300, 500] : undefined,
        lights: [AndroidColor.RED, 300, 600],
        category: AndroidCategory.SOCIAL,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: preferences.sound ? 'default' : undefined,
        critical: false,
      },
    });

    // Ajouter à l'historique
    await addNotificationToHistory({
      type: data?.type || 'newLove',
      title,
      message,
      userId: data?.userId || '',
      userPseudo: data?.userPseudo || '',
      timestamp: new Date(),
      read: false,
      data,
    });

    console.log('Notification envoyée:', title);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
};

/**
 * Réinitialise le badge de l'application
 */
export const resetBadge = async (): Promise<void> => {
  try {
    await notifee.setBadgeCount(0);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du badge:', error);
  }
};

/**
 * Met à jour le badge avec le nombre de notifications non lues
 */
export const updateBadge = async (): Promise<void> => {
  try {
    const unreadCount = await getUnreadNotificationsCount();
    await notifee.setBadgeCount(unreadCount);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du badge:', error);
  }
};
