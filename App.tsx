

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { configurePushNotifications } from './src/lib/notificationService';
import { initializeAdMob } from './src/lib/adMobService';

import { LanguageProvider } from './src/i18n/LanguageContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Configurer les notifications au démarrage de l'application
    configurePushNotifications();
    
    // Initialiser AdMob avec Firebase
    initializeAdMob();
  }, []);

  return (
    <LanguageProvider>
      <>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </>
    </LanguageProvider>
  );
}

export default App;
