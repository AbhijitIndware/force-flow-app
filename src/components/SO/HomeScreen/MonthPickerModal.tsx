import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { C } from './Common';

interface MonthPickerModalProps {
  visible: boolean;
  monthPickerTarget: 'single' | 'from' | 'to';
  selectedMonth: number;
  fromMonth: number;
  toMonth: number;
  onSelectMonth: (month: number) => void;
  onClose: () => void;
}

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  monthPickerTarget,
  selectedMonth,
  fromMonth,
  toMonth,
  onSelectMonth,
  onClose,
}) => {
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
            <Text style={styles.pickerTitle}>Select Month</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={C.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.monthGrid}>
            {moment.months().map((month, index) => {
              const mValue = index + 1;
              const isActive =
                monthPickerTarget === 'single'
                  ? selectedMonth === mValue
                  : monthPickerTarget === 'from'
                    ? fromMonth === mValue
                    : toMonth === mValue;

              return (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthItem,
                    isActive && styles.monthItemActive,
                  ]}
                  onPress={() => onSelectMonth(mValue)}>
                  <Text
                    style={[
                      styles.monthText,
                      isActive && styles.monthTextActive,
                    ]}>
                    {moment().month(index).format('MMM')}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  monthItem: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: C.background,
  },
  monthItemActive: {
    backgroundColor: C.accent,
  },
  monthText: {
    fontWeight: '500',
    fontSize: 13,
    color: C.text,
  },
  monthTextActive: {
    color: C.white,
    fontWeight: '700',
  },
});
