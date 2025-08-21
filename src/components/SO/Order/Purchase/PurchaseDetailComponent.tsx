import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {POOrderData, RSoDetailData} from '../../../../types/baseType';
import {soStatusColors} from '../../../../utils/utils';
import {
  useAmendPurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useCreatePurchaseOrderMutation,
  useSubmitPurchaseOrderMutation,
} from '../../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import {Colors} from '../../../../utils/colors';

type Props = {
  detail: POOrderData;
  navigation: any;
  refetch: any;
};

const PurchaseDetailComponent = ({detail, navigation, refetch}: Props) => {
  const {order_details, items, totals} = detail;

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [submitPurchaseOrder, {isLoading: isSubmitLoading}] =
    useSubmitPurchaseOrderMutation();
  const [cancelPurchaseOrder, {isLoading: isCancelLoading}] =
    useCancelPurchaseOrderMutation();
  const [amendPurchaseOrder, {isLoading: isAmendLoading}] =
    useAmendPurchaseOrderMutation();

  const onConfirmCancel = () => {
    setCancelModalVisible(false);
    handleCancel();
  };

  const handleSubmit = async () => {
    try {
      let payload = {
        order_id: order_details?.order_id,
        action: 'Approve',
      };
      const res = await submitPurchaseOrder(payload).unwrap();
      console.log('🚀 ~ handleSubmit ~ res:', res);
      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: `✅ ${res.message.message}`,
          position: 'top',
        });
        // navigation.navigate('OrdersScreen');
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

  const handleCancel = async () => {
    try {
      let payload = {
        order_id: order_details?.order_id,
        action: 'Reject',
        reason: cancelReason,
      };
      const res = await cancelPurchaseOrder(payload).unwrap();
      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: `✅ ${res.message.message}`,
          position: 'top',
        });
        setCancelReason('');
        // navigation.navigate('OrdersScreen');
      } else {
        Toast.show({
          type: 'error',
          text1: `❌ ${res.message.message || 'Something went wrong'}`,
          position: 'top',
        });
      }
    } catch (error: any) {
      // console.error('Sales Order API Error:', error);
      Toast.show({
        type: 'error',
        text1: `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
        text2: 'Please try again later.',
        position: 'top',
      });
    }
  };

  const handleAmend = async () => {
    try {
      let _amendment = {
        schedule_date: order_details?.schedule_date,
        supplier: order_details?.supplier,
        items: items?.map(item => ({
          item_code: item?.item_code,
          qty: item?.qty,
          rate: item?.rate,
          sales_order: item?.sales_order as string,
        })),
      };
      let payload = {
        order_id: order_details?.order_id,
        amendments: _amendment,
      };
      const res = await amendPurchaseOrder(payload).unwrap();
      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: `✅ ${res.message.message}`,
          position: 'top',
        });
        // navigation.navigate('OrdersScreen');
      } else {
        // console.error('Sales Order API Error:', res.message.message);
        Toast.show({
          type: 'error',
          text1: `❌ ${res.message.message || 'Something went wrong'}`,
          position: 'top',
        });
      }
    } catch (error: any) {
      // console.error('Sales Order API Error:', error);
      Toast.show({
        type: 'error',
        text1: `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
        text2: 'Please try again later.',
        position: 'top',
      });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
    }, 2000);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Order Details */}
      <View style={styles.card}>
        <Text style={styles.title}>Order Details</Text>
        <Text>Order ID: {order_details.order_id}</Text>
        <Text>Supplier: {order_details.supplier_name}</Text>
        <Text>Transaction Date: {order_details.transaction_date}</Text>
        <Text>Schedule Date: {order_details.schedule_date}</Text>
        <View
          style={{
            backgroundColor:
              `${soStatusColors[order_details.status]}40` || '#E5E7EB40',
            padding: 8,
            borderRadius: 6,
            width: 'auto',
          }}>
          <Text
            style={{
              color: soStatusColors[order_details.status] || '#E5E7EB',
              fontWeight: '700',
              fontSize: 16,
            }}>
            {order_details.status}
          </Text>
        </View>
        <Text>Grand Total: {order_details.grand_total}</Text>
        <Text>Total Qty: {order_details.total_qty}</Text>
      </View>

      {/* Items List */}
      <View style={styles.card}>
        <Text style={styles.title}>Items</Text>
        <FlatList
          data={items}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.item_code}-${index}`}
          renderItem={({item}) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>Item Name: {item.item_name}</Text>
              <Text>Description: {item.description}</Text>
              <Text>Sales Order: {item.sales_order}</Text>
              <Text>Qty: {item.qty}</Text>
              <Text>Rate: {item.rate}</Text>
              <Text>Amount: {item.amount}</Text>
              <Text>Warehouse: {item.warehouse}</Text>
              <Text>Schedule Date: {item.schedule_date}</Text>
            </View>
          )}
        />
      </View>

      {/* Totals */}
      <View style={styles.card}>
        <Text style={styles.title}>Totals</Text>
        <Text>Total: {totals.total}</Text>
        <Text>Taxes: {totals.total_taxes_and_charges}</Text>
        <Text>Grand Total: {totals.grand_total}</Text>
        <Text>Rounded: {totals.rounded_total}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (isSubmitLoading || order_details.docstatus !== 0) && {
              opacity: 0.7,
            },
          ]}
          onPress={() => handleSubmit()}
          disabled={isSubmitLoading || order_details.docstatus !== 0}>
          {isSubmitLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (isCancelLoading || order_details.docstatus !== 1) && {
              opacity: 0.7,
            },
            {
              backgroundColor: Colors.darkGray,
            },
          ]}
          onPress={() => setCancelModalVisible(true)}
          disabled={isCancelLoading || order_details.docstatus !== 1}>
          {isCancelLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Cancel</Text>
          )}
        </TouchableOpacity>

        {order_details.docstatus === 2 && (
          <TouchableOpacity
            style={[
              styles.submitBtn,
              isAmendLoading && {
                opacity: 0.7,
              },
              {
                backgroundColor: Colors.primary,
              },
            ]}
            onPress={() => handleAmend()}
            disabled={isAmendLoading}>
            {isAmendLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>Amend</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Cancel Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={cancelModalVisible}
          onRequestClose={() => setCancelModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Cancel Reason</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter reason for cancellation"
                placeholderTextColor={Colors.black}
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.submitBtn, {backgroundColor: Colors.gray}]}
                  onPress={() => setCancelModalVisible(false)}>
                  <Text style={styles.submitText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, !cancelReason && {opacity: 0.7}]}
                  disabled={!cancelReason}
                  onPress={onConfirmCancel}>
                  <Text style={styles.submitText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default PurchaseDetailComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
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
  itemName: {
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  submitBtn: {
    backgroundColor: Colors.green,
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
