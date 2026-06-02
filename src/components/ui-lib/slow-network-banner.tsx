import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

interface SlowNetworkBannerProps {
  isVisible: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
}

export const SlowNetworkBanner: React.FC<SlowNetworkBannerProps> = ({
  isVisible,
  effectiveType = 'unknown',
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Slow Network</Text>
          <Text style={styles.message}>
            {effectiveType === 'slow-2g'
              ? 'You are on a 2G network. Loading may be slow.'
              : effectiveType === '3g'
              ? 'You are on a 3G network. Speeds may be limited.'
              : 'Your connection appears to be slow. Please wait.'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#333333',
  },
});
