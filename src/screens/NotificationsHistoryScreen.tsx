import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getNotificationsHistory,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  clearAllNotifications,
  resetBadge,
} from '../lib/notificationService';
import { NotificationData } from '../types';

interface NotificationsHistoryScreenProps {
  onGoBack: () => void;
}

const NotificationsHistoryScreen: React.FC<NotificationsHistoryScreenProps> = ({ onGoBack }) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const history = await getNotificationsHistory();
      setNotifications(history);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
      }
    }
    
    // Ici vous pourriez naviguer vers l'écran concerné
    // Par exemple, si c'est un LOV, aller vers la carte
    // Si c'est une amitié, aller vers la liste des amis
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(notificationId);
              await deleteNotification(notificationId);
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la notification');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      Alert.alert('Succès', 'Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      Alert.alert('Erreur', 'Impossible de marquer les notifications comme lues');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer toutes les notifications ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllNotifications();
              await resetBadge();
              setNotifications([]);
              Alert.alert('Succès', 'Toutes les notifications ont été supprimées');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer les notifications');
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'newLove':
        return '❤️';
      case 'newFriendship':
        return '👥';
      case 'newReaction':
        return '😊';
      default:
        return '🔔';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return timestamp.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
        <View style={styles.notificationInfo}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
          disabled={deleting === item.id}
        >
          {deleting === item.id ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <Text style={styles.deleteButtonText}>×</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('notifications.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.history')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Actions */}
      {notifications.length > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.markReadButton]}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.actionButtonText}>{t('notifications.markAllAsRead')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearAll}
          >
            <Text style={[styles.actionButtonText, styles.clearButtonText]}>
              {t('notifications.deleteAll')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des notifications */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>{t('notifications.emptyTitle')}</Text>
          <Text style={styles.emptyMessage}>
            {t('notifications.emptyMessage')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  markReadButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  clearButtonText: {
    color: '#FFFFFF',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 2,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 3,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999999',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsHistoryScreen;
