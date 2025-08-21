import {Modal, StyleSheet, Text, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../../../../utils/colors';
import {TouchableOpacity} from 'react-native';
import {IAddPurchaseOrder, RSoDetailData} from '../../../../types/baseType';
import {useCreatePurchaseOrderMutation} from '../../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type Props = {
  detail: RSoDetailData;
  navigation: any;
};

const CreatePoFromSo = ({detail, navigation}: Props) => {
  const {order_details} = detail;
  const [scheduleDate, setScheduleDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [createPurchaseOrder, {isLoading: isPOLoading}] =
    useCreatePurchaseOrderMutation();

  const handleCreatePO = async () => {
    try {
      const payload: IAddPurchaseOrder = {
        sales_orders: [order_details?.order_id],
        schedule_date: scheduleDate,
        submit_order: false,
      };
      const res = await createPurchaseOrder(payload).unwrap();
      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: `✅ ${res.message.message}`,
          position: 'top',
        });
        navigation.navigate('OrdersScreen');
      } else {
        Toast.show({
          type: 'error',
          text1: `❌ ${res.message.message || 'Something went wrong'}`,
          position: 'top',
        });
      }
    } catch (error: any) {
      console.error('Sales Order API Error:', error);
      Toast.show({
        type: 'error',
        text1: `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
        text2: 'Please try again later.',
        position: 'top',
      });
    }
  };
  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.title}>Purchase Order</Text>

        {order_details.custom_purchase_order ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PurchaseDetailScreen', {
                id: order_details.custom_purchase_order,
              })
            }
            style={styles.itemRow}>
            <Text>PO No: {order_details.custom_purchase_order}</Text>
            <Text style={{color: Colors.black, fontWeight: '600'}}>
              ✅ Purchase Order already created
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.itemRow}>
            <Text style={{color: Colors.black, fontWeight: '600'}}>
              🚫 Purchase Order not created yet
            </Text>
            <TouchableOpacity
              style={[styles.submitBtn, {marginLeft: 10}]}
              onPress={() => setCancelModalVisible(true)}
              disabled={isPOLoading}>
              <Text style={styles.submitText}>Create PO</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Cancel Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Schedule Date</Text>
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="date"
              onConfirm={(date: Date) => {
                const formatted = moment(date).format('YYYY-MM-DD');
                setScheduleDate(formatted);
                setTimePickerVisible(false);
              }}
              onCancel={() => setTimePickerVisible(false)}
            />
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setTimePickerVisible(true)}>
              <Text style={styles.timeText}>
                {scheduleDate
                  ? moment(scheduleDate).format('YYYY-MM-DD')
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.submitBtn, {backgroundColor: Colors.gray}]}
                onPress={() => setCancelModalVisible(false)}>
                <Text style={styles.submitText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, !scheduleDate && {opacity: 0.7}]}
                disabled={!scheduleDate}
                onPress={handleCreatePO}>
                <Text style={styles.submitText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CreatePoFromSo;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  itemRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  timeInput: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  timeText: {
    color: Colors.black,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
    marginHorizontal: 16,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
