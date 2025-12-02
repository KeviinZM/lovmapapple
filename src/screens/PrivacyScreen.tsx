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

interface PrivacyScreenProps {
  onGoBack: () => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onGoBack }) => {
  const { t, language } = useLanguage();
  const isFrench = language === 'fr';

  const privacyContent = {
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour : Août 2024',
      
      introduction: {
        title: 'Introduction',
        text: 'LovMap respecte votre vie privée et s\'engage à protéger vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.'
      },
      
      dataController: {
        title: 'Responsable du Traitement',
        name: 'Kevin Zuniga',
        email: 'contact@lovmap.fr',
        address: 'Développeur indépendant'
      },
      
      dataCollection: {
        title: 'Collecte des Données',
        personal: '• Email et nom d\'affichage lors de l\'inscription',
        location: '• Géolocalisation des lieux que vous marquez',
        social: '• Informations sur vos amitiés et interactions',
        technical: '• Données techniques pour le fonctionnement de l\'app',
        notifications: '• Préférences de notifications et historique',
        advertising: '• Identifiant publicitaire Google (AdMob)'
      },
      
      legalBasis: {
        title: 'Base Légale du Traitement',
        consent: '• Consentement explicite pour l\'inscription',
        contract: '• Exécution du contrat d\'utilisation',
        legitimate: '• Intérêt légitime pour la sécurité et le support',
        notifications: '• Consentement pour les notifications push',
        advertising: '• Consentement pour la publicité personnalisée'
      },
      
      dataUsage: {
        title: 'Utilisation des Données',
        functionality: '• Fonctionnement de l\'application',
        communication: '• Communication avec vous et vos amis',
        support: '• Support technique et amélioration du service',
        security: '• Sécurité et prévention des abus',
        notifications: '• Envoi de notifications selon vos préférences',
        advertising: '• Affichage de publicités pertinentes'
      },
      
      dataSharing: {
        title: 'Partage des Données',
        friends: '• Partage limité avec vos amis connectés',
        services: '• Services tiers : Firebase (Google), Mapbox, AdMob',
        legal: '• Obligations légales si nécessaire',
        never: '• Jamais de vente ou location de données'
      },
      
      dataRetention: {
        title: 'Conservation des Données',
        active: '• Pendant l\'utilisation active de votre compte',
        deletion: '• Jusqu\'à suppression de votre compte',
        backup: '• Sauvegardes conservées 30 jours maximum',
        notifications: '• Historique des notifications : 90 jours maximum'
      },
      
      userRights: {
        title: 'Vos Droits RGPD',
        access: '• Droit d\'accès à vos données',
        rectification: '• Droit de rectification',
        deletion: '• Droit à l\'effacement',
        portability: '• Droit à la portabilité',
        objection: '• Droit d\'opposition au traitement',
        restriction: '• Droit à la limitation du traitement',
        notifications: '• Droit de désactiver les notifications',
        advertising: '• Droit de désactiver la publicité personnalisée'
      },
      
      security: {
        title: 'Sécurité des Données',
        encryption: '• Chiffrement en transit (HTTPS/TLS)',
        storage: '• Chiffrement au repos (Firebase)',
        access: '• Accès restreint et authentifié',
        monitoring: '• Surveillance continue des accès'
      },
      
      notifications: {
        title: 'Notifications et Communications',
        types: '• Notifications push pour nouveaux LOVs, amitiés et réactions',
        preferences: '• Gestion des préférences de notifications',
        storage: '• Stockage local (AsyncStorage) et synchronisation (Firestore)',
        consent: '• Consentement explicite requis pour les notifications',
        optOut: '• Possibilité de désactiver à tout moment'
      },
      
      advertising: {
        title: 'Publicités et Services Publicitaires',
        provider: '• Google AdMob pour l\'affichage de publicités',
        data: '• Collecte d\'identifiants publicitaires Google',
        personalization: '• Publicités personnalisées selon vos intérêts',
        consent: '• Consentement requis pour la publicité personnalisée',
        optOut: '• Possibilité de désactiver la personnalisation',
        tracking: '• Cookies publicitaires Google pour la performance'
      },
      
      cookies: {
        title: 'Cookies et Tracking',
        none: '• Aucun cookie tiers ou tracking',
        essential: '• Seuls les cookies essentiels au fonctionnement',
        analytics: '• Aucun analytics ou publicité',
        advertising: '• Cookies publicitaires Google AdMob (avec consentement)'
      },
      
      children: {
        title: 'Protection des Mineurs',
        age: '• Âge minimum : 13 ans',
        consent: '• Consentement parental requis pour les moins de 16 ans',
        protection: '• Protection renforcée des données des mineurs',
        advertising: '• Publicités adaptées à l\'âge (pas de publicités personnalisées)'
      },
      
      international: {
        title: 'Transferts Internationaux',
        eu: '• Données stockées dans l\'UE (Google Cloud)',
        adequacy: '• Niveau de protection adéquat garanti',
        safeguards: '• Mesures de sécurité appropriées',
        advertising: '• Données publicitaires Google peuvent être transférées hors UE'
      },
      
      changes: {
        title: 'Modifications de la Politique',
        notification: '• Notification 30 jours avant modification',
        consent: '• Nouveau consentement si nécessaire',
        history: '• Historique des versions disponible'
      },
      
      contact: {
        title: 'Contact et Réclamations',
        response: 'Réponse sous 48h ouvrées',
        cnil: 'Droit de saisir la CNIL en cas de litige'
      }
    },
    
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: August 2024',
      
      introduction: {
        title: 'Introduction',
        text: 'LovMap respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and protect your information.'
      },
      
      dataController: {
        title: 'Data Controller',
        name: 'Kevin Zuniga',
        email: 'contact@lovmap.fr',
        address: 'Independent Developer'
      },
      
      dataCollection: {
        title: 'Data Collection',
        personal: '• Email and display name during registration',
        location: '• Geolocation of places you mark',
        social: '• Information about your friendships and interactions',
        technical: '• Technical data for app functionality',
        notifications: '• Notification preferences and history',
        advertising: '• Google advertising identifier (AdMob)'
      },
      
      legalBasis: {
        title: 'Legal Basis for Processing',
        consent: '• Explicit consent for registration',
        contract: '• Contract execution for app usage',
        legitimate: '• Legitimate interest for security and support',
        notifications: '• Consent for push notifications',
        advertising: '• Consent for personalized advertising'
      },
      
      dataUsage: {
        title: 'Data Usage',
        functionality: '• App functionality',
        communication: '• Communication with you and your friends',
        support: '• Technical support and service improvement',
        security: '• Security and abuse prevention',
        notifications: '• Sending notifications according to your preferences',
        advertising: '• Display of relevant advertisements'
      },
      
      dataSharing: {
        title: 'Data Sharing',
        friends: '• Limited sharing with your connected friends',
        services: '• Third-party services: Firebase (Google), Mapbox, AdMob',
        legal: '• Legal obligations if necessary',
        never: '• Never sell or rent your data'
      },
      
      dataRetention: {
        title: 'Data Retention',
        active: '• During active use of your account',
        deletion: '• Until account deletion',
        backup: '• Backups kept maximum 30 days',
        notifications: '• Notification history: maximum 90 days'
      },
      
      userRights: {
        title: 'Your GDPR Rights',
        access: '• Right of access to your data',
        rectification: '• Right of rectification',
        deletion: '• Right to erasure',
        portability: '• Right to data portability',
        objection: '• Right to object to processing',
        restriction: '• Right to restrict processing',
        notifications: '• Right to disable notifications',
        advertising: '• Right to disable personalized advertising'
      },
      
      security: {
        title: 'Data Security',
        encryption: '• Encryption in transit (HTTPS/TLS)',
        storage: '• Encryption at rest (Firebase)',
        access: '• Restricted and authenticated access',
        monitoring: '• Continuous access monitoring'
      },
      
      notifications: {
        title: 'Notifications and Communications',
        types: '• Push notifications for new LOVs, amitiés et réactions',
        preferences: '• Management of notification preferences',
        storage: '• Local storage (AsyncStorage) and synchronization (Firestore)',
        consent: '• Explicit consent required for notifications',
        optOut: '• Possibility to disable at any time'
      },
      
      advertising: {
        title: 'Advertising and Advertising Services',
        provider: '• Google AdMob for displaying advertisements',
        data: '• Collection of Google advertising identifiers',
        personalization: '• Personalized advertisements based on your interests',
        consent: '• Consent required for personalized advertising',
        optOut: '• Possibility to disable personalization',
        tracking: '• Google advertising cookies for performance'
      },
      
      cookies: {
        title: 'Cookies and Tracking',
        none: '• No third-party cookies or tracking',
        essential: '• Only essential cookies for functionality',
        analytics: '• No analytics or advertising',
        advertising: '• Google AdMob advertising cookies (with consent)'
      },
      
      children: {
        title: 'Minor Protection',
        age: '• Minimum age: 13 years',
        consent: '• Parental consent required for under 16',
        protection: '• Enhanced protection for minor data',
        advertising: '• Age-appropriate advertising (no personalized ads)'
      },
      
      international: {
        title: 'International Transfers',
        eu: '• Data stored in EU (Google Cloud)',
        adequacy: '• Adequate protection level guaranteed',
        safeguards: '• Appropriate security measures',
        advertising: '• Google advertising data may be transferred outside EU'
      },
      
      changes: {
        title: 'Policy Changes',
        notification: '• 30 days notice before changes',
        consent: '• New consent if necessary',
        history: '• Version history available'
      },
      
      contact: {
        title: 'Contact and Complaints',
        response: 'Response within 48 business hours',
        authority: 'Right to contact data protection authority'
      }
    }
  };

  const content = privacyContent[isFrench ? 'fr' : 'en'];

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
        <Text style={styles.lastUpdated}>{content.lastUpdated}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.introduction.title}</Text>
          <Text style={styles.sectionText}>{content.introduction.text}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.dataController.title}</Text>
          <Text style={styles.sectionText}>{content.dataController.name}</Text>
          <Text style={styles.sectionText}>{content.dataController.email}</Text>
          <Text style={styles.sectionText}>{content.dataController.address}</Text>
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
          <Text style={styles.sectionTitle}>{content.legalBasis.title}</Text>
          <Text style={styles.sectionText}>{content.legalBasis.consent}</Text>
          <Text style={styles.sectionText}>{content.legalBasis.contract}</Text>
          <Text style={styles.sectionText}>{content.legalBasis.legitimate}</Text>
          <Text style={styles.sectionText}>{content.legalBasis.notifications}</Text>
          <Text style={styles.sectionText}>{content.legalBasis.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.dataUsage.title}</Text>
          <Text style={styles.sectionText}>{content.dataUsage.functionality}</Text>
          <Text style={styles.sectionText}>{content.dataUsage.communication}</Text>
          <Text style={styles.sectionText}>{content.dataUsage.support}</Text>
          <Text style={styles.sectionText}>{content.dataUsage.security}</Text>
          <Text style={styles.sectionText}>{content.dataUsage.notifications}</Text>
          <Text style={styles.sectionText}>{content.dataUsage.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.dataSharing.title}</Text>
          <Text style={styles.sectionText}>{content.dataSharing.friends}</Text>
          <Text style={styles.sectionText}>{content.dataSharing.services}</Text>
          <Text style={styles.sectionText}>{content.dataSharing.legal}</Text>
          <Text style={styles.sectionText}>{content.dataSharing.never}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.dataRetention.title}</Text>
          <Text style={styles.sectionText}>{content.dataRetention.active}</Text>
          <Text style={styles.sectionText}>{content.dataRetention.deletion}</Text>
          <Text style={styles.sectionText}>{content.dataRetention.backup}</Text>
          <Text style={styles.sectionText}>{content.dataRetention.notifications}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.userRights.title}</Text>
          <Text style={styles.sectionText}>{content.userRights.access}</Text>
          <Text style={styles.sectionText}>{content.userRights.rectification}</Text>
          <Text style={styles.sectionText}>{content.userRights.deletion}</Text>
          <Text style={styles.sectionText}>{content.userRights.portability}</Text>
          <Text style={styles.sectionText}>{content.userRights.objection}</Text>
          <Text style={styles.sectionText}>{content.userRights.restriction}</Text>
          <Text style={styles.sectionText}>{content.userRights.notifications}</Text>
          <Text style={styles.sectionText}>{content.userRights.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.security.title}</Text>
          <Text style={styles.sectionText}>{content.security.encryption}</Text>
          <Text style={styles.sectionText}>{content.security.storage}</Text>
          <Text style={styles.sectionText}>{content.security.access}</Text>
          <Text style={styles.sectionText}>{content.security.monitoring}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.notifications.title}</Text>
          <Text style={styles.sectionText}>{content.notifications.types}</Text>
          <Text style={styles.sectionText}>{content.notifications.preferences}</Text>
          <Text style={styles.sectionText}>{content.notifications.storage}</Text>
          <Text style={styles.sectionText}>{content.notifications.consent}</Text>
          <Text style={styles.sectionText}>{content.notifications.optOut}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.advertising.title}</Text>
          <Text style={styles.sectionText}>{content.advertising.provider}</Text>
          <Text style={styles.sectionText}>{content.advertising.data}</Text>
          <Text style={styles.sectionText}>{content.advertising.personalization}</Text>
          <Text style={styles.sectionText}>{content.advertising.consent}</Text>
          <Text style={styles.sectionText}>{content.advertising.optOut}</Text>
          <Text style={styles.sectionText}>{content.advertising.tracking}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.cookies.title}</Text>
          <Text style={styles.sectionText}>{content.cookies.none}</Text>
          <Text style={styles.sectionText}>{content.cookies.essential}</Text>
          <Text style={styles.sectionText}>{content.cookies.analytics}</Text>
          <Text style={styles.sectionText}>{content.cookies.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.children.title}</Text>
          <Text style={styles.sectionText}>{content.children.age}</Text>
          <Text style={styles.sectionText}>{content.children.consent}</Text>
          <Text style={styles.sectionText}>{content.children.protection}</Text>
          <Text style={styles.sectionText}>{content.children.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.international.title}</Text>
          <Text style={styles.sectionText}>{content.international.eu}</Text>
          <Text style={styles.sectionText}>{content.international.adequacy}</Text>
          <Text style={styles.sectionText}>{content.international.safeguards}</Text>
          <Text style={styles.sectionText}>{content.international.advertising}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.changes.title}</Text>
          <Text style={styles.sectionText}>{content.changes.notification}</Text>
          <Text style={styles.sectionText}>{content.changes.consent}</Text>
          <Text style={styles.sectionText}>{content.changes.history}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.contact.title}</Text>
          <Text style={styles.sectionText}>{content.contact.response}</Text>
          <Text style={styles.sectionText}>{isFrench ? 'Droit de saisir la CNIL en cas de litige' : 'Right to contact data protection authority'}</Text>
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
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default PrivacyScreen;
