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

interface TermsScreenProps {
  onGoBack: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onGoBack }) => {
  const { t, language } = useLanguage();
  const isFrench = language === 'fr';

  const termsContent = {
    fr: {
      title: 'Conditions d\'Utilisation',
      lastUpdated: 'Dernière mise à jour : Août 2024',
      
      introduction: {
        title: 'Introduction',
        text: 'En utilisant l\'application LovMap, vous acceptez ces conditions d\'utilisation. Si vous n\'êtes pas d\'accord avec ces conditions, veuillez ne pas utiliser l\'application.'
      },
      
      definitions: {
        title: 'Définitions',
        app: '• "Application" ou "App" : L\'application mobile LovMap',
        user: '• "Utilisateur" : Toute personne utilisant l\'application',
        service: '• "Service" : L\'ensemble des fonctionnalités de LovMap',
        content: '• "Contenu" : Données, réactions, lieux marqués par l\'utilisateur'
      },
      
      acceptance: {
        title: 'Acceptation des Conditions',
        text: 'En téléchargeant, installant ou utilisant l\'application, vous confirmez que vous avez lu, compris et accepté ces conditions d\'utilisation.',
        age: 'Vous devez avoir au moins 13 ans pour utiliser l\'application.',
        consent: 'Si vous avez entre 13 et 16 ans, le consentement parental est requis.'
      },
      
      account: {
        title: 'Création et Gestion de Compte',
        registration: '• Inscription obligatoire avec email valide',
        accuracy: '• Informations personnelles exactes et à jour',
        security: '• Protection de vos identifiants de connexion',
        responsibility: '• Responsabilité de toutes les activités de votre compte',
        termination: '• Droit de résilier votre compte à tout moment'
      },
      
      acceptableUse: {
        title: 'Utilisation Acceptable',
        allowed: 'Utilisations autorisées :',
        allowed1: '• Marquer des lieux d\'intérêt personnels',
        allowed2: '• Partager des réactions émojis appropriées',
        allowed3: '• Connecter des amis via des codes uniques',
        allowed4: '• Utiliser l\'application de manière responsable',
        
        prohibited: 'Utilisations interdites :',
        prohibited1: '• Contenu illégal, offensant ou inapproprié',
        prohibited2: '• Harcèlement ou comportement abusif',
        prohibited3: '• Spam ou publicité non autorisée',
        prohibited4: '• Tentative de piratage ou accès non autorisé',
        prohibited5: '• Violation des droits de propriété intellectuelle'
      },
      
      content: {
        title: 'Contenu Utilisateur',
        ownership: '• Vous conservez la propriété de votre contenu',
        license: '• Licence non-exclusive pour l\'utilisation dans l\'app',
        responsibility: '• Responsabilité du contenu que vous publiez',
        monitoring: '• Droit de modération et suppression de contenu',
        backup: '• Sauvegarde de votre responsabilité'
      },
      
      privacy: {
        title: 'Confidentialité et Données',
        policy: '• Collecte et traitement selon notre politique de confidentialité',
        consent: '• Consentement explicite pour le traitement des données',
        rights: '• Respect de vos droits RGPD',
        security: '• Mesures de sécurité appropriées'
      },
      
      intellectualProperty: {
        title: 'Propriété Intellectuelle',
        app: '• LovMap et son contenu sont protégés par la propriété intellectuelle',
        license: '• Licence d\'utilisation limitée, non-exclusive et révocable',
        restrictions: '• Interdiction de copier, modifier ou distribuer l\'app',
        trademarks: '• Respect des marques déposées et droits d\'auteur'
      },
      
      thirdParty: {
        title: 'Services Tiers',
        firebase: '• Firebase (Google) pour l\'authentification et la base de données',
        mapbox: '• Mapbox pour les services de cartographie',
        emailjs: '• Email.js pour les communications',
        responsibility: '• Nous ne sommes pas responsables des services tiers'
      },
      
      limitations: {
        title: 'Limitations de Responsabilité',
        disclaimer: '• L\'application est fournie "en l\'état"',
        noWarranty: '• Aucune garantie de disponibilité ou de fonctionnement',
        damages: '• Limitation des dommages indirects',
        maximum: '• Responsabilité limitée au montant payé pour l\'app'
      },
      
      termination: {
        title: 'Résiliation',
        user: '• Vous pouvez résilier à tout moment',
        app: '• Nous pouvons résilier en cas de violation',
        data: '• Suppression des données selon notre politique',
        survival: '• Certaines clauses survivent à la résiliation'
      },
      
      changes: {
        title: 'Modifications des Conditions',
        notification: '• Notification 30 jours avant modification',
        acceptance: '• Acceptation tacite en continuant l\'utilisation',
        major: '• Consentement explicite pour les changements majeurs',
        history: '• Historique des versions disponible'
      },
      
      governing: {
        title: 'Droit Applicable et Juridiction',
        law: '• Droit français applicable',
        jurisdiction: '• Juridiction française compétente',
        disputes: '• Résolution amiable des litiges',
        mediation: '• Médiation en cas de désaccord persistant'
      },
      
      contact: {
        title: 'Contact',
        email: 'Email: kevin.zuniga@hotmail.fr',
        response: 'Réponse sous 48h ouvrées',
        support: 'Support technique disponible'
      }
    },
    
    en: {
      title: 'Terms of Use',
      lastUpdated: 'Last updated: August 2024',
      
      introduction: {
        title: 'Introduction',
        text: 'By using the LovMap application, you accept these terms of use. If you do not agree with these terms, please do not use the application.'
      },
      
      definitions: {
        title: 'Definitions',
        app: '• "Application" or "App": The LovMap mobile application',
        user: '• "User": Any person using the application',
        service: '• "Service": All LovMap functionalities',
        content: '• "Content": Data, reactions, marked places by the user'
      },
      
      acceptance: {
        title: 'Acceptance of Terms',
        text: 'By downloading, installing, or using the application, you confirm that you have read, understood, and accepted these terms of use.',
        age: 'You must be at least 13 years old to use the application.',
        consent: 'If you are between 13 and 16 years old, parental consent is required.'
      },
      
      account: {
        title: 'Account Creation and Management',
        registration: '• Mandatory registration with valid email',
        accuracy: '• Accurate and up-to-date personal information',
        security: '• Protection of your login credentials',
        responsibility: '• Responsibility for all account activities',
        termination: '• Right to terminate your account at any time'
      },
      
      acceptableUse: {
        title: 'Acceptable Use',
        allowed: 'Allowed uses:',
        allowed1: '• Mark personal points of interest',
        allowed2: '• Share appropriate emoji reactions',
        allowed3: '• Connect friends via unique codes',
        allowed4: '• Use the application responsibly',
        
        prohibited: 'Prohibited uses:',
        prohibited1: '• Illegal, offensive, or inappropriate content',
        prohibited2: '• Harassment or abusive behavior',
        prohibited3: '• Spam or unauthorized advertising',
        prohibited4: '• Attempted hacking or unauthorized access',
        prohibited5: '• Violation of intellectual property rights'
      },
      
      content: {
        title: 'User Content',
        ownership: '• You retain ownership of your content',
        license: '• Non-exclusive license for use in the app',
        responsibility: '• Responsibility for content you publish',
        monitoring: '• Right to moderate and remove content',
        backup: '• Backup is your responsibility'
      },
      
      privacy: {
        title: 'Privacy and Data',
        policy: '• Collection and processing according to our privacy policy',
        consent: '• Explicit consent for data processing',
        rights: '• Respect for your GDPR rights',
        security: '• Appropriate security measures'
      },
      
      intellectualProperty: {
        title: 'Intellectual Property',
        app: '• LovMap and its content are protected by intellectual property',
        license: '• Limited, non-exclusive, and revocable use license',
        restrictions: '• Prohibition to copy, modify, or distribute the app',
        trademarks: '• Respect for trademarks and copyrights'
      },
      
      thirdParty: {
        title: 'Third-Party Services',
        firebase: '• Firebase (Google) for authentication and database',
        mapbox: '• Mapbox for mapping services',
        emailjs: '• Email.js for communications',
        responsibility: '• We are not responsible for third-party services'
      },
      
      limitations: {
        title: 'Limitation of Liability',
        disclaimer: '• The application is provided "as is"',
        noWarranty: '• No warranty of availability or operation',
        damages: '• Limitation of indirect damages',
        maximum: '• Liability limited to amount paid for the app'
      },
      
      termination: {
        title: 'Termination',
        user: '• You can terminate at any time',
        app: '• We can terminate in case of violation',
        data: '• Data deletion according to our policy',
        survival: '• Some clauses survive termination'
      },
      
      changes: {
        title: 'Changes to Terms',
        notification: '• 30 days notice before changes',
        acceptance: '• Tacit acceptance by continuing use',
        major: '• Explicit consent for major changes',
        history: '• Version history available'
      },
      
      governing: {
        title: 'Governing Law and Jurisdiction',
        law: '• French law applicable',
        jurisdiction: '• French jurisdiction competent',
        disputes: '• Amicable resolution of disputes',
        mediation: '• Mediation in case of persistent disagreement'
      },
      
      contact: {
        title: 'Contact',
        email: 'Email: kevin.zuniga@hotmail.fr',
        response: 'Response within 48 business hours',
        support: 'Technical support available'
      }
    }
  };

  const content = termsContent[isFrench ? 'fr' : 'en'];

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
          <Text style={styles.sectionTitle}>{content.definitions.title}</Text>
          <Text style={styles.sectionText}>{content.definitions.app}</Text>
          <Text style={styles.sectionText}>{content.definitions.user}</Text>
          <Text style={styles.sectionText}>{content.definitions.service}</Text>
          <Text style={styles.sectionText}>{content.definitions.content}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.acceptance.title}</Text>
          <Text style={styles.sectionText}>{content.acceptance.text}</Text>
          <Text style={styles.sectionText}>{content.acceptance.age}</Text>
          <Text style={styles.sectionText}>{content.acceptance.consent}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.account.title}</Text>
          <Text style={styles.sectionText}>{content.account.registration}</Text>
          <Text style={styles.sectionText}>{content.account.accuracy}</Text>
          <Text style={styles.sectionText}>{content.account.security}</Text>
          <Text style={styles.sectionText}>{content.account.responsibility}</Text>
          <Text style={styles.sectionText}>{content.account.termination}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.acceptableUse.title}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.allowed}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.allowed1}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.allowed2}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.allowed3}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.allowed4}</Text>
          
          <Text style={styles.sectionText}>{content.acceptableUse.prohibited}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.prohibited1}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.prohibited2}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.prohibited3}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.prohibited4}</Text>
          <Text style={styles.sectionText}>{content.acceptableUse.prohibited5}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.content.title}</Text>
          <Text style={styles.sectionText}>{content.content.ownership}</Text>
          <Text style={styles.sectionText}>{content.content.license}</Text>
          <Text style={styles.sectionText}>{content.content.responsibility}</Text>
          <Text style={styles.sectionText}>{content.content.monitoring}</Text>
          <Text style={styles.sectionText}>{content.content.backup}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.privacy.title}</Text>
          <Text style={styles.sectionText}>{content.privacy.policy}</Text>
          <Text style={styles.sectionText}>{content.privacy.consent}</Text>
          <Text style={styles.sectionText}>{content.privacy.rights}</Text>
          <Text style={styles.sectionText}>{content.privacy.security}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.intellectualProperty.title}</Text>
          <Text style={styles.sectionText}>{content.intellectualProperty.app}</Text>
          <Text style={styles.sectionText}>{content.intellectualProperty.license}</Text>
          <Text style={styles.sectionText}>{content.intellectualProperty.restrictions}</Text>
          <Text style={styles.sectionText}>{content.intellectualProperty.trademarks}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.thirdParty.title}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.firebase}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.mapbox}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.emailjs}</Text>
          <Text style={styles.sectionText}>{content.thirdParty.responsibility}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.limitations.title}</Text>
          <Text style={styles.sectionText}>{content.limitations.disclaimer}</Text>
          <Text style={styles.sectionText}>{content.limitations.noWarranty}</Text>
          <Text style={styles.sectionText}>{content.limitations.damages}</Text>
          <Text style={styles.sectionText}>{content.limitations.maximum}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.termination.title}</Text>
          <Text style={styles.sectionText}>{content.termination.user}</Text>
          <Text style={styles.sectionText}>{content.termination.app}</Text>
          <Text style={styles.sectionText}>{content.termination.data}</Text>
          <Text style={styles.sectionText}>{content.termination.survival}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.changes.title}</Text>
          <Text style={styles.sectionText}>{content.changes.notification}</Text>
          <Text style={styles.sectionText}>{content.changes.acceptance}</Text>
          <Text style={styles.sectionText}>{content.changes.major}</Text>
          <Text style={styles.sectionText}>{content.changes.history}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.governing.title}</Text>
          <Text style={styles.sectionText}>{content.governing.law}</Text>
          <Text style={styles.sectionText}>{content.governing.jurisdiction}</Text>
          <Text style={styles.sectionText}>{content.governing.disputes}</Text>
          <Text style={styles.sectionText}>{content.governing.mediation}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.contact.title}</Text>
          <Text style={styles.sectionText}>{content.contact.email}</Text>
          <Text style={styles.sectionText}>{content.contact.response}</Text>
          <Text style={styles.sectionText}>{content.contact.support}</Text>
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

export default TermsScreen;
