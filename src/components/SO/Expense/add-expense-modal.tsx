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

const initialValues = {
  date: '',
  claim_type: '',
  description: '',
  amount: '',
  attachment: null,
};

const AddExpenseModal = ({visible, onClose, onAddExpense}: any) => {
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
    initialValues,
    validationSchema: expenseItemSchema,
    onSubmit: async formValues => {
      // send all values to parent including attachment
      onAddExpense({
        expense_type: formValues.claim_type,
        expense_date: formValues.date,
        custom_claim_description: formValues.description,
        amount: Number(formValues.amount),
        attachment: formValues.attachment,
      });

      Toast.show({
        type: 'success',
        text1: 'Expense Added',
        position: 'top',
      });

      resetForm();
      onClose();
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalWrapper}>
        <View style={styles.modalContent}>
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

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {color: Colors.white, fontSize: 16, fontWeight: 'bold'},
  closeBtn: {padding: 10, alignItems: 'center'},
  closeText: {fontSize: 14, color: Colors.black},
});
