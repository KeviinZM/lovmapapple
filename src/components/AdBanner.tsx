import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getBannerAdProps } from '../lib/adMobService';

interface AdBannerProps {
  size?: BannerAdSize;
  style?: any;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.BANNER, 
  style 
}) => {
  const adProps = getBannerAdProps();

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adProps.unitId}
        size={size}
        requestOptions={adProps.requestOptions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default AdBanner;
