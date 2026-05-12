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
    Linking,
    Image,
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

export const imageBaseUrl = 'https://sfa.softsensbaby.in';

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

const EXPENSE_ICON_COLORS: Record<string, string> = {
    'Daily Allowance': '#F97316',
    'TA – Auto': '#3B82F6',
    'TA – Cab': '#6366F1',
    'TA – Bus': '#0EA5E9',
    'TA – Rail': '#8B5CF6',
    'TA – Bike (Petrol)': '#10B981',
    'TA – Local Travel': '#14B8A6',
    'Lodging / Boarding / Hotel': '#EC4899',
    'Food / Meals': '#EF4444',
    'Mobile Bill': '#F59E0B',
    Courier: '#64748B',
    Xerox: '#64748B',
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
    last,
}: {
    label: string;
    value: string;
    valueColor?: string;
    bold?: boolean;
    last?: boolean;
}) => (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
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
    iconColor,
    children,
    rightEl,
}: {
    title: string;
    icon: string;
    iconColor?: string;
    children: React.ReactNode;
    rightEl?: React.ReactNode;
}) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <View
                style={[
                    styles.sectionIconWrap,
                    iconColor ? { backgroundColor: iconColor + '18' } : null,
                ]}>
                <Ionicons
                    name={icon}
                    size={15}
                    color={iconColor || Colors.darkButton}
                />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
            {rightEl && <View style={styles.sectionRight}>{rightEl}</View>}
        </View>
        <View style={styles.sectionDivider} />
        {children}
    </View>
);

