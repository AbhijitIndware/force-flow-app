import React, {useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Clock2, EllipsisVertical} from 'lucide-react-native';
import {Menu} from 'react-native-paper';
import Toast from 'react-native-toast-message';

import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {useSubmitSalesInvoiceMutation} from '../../../features/base/promoter-base-api';

interface Props {
  time: string;
  date: string;
  month: string;
  orderNo: string;
  amount: number;
  status: string;
  navigation: any;
}

const SalesItemCard: React.FC<Props> = ({
  time,
  date,
  month,
  orderNo,
  amount,
  status,
  navigation,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [submitSalesInvoice, {isLoading}] = useSubmitSalesInvoiceMutation();

  const statusStyle: Record<string, any> = {
    Draft: styles.draft,
    Pending: styles.pending,
    Paid: styles.delivered,
    Cancelled: styles.cancelled,
  };

  const handleSubmitInvoice = async () => {
    try {
      const res = await submitSalesInvoice({
        invoice_id: orderNo,
      }).unwrap();

      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: 'Invoice submitted successfully',
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: res?._error_message || 'Failed to submit invoice',
          position: 'top',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.data?.message || 'Failed to submit invoice',
        position: 'top',
      });
    } finally {
      setConfirmVisible(false);
    }
  };

  return (
    <>
      {/* ================= CARD ================= */}
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.timeRow}>
            <Clock2 size={16} color="#4A4A4A" />
            <Text style={styles.time}>{time}</Text>
          </View>

          <Text style={[styles.status, statusStyle[status]]}>{status}</Text>

          {/* PAPER MENU */}
          {status === 'Draft' && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              contentStyle={{
                backgroundColor: Colors.white, // ✅ white background
                borderRadius: 12,
                elevation: 4,
              }}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <EllipsisVertical size={20} color={Colors.darkButton} />
                </TouchableOpacity>
              }>
              <Menu.Item
                title="Submit"
                // leadingIcon="send"
                disabled={isLoading}
                onPress={() => {
                  setMenuVisible(false);
                  setConfirmVisible(true);
                }}
                titleStyle={{
                  color: Colors.darkButton,
                  fontFamily: Fonts.medium,
                }}
              />
            </Menu>
          )}
        </View>

        {/* ================= BODY ================= */}
        <TouchableOpacity
          style={styles.body}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('PromoterSaleDetailScreen', {
              id: orderNo,
            })
          }>
          <View style={styles.dateBox}>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.month}>{month}</Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={styles.orderNo}>Sales Order: {orderNo}</Text>
            <Text style={styles.amount}>Amount: ₹ {amount}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ================= CONFIRMATION MODAL ================= */}
      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Submit Invoice?</Text>
            <Text style={styles.confirmText}>
              Once submitted, you won’t be able to edit this invoice. Do you
              want to continue?
            </Text>

            <View style={styles.confirmRow}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isLoading}
                onPress={handleSubmitInvoice}>
                <Text style={styles.submit}>
                  {isLoading ? 'Submitting...' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SalesItemCard;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  time: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },

  status: {
    marginLeft: 'auto',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: Size.xs,
    fontFamily: Fonts.regular,
  },

  delivered: {
    backgroundColor: Colors.lightSuccess,
    color: Colors.sucess,
  },

  pending: {
    backgroundColor: Colors.holdLight,
    color: Colors.orange,
  },

  draft: {
    backgroundColor: Colors.lightBlue,
    color: Colors.blue,
  },

  cancelled: {
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
  },

  body: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },

  dateBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  date: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
  },

  month: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
  },

  orderNo: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
  },

  amount: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    marginTop: 4,
  },

  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmBox: {
    backgroundColor: Colors.white,
    width: '85%',
    borderRadius: 16,
    padding: 16,
  },

  confirmTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    marginBottom: 8,
  },

  confirmText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.gray,
    marginBottom: 20,
  },

  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },

  cancel: {
    fontFamily: Fonts.medium,
    color: Colors.gray,
  },

  submit: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
  },
});
