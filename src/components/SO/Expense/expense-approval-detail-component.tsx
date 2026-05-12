import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Modal,
    TextInput,
    Image,
    Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import {
    useGetClaimDetailQuery,
    useApproveClaimMutation,
    useRejectClaimMutation,
} from '../../../features/tada/tadaApiv2';
import { Expense } from '../../../types/tadaType';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ExpenseApprovalDetailComponentProps {
    claimId: string;
    navigation: any;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    string,
    { bg: string; color: string; dot: string; border: string }
> = {
    Submitted: {
        bg: '#fffbeb',
        color: '#d97706',
        dot: '#fbbf24',
        border: '#fde68a',
    },
    'Pending Approval': {
        bg: '#eff6ff',
        color: '#2563eb',
        dot: '#60a5fa',
        border: '#bfdbfe',
    },
    Approved: {
        bg: '#f0fdf4',
        color: '#16a34a',
        dot: '#22c55e',
        border: '#bbf7d0',
    },
    Rejected: {
        bg: '#fff1f2',
        color: '#dc2626',
        dot: '#f87171',
        border: '#fecaca',
    },
    Draft: { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8', border: '#e2e8f0' },
};

const EXPENSE_ICONS: Record<string, string> = {
    'Daily Allowance': 'sunny-outline',
    'TA – Auto': 'car-outline',
    'TA – Cab': 'car-sport-outline',
    'TA – Bus': 'bus-outline',
    'TA – Rail': 'train-outline',
    'TA – Bike (Petrol)': 'bicycle-outline',
    'TA – Local Travel': 'navigate-outline',
    'Lodging / Boarding / Hotel': 'bed-outline',
    'Food / Meals': 'restaurant-outline',
    'Mobile Bill': 'phone-portrait-outline',
    Courier: 'cube-outline',
    Xerox: 'copy-outline',
};

const getStatusCfg = (s: string) =>
    STATUS_CONFIG[s] ?? {
        bg: '#f1f5f9',
        color: '#64748b',
        dot: '#94a3b8',
        border: '#e2e8f0',
    };

// ─── Sub-components ────────────────────────────────────────────────────────

const InfoRow = ({
    label,
    value,
    valueColor,
    bold,
}: {
    label: string;
    value: string;
    valueColor?: string;
    bold?: boolean;
}) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text
            style={[
                styles.infoValue,
                valueColor ? { color: valueColor } : null,
                bold ? { fontFamily: Fonts.bold } : null,
            ]}>
            {value || 'N/A'}
        </Text>
    </View>
);

const SectionCard = ({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
}) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
                <Ionicons name={icon} size={14} color={Colors.darkButton} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const ExpenseRowCard = ({ item }: { item: Expense }) => {
    const iconName =
        EXPENSE_ICONS[item.expense_type] ?? 'receipt-outline';
    const diff = item.sanctioned_amount - item.amount;
    const isReduced = diff < 0;

    return (
        <View style={styles.expenseCard}>
            {/* Left icon */}
            <View style={styles.expenseIconWrap}>
                <Ionicons name={iconName} size={18} color={Colors.darkButton} />
            </View>

            {/* Center info */}
            <View style={styles.expenseInfo}>
                <Text style={styles.expenseType}>{item.expense_type}</Text>
                <Text style={styles.expenseDate}>
                    {moment(item.date).format('DD MMM YYYY')}
                </Text>
                {item.description ? (
                    <Text style={styles.expenseDesc} numberOfLines={1}>
                        {item.description}
                    </Text>
                ) : null}
                {item.ta_mode ? (
                    <Text style={styles.expenseDesc}>{item.ta_mode}</Text>
                ) : null}
            </View>

            {/* Right amounts */}
            <View style={styles.expenseAmounts}>
                <Text style={styles.claimedAmt}>₹{item.amount.toLocaleString('en-IN')}</Text>
                <Text
                    style={[
                        styles.sanctionedAmt,
                        isReduced ? { color: '#dc2626' } : { color: '#16a34a' },
                    ]}>
                    ₹{item.sanctioned_amount.toLocaleString('en-IN')}
                </Text>
                {item.receipt_url ? (
                    <TouchableOpacity
                        onPress={() => item.receipt_url && Linking.openURL(item.receipt_url)}
                        style={styles.receiptBtn}>
                        <Ionicons name="attach-outline" size={12} color="#2563eb" />
                        <Text style={styles.receiptText}>Receipt</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────

const ExpenseApprovalDetailComponent = ({
    claimId,
    navigation,
}: ExpenseApprovalDetailComponentProps) => {
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const { data, isLoading } = useGetClaimDetailQuery({ claim_id: claimId });
    const [approveClaim, { isLoading: approveLoading }] = useApproveClaimMutation();
    const [rejectClaim, { isLoading: rejectLoading }] = useRejectClaimMutation();

    const claim = data?.message?.data;
    console.log("🚀 ~ ExpenseApprovalDetailComponent ~ claim:", claim)

    // ── Handlers ──────────────────────────────────────────────────────────

    const handleApprove = () => {
        Alert.alert(
            'Confirm Approval',
            'Are you sure you want to approve this expense claim?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            await approveClaim({ claim_id: claimId }).unwrap();
                            Alert.alert('Success', 'Expense claim approved successfully', [
                                { text: 'OK', onPress: () => navigation.goBack() },
                            ]);
                        } catch (error: any) {
                            Alert.alert(
                                'Error',
                                error?.data?.message || 'Failed to approve claim',
                            );
                        }
                    },
                },
            ],
        );
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            Alert.alert('Required', 'Please enter a reason for rejection');
            return;
        }
        Alert.alert(
            'Confirm Rejection',
            'Are you sure you want to reject this expense claim?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rejectClaim({
                                claim_id: claimId,
                                reason: rejectReason,
                            }).unwrap();
                            Alert.alert('Success', 'Expense claim rejected successfully', [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        setRejectModalVisible(false);
                                        setRejectReason('');
                                        navigation.goBack();
                                    },
                                },
                            ]);
                        } catch (error: any) {
                            Alert.alert(
                                'Error',
                                error?.data?.message || 'Failed to reject claim',
                            );
                        }
                    },
                },
            ],
        );
    };

    // ── Loading / Empty ───────────────────────────────────────────────────

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.darkButton} />
            </View>
        );
    }

    if (!claim) {
        return (
            <View style={styles.centered}>
                <Ionicons name="document-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Claim not found</Text>
                <Text style={styles.emptySub}>
                    This claim may have been deleted or you don't have permission.
                </Text>
            </View>
        );
    }

    const st = getStatusCfg(claim.approval_status);
    const canAct = claim.approval_status === 'Draft';

    const sanctionedTotal = claim.expenses?.reduce(
        (sum, e) => sum + e.sanctioned_amount,
        0,
    ) ?? claim.total_sanctioned_amount;

    return (
        <>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}>

                {/* ── Header Card ─────────────────────────────────────────── */}
                <View style={styles.headerCard}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.claimId}>#{claim.claim_id}</Text>
                            <Text style={styles.headerDate}>
                                {moment(claim.posting_date).format('DD MMMM YYYY')}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: st.bg, borderColor: st.border },
                            ]}>
                            <View style={[styles.dot, { backgroundColor: st.dot }]} />
                            <Text style={[styles.statusText, { color: st.color }]}>
                                {claim.approval_status}
                            </Text>
                        </View>
                    </View>

                    {/* Amount summary strip */}
                    <View style={styles.amountStrip}>
                        <View style={styles.amountItem}>
                            <Text style={styles.amountItemLabel}>Claimed</Text>
                            <Text style={styles.amountItemValue}>
                                ₹{claim.total_claimed_amount.toLocaleString('en-IN')}
                            </Text>
                        </View>
                        <View style={styles.amountDivider} />
                        <View style={styles.amountItem}>
                            <Text style={styles.amountItemLabel}>Sanctioned</Text>
                            <Text style={[styles.amountItemValue, { color: '#16a34a' }]}>
                                ₹{sanctionedTotal.toLocaleString('en-IN')}
                            </Text>
                        </View>
                        {claim.total_claimed_amount !== sanctionedTotal && (
                            <>
                                <View style={styles.amountDivider} />
                                <View style={styles.amountItem}>
                                    <Text style={styles.amountItemLabel}>Difference</Text>
                                    <Text style={[styles.amountItemValue, { color: '#dc2626' }]}>
                                        ₹
                                        {Math.abs(
                                            claim.total_claimed_amount - sanctionedTotal,
                                        ).toLocaleString('en-IN')}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* ── Employee Info ────────────────────────────────────────── */}
                <SectionCard title="Employee Information" icon="person-outline">
                    <InfoRow label="Employee" value={claim.employee_name || claim.employee} />
                    <InfoRow label="Employee ID" value={claim.employee} />
                    <InfoRow
                        label="Approver"
                        value={claim.expense_approver || 'N/A'}
                    />
                    {claim.authorized_approver_name && (
                        <InfoRow
                            label="Authorized Approver"
                            value={claim.authorized_approver_name}
                        />
                    )}
                </SectionCard>

                {/* ── Travel Details ───────────────────────────────────────── */}
                <SectionCard title="Travel Details" icon="map-outline">
                    <InfoRow
                        label="Travel Type"
                        value={claim.travel_type || 'N/A'}
                    />
                    <InfoRow
                        label="From"
                        value={claim.from_city || 'N/A'}
                    />
                    <InfoRow
                        label="To"
                        value={claim.to_city || 'N/A'}
                    />
                    {claim.distance_km ? (
                        <InfoRow
                            label="Distance"
                            value={`${claim.distance_km} km`}
                        />
                    ) : null}
                    <InfoRow
                        label="Travel Start"
                        value={
                            claim.travel_start_date
                                ? moment(claim.travel_start_date).format('DD MMM YYYY')
                                : 'N/A'
                        }
                    />
                    <InfoRow
                        label="Travel End"
                        value={
                            claim.travel_end_date
                                ? moment(claim.travel_end_date).format('DD MMM YYYY')
                                : 'N/A'
                        }
                    />
                    <InfoRow
                        label="City Class"
                        value={claim.city_class || 'N/A'}
                    />
                    <InfoRow
                        label="Stay Type"
                        value={claim.is_self_arranged_stay ? 'Self Arranged' : 'Hotel'}
                    />
                    {claim.pjp_store_id ? (
                        <InfoRow label="Store / PJP" value={claim.pjp_store_id} />
                    ) : null}
                </SectionCard>

                {/* ── Expense Rows ─────────────────────────────────────────── */}
                {claim.expenses && claim.expenses.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconWrap}>
                                <Ionicons name="receipt-outline" size={14} color={Colors.darkButton} />
                            </View>
                            <Text style={styles.sectionTitle}>
                                Expense Rows ({claim.expenses.length})
                            </Text>
                        </View>

                        {/* Column header */}
                        <View style={styles.expenseColHeader}>
                            <Text style={[styles.expenseColLabel, { flex: 1 }]}>Item</Text>
                            <Text style={styles.expenseColLabel}>Claimed</Text>
                            <Text style={styles.expenseColLabel}>Sanctioned</Text>
                        </View>

                        {claim.expenses.map((exp, idx) => (
                            <ExpenseRowCard key={exp.row_id || idx} item={exp} />
                        ))}

                        {/* Totals row */}
                        <View style={styles.expenseTotals}>
                            <Text style={styles.expenseTotalLabel}>Total</Text>
                            <Text style={styles.expenseTotalClaimed}>
                                ₹{claim.total_claimed_amount.toLocaleString('en-IN')}
                            </Text>
                            <Text style={styles.expenseTotalSanctioned}>
                                ₹{sanctionedTotal.toLocaleString('en-IN')}
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Attachments ──────────────────────────────────────────── */}
                {claim.attachments && claim.attachments.length > 0 && (
                    <SectionCard
                        title={`Attachments (${claim.attachments.length})`}
                        icon="attach-outline">
                        <View style={styles.attachmentsWrap}>
                            {claim.attachments.map((url, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.attachmentChip}
                                    onPress={() => Linking.openURL(url)}>
                                    <Ionicons name="document-outline" size={14} color="#2563eb" />
                                    <Text style={styles.attachmentText} numberOfLines={1}>
                                        Attachment {idx + 1}
                                    </Text>
                                    <Ionicons
                                        name="open-outline"
                                        size={12}
                                        color="#2563eb"
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </SectionCard>
                )}

                {/* ── Action Buttons ───────────────────────────────────────── */}
                {canAct && (
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.approveBtn]}
                            onPress={handleApprove}
                            disabled={approveLoading}>
                            {approveLoading ? (
                                <ActivityIndicator color={Colors.white} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                                    <Text style={styles.approveBtnText}>Approve Claim</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => setRejectModalVisible(true)}
                            disabled={rejectLoading}>
                            {rejectLoading ? (
                                <ActivityIndicator color="#dc2626" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="close-circle" size={20} color="#dc2626" />
                                    <Text style={styles.rejectBtnText}>Reject Claim</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* ── Reject Modal ──────────────────────────────────────────── */}
            <Modal
                visible={rejectModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setRejectModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalDragHandle} />

                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconWrap}>
                                <Ionicons name="close-circle" size={22} color="#dc2626" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>Reject Expense Claim</Text>
                                <Text style={styles.modalSubtitle}>#{claimId}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                                <Ionicons name="close" size={22} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalDesc}>
                            Please provide a reason for rejecting this expense claim. This
                            reason will be recorded as an audit comment and sent to the
                            employee.
                        </Text>

                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Enter reason for rejection..."
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            placeholderTextColor="#94a3b8"
                            textAlignVertical="top"
                        />

                        <Text style={styles.charCount}>{rejectReason.length} / 500</Text>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setRejectModalVisible(false);
                                    setRejectReason('');
                                }}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.confirmRejectBtn,
                                    !rejectReason.trim() && styles.disabledBtn,
                                ]}
                                onPress={handleReject}
                                disabled={rejectLoading || !rejectReason.trim()}>
                                {rejectLoading ? (
                                    <ActivityIndicator color={Colors.white} size="small" />
                                ) : (
                                    <Text style={styles.confirmRejectBtnText}>
                                        Confirm Rejection
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default ExpenseApprovalDetailComponent;

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        padding: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        padding: 24,
    },
    emptyTitle: {
        fontFamily: Fonts.bold,
        fontSize: Size.md,
        color: Colors.darkButton,
    },
    emptySub: {
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: '#64748b',
        textAlign: 'center',
    },

    // ── Header Card ──
    headerCard: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    headerLeft: { flex: 1 },
    claimId: {
        fontFamily: Fonts.bold,
        fontSize: Size.md,
        color: Colors.darkButton,
        marginBottom: 2,
    },
    headerDate: {
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: '#64748b',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontFamily: Fonts.medium, fontSize: Size.xs },

    // Amount strip
    amountStrip: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    amountItem: { flex: 1, alignItems: 'center', gap: 2 },
    amountItemLabel: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#94a3b8',
    },
    amountItemValue: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: Colors.darkButton,
    },
    amountDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 2,
    },

    // ── Section ──
    section: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionIconWrap: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: Colors.darkButton,
    },

    // Info rows
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    infoLabel: {
        fontFamily: Fonts.medium,
        fontSize: Size.xs,
        color: '#94a3b8',
        flex: 0.45,
    },
    infoValue: {
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: Colors.darkButton,
        flex: 0.55,
        textAlign: 'right',
    },

    // Expense rows
    expenseColHeader: {
        flexDirection: 'row',
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        marginBottom: 6,
    },
    expenseColLabel: {
        fontFamily: Fonts.medium,
        fontSize: 10,
        color: '#94a3b8',
        width: 80,
        textAlign: 'right',
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 10,
    },
    expenseIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    expenseInfo: { flex: 1, gap: 2 },
    expenseType: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.xs,
        color: Colors.darkButton,
    },
    expenseDate: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#94a3b8',
    },
    expenseDesc: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#64748b',
    },
    expenseAmounts: {
        alignItems: 'flex-end',
        gap: 3,
        minWidth: 72,
    },
    claimedAmt: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: '#64748b',
        textDecorationLine: 'line-through',
    },
    sanctionedAmt: {
        fontFamily: Fonts.bold,
        fontSize: Size.xs,
    },
    receiptBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 2,
    },
    receiptText: {
        fontFamily: Fonts.medium,
        fontSize: 9,
        color: '#2563eb',
    },
    expenseTotals: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        marginTop: 4,
        borderTopWidth: 1.5,
        borderTopColor: '#e2e8f0',
    },
    expenseTotalLabel: {
        flex: 1,
        fontFamily: Fonts.bold,
        fontSize: Size.xs,
        color: Colors.darkButton,
    },
    expenseTotalClaimed: {
        width: 80,
        textAlign: 'right',
        fontFamily: Fonts.medium,
        fontSize: Size.xs,
        color: '#64748b',
        textDecorationLine: 'line-through',
    },
    expenseTotalSanctioned: {
        width: 80,
        textAlign: 'right',
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: '#16a34a',
    },

    // Attachments
    attachmentsWrap: { gap: 8 },
    attachmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    attachmentText: {
        fontFamily: Fonts.medium,
        fontSize: Size.xs,
        color: '#2563eb',
        flex: 1,
    },

    // Action buttons
    actionSection: { gap: 10, marginTop: 4 },
    actionBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    approveBtn: { backgroundColor: '#16a34a' },
    approveBtnText: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: Colors.white,
    },
    rejectBtn: {
        backgroundColor: '#fff1f2',
        borderWidth: 1.5,
        borderColor: '#fecaca',
    },
    rejectBtnText: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: '#dc2626',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingTop: 12,
    },
    modalDragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#e2e8f0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    modalIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#fff1f2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontFamily: Fonts.bold,
        fontSize: Size.md,
        color: Colors.darkButton,
    },
    modalSubtitle: {
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: '#94a3b8',
    },
    modalDesc: {
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 14,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontFamily: Fonts.regular,
        fontSize: Size.xs,
        color: Colors.darkButton,
        minHeight: 100,
        maxHeight: 140,
        backgroundColor: '#f8fafc',
    },
    charCount: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#94a3b8',
        textAlign: 'right',
        marginTop: 4,
        marginBottom: 16,
    },
    modalFooter: { flexDirection: 'row', gap: 10 },
    cancelBtn: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: Colors.darkButton,
    },
    confirmRejectBtn: {
        flex: 2,
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor: '#dc2626',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledBtn: { opacity: 0.45 },
    confirmRejectBtnText: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: Colors.white,
    },
});