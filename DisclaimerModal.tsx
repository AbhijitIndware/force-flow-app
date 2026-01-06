import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCLAIMER_KEY = 'disclaimerAccepted_v1';
const SHOW_DELAY = 400; // milliseconds

const DisclaimerModal = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkDisclaimer = async () => {
      const accepted = await AsyncStorage.getItem(DISCLAIMER_KEY);

      if (!accepted) {
        // ⏱ show after delay
        setTimeout(() => {
          setVisible(true);
        }, SHOW_DELAY);
      }
    };

    checkDisclaimer();
  }, []);

  const handleAccept = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
    setVisible(false);
  };

  const handleDecline = () => {
    BackHandler.exitApp();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>⚠️ Disclaimer</Text>

          <Text style={styles.text}>
            This application tracks <Text style={styles.bold}>location</Text>{' '}
            and <Text style={styles.bold}>work-related activities</Text> during
            official working hours for business purposes only.
          </Text>

          <Text style={styles.text}>
            By logging in, you consent to data collection as per company policy
            and applicable laws.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.decline]}
              onPress={handleDecline}
              activeOpacity={0.85}>
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.accept]}
              onPress={handleAccept}
              activeOpacity={0.85}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DisclaimerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111827',
  },
  text: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 10,
    color: '#374151',
  },
  bold: {
    fontWeight: '600',
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  accept: {
    backgroundColor: '#16a34a',
    marginLeft: 10,
  },
  decline: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 10,
  },
  acceptText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  declineText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
});
