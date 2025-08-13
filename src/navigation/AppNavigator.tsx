import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from '../lib/firebase';
import { ensureUserProfile } from '../lib/mapService';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';

type Screen = 'login' | 'signup' | 'home';

const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Remis à true pour vérifier l'auth

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try { await ensureUserProfile(); } catch {}
        setCurrentScreen('home'); // Aller sur home si connecté
      } else {
        setCurrentScreen('login'); // Aller sur login si déconnecté
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };



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
        return <LoginScreen 
          onNavigateToSignUp={() => navigateTo('signup')} 
          onNavigateToHome={() => navigateTo('home')} 
        />;
      case 'signup':
        return <SignUpScreen 
          onNavigateToLogin={() => navigateTo('login')} 
          onNavigateToHome={() => navigateTo('home')} 
        />;
      case 'home':
        return <HomeScreen onNavigateToLogin={() => navigateTo('login')} />;
      default:
        return <HomeScreen onNavigateToLogin={() => navigateTo('login')} />;
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
