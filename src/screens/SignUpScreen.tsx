import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { auth } from '../lib/firebase';
import { ensureUserProfile } from '../lib/mapService';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageButton from '../components/LanguageButton';
import { LegalNavigator } from '../navigation/LegalNavigator';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToHome?: () => void; // Nouvelle prop pour la navigation vers Home
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToLogin, onNavigateToHome }) => {
  const { t, language } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      // 1. Créer l'utilisateur avec Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // 2. Créer le profil utilisateur dans Firestore
      try {
        // Attendre que l'utilisateur soit bien créé
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('🔍 Tentative de création du profil avec pseudo:', username);
        const profile = await ensureUserProfile(username);
        console.log('✅ Profil créé avec succès:', {
          uid: profile.uid,
          pseudo: profile.pseudo
        });
      } catch (profileError: any) {
        console.error('❌ Erreur lors de la création du profil:', profileError);
      }
      
      // 3. Navigation forcée vers le HomeScreen après inscription réussie
      if (onNavigateToHome) {
        onNavigateToHome();
      } else {
        Alert.alert(t('common.success'), t('auth.signupSuccess'));
      }
    } catch (error: any) {
      Alert.alert(t('auth.signupError'), error.message);
    } finally {
      setLoading(false);
    }
  };

  if (legalOpen) {
    return <LegalNavigator onGoBack={() => setLegalOpen(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/logo2-V1.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <LanguageButton style={styles.languageSelector} />
      </View>

      {/* Feature Boxes */}
      <View style={styles.featureBoxes}>
        <View style={[styles.featureBox, { backgroundColor: '#FFF1E6', borderColor: '#FFD8C2' }]}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>👤</Text>
          </View>
          <Text style={styles.featureText}>{t('signup.tips.createAccount')}</Text>
        </View>
        
        <View style={[styles.featureBox, { backgroundColor: '#EAF2FF', borderColor: '#D6E4FF' }]}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>📍</Text>
          </View>
          <Text style={styles.featureText}>{t('signup.tips.addCity')}</Text>
        </View>
        
        <View style={[styles.featureBox, { backgroundColor: '#EAF8EE', borderColor: '#CFEED7' }]}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>👥</Text>
          </View>
          <Text style={styles.featureText}>{t('signup.tips.addFriends')}</Text>
        </View>
      </View>

      {/* Input Fields */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.username')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.signUpButtonText}>{t('auth.createAccount')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Bouton Google supprimé - disponible uniquement sur LoginScreen */}

        {/* Login Link */}
        <TouchableOpacity style={styles.loginLink} onPress={onNavigateToLogin}>
          <Text style={styles.loginText}>
            {t('auth.alreadyHaveAccount')} {t('auth.signIn')}
          </Text>
        </TouchableOpacity>

        {/* Legal Information Link */}
        <TouchableOpacity style={styles.legalLink} onPress={() => setLegalOpen(true)}>
          <Text style={styles.legalText}>
            {language === 'fr' ? 'Informations légales' : 'Legal Information'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  languageSelector: {
    marginTop: 10,
  },
  featureBoxes: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  featureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureIconText: {
    fontSize: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  signUpButton: {
    backgroundColor: '#FF6A2B',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  signUpButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '600',
  },
  legalLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  legalText: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
