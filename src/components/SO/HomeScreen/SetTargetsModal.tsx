import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import { Fonts } from '../../../constants';

interface SetTargetsModalProps {
  visible: boolean;
  editSalesTarget: string;
  editDdnTarget: string;
  isSavingTargets: boolean;
  setEditSalesTarget: (v: string) => void;
  setEditDdnTarget: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const SetTargetsModal: React.FC<SetTargetsModalProps> = ({
  visible,
  editSalesTarget,
  editDdnTarget,
  isSavingTargets,
  setEditSalesTarget,
  setEditDdnTarget,
  onCancel,
  onSave,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onCancel}>
        <View style={[styles.modalContainer, { gap: 14 }]}>
          <Text style={styles.modalTitle}>Set Monthly Targets</Text>

          <Text style={styles.periodText}>
            {moment().format('MMMM YYYY')} — targets apply to current month
            only
          </Text>

          {/* Sales Target */}
          <View>
            <Text style={styles.modalLabel}>Order Target (₹)</Text>
            <TextInput
              value={editSalesTarget}
              onChangeText={setEditSalesTarget}
              keyboardType="numeric"
              placeholder="e.g. 5000000"
              style={styles.input}
            />
          </View>

          {/* DDN Target */}
          <View>
            <Text style={styles.modalLabel}>Delivery Note Target (₹)</Text>
            <TextInput
              value={editDdnTarget}
              onChangeText={setEditDdnTarget}
              keyboardType="numeric"
              placeholder="e.g. 4000000"
              style={styles.input}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, isSavingTargets && { opacity: 0.6 }]}
              disabled={isSavingTargets}
              onPress={onSave}>
              {isSavingTargets ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
  periodText: {
    fontSize: 12,
    color: '#828282',
    fontFamily: Fonts.regular,
    marginTop: -8,
  },
  modalLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    marginTop: 4,
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
  cancelText: { color: '#374151', fontWeight: '500' },
  confirmText: { color: '#FFFFFF', fontWeight: '600' },
});
