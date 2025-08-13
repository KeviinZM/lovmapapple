/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { configureGoogleSignIn } from './src/lib/googleSignIn';
import { LanguageProvider } from './src/i18n/LanguageContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialiser Google Sign-In
    configureGoogleSignIn();
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
