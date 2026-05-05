import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Package, Info, CheckCircle2, FileText, Calendar, MessageSquare, TrendingDown } from 'lucide-react-native';
import moment from 'moment';
import { useApproveAndCreateDDNMutation } from '../../../features/base/distributor-api';
import { useGetPurchaseOrderByIdQuery } from '../../../features/base/base-api';
import { DistributorAppStackParamList } from '../../../types/Navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../../utils/colors';
import Toast from 'react-native-toast-message';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import PageHeader from '../../../components/ui/PageHeader';
import ReusableDatePicker from '../../../components/ui-lib/reusable-date-picker';
import { Size } from '../../../utils/fontSize';

// ─── Types ────────────────────────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<
    DistributorAppStackParamList,
    'PurchaseOrderDetailScreen'
>;

type Props = {
    navigation: NavigationProp;
    route: any
};

type LinkedDDN = {
    name: string;
    invoice_no: string;
    date: string;
    remarks: string;
    workflow_state: string;
    del_qty: number;
    ord_qty: number;
    grand_total: number;
    creation: string;
    created_by: string;
};

const REMARKS_OPTIONS = [
    { label: 'Credit limit exceed', value: 'credit_limit_exceed' },
    { label: 'Stock not available', value: 'stock_not_available' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
    white: '#FFFFFF',
    text: '#1A1A2E',
    textMuted: '#6B7280',
    accent: '#534AB7',
    background: '#F5F5F7',
    border: '#E5E7EB',
    success: '#21974e',
    warning: '#92400E',
};

const COLUMN_WIDTHS = {
    check: 32,
    item: 160,
    ordered: 58,
    delQty: 64,
    amount: 76,
};

// ─── Status Badge ──────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        Pending: { bg: '#FEF3C7', text: '#92400E' },
        Approved: { bg: '#DCFCE7', text: '#1E40AF' },
        Delivered: { bg: '#8de58dff', text: '#21974eff' },
        'Partially Delivered': { bg: '#FEE2E2', text: '#991B1B' },
        Rejected: { bg: '#ff6557ff', text: '#92400E' },
    };
    const colors = colorMap[status] ?? { bg: C.background, text: C.textMuted };
    return (
        <View style={[badgeStyles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[badgeStyles.text, { color: colors.text }]}>{status}</Text>
        </View>
    );
};

// ─── DDN State Badge ──────────────────────────────────────────────────────────

const DDNStateBadge: React.FC<{ state: string }> = ({ state }) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        Draft: { bg: '#F3F4F6', text: '#374151' },
        Submitted: { bg: '#DBEAFE', text: '#1D4ED8' },
        Delivered: { bg: '#D1FAE5', text: '#065F46' },
        Cancelled: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const colors = colorMap[state] ?? { bg: C.background, text: C.textMuted };
    return (
        <View style={[ddnStyles.stateBadge, { backgroundColor: colors.bg }]}>
            <Text style={[ddnStyles.stateBadgeText, { color: colors.text }]}>{state}</Text>
        </View>
    );
};

// ─── Linked DDN Card ──────────────────────────────────────────────────────────

