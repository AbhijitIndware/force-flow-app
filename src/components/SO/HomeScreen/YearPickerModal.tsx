import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { C } from './Common';

interface YearPickerModalProps {
  visible: boolean;
  selectedYear: number;
  currentYear: number;
  onSelectYear: (year: number) => void;
  onClose: () => void;
}

export const YearPickerModal: React.FC<YearPickerModalProps> = ({
  visible,
  selectedYear,
  currentYear,
  onSelectYear,
  onClose,
}) => {
  const years = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.pickerModalContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Year</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={C.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.yearList}>
            {years.map(year => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearItem,
                  selectedYear === year && styles.yearItemActive,
                ]}
                onPress={() => onSelectYear(year)}>
                <Text
                  style={[
                    styles.yearText,
                    selectedYear === year && styles.yearTextActive,
                  ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
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
  pickerModalContainer: {
    width: '80%',
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  yearList: {
    gap: 10,
  },
  yearItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: C.background,
  },
  yearItemActive: {
    backgroundColor: C.accent,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  yearTextActive: {
    color: C.white,
  },
});
