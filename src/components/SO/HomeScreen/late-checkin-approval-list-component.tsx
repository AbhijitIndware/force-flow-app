import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import {
  useGetPendingLateApprovalsQuery,
  useApproveRejectLateCheckinMutation,
} from '../../../features/base/base-api';
import { LateCheckinApprovalRecord } from '../../../types/baseType';

const LateCheckinApprovalListComponent = () => {
  const { data, isLoading, isFetching, refetch } =
    useGetPendingLateApprovalsQuery();
  const [approveReject, { isLoading: isMutating }] =
    useApproveRejectLateCheckinMutation();

  const [selectedRequest, setSelectedRequest] =
    useState<LateCheckinApprovalRecord | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(
    null,
  );
  const [managerRemarks, setManagerRemarks] = useState('');

  const records = data?.message?.data ?? [];

  const handleAction = (item: LateCheckinApprovalRecord, status: 'Approved' | 'Rejected') => {
    setSelectedRequest(item);
    setActionType(status);
    setManagerRemarks('');
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType) return;
    try {
      let res = await approveReject({
        request_id: selectedRequest.name,
        status: actionType,
        manager_remarks: managerRemarks || undefined,
      }).unwrap();
      if (res?.message.success) {
        Toast.show({
          type: 'success',
          text1: actionType === 'Approved'
            ? '✅ Late check-in request approved.'
            : '✅ Late check-in request rejected.',
          position: 'top',
        });
        setSelectedRequest(null);
        setActionType(null);
        setManagerRemarks('');
        refetch();
      } else {
        Toast.show({
          type: 'error',
          text1: res?.message?.message || 'Something went wrong. Please try again.',
          position: 'top',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Error',
        text2: err?.data?.message?.message || 'Something went wrong. Please try again.',
        position: 'top',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.darkButton} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: LateCheckinApprovalRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.employee_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.statusDot} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.employeeName}>{item.employee_name}</Text>
          <Text style={styles.employeeId}>{item.employee}</Text>
        </View>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.dateBadgeText}>
            {item.date ? moment(item.date).format('DD MMM') : '—'}
          </Text>
        </View>
      </View>

      {item.reason ? (
        <View style={styles.reasonRow}>
          <Ionicons name="chatbox-ellipses-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleAction(item, 'Approved')}
          activeOpacity={0.8}>
          <Ionicons name="checkmark-circle-outline" size={16} color={Colors.white} />
          <Text style={styles.actionBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleAction(item, 'Rejected')}
          activeOpacity={0.8}>
          <Ionicons name="close-circle-outline" size={16} color={Colors.white} />
          <Text style={styles.actionBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No Pending Approvals</Text>
        <Text style={styles.emptySubtitle}>
          All late check-in requests have been reviewed.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={item => item.name}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      />

      <Modal visible={!!selectedRequest} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'Approved' ? 'Approve' : 'Reject'} Request
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedRequest?.employee_name} —{' '}
              {selectedRequest?.date
                ? moment(selectedRequest.date).format('DD MMM YYYY')
                : ''}
            </Text>

            <TextInput
              style={styles.remarksInput}
              placeholder="Add remarks (optional)"
              placeholderTextColor="#94a3b8"
              value={managerRemarks}
              onChangeText={setManagerRemarks}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                  setManagerRemarks('');
                }}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  actionType === 'Approved'
                    ? styles.confirmApproveBtn
                    : styles.confirmRejectBtn,
                ]}
                onPress={confirmAction}
                disabled={isMutating}>
                {isMutating ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    {actionType === 'Approved' ? 'Approve' : 'Reject'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LateCheckinApprovalListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: Size.sm,
    fontFamily: Fonts.semiBold,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fbbf24',
    borderWidth: 2,
    borderColor: Colors.white,
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
  cardInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: Size.sm,
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
  },
  employeeId: {
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 2,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateBadgeText: {
    fontSize: Size.xxs,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
  },

  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
  },
  reasonText: {
    flex: 1,
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: '#334155',
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  approveBtn: {
    backgroundColor: '#16a34a',
  },
  rejectBtn: {
    backgroundColor: '#dc2626',
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: Size.xxs,
    fontFamily: Fonts.semiBold,
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: Size.md,
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: '#64748b',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: Size.md,
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginBottom: 16,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalBtn: {
    backgroundColor: '#f1f5f9',
  },
  cancelModalText: {
    fontSize: Size.xxs,
    fontFamily: Fonts.semiBold,
    color: '#475569',
  },
  confirmApproveBtn: {
    backgroundColor: '#16a34a',
  },
  confirmRejectBtn: {
    backgroundColor: '#dc2626',
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: Size.xxs,
    fontFamily: Fonts.semiBold,
  },
});