const ExpenseRowCard = ({
    item,
    last,
    onPreview,
}: {
    item: Expense;
    last?: boolean;
    onPreview?: (url: string, type: 'image' | 'pdf') => void;
}) => {
    const iconName = EXPENSE_ICONS[item.expense_type] ?? 'receipt-outline';
    const iconColor = EXPENSE_ICON_COLORS[item.expense_type] ?? '#64748B';
    const isReduced = item.sanctioned_amount < item.amount;
    const isEqual = item.sanctioned_amount === item.amount;

    const handleReceiptPress = () => {
        if (item.receipt_url) {
            // Check if it's a PDF or image
            const isPdf = item.receipt_url.toLowerCase().includes('.pdf');
            const fullUrl = item.receipt_url.startsWith('http')
                ? item.receipt_url
                : `${imageBaseUrl}${item.receipt_url}`;
            if (onPreview) {
                onPreview(fullUrl, isPdf ? 'pdf' : 'image');
            } else {
                Linking.openURL(fullUrl);
            }
        }
    };

    return (
        <View style={[styles.expenseCard, last && { borderBottomWidth: 0 }]}>
            <View
                style={[styles.expenseIconWrap, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name={iconName} size={17} color={iconColor} />
            </View>

            <View style={styles.expenseInfo}>
                <Text style={styles.expenseType} numberOfLines={1}>
                    {item.expense_type}
                </Text>
                <View style={styles.expenseMeta}>
                    <Ionicons name="calendar-outline" size={10} color="#94a3b8" />
                    <Text style={styles.expenseDate}>
                        {moment(item.date).format('DD MMM YYYY')}
                    </Text>
                    {item.ta_mode ? (
                        <>
                            <Text style={styles.metaDot}>·</Text>
                            <Text style={styles.expenseDate}>{item.ta_mode}</Text>
                        </>
                    ) : null}
                </View>
                {item.description ? (
                    <Text style={styles.expenseDesc} numberOfLines={1}>
                        {item.description}
                    </Text>
                ) : null}
                {item.receipt_url ? (
                    <TouchableOpacity
                        onPress={handleReceiptPress}
                        style={styles.receiptBtn}>
                        <Ionicons name="attach-outline" size={11} color="#2563eb" />
                        <Text style={styles.receiptText}>View Receipt</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.expenseAmounts}>
                {!isEqual && (
                    <Text style={styles.claimedAmt}>
                        ₹{item.amount.toLocaleString('en-IN')}
                    </Text>
                )}
                <View
                    style={[
                        styles.sanctionedChip,
                        {
                            backgroundColor: isReduced
                                ? '#fff1f2'
                                : isEqual
                                    ? '#f8fafc'
                                    : '#f0fdf4',
                        },
                    ]}>
                    <Text
                        style={[
                            styles.sanctionedAmt,
                            {
                                color: isReduced
                                    ? '#dc2626'
                                    : isEqual
                                        ? Colors.darkButton
                                        : '#16a34a',
                            },
                        ]}>
                        ₹{item.sanctioned_amount.toLocaleString('en-IN')}
                    </Text>
                </View>
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
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState<'image' | 'pdf'>('image');
    const [imageLoading, setImageLoading] = useState(false);

    const { data, isLoading } = useGetClaimDetailQuery({ claim_id: claimId });
    const [approveClaim, { isLoading: approveLoading }] = useApproveClaimMutation();
    const [rejectClaim, { isLoading: rejectLoading }] = useRejectClaimMutation();

    const claim = data?.message?.data;
    console.log('🚀 ~ ExpenseApprovalDetailComponent ~ claim:', claim);

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
                <View style={styles.emptyIconWrap}>
                    <Ionicons name="document-outline" size={32} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>Claim not found</Text>
                <Text style={styles.emptySub}>
                    This claim may have been deleted or you don't have permission.
                </Text>
            </View>
        );
    }

    const st = getStatusCfg(claim.approval_status);
    const canAct = claim.approval_status === 'Draft';

    const sanctionedTotal =
        claim.expenses?.reduce((sum, e) => sum + e.sanctioned_amount, 0) ??
        claim.total_sanctioned_amount;

    const diff = Math.abs(claim.total_claimed_amount - sanctionedTotal);
    const hasDiff = claim.total_claimed_amount !== sanctionedTotal;

    return (
        <>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}>
                {/* ── Hero Header ────────────────────────────────────────── */}
                <View style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <View style={styles.heroLeft}>
                            <View style={styles.claimIdRow}>
                                <View style={styles.claimIdPill}>
                                    <Text style={styles.claimIdPillText}>CLAIM</Text>
                                </View>
                                <Text style={styles.claimId}>{claim.claim_id}</Text>
                            </View>
                            <Text style={styles.heroDate}>
                                {moment(claim.posting_date).format('dddd, DD MMMM YYYY')}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: st.bg, borderColor: st.border },
                            ]}>
                            <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                            <Text style={[styles.statusText, { color: st.color }]}>
                                {claim.approval_status}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.heroDivider} />

                    <View style={styles.amountRow}>
                        <View style={styles.amountTile}>
                            <Text style={styles.amountTileLabel}>Claimed</Text>
                            <Text style={styles.amountTileValue}>
                                ₹{claim.total_claimed_amount.toLocaleString('en-IN')}
                            </Text>
                        </View>

                        <View style={styles.amountArrow}>
                            <Ionicons name="arrow-forward" size={14} color="#CBD5E1" />
                        </View>

                        <View style={[styles.amountTile, styles.amountTileCenter]}>
                            <Text style={styles.amountTileLabel}>Sanctioned</Text>
                            <Text style={[styles.amountTileValue, { color: '#16a34a' }]}>
                                ₹{sanctionedTotal.toLocaleString('en-IN')}
                            </Text>
                        </View>

                        {hasDiff && (
                            <>
                                <View style={styles.amountArrow}>
                                    <Ionicons name="remove" size={14} color="#CBD5E1" />
                                </View>
                                <View style={styles.amountTile}>
                                    <Text style={styles.amountTileLabel}>Difference</Text>
                                    <Text style={[styles.amountTileValue, { color: '#dc2626' }]}>
                                        ₹{diff.toLocaleString('en-IN')}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* ── Employee Information ─────────────────────────────── */}
                <SectionCard
                    title="Employee Information"
                    icon="person-circle-outline"
                    iconColor="#6366F1">
                    <InfoRow label="Name" value={claim.employee_name || claim.employee} />
                    <InfoRow label="Employee ID" value={claim.employee} />
                    <InfoRow label="Approver" value={claim.expense_approver || 'N/A'} />
                    <InfoRow
                        label="Auth. Approver"
                        value={claim.authorized_approver_name || 'N/A'}
                        last
                    />
                </SectionCard>

                {/* ── Travel Details ───────────────────────────────────── */}
                <SectionCard
                    title="Travel Details"
                    icon="map-outline"
                    iconColor="#0EA5E9">
                    <InfoRow label="Travel Type" value={claim.travel_type || 'N/A'} />
                    <InfoRow label="From" value={claim.from_city || 'N/A'} />
                    <InfoRow label="To" value={claim.to_city || 'N/A'} />
                    {claim.distance_km ? (
                        <InfoRow label="Distance" value={`${claim.distance_km} km`} />
                    ) : null}
                    <InfoRow
                        label="Start Date"
                        value={
                            claim.travel_start_date
                                ? moment(claim.travel_start_date).format('DD MMM YYYY')
                                : 'N/A'
                        }
                    />
                    <InfoRow
                        label="End Date"
                        value={
                            claim.travel_end_date
                                ? moment(claim.travel_end_date).format('DD MMM YYYY')
                                : 'N/A'
                        }
                    />
                    <InfoRow label="City Class" value={claim.city_class || 'N/A'} />
                    <InfoRow
                        label="Stay Type"
                        value={claim.is_self_arranged_stay ? 'Self Arranged' : 'Hotel'}
                    />
                    <InfoRow
                        label="Store / PJP"
                        value={claim.pjp_store_id || 'N/A'}
                        last
                    />
                </SectionCard>

                {/* ── Expense Items ─────────────────────────────────────── */}
                {claim.expenses && claim.expenses.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View
                                style={[
                                    styles.sectionIconWrap,
                                    { backgroundColor: '#F9731618' },
                                ]}>
                                <Ionicons name="receipt-outline" size={15} color="#F97316" />
                            </View>
                            <Text style={styles.sectionTitle}>Expense Items</Text>
                            <View style={styles.sectionRight}>
                                <View style={styles.countChip}>
                                    <Text style={styles.countChipText}>
                                        {claim.expenses.length} items
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.sectionDivider} />

                        <View style={styles.expenseColHeader}>
                            <Text
                                style={[styles.expenseColLabel, { flex: 1, textAlign: 'left' }]}>
                                Description
                            </Text>
                            <Text style={[styles.expenseColLabel, { marginRight: 8 }]}>
                                Claimed
                            </Text>
                            <Text style={styles.expenseColLabel}>Final</Text>
                        </View>

                        {claim.expenses.map((exp, idx) => (
                            <ExpenseRowCard
                                key={exp.row_id || idx}
                                item={exp}
                                last={idx === claim.expenses.length - 1}
                                onPreview={(url, type) => {
                                    setPreviewUrl(url);
                                    setPreviewType(type);
                                    setImageLoading(type === 'image');
                                    setPreviewModalVisible(true);
                                }}
                            />
                        ))}

                        <View style={styles.expenseTotals}>
                            <Text style={styles.expenseTotalLabel}>Grand Total</Text>
                            <Text style={styles.expenseTotalClaimed}>
                                ₹{claim.total_claimed_amount.toLocaleString('en-IN')}
                            </Text>
                            <View style={styles.expenseTotalFinalWrap}>
                                <Text style={styles.expenseTotalSanctioned}>
                                    ₹{sanctionedTotal.toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* ── Attachments ──────────────────────────────────────── */}
                {claim.attachments && claim.attachments.length > 0 && (
                    <SectionCard
                        title="Attachments"
                        icon="folder-open-outline"
                        iconColor="#8B5CF6"
                        rightEl={
                            <View style={styles.countChip}>
                                <Text style={styles.countChipText}>
                                    {claim.attachments.length} files
                                </Text>
                            </View>
                        }>
                        <View style={styles.attachmentsGrid}>
                            {claim.attachments.map((url, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.attachmentCard}
                                    onPress={() => {
                                        if (url) {
                                            // Check if it's a PDF or image
                                            const isPdf = url.toLowerCase().includes('.pdf');
                                            const fullUrl = url.startsWith('http')
                                                ? url
                                                : `${imageBaseUrl}${url}`;
                                            setPreviewUrl(fullUrl);
                                            setPreviewType(isPdf ? 'pdf' : 'image');
                                            setPreviewModalVisible(true);
                                        }
                                    }}
                                    activeOpacity={0.7}>
                                    <View style={styles.attachmentIconWrap}>
                                        <Ionicons name="document-text" size={20} color="#8B5CF6" />
                                    </View>
                                    <Text style={styles.attachmentName} numberOfLines={1}>
                                        File {idx + 1}
                                    </Text>
                                    <View style={styles.attachmentOpenBtn}>
                                        <Ionicons name="open-outline" size={11} color="#2563eb" />
                                        <Text style={styles.attachmentOpenText}>Open</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </SectionCard>
                )}

                {/* ── Action Buttons ───────────────────────────────────── */}
                {canAct && (
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={handleApprove}
                            disabled={approveLoading}
                            activeOpacity={0.85}>
                            {approveLoading ? (
                                <ActivityIndicator color={Colors.white} size="small" />
                            ) : (
                                <>
                                    <View style={styles.actionBtnIconWrap}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color={Colors.white}
                                        />
                                    </View>
                                    <Text style={styles.approveBtnText}>Approve Claim</Text>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color="rgba(255,255,255,0.5)"
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => setRejectModalVisible(true)}
                            disabled={rejectLoading}
                            activeOpacity={0.85}>
                            {rejectLoading ? (
                                <ActivityIndicator color="#dc2626" size="small" />
                            ) : (
                                <>
                                    <View style={styles.rejectBtnIconWrap}>
                                        <Ionicons name="close-circle" size={20} color="#dc2626" />
                                    </View>
                                    <Text style={styles.rejectBtnText}>Reject Claim</Text>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color="#fca5a5"
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* ── Reject Modal ────────────────────────────────────────── */}
            <Modal
                visible={rejectModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setRejectModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalDragHandle} />

                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconCircle}>
                                <Ionicons name="close-circle" size={24} color="#dc2626" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>Reject Expense Claim</Text>
                                <Text style={styles.modalSubtitle}>#{claimId}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseBtn}
                                onPress={() => setRejectModalVisible(false)}>
                                <Ionicons name="close" size={18} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalWarning}>
                            <Ionicons
                                name="information-circle-outline"
                                size={15}
                                color="#d97706"
                            />
                            <Text style={styles.modalWarningText}>
                                This reason will be saved as a permanent audit comment and
                                notified to the employee.
                            </Text>
                        </View>

                        <Text style={styles.inputLabel}>Rejection Reason *</Text>
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Describe why this claim is being rejected..."
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
                                style={styles.modalCancelBtn}
                                onPress={() => {
                                    setRejectModalVisible(false);
                                    setRejectReason('');
                                }}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalConfirmBtn,
                                    !rejectReason.trim() && styles.disabledBtn,
                                ]}
                                onPress={handleReject}
                                disabled={rejectLoading || !rejectReason.trim()}>
                                {rejectLoading ? (
                                    <ActivityIndicator color={Colors.white} size="small" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="close-circle"
                                            size={16}
                                            color={Colors.white}
                                        />
                                        <Text style={styles.modalConfirmText}>
                                            Confirm Rejection
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Preview Modal ───────────────────────────────────────── */}
            <Modal
                visible={previewModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewModalVisible(false)}>
                <View style={styles.previewModalOverlay}>
                    <View style={styles.previewModalContent}>
                        <View style={styles.previewModalHeader}>
                            <Text style={styles.previewModalTitle}>
                                {previewType === 'pdf' ? 'PDF Preview' : 'Image Preview'}
                            </Text>
                            <TouchableOpacity
                                style={styles.previewModalCloseBtn}
                                onPress={() => setPreviewModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.previewContainer}>
                            {previewType === 'image' ? (
                                <View style={styles.imagePreviewContainer}>
                                    {imageLoading && (
                                        <View style={styles.imageLoadingOverlay}>
                                            <ActivityIndicator
                                                size="large"
                                                color={Colors.darkButton}
                                            />
                                            <Text style={styles.loadingText}>Loading image...</Text>
                                        </View>
                                    )}
                                    <Image
                                        source={{ uri: previewUrl }}
                                        style={styles.previewImage}
                                        resizeMode="contain"
                                        onLoadStart={() => setImageLoading(true)}
                                        onLoadEnd={() => setImageLoading(false)}
                                        onError={() => setImageLoading(false)}
                                    />
                                </View>
                            ) : (
                                <View style={styles.pdfPreviewContainer}>
                                    <Ionicons name="document-text" size={64} color="#8B5CF6" />
                                    <Text style={styles.pdfPreviewText}>PDF Document</Text>
                                    <TouchableOpacity
                                        style={styles.pdfOpenBtn}
                                        onPress={() => Linking.openURL(previewUrl)}>
                                        <Ionicons
                                            name="open-outline"
                                            size={16}
                                            color={Colors.white}
                                        />
                                        <Text style={styles.pdfOpenText}>Open PDF</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
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
        backgroundColor: '#F1F5F9',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 32,
        backgroundColor: '#F1F5F9',
    },
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
        lineHeight: 20,
    },

    // ── Hero Card ──
    heroCard: {
        margin: 14,
        marginBottom: 10,
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 18,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
    heroTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    heroLeft: { flex: 1 },
    claimIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    claimIdPill: {
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    claimIdPillText: {
        fontFamily: Fonts.bold,
        fontSize: 9,
        color: '#94A3B8',
        letterSpacing: 0.8,
    },
    claimId: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.darkButton,
        letterSpacing: -0.3,
    },
    heroDate: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 1,
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
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontFamily: Fonts.semiBold, fontSize: 11 },
    heroDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },

    // Amount tiles
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountTile: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
    },
    amountTileCenter: {},
    amountArrow: {
        paddingHorizontal: 2,
    },
    amountTileLabel: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    amountTileValue: {
        fontFamily: Fonts.bold,
        fontSize: 15,
        color: Colors.darkButton,
        letterSpacing: -0.3,
    },

    // ── Section Card ──
    section: {
        marginHorizontal: 14,
        marginBottom: 10,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    sectionIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontFamily: Fonts.bold,
        fontSize: 13,
        color: Colors.darkButton,
        flex: 1,
    },
    sectionRight: {
        marginLeft: 'auto',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#F8FAFC',
        marginBottom: 4,
    },
    countChip: {
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    countChipText: {
        fontFamily: Fonts.medium,
        fontSize: 10,
        color: '#64748B',
    },

    // Info rows
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    infoLabel: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: '#94A3B8',
        flex: 0.42,
    },
    infoValue: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: Colors.darkButton,
        flex: 0.58,
        textAlign: 'right',
    },

    // Expense column header
    expenseColHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 2,
        marginBottom: 4,
    },
    expenseColLabel: {
        fontFamily: Fonts.medium,
        fontSize: 10,
        color: '#CBD5E1',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        width: 72,
        textAlign: 'right',
    },

    // Expense row card
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        gap: 11,
    },
    expenseIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    expenseInfo: { flex: 1, gap: 3 },
    expenseType: {
        fontFamily: Fonts.semiBold,
        fontSize: 12,
        color: Colors.darkButton,
    },
    expenseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expenseDate: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#94A3B8',
    },
    metaDot: {
        fontSize: 10,
        color: '#CBD5E1',
    },
    expenseDesc: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#64748B',
    },
    receiptBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
        alignSelf: 'flex-start',
        backgroundColor: '#EFF6FF',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    receiptText: {
        fontFamily: Fonts.medium,
        fontSize: 10,
        color: '#2563eb',
    },
    expenseAmounts: {
        alignItems: 'flex-end',
        gap: 4,
        minWidth: 76,
    },
    claimedAmt: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: '#CBD5E1',
        textDecorationLine: 'line-through',
    },
    sanctionedChip: {
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    sanctionedAmt: {
        fontFamily: Fonts.bold,
        fontSize: 12,
    },

    // Expense totals
    expenseTotals: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        marginTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    expenseTotalLabel: {
        flex: 1,
        fontFamily: Fonts.bold,
        fontSize: 12,
        color: Colors.darkButton,
    },
    expenseTotalClaimed: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: '#CBD5E1',
        textDecorationLine: 'line-through',
        marginRight: 8,
        textAlign: 'right',
    },
    expenseTotalFinalWrap: {
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        minWidth: 76,
        alignItems: 'center',
    },
    expenseTotalSanctioned: {
        fontFamily: Fonts.bold,
        fontSize: 13,
        color: '#16a34a',
    },

    // Attachments
    attachmentsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    attachmentCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        alignItems: 'center',
        gap: 6,
    },
    attachmentIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentName: {
        fontFamily: Fonts.medium,
        fontSize: 11,
        color: Colors.darkButton,
        textAlign: 'center',
    },
    attachmentOpenBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#EFF6FF',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    attachmentOpenText: {
        fontFamily: Fonts.medium,
        fontSize: 10,
        color: '#2563eb',
    },

    // Action buttons
    actionSection: {
        gap: 10,
        marginHorizontal: 14,
        marginTop: 4,
    },
    approveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16a34a',
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 18,
        gap: 10,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    actionBtnIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    approveBtnText: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: Colors.white,
    },
    rejectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF1F2',
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 18,
        gap: 10,
        borderWidth: 1.5,
        borderColor: '#FECACA',
    },
    rejectBtnIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(220,38,38,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectBtnText: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: '#dc2626',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
        paddingTop: 12,
        paddingBottom: 32,
    },
    modalDragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    modalIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFF1F2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    modalTitle: {
        fontFamily: Fonts.bold,
        fontSize: 15,
        color: Colors.darkButton,
        marginBottom: 2,
    },
    modalSubtitle: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: '#94A3B8',
    },
    modalCloseBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalWarning: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#FFFBEB',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#FDE68A',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    modalWarningText: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: '#92400E',
        flex: 1,
        lineHeight: 17,
    },
    inputLabel: {
        fontFamily: Fonts.semiBold,
        fontSize: 12,
        color: Colors.darkButton,
        marginBottom: 8,
    },
    reasonInput: {
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 14,
        fontFamily: Fonts.regular,
        fontSize: 13,
        color: Colors.darkButton,
        minHeight: 110,
        maxHeight: 150,
        backgroundColor: '#F8FAFC',
    },
    charCount: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: '#CBD5E1',
        textAlign: 'right',
        marginTop: 5,
        marginBottom: 18,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 10,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCancelText: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: '#64748B',
    },
    modalConfirmBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#dc2626',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 7,
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    disabledBtn: { opacity: 0.4 },
    modalConfirmText: {
        fontFamily: Fonts.bold,
        fontSize: Size.sm,
        color: Colors.white,
    },

    // Preview Modal
    previewModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewModalContent: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        margin: 20,
        maxHeight: '80%',
        width: '90%',
        overflow: 'hidden',
    },
    previewModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    previewModalTitle: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: Colors.darkButton,
    },
    previewModalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        maxHeight: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePreviewContainer: {
        position: 'relative',
        width: '80%',
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 10,
        gap: 12,
    },
    loadingText: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        color: Colors.darkButton,
    },
    previewImage: {
        width: '100%',
        height: 500,
        borderRadius: 8,
        resizeMode: 'contain',
    },
    pdfPreviewContainer: {
        alignItems: 'center',
        padding: 40,
        gap: 16,
    },
    pdfPreviewText: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        color: Colors.darkButton,
    },
    pdfOpenBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    pdfOpenText: {
        fontFamily: Fonts.bold,
        fontSize: 14,
        color: Colors.white,
    },
});
