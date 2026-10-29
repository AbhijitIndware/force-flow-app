import {
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Modal,
  View,
} from 'react-native';
import React, {useRef} from 'react';
import {Colors} from '../../../utils/colors';
import Toast from 'react-native-toast-message';
import {useFormik} from 'formik';
import {expenseItemSchema} from '../../../types/schema';
import AddExpenseItemV2 from './add-expense-item-v2';
import InAppCameraHost from '../../ui-lib/in-app-camera-host';
import {X} from 'lucide-react-native';

const initialValues = {
  date: '',
  claim_type: '',
  description: '',
  amount: '',
  attachment: null,
  ta_mode: '',
  ta_rail_class: '',
  is_local: 0,
  ta_km: '',
  telecom_bill_month: '',
  mobile_number: '',
  incidental_bill_month: '',
  is_self_arranged_stay: 0,
};

const AddExpenseModal = ({
  visible,
  onClose,
  onAddExpense,
  selectedDate,
}: any) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues: {
      ...initialValues,
      date: selectedDate || '', // ← pre-fill date
    },
    validationSchema: expenseItemSchema,
    onSubmit: async formValues => {
      // send all values to parent including attachment
      onAddExpense({
        expense_type: formValues.claim_type,
        expense_date: formValues.date || selectedDate,
        custom_claim_description: formValues.description,
        amount: Number(formValues.amount),
        attachment: formValues.attachment,
        ta_mode: formValues.ta_mode,
        ta_rail_class: formValues.ta_rail_class,
        is_local: formValues.is_local,
        ta_km: Number(formValues.ta_km) || 0,
        telecom_bill_month: formValues.telecom_bill_month,
        mobile_number: formValues.mobile_number,
        incidental_bill_month: formValues.incidental_bill_month,
        is_self_arranged_stay: formValues.is_self_arranged_stay,
      });

      // Toast.show({
      //   type: 'success',
      //   text1: 'Expense Added',
      //   position: 'top',
      // });

      resetForm();
      onClose();
    },
  });
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalWrapper}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Expense</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.headerCloseBtn}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <X size={18} color={Colors.black} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <AddExpenseItemV2
            {...{
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
            }}
            scrollY={scrollY}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => handleSubmit()}>
            <Text style={styles.submitText}>+ Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* iOS: the root host can't present over this Modal, so the attachment
          camera needs a host inside it. */}
      <InAppCameraHost />
    </Modal>
  );
};

export default AddExpenseModal;

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  headerTitle: {fontSize: 16, fontWeight: 'bold', color: Colors.black},
  headerCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: Colors.orange,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {color: Colors.white, fontSize: 16, fontWeight: 'bold'},
});
