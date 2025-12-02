import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';

interface LegalScreenProps {
  onGoBack: () => void;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({ onGoBack }) => {
  const { t, language } = useLanguage();
  const isFrench = language === 'fr';

  const legalContent = {
    fr: {
      title: 'Mentions Légales',
      company: 'LovMap',
      developer: 'Développé par Kevin Zuniga',
      description: 'Application mobile de cartographie sociale permettant aux utilisateurs de marquer des lieux d\'intérêt et de partager des réactions émojis avec leurs amis.',
      
      // Données collectées
      dataCollection: {
        title: 'Données Collectées',
        personal: 'Données personnelles : email, nom d\'affichage, code ami unique',
        location: 'Données de géolocalisation : latitude, longitude, adresse des lieux marqués',
        social: 'Données sociales : amitiés, réactions émojis, interactions',
        technical: 'Données techniques : identifiant utilisateur, timestamps, métadonnées',
        notifications: 'Préférences de notifications et historique des communications',
        advertising: 'Identifiant publicitaire Google (AdMob) pour la personnalisation'
      },
      
      // Stockage
      storage: {
        title: 'Stockage des Données',
        firebase: 'Les données sont stockées sur Firebase (Google Cloud Platform)',
        security: 'Chiffrement en transit et au repos',
        retention: 'Conservation jusqu\'à suppression du compte',
        backup: 'Sauvegardes automatiques Firebase',
        local: 'Stockage local (AsyncStorage) pour les préférences de notifications'
      },
      
      // Utilisation
      usage: {
        title: 'Utilisation des Données',
        purpose: 'Fonctionnement de l\'application, gestion des amitiés, affichage des réactions',
        sharing: 'Partage limité entre amis connectés',
        analytics: 'Aucun tracking ou analytics tiers',
        notifications: 'Envoi de notifications selon vos préférences',
        advertising: 'Affichage de publicités pertinentes via Google AdMob'
      },
      
      // Services tiers
      thirdParty: {
        title: 'Services Tiers Utilisés',
        firebase: 'Firebase (Google) : authentification, base de données, stockage',
        mapbox: 'Mapbox : services de cartographie et géolocalisation',
        emailjs: 'Email.js : communications et support utilisateur',
        admob: 'Google AdMob : services publicitaires et monétisation',
        description: 'Ces services respectent les standards de sécurité et de confidentialité'
      },
      
      // Droits utilisateur
      userRights: {
        title: 'Vos Droits',
        access: 'Accès à vos données personnelles',
        rectification: 'Rectification des informations',
        deletion: 'Suppression de votre compte et données',
        portability: 'Portabilité des données',
        notifications: 'Gestion des préférences de notifications',
        advertising: 'Contrôle de la publicité personnalisée'
      },
      
      // Contact
      contact: {
        title: 'Contact',
        email: 'Email: contact@lovmap.fr',
        response: 'Réponse sous 48h ouvrées'
      }
    },
    
    en: {
      title: 'Legal Notice',
      company: 'LovMap',
      developer: 'Developed by Kevin Zuniga',
      description: 'Social mapping mobile application allowing users to mark points of interest and share emoji reactions with their friends.',
      
      dataCollection: {
        title: 'Data Collection',
        personal: 'Personal data: email, display name, unique friend code',
        location: 'Geolocation data: latitude, longitude, marked location addresses',
        social: 'Social data: friendships, emoji reactions, interactions',
        technical: 'Technical data: user ID, timestamps, metadata',
        notifications: 'Notification preferences and communication history',
        advertising: 'Google advertising identifier (AdMob) for personalization'
      },
      
      storage: {
        title: 'Data Storage',
        firebase: 'Data is stored on Firebase (Google Cloud Platform)',
        security: 'Encryption in transit and at rest',
        retention: 'Retention until account deletion',
        backup: 'Automatic Firebase backups',
        local: 'Local storage (AsyncStorage) for notification preferences'
      },
      
      usage: {
        title: 'Data Usage',
        purpose: 'App functionality, friendship management, reaction display',
        sharing: 'Limited sharing between connected friends',
        analytics: 'No third-party tracking or analytics',
        notifications: 'Sending notifications according to your preferences',
        advertising: 'Display of relevant advertisements via Google AdMob'
      },
      
      thirdParty: {
        title: 'Third-Party Services Used',
        firebase: 'Firebase (Google): authentication, database, storage',
        mapbox: 'Mapbox: mapping services and geolocation',
        emailjs: 'Email.js: communications and user support',
        admob: 'Google AdMob: advertising services and monetization',
        description: 'These services comply with security and privacy standards'
      },
      
      userRights: {
        title: 'Your Rights',
        access: 'Access to your personal data',
        rectification: 'Rectification of information',
        deletion: 'Account and data deletion',
        portability: 'Data portability',
        notifications: 'Management of notification preferences',
        advertising: 'Control of personalized advertising'
      },
      
      contact: {
        title: 'Contact',
        email: 'Email: contact@lovmap.fr',
        response: 'Response within 48 business hours'
      }
    }
  };

  const content = legalContent[isFrench ? 'fr' : 'en'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{content.title}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.company}</Text>
          <Text style={styles.sectionText}>{content.description}</Text>
          <Text style={styles.developerText}>{content.developer}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.dataCollection.title}</Text>
          <Text style={styles.sectionText}>{content.dataCollection.personal}</Text>
          <Text style={styles.sectionText}>{content.dataCollection.location}</Text>
          <Text style={styles.sectionText}>{content.dataCollection.social}</Text>
          <Text style={styles.sectionText}>{content.dataCollection.technical}</Text>
          <Text style={styles.sectionText}>{content.dataCollection.notifications}</Text>
          <Text style={styles.sectionText}>{content.dataCollection.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.storage.title}</Text>
          <Text style={styles.sectionText}>{content.storage.firebase}</Text>
          <Text style={styles.sectionText}>{content.storage.security}</Text>
          <Text style={styles.sectionText}>{content.storage.retention}</Text>
          <Text style={styles.sectionText}>{content.storage.backup}</Text>
          <Text style={styles.sectionText}>{content.storage.local}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.usage.title}</Text>
          <Text style={styles.sectionText}>{content.usage.purpose}</Text>
          <Text style={styles.sectionText}>{content.usage.sharing}</Text>
          <Text style={styles.sectionText}>{content.usage.analytics}</Text>
          <Text style={styles.sectionText}>{content.usage.notifications}</Text>
          <Text style={styles.sectionText}>{content.usage.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.thirdParty.title}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.firebase}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.mapbox}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.emailjs}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.admob}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.userRights.title}</Text>
          <Text style={styles.sectionText}>{content.userRights.access}</Text>
          <Text style={styles.sectionText}>{content.userRights.rectification}</Text>
          <Text style={styles.sectionText}>{content.userRights.deletion}</Text>
          <Text style={styles.sectionText}>{content.userRights.portability}</Text>
          <Text style={styles.sectionText}>{content.userRights.notifications}</Text>
          <Text style={styles.sectionText}>{content.userRights.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.contact.title}</Text>
          <Text style={styles.sectionText}>Email: {content.contact.email}</Text>
          <Text style={styles.sectionText}>{content.contact.response}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FF6A2B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  developerText: {
    fontSize: 14,
    color: '#FF6A2B',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default LegalScreen;
