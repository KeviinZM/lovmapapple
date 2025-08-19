

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

import { LanguageProvider } from './src/i18n/LanguageContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

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
