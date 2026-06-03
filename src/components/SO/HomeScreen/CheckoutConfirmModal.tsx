import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ICheckOut } from '../../../types/baseType';

interface CheckoutConfirmModalProps {
  visible: boolean;
  checkoutPayload: ICheckOut | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const CheckoutConfirmModal: React.FC<CheckoutConfirmModalProps> = ({
  visible,
  checkoutPayload,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirm Check-out</Text>

          <Text style={styles.modalLabel}>Store</Text>
          <Text style={styles.modalValue}>{checkoutPayload?.store}</Text>

          <Text style={styles.modalLabel}>Current Location</Text>
          <Text style={styles.modalValue}>
            {checkoutPayload?.current_location}
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  modalValue: {
    fontSize: 14,
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '500',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