const LinkedDDNCard: React.FC<{ ddn: LinkedDDN }> = ({ ddn }) => {
    const fulfilledPct = ddn.ord_qty > 0
        ? Math.min(100, Math.round((ddn.del_qty / ddn.ord_qty) * 100))
        : 0;

    return (
        <View style={ddnStyles.card}>
            {/* Top row: DDN name + state badge */}
            <View style={ddnStyles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={ddnStyles.ddnName} numberOfLines={1}>{ddn.name}</Text>
                    <Text style={ddnStyles.createdBy} numberOfLines={1}>by {ddn.created_by}</Text>
                </View>
                <DDNStateBadge state={ddn.workflow_state} />
            </View>

            <View style={ddnStyles.divider} />

            {/* Info grid: Invoice · Date · Remarks */}
            <View style={ddnStyles.infoGrid}>
                {/* Invoice No */}
                <View style={ddnStyles.infoCell}>
                    <View style={ddnStyles.infoIconRow}>
                        <FileText size={11} color={C.accent} />
                        <Text style={ddnStyles.infoLabel}>Invoice No.</Text>
                    </View>
                    <Text style={ddnStyles.infoValue} numberOfLines={1}>
                        {ddn.invoice_no || '—'}
                    </Text>
                </View>

                {/* Date */}
                <View style={ddnStyles.infoCell}>
                    <View style={ddnStyles.infoIconRow}>
                        <Calendar size={11} color={C.accent} />
                        <Text style={ddnStyles.infoLabel}>Date</Text>
                    </View>
                    <Text style={ddnStyles.infoValue}>
                        {ddn.date ? moment(ddn.date).format('DD MMM YYYY') : '—'}
                    </Text>
                </View>

                {/* Remarks */}
                <View style={[ddnStyles.infoCell, { flex: 1.4 }]}>
                    <View style={ddnStyles.infoIconRow}>
                        <MessageSquare size={11} color={C.textMuted} />
                        <Text style={ddnStyles.infoLabel}>Remarks</Text>
                    </View>
                    <Text style={[ddnStyles.infoValue, { color: C.textMuted }]} numberOfLines={1}>
                        {ddn.remarks
                            ? (REMARKS_OPTIONS.find(r => r.value === ddn.remarks)?.label ?? ddn.remarks)
                            : '—'}
                    </Text>
                </View>
            </View>

            {/* Bottom row: qty fulfillment + grand total */}
            <View style={ddnStyles.footerRow}>
                {/* Qty bar */}
                <View style={{ flex: 1, gap: 4 }}>
                    <View style={ddnStyles.qtyLabelRow}>
                        <TrendingDown size={11} color={C.textMuted} />
                        <Text style={ddnStyles.qtyLabel}>
                            {ddn.del_qty} / {ddn.ord_qty} qty delivered
                        </Text>
                        <Text style={ddnStyles.qtyPct}>{fulfilledPct}%</Text>
                    </View>
                    <View style={ddnStyles.progressTrack}>
                        <View style={[ddnStyles.progressFill, { width: `${fulfilledPct}%` }]} />
                    </View>
                </View>

                {/* Grand total */}
                <View style={ddnStyles.totalBox}>
                    <Text style={ddnStyles.totalLabel}>Total</Text>
                    <Text style={ddnStyles.totalValue}>₹{ddn.grand_total?.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const PurchaseOrderDetailScreen = ({ route, navigation }: Props) => {
    const { order_id } = route.params;
    const { data, isLoading } = useGetPurchaseOrderByIdQuery(order_id, {
        skip: !order_id,
        refetchOnMountOrArgChange: true,
    });
    console.log("🚀 ~ PurchaseOrderDetailScreen ~ data:", data)
    const [approveDDN, { isLoading: isApproving }] = useApproveAndCreateDDNMutation();

    const [modalVisible, setModalVisible] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
    const [remarks, setRemarks] = useState('');
    const [remarksSearch, setRemarksSearch] = useState('');

    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [deliveryQtys, setDeliveryQtys] = useState<Record<string, string>>({});

    const orderData = data?.message?.data;
    const details = orderData?.order_details;
    const items = orderData?.items || [];
    const linkedDDNs: LinkedDDN[] = orderData?.linked_ddns || [];

    // ─── Derived ──────────────────────────────────────────────────────────────

    const grandTotal = items.reduce((acc: number, item: any) => {
        const isChecked = checkedItems[item.item_code] !== false;
        if (!isChecked) return acc;
        const qty = parseFloat(deliveryQtys[item.item_code] ?? String(item.qty)) || 0;
        return acc + qty * (item.rate || 0);
    }, 0);

    const selectedCount = items.filter(
        (item: any) => checkedItems[item.item_code] !== false
    ).length;

    const isItemChecked = (item_code: string) => checkedItems[item_code] !== false;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const toggleItem = (item_code: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [item_code]: !(prev[item_code] !== false),
        }));
    };

    const setQty = (item_code: string, val: string, maxQty: number) => {
        const num = parseFloat(val);
        if (num > maxQty) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Quantity',
                text2: `Cannot exceed ordered qty (${maxQty})`,
            });
            setDeliveryQtys(prev => ({ ...prev, [item_code]: String(maxQty) }));
        } else {
            setDeliveryQtys(prev => ({ ...prev, [item_code]: val }));
        }
    };

    const handleApprove = async () => {
        if (!invoiceNo.trim()) {
            Toast.show({ type: 'error', text1: 'Required', text2: 'Enter an Invoice Number' });
            return;
        }
        if (!date) {
            Toast.show({ type: 'error', text1: 'Required', text2: 'Select a delivery date' });
            return;
        }

        const delivered_items = items
            .filter((item: any) => isItemChecked(item.item_code))
            .map((item: any) => ({
                item_code: item.item_code,
                del_qty: deliveryQtys[item.item_code]
                    ? parseFloat(deliveryQtys[item.item_code])
                    : item.qty,
            }));

        try {
            const res = await approveDDN({
                purchase_order_id: order_id,
                invoice_no: invoiceNo,
                date,
                remarks,
                delivered_items,
            }).unwrap();

            if (res?.message?.success === false) {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Denied',
                    text2: res?.message?.message || "You don't have permission to approve",
                });
                return;
            }

            Toast.show({ type: 'success', text1: 'Order Approved', text2: 'DDN created successfully!' });
            setModalVisible(false);
            navigation.navigate('DeliveryNotesScreen');
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Action Failed',
                text2: err?.data?.message || 'Failed to approve order',
            });
        }
    };

    // ─── Loading / Empty ──────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={C.accent} />
            </View>
        );
    }

    if (!orderData) {
        return (
            <View style={styles.center}>
                <Text>Order not found</Text>
            </View>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.container}>
            <PageHeader title='Order Details' navigation={() => navigation.goBack()} type='distributor' />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ── Top Row: Status + Participants ── */}
                <View style={styles.topRow}>
                    <View style={[styles.card, { flex: 1.5 }]}>
                        <Text style={styles.orderIdText} numberOfLines={2}>
                            {details?.order_id || order_id}
                        </Text>
                        <Text style={styles.dateText}>
                            {moment(details?.creation).format('DD MMM YY')}
                        </Text>
                        <Text style={styles.dateText} numberOfLines={1}>
                            {details?.created_by}
                        </Text>
                        <View style={{ marginTop: 2, width: '50%' }}>
                            <StatusBadge status={details?.workflow_state as string} />
                        </View>
                    </View>

                    <View style={[styles.card, { flex: 1 }]}>
                        <View style={styles.participantItem}>
                            <Text style={styles.detailLabel}>Supplier</Text>
                            <Text style={styles.detailValue} numberOfLines={2}>
                                {details?.supplier_name}
                            </Text>
                        </View>
                        <View style={[styles.participantItem, { marginTop: 10 }]}>
                            <Text style={styles.detailLabel}>Distributor</Text>
                            <Text style={styles.detailValue} numberOfLines={2}>
                                {details?.distributor_name}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Delivery Fields ── */}
                <View style={styles.section}>
                    <View style={styles.fieldRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Invoice No. *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="INV-0001"
                                placeholderTextColor={Colors.gray}
                                value={invoiceNo}
                                onChangeText={setInvoiceNo}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <ReusableDatePicker
                                label="Date *"
                                value={date}
                                onChange={setDate}
                                marginBottom={0}
                                labelStyle={styles.inputLabel}
                                inputStyle={styles.input}
                            />
                        </View>

                        <View style={{ flex: 1.5 }}>
                            <ReusableDropdown
                                label="Remarks"
                                field="value"
                                value={remarks}
                                data={REMARKS_OPTIONS}
                                onChange={(val: string) => setRemarks(val)}
                                searchText={remarksSearch}
                                setSearchText={setRemarksSearch}
                                marginBottom={0}
                                labelStyle={styles.inputLabel}
                                textSize={Size.xxs}
                                height={35}
                            />
                        </View>
                    </View>
                </View>

                {/* ── Linked DDNs ── */}
                {linkedDDNs.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <FileText size={16} color={C.accent} />
                            <Text style={styles.sectionTitle}>
                                Linked DDNs
                            </Text>
                            <View style={ddnStyles.countPill}>
                                <Text style={ddnStyles.countPillText}>{linkedDDNs.length}</Text>
                            </View>
                        </View>

                        <View style={{ gap: 10 }}>
                            {linkedDDNs.map((ddn) => (
                                <LinkedDDNCard key={ddn.name} ddn={ddn} />
                            ))}
                        </View>
                    </View>
                )}

                {/* ── Items Grid ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Package size={16} color={C.accent} />
                        <Text style={styles.sectionTitle}>
                            Items ({selectedCount}/{items.length} selected)
                        </Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            <View style={gridStyles.headerRow}>
                                <View style={{ width: COLUMN_WIDTHS.check }} />
                                <Text style={[gridStyles.headerCell, { width: COLUMN_WIDTHS.item }]}>Item</Text>
                                <Text style={[gridStyles.headerCell, { width: COLUMN_WIDTHS.ordered, textAlign: 'center' }]}>Ordered</Text>
                                <Text style={[gridStyles.headerCell, { width: COLUMN_WIDTHS.delQty, textAlign: 'center' }]}>Del. Qty</Text>
                                <Text style={[gridStyles.headerCell, { width: COLUMN_WIDTHS.amount, textAlign: 'right' }]}>Amount</Text>
                            </View>

                            {items.map((item: any, index: number) => {
                                const checked = isItemChecked(item.item_code);
                                const rowQty = deliveryQtys[item.item_code] ?? String(item.qty);
                                const amount = checked
                                    ? (parseFloat(rowQty) || 0) * (item.rate || 0)
                                    : 0;

                                return (
                                    <View
                                        key={item.item_code}
                                        style={[
                                            gridStyles.row,
                                            index % 2 === 0 ? gridStyles.evenRow : gridStyles.oddRow,
                                            checked && gridStyles.checkedRow,
                                        ]}
                                    >
                                        <TouchableOpacity
                                            style={[gridStyles.cell, { width: COLUMN_WIDTHS.check }]}
                                            onPress={() => toggleItem(item.item_code)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[gridStyles.checkbox, checked && gridStyles.checkboxChecked]}>
                                                {checked && <Text style={gridStyles.checkmark}>✓</Text>}
                                            </View>
                                        </TouchableOpacity>

                                        <View style={[gridStyles.cell, { width: COLUMN_WIDTHS.item }]}>
                                            <Text style={gridStyles.itemName} numberOfLines={2}>
                                                {item.item_name}
                                            </Text>
                                        </View>

                                        <View style={[gridStyles.cell, { width: COLUMN_WIDTHS.ordered, alignItems: 'center' }]}>
                                            <Text style={gridStyles.orderedQty}>{item.qty}</Text>
                                        </View>

                                        <View style={[gridStyles.cell, { width: COLUMN_WIDTHS.delQty, alignItems: 'center' }]}>
                                            {checked ? (
                                                <TextInput
                                                    style={gridStyles.qtyInput}
                                                    keyboardType="numeric"
                                                    value={rowQty}
                                                    onChangeText={v => setQty(item.item_code, v, item.qty)}
                                                    placeholderTextColor={C.textMuted}
                                                    selectTextOnFocus
                                                />
                                            ) : (
                                                <Text style={gridStyles.qtyDash}>—</Text>
                                            )}
                                        </View>

                                        <View style={[gridStyles.cell, { width: COLUMN_WIDTHS.amount, alignItems: 'flex-end' }]}>
                                            <Text style={[gridStyles.amount, !checked && { color: C.textMuted }]}>
                                                {checked ? `₹${amount.toLocaleString()}` : '—'}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>

                    <View style={gridStyles.totalRow}>
                        <View style={gridStyles.totalCol}>
                            <Text style={gridStyles.totalSubLabel}>Ordered Total</Text>
                            <Text style={gridStyles.totalValue}>
                                ₹{items.reduce((acc: number, item: any) => acc + item.qty * (item.rate || 0), 0).toLocaleString()}
                            </Text>
                        </View>
                        <View style={gridStyles.totalDivider} />
                        <View style={[gridStyles.totalCol, { alignItems: 'flex-end' }]}>
                            <Text style={gridStyles.totalSubLabel}>Delivery Total</Text>
                            <Text style={[gridStyles.totalValue, { color: '#16A34A' }]}>
                                ₹{grandTotal.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.approveBtn,
                        details?.workflow_state === 'Delivered' && { opacity: 0.5 },
                    ]}
                    disabled={details?.workflow_state === 'Delivered' || isApproving}
                    onPress={() => {
                        if (!invoiceNo.trim()) {
                            Toast.show({ type: 'error', text1: 'Required', text2: 'Enter an Invoice Number' });
                            return;
                        }
                        if (!date.trim()) {
                            Toast.show({ type: 'error', text1: 'Required', text2: 'Select a delivery date' });
                            return;
                        }
                        setModalVisible(true);
                    }}
                >
                    {isApproving
                        ? <ActivityIndicator color={C.white} />
                        : <>
                            <CheckCircle2 size={20} color={C.white} />
                            <Text style={styles.approveBtnText}>Approve Order</Text>
                        </>
                    }
                </TouchableOpacity>
            </View>

            {/* ── Confirmation Modal ── */}
            <Modal visible={modalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <View style={styles.confirmIconRow}>
                            <CheckCircle2 size={32} color="#16A34A" />
                        </View>
                        <Text style={styles.confirmTitle}>Confirm Approval</Text>
                        <Text style={styles.confirmSubtitle}>
                            Please review before submitting
                        </Text>

                        <View style={styles.confirmDivider} />

                        <View style={styles.confirmRow}>
                            <Text style={styles.confirmLabel}>Invoice No.</Text>
                            <Text style={styles.confirmValue}>{invoiceNo}</Text>
                        </View>
                        <View style={styles.confirmRow}>
                            <Text style={styles.confirmLabel}>Date</Text>
                            <Text style={styles.confirmValue}>{date}</Text>
                        </View>
                        {remarks ? (
                            <View style={styles.confirmRow}>
                                <Text style={styles.confirmLabel}>Remarks</Text>
                                <Text style={styles.confirmValue}>
                                    {REMARKS_OPTIONS.find(r => r.value === remarks)?.label ?? remarks}
                                </Text>
                            </View>
                        ) : null}
                        <View style={styles.confirmRow}>
                            <Text style={styles.confirmLabel}>Items</Text>
                            <Text style={styles.confirmValue}>{selectedCount} item(s)</Text>
                        </View>
                        <View style={styles.confirmRow}>
                            <Text style={styles.confirmLabel}>Total</Text>
                            <Text style={[styles.confirmValue, { color: C.accent, fontWeight: '700' }]}>
                                ₹{grandTotal.toLocaleString()}
                            </Text>
                        </View>

                        <View style={styles.confirmDivider} />

                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={handleApprove}
                                disabled={isApproving}
                            >
                                {isApproving
                                    ? <ActivityIndicator color={C.white} size="small" />
                                    : <Text style={styles.confirmBtnText}>Approve</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default PurchaseOrderDetailScreen;

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 10, gap: 10 },
    topRow: { flexDirection: 'row', gap: 10 },
    card: { backgroundColor: C.white, borderRadius: 10, padding: 10 },
    orderIdText: { fontSize: 13, fontWeight: 'bold', color: C.text },
    dateText: { fontSize: 11, color: C.textMuted, marginTop: 2 },
    detailLabel: { fontSize: 10, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase' },
    detailValue: { fontSize: 12, color: C.text, fontWeight: '500', marginTop: 1 },
    participantItem: {},
    section: { backgroundColor: C.white, borderRadius: 10, padding: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: C.text },
    fieldRow: { flexDirection: 'row', gap: 8 },
    inputLabel: { fontSize: 11, fontWeight: '600', color: C.text, marginBottom: 0 },
    input: {
        backgroundColor: C.background,
        borderRadius: 8, padding: 8,
        fontSize: 12,
        borderWidth: 0.5, borderColor: C.border,
        color: C.text, height: 38,
    },
    footer: {
        padding: 12, backgroundColor: C.white,
        borderTopWidth: 0.5, borderTopColor: C.border,
    },
    approveBtn: {
        backgroundColor: C.accent, padding: 13, borderRadius: 10,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    },
    approveBtnText: { color: C.white, fontSize: 15, fontWeight: '600' },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center', alignItems: 'center',
    },
    confirmModal: {
        width: '88%', backgroundColor: C.white,
        borderRadius: 18, padding: 20,
        elevation: 10,
    },
    confirmIconRow: { alignItems: 'center', marginBottom: 8 },
    confirmTitle: { fontSize: 17, fontWeight: '700', color: C.text, textAlign: 'center' },
    confirmSubtitle: { fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 3 },
    confirmDivider: { height: 0.5, backgroundColor: C.border, marginVertical: 12 },
    confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    confirmLabel: { fontSize: 12, color: C.textMuted },
    confirmValue: { fontSize: 12, fontWeight: '600', color: C.text, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
    confirmActions: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: C.background, alignItems: 'center' },
    cancelText: { color: C.text, fontWeight: '600', fontSize: 13 },
    confirmBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: '#16A34A', alignItems: 'center' },
    confirmBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
    modalContent: { backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: C.border },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: C.text },
    modalScroll: { padding: 16 },
    summaryItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: C.border },
    summaryItemName: { fontSize: 12, color: C.text, flex: 1 },
    summaryItemQty: { fontSize: 12, color: C.accent, fontWeight: '600' },
    warningBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, gap: 8, marginBottom: 12 },
    warningText: { flex: 1, fontSize: 11, color: C.warning },
});

