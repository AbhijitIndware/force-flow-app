import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface Props {
  visible: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

const MinStoresWarningModal = ({visible, onContinue, onCancel}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>⚠️ Minimum Stores Required</Text>

          <Text style={styles.text}>
            You must select at least <Text style={styles.bold}>15 stores</Text>{' '}
            before submitting.
          </Text>

          <Text style={styles.text}>Do you want to continue anyway?</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onCancel}
              activeOpacity={0.85}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.continue]}
              onPress={onContinue}
              activeOpacity={0.85}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MinStoresWarningModal;

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
  continue: {
    backgroundColor: '#16a34a',
    marginLeft: 10,
  },
  cancel: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 10,
  },
  continueText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
});
