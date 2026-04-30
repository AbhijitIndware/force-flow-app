import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Package, Truck, Receipt, Info, CheckCircle2 } from 'lucide-react-native';
import moment from 'moment';
import {
    useApproveAndCreateDDNMutation
} from '../../../features/base/distributor-api';
import { useGetPurchaseOrderByIdQuery } from '../../../features/base/base-api';
import { DistributorAppStackParamList } from '../../../types/Navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';
import { Colors } from '../../../utils/colors';
import Toast from 'react-native-toast-message';

// Helper for status colors
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        Pending: { bg: '#FEF3C7', text: '#92400E' },
        Approved: { bg: '#DCFCE7', text: '#1E40AF' },
        Delivered: { bg: '#8de58dff', text: ' #21974eff' },
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

type NavigationProp = NativeStackNavigationProp<
    DistributorAppStackParamList,
    'PurchaseOrderDetailScreen'
>;

type Props = {
    navigation: NavigationProp;
    route: any
};

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

const PurchaseOrderDetailScreen = ({ route, navigation }: Props) => {
    const { order_id } = route.params;
    const { data, isLoading } = useGetPurchaseOrderByIdQuery(order_id, { skip: !order_id, refetchOnMountOrArgChange: true });
    const [approveDDN, { isLoading: isApproving }] = useApproveAndCreateDDNMutation();

    const [modalVisible, setModalVisible] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [deliveryQtys, setDeliveryQtys] = useState<Record<string, string>>({});

    // Fix: Accessing the correct nested data structure
    const orderData = data?.message?.data;
    const details = orderData?.order_details; // Extracting order_details for easier access
    const items = orderData?.items || [];
    console.log("🚀 ~ PurchaseOrderDetailScreen ~ items:", items)

    const handleApprove = async () => {
        if (!invoiceNo) {
            Toast.show({
                type: 'error',
                text1: 'Required Field',
                text2: 'Please enter an Invoice Number',
            });
            return;
        }

        const delivered_items = items.map(item => ({
            item_code: item.item_code,
            del_qty: deliveryQtys[item.item_code]
                ? parseFloat(deliveryQtys[item.item_code])
                : item.qty,
        }));

        try {
            let payload = {
                purchase_order_id: order_id,
                invoice_no: invoiceNo,
                delivered_items,
            }
            console.log("🚀 ~ handleApprove ~ payload:", payload)
            const res = await approveDDN(payload).unwrap();
            console.log("🚀 ~ handleApprove ~ res:", res)

            // --- ADDED PERMISSION CHECKING HERE ---
            if (res?.message?.success === false) {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Denied',
                    text2: res?.message.message || "You don't have permission to Approve this order",
                });
                return; // Stop execution
            }

            // 1. Show Success Toast
            Toast.show({
                type: 'success',
                text1: 'Order Approved',
                text2: 'DDN created successfully! 🚚',
            });

            // 2. Close Modal
            setModalVisible(false);

            // 3. Navigate
            navigation.navigate('DeliveryNotesScreen');

        } catch (err: any) {
            // Handle actual HTTP errors (403, 500, etc.)
            const errorMessage = err?.data?.message || 'Failed to approve order';

            Toast.show({
                type: 'error',
                text1: 'Action Failed',
                text2: errorMessage,
            });
        }
    };

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 1. Primary Status Card */}
                <View style={styles.statusCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.orderIdText}>{details?.order_id || order_id}</Text>
                        <Text style={styles.dateText}>
                            Created: {moment(details?.creation).format('DD MMM YYYY, hh:mm A')}
                        </Text>
                        <Text style={styles.dateText}>
                            Created By: {details?.created_by}
                        </Text>
                    </View>
                    <View style={styles.statusCol}>
                        <StatusBadge status={details?.workflow_state as string} />
                        {/* <Text style={styles.workflowText}>{details?.workflow_state}</Text> */}
                    </View>
                </View>

                {/* 2. Parties Involved Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Info size={18} color={C.accent} />
                        <Text style={styles.sectionTitle}>Order Participants</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailLabel}>Supplier</Text>
                            <Text style={styles.detailValue}>{details?.supplier_name}</Text>
                            {/* <Text style={styles.detailSub}>{details?.supplier}</Text> */}
                        </View>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailLabel}>Distributor</Text>
                            <Text style={styles.detailValue}>{details?.distributor_name}</Text>
                            {/* <Text style={styles.detailSub}>{details?.distributor}</Text> */}
                        </View>
                    </View>
                </View>

                {/* Items Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Package size={18} color={C.accent} />
                        <Text style={styles.sectionTitle}>Items ({items.length})</Text>
                    </View>
                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.item_name}</Text>
                                <Text style={styles.itemSub}>{item.item_code} • {item.uom}</Text>
                            </View>
                            <View style={styles.itemPricing}>
                                <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                                <Text style={styles.itemRate}>₹{item.rate?.toLocaleString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Summary Table */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryRow, styles.grandTotalRow]}>
                        <Text style={styles.grandTotalLabel}>Grand Total</Text>
                        <Text style={styles.grandTotalValue}>₹{orderData?.totals?.grand_total?.toLocaleString()}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Button */}
            {/* {details?.workflow_state === 'Pending' && ( */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.approveBtn,
                        details?.workflow_state === 'Delivered' && { opacity: 0.5 } // Dims if NOT pending
                    ]}
                    disabled={details?.workflow_state === 'Delivered'} // Disables if NOT pending
                    onPress={() => setModalVisible(true)}
                >
                    <CheckCircle2 size={20} color={C.white} />
                    <Text style={styles.approveBtnText}>Approve Order</Text>
                </TouchableOpacity>
            </View>
            {/* )} */}

            {/* Approval Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Delivery Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={C.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.warningBox}>
                            <Info size={16} color={C.warning} />
                            <Text style={styles.warningText}>
                                Note: Leaving delivery quantity empty will mark the item as fully delivered.
                            </Text>
                        </View>
                        <ScrollView style={styles.modalScroll}>

                            <Text style={styles.inputLabel}>Invoice Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Invoice No."
                                placeholderTextColor={Colors.gray}
                                value={invoiceNo}
                                onChangeText={setInvoiceNo}
                            />

                            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Delivery Quantities</Text>
                            {items.map((item) => (
                                <View key={item.item_code} style={styles.qtyInputRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.qtyItemName}>{item.item_name}</Text>
                                        <Text style={styles.qtyItemStock}>Ordered: {item.qty}</Text>
                                    </View>
                                    <TextInput
                                        style={[
                                            styles.qtyInput,
                                            // Optional: Add red border if user tries to exceed qty
                                            parseFloat(deliveryQtys[item.item_code]) > item.qty && { borderColor: 'red' }
                                        ]}
                                        keyboardType="numeric"
                                        placeholderTextColor={C.textMuted} // Ensure this matches your color constant
                                        placeholder={item.qty.toString()}
                                        value={deliveryQtys[item.item_code] || ''}
                                        onChangeText={(val) => {
                                            const numericVal = parseFloat(val);

                                            if (numericVal > item.qty) {
                                                // 1. Show a quick Toast warning
                                                Toast.show({
                                                    type: 'error',
                                                    text1: 'Invalid Quantity',
                                                    text2: `Cannot exceed ordered quantity (${item.qty})`,
                                                });

                                                // 2. Automatically reset to max allowed or keep previous valid
                                                setDeliveryQtys(prev => ({ ...prev, [item.item_code]: item.qty.toString() }));
                                            } else {
                                                // 3. Update normally if within limits
                                                setDeliveryQtys(prev => ({ ...prev, [item.item_code]: val }));
                                            }
                                        }}
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.approveBtn, { margin: 16 }]}
                            onPress={handleApprove}
                            disabled={isApproving}
                        >
                            {isApproving ? <ActivityIndicator color={C.white} /> : <Text style={styles.approveBtnText}>Confirm Delivery</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
};

export default PurchaseOrderDetailScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: C.white,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: C.text },
    scrollContent: { padding: 16 },
    statusCard: {
        backgroundColor: C.white,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'center',
        marginBottom: 16,
    },
    orderIdText: { fontSize: 16, fontWeight: 'bold', color: C.text },
    dateText: { fontSize: 13, color: C.textMuted, marginTop: 4 },
    badge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { color: '#1E40AF', fontSize: 12, fontWeight: '700' },
    section: { backgroundColor: C.white, borderRadius: 12, padding: 16, marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: C.text },
    itemRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '500', color: C.text },
    itemSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
    itemPricing: { alignItems: 'flex-end' },
    itemQty: { fontSize: 13, fontWeight: '600', color: C.text },
    itemRate: { fontSize: 13, color: C.accent, marginTop: 2 },
    summaryContainer: { backgroundColor: C.white, borderRadius: 12, padding: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    summaryLabel: { color: C.textMuted, fontSize: 14 },
    summaryValue: { color: C.text, fontSize: 14, fontWeight: '500' },
    grandTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
    grandTotalLabel: { fontSize: 16, fontWeight: 'bold', color: C.text },
    grandTotalValue: { fontSize: 16, fontWeight: 'bold', color: C.accent },
    footer: { padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
    approveBtn: { backgroundColor: C.accent, padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    approveBtnText: { color: C.white, fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', height: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },
    modalScroll: { padding: 20 },
    warningBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8, gap: 10, marginBottom: 10, marginHorizontal: 10 },
    warningText: { flex: 1, fontSize: 12, color: C.warning },
    inputLabel: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 8 },
    input: { backgroundColor: C.background, borderRadius: 8, padding: 12, fontSize: 14, borderWidth: 1, borderColor: C.border },
    qtyInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: C.border },
    qtyItemName: { fontSize: 13, fontWeight: '500', color: C.text },
    qtyItemStock: { fontSize: 11, color: C.textMuted },
    qtyInput: { width: 80, backgroundColor: C.background, borderRadius: 6, padding: 8, textAlign: 'center', borderWidth: 1, borderColor: C.border, color: Colors.black },

    statusCol: { alignItems: 'flex-start' },
    workflowText: { fontSize: 10, color: C.textMuted, marginTop: 4, textTransform: 'uppercase' },

    detailRow: { flexDirection: 'row', marginTop: 10, gap: 16 },
    detailCol: { flex: 1 },
    detailLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase' },
    detailValue: { fontSize: 14, color: C.text, fontWeight: '500', marginTop: 2 },
    detailSub: { fontSize: 12, color: C.textMuted },

    progressGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, backgroundColor: C.background, borderRadius: 8, padding: 12 },
    progressItem: { alignItems: 'center', flex: 1 },
    progressLabel: { fontSize: 10, color: C.textMuted, marginBottom: 4 },
    progressValue: { fontSize: 15, fontWeight: '700', color: C.text },

    termsText: { fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 18 },

    systemInfo: { padding: 16, marginBottom: 100, alignItems: 'center' },
    systemText: { fontSize: 11, color: C.textMuted, marginBottom: 2 },
}); const badgeStyles = StyleSheet.create({
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    text: { fontSize: 10, fontWeight: '700' },
});