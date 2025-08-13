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
import { auth } from '../lib/firebase';
import { signInWithGoogle } from '../lib/googleSignIn';
import { ensureUserProfile } from '../lib/mapService';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageButton from '../components/LanguageButton';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
  onNavigateToHome?: () => void; // Nouvelle prop pour la navigation vers Home
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignUp, onNavigateToHome }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      Alert.alert(t('auth.loginError'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      
      
      // Étape 1: Google Sign-In
      const userInfo = await signInWithGoogle();
      

      // Récupérer l'idToken de façon robuste (selon version de la lib)
      const idToken = (userInfo as any)?.idToken ?? (userInfo as any)?.data?.idToken;

      // Vérifier la présence du token
      if (idToken) {
        // Étape 2: Créer credential Firebase
        const credential = auth.GoogleAuthProvider.credential(idToken);
        
        
        // Étape 3: Sign in Firebase
        const result = await auth().signInWithCredential(credential);
        
        try { await ensureUserProfile(); } catch {}
        
        // Navigation forcée vers le HomeScreen après connexion réussie
        if (onNavigateToHome) {
          onNavigateToHome();
        } else {
          Alert.alert(t('common.success'), t('auth.loginSuccess'));
        }
      } else {
        console.error('Structure userInfo inattendue:', userInfo);
        console.error('Propriétés disponibles:', Object.keys(userInfo || {}));
        throw new Error('Pas de token Google reçu. Vérifiez la configuration.');
      }
      
    } catch (error: any) {
      console.error('Erreur dans handleGoogleLogin:', error);
      Alert.alert(
        t('auth.googleSignInError'), 
        error.message || t('auth.googleSignInError')
      );
    } finally {
      setLoading(false);
    }
  };

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

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <View style={styles.googleBtnContent}>
            <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpLink} onPress={onNavigateToSignUp}>
          <Text style={styles.signUpText}>
            {t('auth.dontHaveAccount')} {t('auth.signUp')}
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
  logoIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  langIcon: { fontSize: 14, color: '#555' },
  langText: { color: '#333', fontWeight: '700' },
  form: {
    flex: 1,
  },
  tips: {
    marginBottom: 20, // Augmenté pour plus d'espace avant le formulaire
    gap: 8, // Réduit pour rapprocher les cartes
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Réduit de 10 à 8
    paddingVertical: 10, // Réduit de 12 à 10
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
    marginBottom: 12, // Réduit de 20 à 12
  },
  loginBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginButtonIcon: { color: '#fff', fontSize: 14 },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16, // Réduit de 20 à 16
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  googleBtnContent: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  googleG: { color: '#4285F4', fontWeight: '800', fontSize: 16 },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: 16, // Réduit de 20 à 16 pour remonter le bouton
  },
  signUpText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '600',
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 12, // Augmenté pour plus d'espace après le logo
  },
});

export default LoginScreen;
