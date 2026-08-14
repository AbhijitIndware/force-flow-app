import React, {useState} from 'react';
import {Image, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {EllipsisVertical} from 'lucide-react-native';
import {Menu} from 'react-native-paper';
import Toast from 'react-native-toast-message';

import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {soStatusColors} from '../../../utils/utils';
import {imageBaseUrl} from '../../../features/apiBaseUrl';
import {
  useSubmitSalesOrderMutation,
  useCancelSalesOrderMutation,
} from '../../../features/base/promoter-base-api';

interface Props {
  time: string;
  date: string;
  month: string;
  orderNo: string;
  amount: number;
  status: string;
  storeName: string;
  distributor: string;
  storeImage?: string;
  navigation: any;
}

const SalesItemCard: React.FC<Props> = ({
  time,
  date,
  month,
  orderNo,
  amount,
  status,
  storeName,
  distributor,
  storeImage,
  navigation,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [action, setAction] = useState<'submit' | 'cancel'>('submit');

  const [submitSalesOrder, {isLoading: isSubmitting}] =
    useSubmitSalesOrderMutation();
  const [cancelSalesOrder, {isLoading: isCancelling}] =
    useCancelSalesOrderMutation();

  const isLoading = isSubmitting || isCancelling;

  const statusColor = soStatusColors[status] || Colors.blue;
  const isDraft = status === 'Draft';
  const isPending = status === 'Pending';

  const openConfirm = (nextAction: 'submit' | 'cancel') => {
    setAction(nextAction);
    setMenuVisible(false);
    setConfirmVisible(true);
  };

  const handleConfirm = async () => {
    try {
      const res =
        action === 'submit'
          ? await submitSalesOrder({order_id: orderNo}).unwrap()
          : await cancelSalesOrder({order_id: orderNo}).unwrap();

      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1:
            action === 'submit'
              ? 'Sales order submitted successfully'
              : 'Sales order cancelled',
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: res?.message?.message || 'Something went wrong',
          position: 'top',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.data?.message?.message || 'Something went wrong',
        position: 'top',
      });
    } finally {
      setConfirmVisible(false);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.timeSection}>
            <Text style={styles.time}>SO ID: {orderNo}</Text>
          </View>

          <View style={styles.headerRight}>
            <Text
              style={[
                styles.statusBadge,
                {backgroundColor: `${statusColor}30`, color: statusColor},
              ]}>
              {status}
            </Text>

            {(isDraft || isPending) && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                contentStyle={{
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  elevation: 4,
                }}
                anchor={
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <EllipsisVertical size={20} color={Colors.darkButton} />
                  </TouchableOpacity>
                }>
                {isDraft && (
                  <Menu.Item
                    title="Submit"
                    disabled={isLoading}
                    onPress={() => openConfirm('submit')}
                    titleStyle={{
                      color: Colors.darkButton,
                      fontFamily: Fonts.medium,
                    }}
                  />
                )}
                {isDraft && (
                  <Menu.Item
                    title="Cancel"
                    disabled={isLoading}
                    onPress={() => openConfirm('cancel')}
                    titleStyle={{
                      color: Colors.denger,
                      fontFamily: Fonts.medium,
                    }}
                  />
                )}
                {isPending && (
                  <Menu.Item
                    title="Cancel"
                    disabled={isLoading}
                    onPress={() => openConfirm('cancel')}
                    titleStyle={{
                      color: Colors.denger,
                      fontFamily: Fonts.medium,
                    }}
                  />
                )}
                <Menu.Item
                  title="View"
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate('PromoterSaleDetailScreen', {
                      id: orderNo,
                    });
                  }}
                  titleStyle={{
                    color: Colors.darkButton,
                    fontFamily: Fonts.medium,
                  }}
                />
              </Menu>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.cardbody}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('PromoterSaleDetailScreen', {
              id: orderNo,
            })
          }>
          {storeImage && (
            <Image
              source={{uri: imageBaseUrl + storeImage}}
              style={styles.storeThumb}
            />
          )}

          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.monthText}>{month}</Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={styles.contentText}>Store: {storeName}</Text>
            <Text style={styles.contentText}>Distributor: {distributor}</Text>
            <Text style={styles.amountText}>PO Amount: ₹{amount}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              {action === 'submit' ? 'Submit Sales Order?' : 'Cancel Sales Order?'}
            </Text>
            <Text style={styles.confirmText}>
              {action === 'submit'
                ? 'Once submitted, you won’t be able to edit this order. Do you want to continue?'
                : 'This order will be cancelled. Do you want to continue?'}
            </Text>

            <View style={styles.confirmRow}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isLoading}
                onPress={handleConfirm}>
                <Text style={styles.submit}>
                  {isLoading
                    ? 'Please wait...'
                    : action === 'submit'
                    ? 'Continue'
                    : 'Yes, Cancel'}
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

const styles = StyleSheet.create({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '50%',
    maxWidth: 175,
  },
  time: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    lineHeight: 18,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  statusBadge: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    lineHeight: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 50,
    maxWidth: 130,
    textAlign: 'center',
  },
  cardbody: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 0,
  },
  storeThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  dateBox: {
    width: 50,
    height: 50,
    borderColor: Colors.darkButton,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.transparent,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  dateText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  monthText: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.xs,
  },
  contentText: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.xs,
    lineHeight: 20,
  },
  amountText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    lineHeight: 20,
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
    color: Colors.darkButton,
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