const gridStyles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 6,
        paddingVertical: 6,
        borderWidth: 0.5, borderColor: C.border,
    },
    headerCell: {
        fontSize: 10, fontWeight: '600',
        color: C.textMuted, paddingHorizontal: 4,
    },
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 6,
        borderLeftWidth: 0.5, borderRightWidth: 0.5,
        borderBottomWidth: 0.5, borderColor: C.border,
    },
    evenRow: { backgroundColor: C.white },
    oddRow: { backgroundColor: '#F9FAFB' },
    checkedRow: { backgroundColor: '#F0FDF4' },
    cell: { paddingHorizontal: 4, justifyContent: 'center' },
    checkbox: {
        width: 18, height: 18, borderRadius: 4,
        borderWidth: 1.5, borderColor: C.border,
        alignItems: 'center', justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: C.accent, borderColor: C.accent },
    checkmark: { color: '#fff', fontSize: 11, fontWeight: '700' },
    itemName: { fontSize: 11, fontWeight: '500', color: C.text, lineHeight: 15 },
    orderedQty: { fontSize: 12, color: C.text, fontWeight: '500' },
    qtyInput: {
        width: 50, height: 30,
        borderWidth: 0.5, borderColor: C.border,
        borderRadius: 6, textAlign: 'center',
        fontSize: 12, color: C.text,
        backgroundColor: C.white,
        padding: 0,
    },
    qtyDash: { fontSize: 12, color: C.textMuted },
    amount: { fontSize: 11, fontWeight: '600', color: C.accent },
    totalLabel: { fontSize: 13, fontWeight: 'bold', color: C.text },
    totalValue: { fontSize: 13, fontWeight: 'bold', color: C.accent },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 5,
        marginTop: 5,
        borderTopWidth: 0.5,
        borderTopColor: C.border,
    },
    totalCol: { flex: 1 },
    totalDivider: { width: 0.5, backgroundColor: C.border, marginVertical: 2 },
    totalSubLabel: { fontSize: 11, color: C.textMuted, marginBottom: 2 },
});

