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

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToHome?: () => void; // Nouvelle prop pour la navigation vers Home
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToLogin, onNavigateToHome }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 12, // Augmenté pour être cohérent avec l'écran de connexion
  },
  locationIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIconText: {
    fontSize: 18,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  globeIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  featureBoxes: {
    marginBottom: 20, // Augmenté pour plus d'espace avant le formulaire
  },
  featureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8, // Augmenté de 6 à 8 pour un meilleur espacement
    borderWidth: 1,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureIconText: {
    fontSize: 14,
  },
  featureText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
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
});

export default SignUpScreen;
