import {
  StyleSheet, Text, View, FlatList, ScrollView,
  TouchableOpacity, ActivityIndicator, Modal,
  TextInput, RefreshControl,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { RSoDetailData } from '../../../../types/baseType';
import { soStatusColors } from '../../../../utils/utils';
import {
  useAmendSaleOrderMutation,
  useCancelSaleOrderMutation,
  useSubmitSaleOrderMutation,
} from '../../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../../utils/colors';
import CreatePoFromSo from './CreatePoFromSo';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  detail: RSoDetailData;
  navigation: any;
  refetch: any;
};

// ── Reusable row component ─────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <View style={D.row}>
    <Text style={D.rowLabel}>{label}</Text>
    <Text style={D.rowValue} numberOfLines={2}>{value ?? '—'}</Text>
  </View>
);

// ── Section card wrapper ───────────────────────────────────────────────────────
const Section = ({
  icon, title, children,
}: {
  icon: string; title: string; children: React.ReactNode;
}) => (
  <View style={D.card}>
    <View style={D.cardHeader}>
      <View style={D.iconCircle}>
        <Ionicons name={icon} size={14} color="#534AB7" />
      </View>
      <Text style={D.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const SaleDetailComponent = ({ detail, navigation, refetch }: Props) => {
  const { order_details, items, store_details, totals } = detail;
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [submitSaleOrder, { isLoading: isSubmitLoading }] = useSubmitSaleOrderMutation();
  const [cancelSaleOrder, { isLoading: isCancelLoading }] = useCancelSaleOrderMutation();
  const [amendSaleOrder, { isLoading: isAmendLoading }] = useAmendSaleOrderMutation();

  const statusColor = soStatusColors[order_details.status] || '#6B7280';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); refetch(); }, 2000);
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await submitSaleOrder({
        order_id: order_details?.order_id, action: 'Approve',
      }).unwrap();
      Toast.show({
        type: res?.message?.success ? 'success' : 'error',
        text1: res?.message?.success
          ? '✅ Sales order submitted successfully'
          : `❌ ${res.message.message || 'Something went wrong'}`,
        position: 'top',
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: `❌ ${error?.data?.message?.message || 'Internal Server Error'}`, position: 'top' });
    }
  };

  const handleCancel = async () => {
    try {
      const res = await cancelSaleOrder({
        order_id: order_details?.order_id, action: 'Reject', reason: cancelReason,
      }).unwrap();
      if (res?.message?.success) {
        Toast.show({ type: 'success', text1: `✅ ${res.message.message}`, position: 'top' });
        setCancelReason('');
        setCancelModalVisible(false);
      } else {
        Toast.show({ type: 'error', text1: `❌ ${res.message.message || 'Something went wrong'}`, position: 'top' });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: `❌ ${error?.data?.message?.message || 'Internal Server Error'}`, position: 'top' });
    }
  };

  const handleAmend = async () => {
    try {
      const res = await amendSaleOrder({
        order_id: order_details?.order_id,
        amendments: {
          delivery_date: order_details?.delivery_date,
          items: items?.map(item => ({
            item_code: item?.item_code, qty: item?.qty,
            rate: item?.rate, delivery_date: item?.delivery_date,
          })),
        },
      }).unwrap();
      Toast.show({
        type: res?.message?.success ? 'success' : 'error',
        text1: res?.message?.success ? `✅ ${res.message.message}` : `❌ ${res.message.message || 'Something went wrong'}`,
        position: 'top',
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: `❌ ${error?.data?.message?.message || 'Internal Server Error'}`, position: 'top' });
    }
  };

  return (
    <ScrollView
      style={D.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      nestedScrollEnabled
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* ── Hero status banner ── */}
      <View style={[D.heroBanner, { borderLeftColor: statusColor }]}>
        <View style={{ flex: 1 }}>
          <Text style={D.heroOrderId}>{order_details.order_id}</Text>
          <Text style={D.heroMeta}>
            {order_details.transaction_date}  ·  {order_details.customer_name}
          </Text>
        </View>
        <View style={[D.statusPill, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}50` }]}>
          <View style={[D.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[D.statusText, { color: statusColor }]}>{order_details.status}</Text>
        </View>
      </View>

      {/* ── Quick stats row ── */}
      <View style={D.statsRow}>
        <View style={D.statBox}>
          <Text style={D.statLabel}>Grand Total</Text>
          <Text style={D.statValue}>₹{order_details.grand_total}</Text>
        </View>
        <View style={D.statDivider} />
        <View style={D.statBox}>
          <Text style={D.statLabel}>Total Qty</Text>
          <Text style={D.statValue}>{order_details.total_qty}</Text>
        </View>
        <View style={D.statDivider} />
        <View style={D.statBox}>
          <Text style={D.statLabel}>Items</Text>
          <Text style={D.statValue}>{items?.length ?? 0}</Text>
        </View>
      </View>

      {/* ── Order Details ── */}
      <Section icon="receipt-outline" title="Order Details">
        <InfoRow label="Order ID" value={order_details.order_id} />
        <InfoRow label="Customer" value={order_details.customer_name} />
        <InfoRow label="Created By" value={order_details.created_by} />
        <InfoRow label="Transaction Date" value={order_details.transaction_date} />
        <InfoRow label="Delivery Date" value={order_details.delivery_date} />
      </Section>

      {/* ── Store Details ── */}
      <Section icon="storefront-outline" title="Store Details">
        <InfoRow label="Warehouse" value={store_details.warehouse_name} />
        <InfoRow label="Store" value={order_details.store_name} />
        <InfoRow label="Distributor" value={store_details.distributor} />
      </Section>

      {/* ── Items ── */}
      <Section icon="cube-outline" title={`Items (${items?.length ?? 0})`}>
        {items?.map((item, index) => (
          <View
            key={`${item.item_code}-${index}`}
            style={[D.itemCard, index < items.length - 1 && D.itemBorder]}
          >
            <Text style={D.itemName} numberOfLines={2}>{item.item_name}</Text>
            <Text style={D.itemCode}>{item.item_code}</Text>
            <View style={D.itemMetaRow}>
              <View style={D.itemChip}>
                <Text style={D.itemChipLabel}>Qty</Text>
                <Text style={D.itemChipValue}>{item.qty}</Text>
              </View>
              <View style={D.itemChip}>
                <Text style={D.itemChipLabel}>Rate</Text>
                <Text style={D.itemChipValue}>₹{item.rate}</Text>
              </View>
              <View style={[D.itemChip, { backgroundColor: '#EEF2FF' }]}>
                <Text style={D.itemChipLabel}>Amount</Text>
                <Text style={[D.itemChipValue, { color: '#534AB7' }]}>₹{item.amount}</Text>
              </View>
            </View>
          </View>
        ))}
      </Section>

      {/* ── Totals ── */}
      <Section icon="calculator-outline" title="Totals">
        <InfoRow label="Subtotal" value={`₹${totals.total}`} />
        <InfoRow label="Taxes" value={`₹${totals.total_taxes_and_charges}`} />
        <View style={[D.row, D.grandTotalRow]}>
          <Text style={D.grandTotalLabel}>Grand Total</Text>
          <Text style={D.grandTotalValue}>₹{totals.grand_total}</Text>
        </View>
        {totals.rounded_total && (
          <InfoRow label="Rounded" value={`₹${totals.rounded_total}`} />
        )}
      </Section>

      {/* ── Purchase Order Section ── */}
      {order_details.custom_purchase_order && (
        <CreatePoFromSo detail={detail as RSoDetailData} navigation={navigation} />
      )}

      {/* ── Action Buttons ── */}
      <View style={D.actions}>
        <TouchableOpacity
          style={[D.actionBtn, D.btnGreen, (isSubmitLoading || order_details.docstatus !== 0) && D.btnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitLoading || order_details.docstatus !== 0}
        >
          {isSubmitLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={D.actionBtnText}>Submit</Text>
            </>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[D.actionBtn, D.btnRed, (isCancelLoading || order_details.docstatus !== 1) && D.btnDisabled]}
          onPress={() => setCancelModalVisible(true)}
          disabled={isCancelLoading || order_details.docstatus !== 1}
        >
          {isCancelLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <>
              <Ionicons name="close-circle-outline" size={18} color="#fff" />
              <Text style={D.actionBtnText}>Cancel</Text>
            </>
          }
        </TouchableOpacity>
      </View>

      {order_details.docstatus === 2 && (
        <View style={[D.actions, { marginTop: 0 }]}>
          <TouchableOpacity
            style={[D.actionBtn, D.btnPurple, { flex: 1 }, isAmendLoading && D.btnDisabled]}
            onPress={handleAmend}
            disabled={isAmendLoading}
          >
            {isAmendLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <>
                <Ionicons name="create-outline" size={18} color="#fff" />
                <Text style={D.actionBtnText}>Amend Order</Text>
              </>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* ── Cancel Modal ── */}
      <Modal
        animationType="fade"
        transparent
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={D.modalOverlay}>
          <View style={D.modalBox}>
            <View style={D.modalIconRow}>
              <View style={D.modalIconCircle}>
                <Ionicons name="warning-outline" size={24} color="#EF4444" />
              </View>
            </View>
            <Text style={D.modalTitle}>Cancel Order</Text>
            <Text style={D.modalSubtitle}>Please provide a reason for cancellation</Text>

            <TextInput
              style={D.modalInput}
              placeholder="Enter reason..."
              value={cancelReason}
              placeholderTextColor="#9CA3AF"
              onChangeText={setCancelReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={D.modalActions}>
              <TouchableOpacity
                style={[D.modalBtn, D.modalBtnGhost]}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={D.modalBtnGhostText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[D.modalBtn, D.modalBtnDanger, !cancelReason && D.btnDisabled]}
                disabled={!cancelReason}
                onPress={handleCancel}
              >
                {isCancelLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={D.modalBtnText}>Confirm</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default SaleDetailComponent;

const D = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', paddingHorizontal: 14, paddingTop: 12 },

  // ── Hero ──
  heroBanner: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  heroOrderId: { fontSize: 14, fontFamily: Fonts.semiBold, color: '#1A1A2E' },
  heroMeta: { fontSize: 11, fontFamily: Fonts.regular, color: '#6B7280', marginTop: 3 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: Fonts.semiBold },

  // ── Stats row ──
  statsRow: {
    backgroundColor: '#fff', borderRadius: 14,
    flexDirection: 'row', marginBottom: 10,
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statDivider: { width: 0.5, backgroundColor: '#E5E7EB', marginVertical: 10 },
  statLabel: { fontSize: 10, fontFamily: Fonts.regular, color: '#6B7280', marginBottom: 4 },
  statValue: { fontSize: 15, fontFamily: Fonts.semiBold, color: '#1A1A2E' },

  // ── Card ──
  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginBottom: 10, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB',
  },
  iconCircle: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 13, fontFamily: Fonts.semiBold, color: '#1A1A2E' },

  // ── Info rows ──
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 14,
    paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 12, fontFamily: Fonts.regular, color: '#6B7280', flex: 1 },
  rowValue: { fontSize: 12, fontFamily: Fonts.semiBold, color: '#1A1A2E', flex: 1, textAlign: 'right' },

  // ── Grand total row ──
  grandTotalRow: {
    backgroundColor: '#F5F3FF',
    borderBottomWidth: 0,
    marginTop: 2,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  grandTotalLabel: { fontSize: 13, fontFamily: Fonts.semiBold, color: '#1A1A2E', flex: 1 },
  grandTotalValue: { fontSize: 15, fontFamily: Fonts.semiBold, color: '#534AB7', flex: 1, textAlign: 'right' },

  // ── Items ──
  itemCard: { paddingHorizontal: 14, paddingVertical: 12 },
  itemBorder: { borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  itemName: { fontSize: 13, fontFamily: Fonts.semiBold, color: '#1A1A2E', marginBottom: 2 },
  itemCode: { fontSize: 10, fontFamily: Fonts.regular, color: '#9CA3AF', marginBottom: 8 },
  itemMetaRow: { flexDirection: 'row', gap: 8 },
  itemChip: {
    flex: 1, backgroundColor: '#F9FAFB',
    borderRadius: 8, padding: 8, alignItems: 'center',
    borderWidth: 0.5, borderColor: '#E5E7EB',
  },
  itemChipLabel: { fontSize: 9, fontFamily: Fonts.regular, color: '#6B7280', marginBottom: 2 },
  itemChipValue: { fontSize: 12, fontFamily: Fonts.semiBold, color: '#1A1A2E' },

  // ── Actions ──
  actions: {
    flexDirection: 'row', gap: 10,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderRadius: 12,
  },
  btnGreen: { backgroundColor: '#16A34A' },
  btnRed: { backgroundColor: '#EF4444' },
  btnPurple: { backgroundColor: '#534AB7' },
  btnDisabled: { opacity: 0.45 },
  actionBtnText: { fontSize: 14, fontFamily: Fonts.semiBold, color: '#fff' },

  // ── Cancel Modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    width: '88%', backgroundColor: '#fff',
    borderRadius: 20, padding: 22,
  },
  modalIconRow: { alignItems: 'center', marginBottom: 12 },
  modalIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: 17, fontFamily: Fonts.semiBold, color: '#1A1A2E', textAlign: 'center' },
  modalSubtitle: { fontSize: 12, fontFamily: Fonts.regular, color: '#6B7280', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  modalInput: {
    backgroundColor: '#F9FAFB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 0.5, borderColor: '#E5E7EB',
    fontSize: 13, fontFamily: Fonts.regular,
    color: '#1A1A2E', minHeight: 80,
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalBtn: {
    flex: 1, paddingVertical: 13,
    borderRadius: 12, alignItems: 'center',
  },
  modalBtnGhost: { backgroundColor: '#F3F4F6' },
  modalBtnGhostText: { fontSize: 14, fontFamily: Fonts.semiBold, color: '#374151' },
  modalBtnDanger: { backgroundColor: '#EF4444' },
  modalBtnText: { fontSize: 14, fontFamily: Fonts.semiBold, color: '#fff' },
});