// ─── DDN Styles ───────────────────────────────────────────────────────────────
const ddnStyles = StyleSheet.create({
    countPill: {
        backgroundColor: C.accent,
        borderRadius: 99,
        paddingHorizontal: 7,
        paddingVertical: 1,
        marginLeft: 2,
    },
    countPillText: { fontSize: 10, color: C.white, fontWeight: '700' },

    card: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: '#FAFAFA',
        padding: 12,
        gap: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },
    ddnName: { fontSize: 12, fontWeight: '700', color: C.text },
    createdBy: { fontSize: 10, color: C.textMuted, marginTop: 1 },

    stateBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 99,
    },
    stateBadgeText: { fontSize: 10, fontWeight: '700' },

    divider: { height: 0.5, backgroundColor: C.border },

    // Info grid: Invoice · Date · Remarks in a row
    infoGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    infoCell: {
        flex: 1,
        gap: 3,
    },
    infoIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: '600',
        color: C.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '600',
        color: C.text,
    },

    // Footer: qty bar + total
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    qtyLabel: { fontSize: 11, color: C.textMuted, flex: 1 },
    qtyPct: { fontSize: 11, fontWeight: '700', color: C.accent },
    progressTrack: {
        height: 4,
        backgroundColor: C.border,
        borderRadius: 99,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: C.accent,
        borderRadius: 99,
    },
    totalBox: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    totalLabel: { fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
    totalValue: { fontSize: 13, fontWeight: '800', color: C.success },
});

const badgeStyles = StyleSheet.create({
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, height: 22, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 10, fontWeight: '700' },
});