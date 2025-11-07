/* eslint-disable react-native/no-inline-styles */
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
import {Size} from '../../../../utils/fontSize';
import {Fonts} from '../../../../constants';

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
      // console.log('🚀 ~ handleSubmit ~ res:', res);
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
      // console.error('Sales Order API Error:', error);
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
        <View style={styles.cardInnerHeader}>
          <Text style={styles.title}>Order Details</Text>
        </View>
        <View style={{paddingHorizontal: 16}}>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Order ID:</Text>
            <Text style={styles.contenttext}>{order_details.order_id}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Supplier:</Text>
            <Text style={styles.contenttext}>
              {order_details.supplier_name}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Transaction Date:</Text>
            <Text style={styles.contenttext}>
              {order_details.transaction_date}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Schedule Date:</Text>
            <Text style={styles.contenttext}>
              {order_details.schedule_date}
            </Text>
          </View>
          <View
            style={{
              backgroundColor:
                `${soStatusColors[order_details.status]}40` || '#E5E7EB40',
              padding: 8,
              borderRadius: 6,
              width: 'auto',
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 8,
            }}>
            <Text
              style={{
                color: soStatusColors[order_details.status] || '#E5E7EB',
                fontSize: 16,
                justifyContent: 'center',
                fontFamily: Fonts.semiBold,
              }}>
              {order_details.status}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Grand Total:</Text>
            <Text style={styles.contenttext}>{order_details.grand_total}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Total Qty:</Text>
            <Text style={styles.contenttext}>{order_details.total_qty}</Text>
          </View>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.card}>
        <View style={styles.cardInnerHeader}>
          <Text style={styles.title}>Items</Text>
        </View>
        <FlatList
          data={items}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.item_code}-${index}`}
          renderItem={({item}) => (
            <>
              <View style={styles.itemRow}>
                <View style={{paddingHorizontal: 16}}>
                  <View
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.contentHeading}>Item Name:</Text>
                    <Text style={styles.contenttext}>{item.item_name}</Text>
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.contentHeading}>Description:</Text>
                    <Text style={styles.contenttext}>{item.description}</Text>
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.contentHeading}>Sales Order:</Text>
                    <Text style={styles.contenttext}>{item.sales_order}</Text>
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.contentHeading}>Qty:</Text>
                    <Text style={styles.contenttext}>{item.qty}</Text>
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.contentHeading}>Rate:</Text>
                    <Text style={styles.contenttext}>{item.rate}</Text>
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.contentHeading}>Amount:</Text>
                    <Text style={styles.contenttext}>{item.amount}</Text>
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.contentHeading}>Warehouse:</Text>
                    <Text style={styles.contenttext}>{item.warehouse}</Text>
                  </View>
                  <View
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.contentHeading}>Schedule Date:</Text>
                    <Text style={styles.contenttext}>{item.schedule_date}</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        />
      </View>
      {/* Totals */}
      <View style={styles.card}>
        <View style={styles.cardInnerHeader}>
          <Text style={styles.title}>Totals</Text>
        </View>
        <View style={{paddingHorizontal: 16}}>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Total:</Text>
            <Text style={styles.contenttext}>{totals.total}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Taxes:</Text>
            <Text style={styles.contenttext}>
              {totals.total_taxes_and_charges}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Grand Total:</Text>
            <Text style={styles.contenttext}>{totals.grand_total}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentHeading}>Rounded:</Text>
            <Text style={styles.contenttext}>{totals.rounded_total}</Text>
          </View>
        </View>
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
      </View>
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
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
  },
  card: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    marginBottom: 12,
    borderRadius: 16,
  },
  itemRow: {
    paddingVertical: 6,
  },
  itemName: {
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
    columnGap: 20,
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.green,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    gap: 5,
    zIndex: 1,
    width: '50%',
  },
  submitText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ecececff',
    height: 50,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  submitBtn2: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.green,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    gap: 5,
    zIndex: 1,
    width: '49%',
  },
  cardInnerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: 15,
    paddingBottom: 8,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  contentHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  contenttext: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
});
