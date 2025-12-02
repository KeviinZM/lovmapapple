import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { Translations } from '../i18n';
import { useLanguage } from '../i18n/LanguageContext';

import { ensureUserProfile } from '../lib/mapService';
import LanguageButton from '../components/LanguageButton';
import { LegalNavigator } from '../navigation/LegalNavigator';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
  onNavigateToHome?: () => void; // Nouvelle prop pour la navigation vers Home
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignUp, onNavigateToHome }) => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      try { await ensureUserProfile(); } catch {}
      
      // Navigation forcée vers le HomeScreen après connexion réussie
      if (onNavigateToHome) {
        onNavigateToHome();
      }
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      Alert.alert(t('auth.loginError'), error.message);
    } finally {
      setLoading(false);
    }
  };

  if (legalOpen) {
    return <LegalNavigator onGoBack={() => setLegalOpen(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/logo2-V1.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <LanguageButton style={styles.langRow} />
      </View>

      <View style={styles.form}>
        <View style={styles.tips}>
          <View style={[styles.tipCard, styles.tipOrange]}> 
            <Text style={styles.tipIcon}>👤</Text>
            <Text style={styles.tipText}>{t('login.tips.createAccount')}</Text>
          </View>
          <View style={[styles.tipCard, styles.tipBlue]}> 
            <Text style={styles.tipIcon}>📍</Text>
            <Text style={styles.tipText}>{t('login.tips.addCity')}</Text>
          </View>
          <View style={[styles.tipCard, styles.tipGreen]}> 
            <Text style={styles.tipIcon}>👥</Text>
            <Text style={styles.tipText}>{t('login.tips.addFriends')}</Text>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.loginBtnContent}>
              <Text style={styles.loginButtonText}>{t('auth.signIn')}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpLink} onPress={onNavigateToSignUp}>
          <Text style={styles.signUpText}>
            {t('auth.dontHaveAccount')} {t('auth.signUp')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.legalLink} onPress={() => setLegalOpen(true)}>
          <Text style={styles.legalText}>
            {language === 'fr' ? 'Informations légales' : 'Legal Information'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  form: {
    flex: 1,
  },
  tips: {
    marginBottom: 20,
    gap: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tipIcon: { fontSize: 14 },
  tipText: { color: '#333', fontWeight: '600' },
  tipOrange: { backgroundColor: '#FFF1E6', borderColor: '#FFD8C2' },
  tipBlue: { backgroundColor: '#EAF2FF', borderColor: '#D6E4FF' },
  tipGreen: { backgroundColor: '#EAF8EE', borderColor: '#CFEED7' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    backgroundColor: '#FF6A2B',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginBtnContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  signUpText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '600',
  },
  legalLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  legalText: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
