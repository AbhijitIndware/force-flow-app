import React, {useState} from 'react';
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

import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  useGetVisibilityClaimDetailsQuery,
  useApproveVisibilityClaimMutation,
  useRejectVisibilityClaimMutation,
} from '../../../features/tada/tadaApiv2';
import {imageBaseUrl} from '../../../features/apiBaseUrl';

// ─── Types ─────────────────────────────────────────────────────────────────

interface VisibilityApprovalDetailComponentProps {
  claimId: string;
  navigation: any;
  isApprover: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {bg: string; color: string; dot: string}> =
  {
    Approved: {bg: '#16a34a20', color: '#16a34a', dot: '#22c55e'},
    Rejected: {bg: '#dc262620', color: '#dc2626', dot: '#f87171'},
    Submitted: {bg: '#d9770620', color: '#d97706', dot: '#fbbf24'},
    'Pending Accounting Manager': {
      bg: '#d9770620',
      color: '#d97706',
      dot: '#fbbf24',
    },
    Draft: {bg: '#6B728020', color: '#6B7280', dot: '#94a3b8'},
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
  <View style={[styles.infoRow, last && {borderBottomWidth: 0}]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      numberOfLines={2}
      style={[
        styles.infoValue,
        valueColor ? {color: valueColor} : null,
        bold ? {fontFamily: Fonts.bold} : null,
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
          iconColor ? {backgroundColor: iconColor + '18'} : null,
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

const VisibilityApprovalDetailComponent = ({
  claimId,
  navigation,
  isApprover = true,
}: VisibilityApprovalDetailComponentProps) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const isPDF = (image?: string) => {
    return image?.toLowerCase().includes('.pdf');
  };
  const {data, isLoading, isFetching} = useGetVisibilityClaimDetailsQuery({
    claim_id: claimId,
  });
  const [approveClaim, {isLoading: approveLoading}] =
    useApproveVisibilityClaimMutation();
  const [rejectClaim, {isLoading: rejectLoading}] =
    useRejectVisibilityClaimMutation();

  const claim = data?.message?.data;

  const handleApprove = async () => {
    try {
      Alert.alert(
        'Confirm Approval',
        'Are you sure you want to approve this visibility claim?',
        [
          {text: 'Cancel', onPress: () => {}, style: 'cancel'},
          {
            text: 'Approve',
            onPress: async () => {
              await approveClaim({claim_id: claimId}).unwrap();
              Alert.alert('Success', 'Visibility claim approved successfully', [
                {text: 'OK', onPress: () => navigation.goBack()},
              ]);
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to approve claim');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Required', 'Please enter a reason for rejection');
      return;
    }
    try {
      Alert.alert(
        'Confirm Rejection',
        'Are you sure you want to reject this visibility claim?',
        [
          {text: 'Cancel', onPress: () => {}, style: 'cancel'},
          {
            text: 'Reject',
            onPress: async () => {
              await rejectClaim({
                claim_id: claimId,
                reason: rejectReason,
              }).unwrap();
              Alert.alert('Success', 'Visibility claim rejected successfully', [
                {
                  text: 'OK',
                  onPress: () => {
                    setRejectModalVisible(false);
                    setRejectReason('');
                    navigation.goBack();
                  },
                },
              ]);
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to reject claim');
    }
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
  const canAct = claim.approval_status === 'Submitted' && isApprover;

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        {/* ── Hero Header ────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          {/* Row 1: Claim pill + Status badge side by side */}
          <View style={styles.heroTopRow}>
            <View style={styles.claimIdPill}>
              <Text style={styles.claimIdPillText}>CLAIM</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: st.bg, borderColor: st.color},
              ]}>
              <View style={[styles.statusDot, {backgroundColor: st.dot}]} />
              <Text
                style={[styles.statusText, {color: st.color}]}
                numberOfLines={1}>
                {claim.approval_status}
              </Text>
            </View>
          </View>

          {/* Row 2: Claim ID */}
          <Text style={styles.claimId}>{claim.claim_id}</Text>

          {/* Row 3: Date */}
          <Text style={styles.heroDate}>
            {moment(claim.date).format('dddd, DD MMMM YYYY')}
          </Text>

          <View style={styles.heroDivider} />

          {/* Row 4: Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.amountTileLabel}>COLLECTION AMOUNT</Text>
            <Text style={styles.amountTileValue}>
              ₹{claim.collection_amount?.toLocaleString('en-IN') || '0'}
            </Text>
          </View>
        </View>

        {/* ── Employee Information ─────────────────────────────── */}
        <SectionCard
          title="Employee Information"
          icon="person-circle-outline"
          iconColor="#6366F1">
          <InfoRow label="Name" value={claim.employee_name || claim.employee} />
          <InfoRow
            label="Approver"
            value={claim.authorized_approver_name || 'N/A'}
            last
          />
        </SectionCard>

        {/* ── Store Information ─────────────────────────────────── */}
        <SectionCard
          title="Store Information"
          icon="storefront-outline"
          iconColor="#0EA5E9">
          <InfoRow label="Store Name" value={claim.store_name} last />
          <InfoRow
            label="Distributor Name"
            value={claim.distributor_name}
            last
          />
        </SectionCard>

        {/* ── Claim Details ────────────────────────────────────── */}
        <SectionCard
          title="Claim Details"
          icon="document-text-outline"
          iconColor="#F97316">
          <InfoRow label="Claim ID" value={claim.claim_id} />
          <InfoRow
            label="Date"
            value={moment(claim.date).format('DD MMM YYYY')}
          />
          <InfoRow
            label="Collection Amount"
            value={`₹ ${
              claim.collection_amount?.toLocaleString('en-IN') || '0'
            }`}
            valueColor="#16a34a"
            bold
          />
          {claim?.attachments &&
            claim?.attachments?.map((attachment: string, index: number) => (
              <View style={styles.infoRow} key={index}>
                <Text style={styles.infoLabel}>Claim Image {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPreviewImage(attachment);
                    setShowImagePreview(true);
                  }}
                  style={styles.receiptBtn}>
                  <Ionicons name="attach-outline" size={11} color="#2563eb" />
                  <Text style={styles.receiptText}>View Image</Text>
                </TouchableOpacity>
              </View>
            ))}
        </SectionCard>

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
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Preview Modal ───────────────────────────────────────── */}
      <Modal
        visible={showImagePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}>
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowImagePreview(false)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          {previewImage ? (
            isPDF(previewImage) ? (
              <View style={{alignItems: 'center', gap: 16}}>
                <Ionicons name="document-text" size={64} color="#8B5CF6" />
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: Fonts.medium,
                    fontSize: 16,
                  }}>
                  PDF Document
                </Text>
                <TouchableOpacity
                  style={styles.pdfOpenBtn}
                  onPress={() => {
                    const url = previewImage.startsWith('http')
                      ? previewImage
                      : `${imageBaseUrl}${previewImage}`;
                    Linking.openURL(url);
                  }}>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={Colors.white}
                  />
                  <Text style={styles.pdfOpenText}>Open PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {imageLoading && (
                  <ActivityIndicator
                    size="large"
                    color={Colors.white}
                    style={{position: 'absolute'}}
                  />
                )}
                <Image
                  source={{
                    uri: previewImage.startsWith('http')
                      ? previewImage
                      : `${imageBaseUrl}${previewImage}`,
                  }}
                  style={styles.fullImage}
                  resizeMode="contain"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </>
            )
          ) : (
            <Text
              style={{
                color: '#94a3b8',
                fontFamily: Fonts.regular,
                fontSize: 14,
              }}>
              No attachment available
            </Text>
          )}
        </View>
      </Modal>

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
              <View style={{flex: 1}}>
                <Text style={styles.modalTitle}>Reject Visibility Claim</Text>
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
    </>
  );
};

export default VisibilityApprovalDetailComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    padding: 12,
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

  // ── Hero Card ──────────────────────────────────────────────────
  heroCard: {
    marginBottom: 10,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  // Top row: pill + badge on same line
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '65%',
  },
  statusDot: {width: 6, height: 6, borderRadius: 3},
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    flexShrink: 1,
  },
  // Claim ID on its own line — no wrapping issue
  claimId: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.darkButton,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  heroDate: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  // ── Section Card ───────────────────────────────────────────────
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
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
    fontSize: Size.sm,
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

  // ── Info Rows ──────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#94A3B8',
    flex: 0.6,
  },
  infoValue: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.darkButton,
    flex: 0.58,
    textAlign: 'right',
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

  // ── Action Buttons ─────────────────────────────────────────────
  actionSection: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionBtnIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rejectBtnIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(220,38,38,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: '#dc2626',
  },

  // ── Reject Modal ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    marginBottom: 15,
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
    fontSize: Size.md,
    color: Colors.darkButton,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
    textAlignVertical: 'top',
    marginBottom: 8,
    maxHeight: 120,
  },
  charCount: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#94A3B8',
    textAlign: 'right',
    marginBottom: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
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
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledBtn: {opacity: 0.4},
  modalConfirmText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.white,
  },

  // ── Preview Modal ──────────────────────────────────────────────
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
    height: '80%',
    width: '90%',
    overflow: 'hidden',
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  pdfOpenText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.white,
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
