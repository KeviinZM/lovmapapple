import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from '../lib/firebase';
import { ensureUserProfile } from '../lib/mapService';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';

type Screen = 'login' | 'signup' | 'home';

const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {

    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      setCurrentScreen('login');
    }, 5000);

    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      // Annuler le timeout de sécurité
      clearTimeout(safetyTimeout);
      
      if (user) {
        setUser(user);
        
        // Créer le profil seulement une fois
        if (!profileCreated) {
          try {
            await ensureUserProfile();
            setProfileCreated(true);
          } catch (error) {
            console.error('Erreur lors de la création du profil:', error);
          }
        }
        
        setCurrentScreen('home');
      } else {
        setUser(null);
        setProfileCreated(false);
        setCurrentScreen('login');
      }
      setLoading(false);
    });



    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, [profileCreated]);

  const renderScreen = () => {
    if (loading) {
      return (
        <View style={styles.container}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      );
    }

    switch (currentScreen) {
      case 'login':
        return (
                  <LoginScreen 
          onNavigateToSignUp={() => setCurrentScreen('signup')} 
        />
        );
      case 'signup':
        return <SignUpScreen 
          onNavigateToLogin={() => setCurrentScreen('login')} 
          onNavigateToHome={() => setCurrentScreen('home')} 
        />;
      case 'home':
        return <HomeScreen onNavigateToLogin={() => setCurrentScreen('login')} />;
      default:
        return <HomeScreen onNavigateToLogin={() => setCurrentScreen('login')} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
});

export default AppNavigator;
