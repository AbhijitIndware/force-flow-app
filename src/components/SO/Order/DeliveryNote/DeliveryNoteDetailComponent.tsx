/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { DeliveryNoteResponse } from '../../../../types/baseType';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';

type Props = {
  detail: DeliveryNoteResponse['message']['data'];
  navigation: any;
  refetch: any;
};

const DeliveryNoteDetailComponent = ({ detail, navigation, refetch }: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  if (!detail) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, fontFamily: Fonts.medium }}>Loading details...</Text>
      </View>
    );
  }

  const { order_details, items, totals } = detail;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
    }, 2000);
  }, [refetch]);

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <View style={styles.infoRow}>
      <Text style={styles.contentHeading}>{label}</Text>
      <Text style={styles.contenttext}>{value ?? 'N/A'}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>

      {/* Status Banner */}
      {(() => {
        const statusColor =
          order_details.status === 'Submitted' || order_details.status === 'Approved'
            ? '#049a3b'
            : order_details.status === 'Cancelled'
              ? '#EF4444'
              : '#FACC15';

        return (
          <View style={[styles.statusBanner, { backgroundColor: `${statusColor}30` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {order_details.status} • {order_details.workflow_state}
            </Text>
          </View>
        );
      })()}

      {/* Main Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Basic Information</Text>
        </View>
        <View style={styles.cardBody}>
          <InfoRow label="DDN ID" value={order_details.delivery_note_id} />
          <InfoRow label="Distributor" value={order_details.distributor_name} />
          <InfoRow label="Store" value={order_details.store_name} />
          <View style={styles.dividerSmall} />
          <InfoRow label="Posting Date" value={order_details.posting_date} />
          <InfoRow label="Invoice No" value={order_details.invoice_no} />
          <InfoRow label="Purchase Order" value={order_details.purchase_order} />
          <InfoRow label="Warehouse" value={order_details.store_warehouse} />
        </View>
      </View>

      {/* Qty Summary Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Quantity Summary</Text>
        </View>
        <View style={[styles.cardBody, styles.rowBetween]}>
          <View style={styles.qtyBox}>
            <Text style={styles.qtyLabel}>Ordered</Text>
            <Text style={styles.qtyValue}>{order_details.ordered_qty}</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.qtyBox}>
            <Text style={styles.qtyLabel}>Delivered</Text>
            <Text style={styles.qtyValue}>{order_details.delivered_qty}</Text>
          </View>
        </View>
      </View>

      {/* Items Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Items ({items.length})</Text>
      </View>

      {items.map((item, index) => (
        <View key={`${item.item_code}-${index}`} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={2}>{item.item_name}</Text>
            <Text style={styles.itemCode}>{item.item_code}</Text>
          </View>
          <View style={styles.itemBody}>
            <View style={styles.itemRow}>
              <View style={styles.itemCol}>
                <Text style={styles.itemLabel}>Ordered Qty</Text>
                <Text style={styles.itemValue}>{item.ordered_qty}</Text>
              </View>
              <View style={styles.itemCol}>
                <Text style={styles.itemLabel}>Delivered Qty</Text>
                <Text style={styles.itemValue}>{item.delivered_qty}</Text>
              </View>
            </View>
            <View style={styles.dividerSmall} />
            <View style={styles.itemRow}>
              <View style={styles.itemCol}>
                <Text style={styles.itemLabel}>Rate</Text>
                <Text style={styles.itemValue}>₹{item.rate}</Text>
              </View>
              <View style={styles.itemCol}>
                <Text style={styles.itemLabel}>Amount</Text>
                <Text style={[styles.itemValue, { fontFamily: Fonts.bold, color: Colors.primary }]}>₹{item.amount}</Text>
              </View>
            </View>
            {item.warehouse && (
              <>
                <View style={styles.dividerSmall} />
                <Text style={styles.itemSubLabel}>Warehouse: {item.warehouse}</Text>
              </>
            )}
          </View>
        </View>
      ))}

      {/* Totals Card */}
      <View style={[styles.card, { marginBottom: 60, marginTop: 20, backgroundColor: Colors.orange }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: Colors.white }]}>Order Summary</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{totals?.total}</Text>
          </View>
          {/* {totals?.taxes_and_charges !== undefined && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxes</Text>
              <Text style={styles.totalValue}>₹{totals?.taxes_and_charges}</Text>
            </View>
          )} */}
          <View style={styles.dividerLight} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotalLabel]}>Grand Total</Text>
            <Text style={[styles.totalValue, styles.grandTotalValue]}>₹{totals?.grand_total}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DeliveryNoteDetailComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.lightBg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contentHeading: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: '#6B7280',
  },
  contenttext: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  qtyLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: '#6B7280',
    marginBottom: 4,
  },
  qtyValue: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.primary,
  },
  dividerVertical: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.borderLight,
  },
  dividerSmall: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemName: {
    fontFamily: Fonts.bold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
    lineHeight: 20,
  },
  itemCode: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemBody: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemCol: {
    flex: 1,
  },
  itemLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  itemSubLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  totalValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.white,
  },
  grandTotalLabel: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  grandTotalValue: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.white,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
});
