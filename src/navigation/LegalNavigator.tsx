import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import LegalScreen from '../screens/LegalScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import ContactScreen from '../screens/ContactScreen';

type LegalScreen = 'menu' | 'legal' | 'privacy' | 'terms' | 'contact';

interface LegalNavigatorProps {
  onGoBack: () => void;
}

export const LegalNavigator: React.FC<LegalNavigatorProps> = ({ onGoBack }) => {
  const { t, language } = useLanguage();
  const isFrench = language === 'fr';
  const [currentScreen, setCurrentScreen] = useState<LegalScreen>('menu');

  const navigateTo = (screen: LegalScreen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return null; // Le menu principal est rendu directement
      case 'legal':
        return <LegalScreen onGoBack={() => navigateTo('menu')} />;
      case 'privacy':
        return <PrivacyScreen onGoBack={() => navigateTo('menu')} />;
      case 'terms':
        return <TermsScreen onGoBack={() => navigateTo('menu')} />;
      case 'contact':
        return <ContactScreen onGoBack={() => navigateTo('menu')} />;
      default:
        return null;
    }
  };

  if (currentScreen === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isFrench ? 'Informations Légales' : 'Legal Information'}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('legal')}
          >
            <Text style={styles.menuItemText}>{isFrench ? 'Mentions Légales' : 'Legal Notice'}</Text>
            <Text style={styles.menuItemSubtext}>{isFrench ? 'Informations sur l\'application et le développeur' : 'Information about the application and developer'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('privacy')}
          >
            <Text style={styles.menuItemText}>{isFrench ? 'Politique de Confidentialité' : 'Privacy Policy'}</Text>
            <Text style={styles.menuItemSubtext}>{isFrench ? 'Protection de vos données personnelles' : 'Protection of your personal data'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('terms')}
          >
            <Text style={styles.menuItemText}>{isFrench ? 'Conditions d\'Utilisation' : 'Terms of Use'}</Text>
            <Text style={styles.menuItemSubtext}>{isFrench ? 'Règles d\'utilisation de l\'application' : 'Rules for using the application'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('contact')}
          >
            <Text style={styles.menuItemText}>{isFrench ? 'Contact' : 'Contact'}</Text>
            <Text style={styles.menuItemSubtext}>{isFrench ? 'Nous contacter pour toute question' : 'Contact us for any questions'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return renderScreen();
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
    paddingTop: 20,
  },
  menuItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  menuItemSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default LegalNavigator;
