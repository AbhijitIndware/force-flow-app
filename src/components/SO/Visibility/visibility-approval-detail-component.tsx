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
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {flexCol, flexRow, itemsCenter} from '../../../utils/styles';
import {
  useGetVisibilityClaimDetailsQuery,
  useApproveVisibilityClaimMutation,
  useRejectVisibilityClaimMutation,
} from '../../../features/tada/tadaApiv2';
import {TextInput} from 'react-native';
import {imageBaseUrl} from '../../../features/apiBaseUrl';

interface VisibilityApprovalDetailComponentProps {
  claimId: string;
  navigation: any;
  isApprover: boolean;
}

const VisibilityApprovalDetailComponent = ({
  claimId,
  navigation,
  isApprover,
}: VisibilityApprovalDetailComponentProps) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

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
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Approve',
            onPress: async () => {
              const result = await approveClaim({
                claim_id: claimId,
              }).unwrap();

              Alert.alert('Success', 'Visibility claim approved successfully', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.goBack();
                  },
                },
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
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Reject',
            onPress: async () => {
              const result = await rejectClaim({
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
      <View
        style={[
          flexCol,
          {justifyContent: 'center', alignItems: 'center', flex: 1},
        ]}>
        <ActivityIndicator size="large" color={Colors.darkButton} />
      </View>
    );
  }

  if (!claim) {
    return (
      <View
        style={[
          flexCol,
          {justifyContent: 'center', alignItems: 'center', flex: 1},
        ]}>
        <Text style={styles.errorText}>Claim not found</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return '#F59E0B';
      case 'Approved':
        return '#10B981';
      case 'Rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.headerCard}>
          <View style={flexRow}>
            <View style={{flex: 1}}>
              <Text style={styles.claimIdText}>Claim ID: {claim.claim_id}</Text>
              <Text style={styles.dateText}>
                {moment(claim.date).format('DD MMM YYYY')}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(claim.approval_status) + '20'},
              ]}>
              <Text
                style={[
                  styles.statusBadgeText,
                  {color: getStatusColor(claim.approval_status)},
                ]}>
                {claim.approval_status}
              </Text>
            </View>
          </View>
        </View>

        {/* Employee Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Employee</Text>
            <Text style={styles.value}>{claim.employee_name || 'N/A'}</Text>
          </View>
          {/* <View style={styles.infoRow}>
            <Text style={styles.label}>Approver</Text>
            <Text style={styles.value}>{claim.expense_approver || 'N/A'}</Text>
          </View> */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Approver</Text>
            <Text style={styles.value}>
              {claim.authorized_approver_name || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Store Name</Text>
            <Text style={styles.value}>{claim.store_name}</Text>
          </View>
        </View>

        {/* Claim Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claim Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Claim ID</Text>
            <Text style={styles.value}>{claim.claim_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {moment(claim.date).format('DD MMM YYYY')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Type</Text>
            <Text style={styles.value}>{claim.payment_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Collection Amount</Text>
            <Text
              style={[
                styles.value,
                {color: Colors.darkButton, fontFamily: Fonts.bold},
              ]}>
              ₹ {claim.collection_amount}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Price Difference</Text>
            <Text style={styles.value}>₹ {claim.price_difference_amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Damage Claim</Text>
            <Text style={styles.value}>₹ {claim.damage_claim}</Text>
          </View>
          {claim?.visibility_image && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Claim Receipt</Text>
              <TouchableOpacity
                onPress={() => {
                  setImageError('');
                  setShowImagePreview(true);
                }}
                style={styles.receiptBtn}>
                <Ionicons name="attach-outline" size={11} color="#2563eb" />
                <Text style={styles.receiptText}>View Receipt</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Approval Actions - Only show if status is Submitted */}
        {claim.approval_status === 'Submitted' && isApprover && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={handleApprove}
              disabled={approveLoading}>
              {approveLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.white}
                  />
                  <Text style={styles.buttonText}>Approve Claim</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => setRejectModalVisible(true)}
              disabled={rejectLoading}>
              {rejectLoading ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text style={[styles.buttonText, {color: '#EF4444'}]}>
                    Reject Claim
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{height: 30}} />
      </ScrollView>

      {/* IMAGE PREVIEW MODAL */}
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
          {data?.message?.data?.visibility_image &&
            (() => {
              const imageUrl = data?.message?.data?.visibility_image.startsWith(
                'http',
              )
                ? data?.message?.data?.visibility_image
                : `${imageBaseUrl}${data?.message?.data?.visibility_image}`;

              if (isPDF(imageUrl)) {
                return (
                  <View style={styles.pdfPlaceholder}>
                    <Text style={styles.pdfPlaceholderText}>
                      PDF preview is not supported here.
                    </Text>
                  </View>
                );
              }

              return (
                <>
                  {imageLoading && (
                    <ActivityIndicator
                      size="large"
                      color={Colors.white}
                      style={styles.imageLoader}
                    />
                  )}
                  <Image
                    source={{uri: imageUrl}}
                    style={styles.fullImage}
                    resizeMode="contain"
                    onLoadStart={() => {
                      setImageError('');
                      setImageLoading(true);
                    }}
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError('Unable to load receipt image.');
                    }}
                  />
                  {imageError ? (
                    <Text style={styles.previewErrorText}>{imageError}</Text>
                  ) : null}
                </>
              );
            })()}
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reject Visibility Claim</Text>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.darkButton} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Please provide a reason for rejecting this visibility claim. This
              will be sent to the employee.
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Enter rejection reason..."
              multiline
              numberOfLines={4}
              maxLength={500}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholderTextColor="#999"
            />

            <Text style={styles.charCount}>{rejectReason.length}/500</Text>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectReason('');
                }}>
                <Text
                  style={[styles.modalButtonText, {color: Colors.darkButton}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleReject}
                disabled={rejectLoading || !rejectReason.trim()}>
                {rejectLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Reject</Text>
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
    padding: 15,
  },

  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  claimIdText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    marginBottom: 4,
  },

  dateText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#64748B',
  },

  statusBadge: {
    height: 35,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
  },

  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  label: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: '#64748B',
    flex: 0.4,
  },

  value: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
    flex: 0.6,
    textAlign: 'right',
  },

  actionSection: {
    gap: 12,
    marginBottom: 20,
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },

  approveButton: {
    backgroundColor: '#10B981',
  },

  rejectButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },

  buttonText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.white,
  },

  errorText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: '#EF4444',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },

  modalDescription: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#64748B',
    marginBottom: 15,
    lineHeight: 20,
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

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  confirmButton: {
    backgroundColor: '#EF4444',
  },

  modalButtonText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
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
    top: 50,
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
  imageLoader: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
  },
  pdfPlaceholder: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pdfPlaceholderText: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    textAlign: 'center',
  },
  previewErrorText: {
    marginTop: 12,
    color: '#F87171',
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    textAlign: 'center',
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
});
