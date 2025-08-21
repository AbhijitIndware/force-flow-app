// CustomToast.tsx
import React from 'react';
import {BaseToast, ErrorToast} from 'react-native-toast-message';
import {StyleSheet} from 'react-native';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={[styles.base, {borderLeftColor: 'green'}]}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={4}
      text2NumberOfLines={3} // 👈 allow up to 3 lines
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={[styles.base, {borderLeftColor: 'red'}]}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={4}
      text2NumberOfLines={3} // 👈 allow up to 3 lines
    />
  ),

  warning: ({text1, text2, ...rest}: any) => (
    <BaseToast
      {...rest}
      style={[styles.base, {borderLeftColor: 'orange'}]}
      text1={text1}
      text2={text2}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={4}
      text2NumberOfLines={3} // 👈 allow up to 3 lines
    />
  ),
};

const styles = StyleSheet.create({
  base: {
    borderLeftWidth: 5,
    minHeight: 70,
  },
  text1: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  text2: {
    fontSize: 12,
    flexWrap: 'wrap', // 👈 allow wrapping
    flexShrink: 1, // 👈 prevent truncation
  },
});
