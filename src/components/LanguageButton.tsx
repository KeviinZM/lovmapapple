import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface LanguageButtonProps {
  style?: any;
}

const LanguageButton: React.FC<LanguageButtonProps> = ({ style }) => {
  const { language } = useLanguage();
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);

  const getLanguageDisplay = () => {
    switch (language) {
      case 'fr':
        return 'FR';
      case 'en':
        return 'EN';
      default:
        return 'FR';
    }
  };

  const getLanguageFlag = () => {
    switch (language) {
      case 'fr':
        return '🇫🇷';
      case 'en':
        return '🇬🇧';
      default:
        return '🇫🇷';
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={() => setLanguageSelectorVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <Text style={styles.flag}>{getLanguageFlag()}</Text>
          <Text style={styles.languageText}>{getLanguageDisplay()}</Text>
        </View>
      </TouchableOpacity>

      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flag: {
    fontSize: 14,
  },
  languageText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default LanguageButton;
