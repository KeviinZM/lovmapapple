import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  sendLocalNotification,
} from '../lib/notificationService';
import { NotificationPreferences } from '../types';

interface NotificationSettingsScreenProps {
  onGoBack: () => void;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onGoBack }) => {
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newLoves: true,
    newFriendships: true,
    newReactions: true,
    sound: true,
    vibration: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      setSaving(true);
      await saveNotificationPreferences(newPreferences);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Remettre l'ancienne valeur en cas d'erreur
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={styles.headerTitle}>{t('notifications.settings')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Types de notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications.types')}</Text>
          
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>{t('notifications.newLoves')}</Text>
              <Text style={styles.preferenceDescription}>
                {t('notifications.preferences.newLovesDescription')}
              </Text>
            </View>
            <Switch
              value={preferences.newLoves}
              onValueChange={(value) => handlePreferenceChange('newLoves', value)}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={preferences.newLoves ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>{t('notifications.newFriendships')}</Text>
              <Text style={styles.preferenceDescription}>
                {t('notifications.preferences.newFriendshipsDescription')}
              </Text>
            </View>
            <Switch
              value={preferences.newFriendships}
              onValueChange={(value) => handlePreferenceChange('newFriendships', value)}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={preferences.newFriendships ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>{t('notifications.newReactions')}</Text>
              <Text style={styles.preferenceDescription}>
                {t('notifications.preferences.newReactionsDescription')}
              </Text>
            </View>
            <Switch
              value={preferences.newReactions}
              onValueChange={(value) => handlePreferenceChange('newReactions', value)}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={preferences.newReactions ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Paramètres audio et vibration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications.soundAndVibration')}</Text>
          
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>{t('notifications.sound')}</Text>
              <Text style={styles.preferenceDescription}>
                {t('notifications.preferences.soundDescription')}
              </Text>
            </View>
            <Switch
              value={preferences.sound}
              onValueChange={(value) => handlePreferenceChange('sound', value)}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={preferences.sound ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>{t('notifications.vibration')}</Text>
              <Text style={styles.preferenceDescription}>
                {t('notifications.preferences.vibrationDescription')}
              </Text>
            </View>
            <Switch
              value={preferences.vibration}
              onValueChange={(value) => handlePreferenceChange('vibration', value)}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={preferences.vibration ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Bouton de test des notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test des notifications</Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              try {
                console.log('🔔 Test de notification en cours...');
                await sendLocalNotification(
                  'Test de notification',
                  'Si vous voyez ceci, les notifications fonctionnent !',
                  { type: 'test' }
                );
                console.log('🔔 Notification de test envoyée');
              } catch (error) {
                console.error('🔔 Erreur lors du test:', error);
              }
            }}
          >
            <Text style={styles.testButtonText}>Tester une notification</Text>
          </TouchableOpacity>
        </View>

        {/* Indicateur de sauvegarde */}
        {saving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.savingText}>{t('notifications.saving')}</Text>
          </View>
        )}
      </ScrollView>
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
    fontSize: 20,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 3,
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
