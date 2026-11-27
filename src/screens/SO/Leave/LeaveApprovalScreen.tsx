import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import PageHeader from '../../../components/ui/PageHeader';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useAppSelector } from '../../../store/hook';
import {
  useApproveLeaveMutation,
  useGetPendingLeaveApprovalsQuery,
  useRejectLeaveMutation,
} from '../../../features/base/base-api';
import {
  PendingLeaveApproval,
  formatLeaveDate,
  managerStepRows,
} from '../../../types/leaveType';
import {
  getSafeServerMessage,
  getUserFacingError,
  isServerSuccess,
} from '../../../utils/errorMessage';

type Props = {
  navigation: NativeStackNavigationProp<
    SoAppStackParamList,
    'LeaveApprovalScreen'
  >;
};

type Decision = { item: PendingLeaveApproval; action: 'approve' | 'reject' };

const TYPE_COLORS: Record<string, { fg: string; bg: string }> = {
  'Casual Leave': { fg: '#1D4ED8', bg: '#DBEAFE' },
  'Privilege Leave': { fg: '#7C3AED', bg: '#EDE9FE' },
  'Leave Without Pay': { fg: '#475569', bg: '#E2E8F0' },
};
const DEFAULT_TYPE_COLOR = { fg: '#0F766E', bg: '#CCFBF1' };

const typeColor = (t: string) => TYPE_COLORS[t] ?? DEFAULT_TYPE_COLOR;

function daysLabel(n?: number) {
  if (n === undefined || n === null) return '';
  if (n === 0.5) return 'Half day';
  return `${n} day${n === 1 ? '' : 's'}`;
}

function initials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

/**
 * Team leave waiting at the manager step. Approving sends it to HR, who
 * gives the final approval on the website (there is no HR step in the app).
 */
const LeaveApprovalScreen = ({ navigation }: Props) => {
  const { data, isLoading, isFetching, refetch } =
    useGetPendingLeaveApprovalsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });
  const [approveLeave, { isLoading: isApproving }] = useApproveLeaveMutation();
  const [rejectLeave, { isLoading: isRejecting }] = useRejectLeaveMutation();

  const [decision, setDecision] = useState<Decision | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const empId = useAppSelector(s => s.persistedReducer.authSlice.empId);
  const rows = managerStepRows(data?.message?.data, empId);

  const isSubmitting = isApproving || isRejecting;
  const reasonMissing =
    decision?.action === 'reject' && !rejectReason.trim();

  const openDecision = (
    item: PendingLeaveApproval,
    action: Decision['action'],
  ) => {
    setRejectReason('');
    setDecision({ item, action });
  };

  const closeDecision = () => {
    if (isSubmitting) return;
    setDecision(null);
    setRejectReason('');
  };

  const confirmDecision = async () => {
    if (!decision) return;
    const { item, action } = decision;
    if (action === 'reject' && !rejectReason.trim()) {
      Toast.show({ type: 'error', text1: 'A reason is required to reject' });
      return;
    }
    try {
      const res =
        action === 'approve'
          ? await approveLeave({ leave_application_id: item.name }).unwrap()
          : await rejectLeave({
              leave_application_id: item.name,
              reason: rejectReason.trim(),
            }).unwrap();
      const ok = isServerSuccess(res);
      const msg = getSafeServerMessage(res?.message?.message);
      Toast.show({
        type: ok ? 'success' : 'error',
        text1:
          msg ??
          (ok
            ? action === 'approve'
              ? 'Leave approved'
              : 'Leave rejected'
            : 'Something went wrong. Please try again.'),
      });
      if (ok) {
        setDecision(null);
        setRejectReason('');
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(err, 'Something went wrong. Please try again.'),
      });
    }
  };

  const renderSummary = () => {
    if (rows.length === 0) return null;
    return (
      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Ionicons name="calendar" size={18} color={Colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryTitle}>
            {rows.length} leave request{rows.length === 1 ? '' : 's'} waiting
          </Text>
          <Text style={styles.summarySub}>Waiting for your approval</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: PendingLeaveApproval }) => {
    const tc = typeColor(item.leave_type);
    const sameDay = item.from_date === item.to_date;
    const dates = sameDay
      ? formatLeaveDate(item.from_date)
      : `${formatLeaveDate(item.from_date)} – ${formatLeaveDate(item.to_date)}`;
    return (
      <View style={styles.card}>
        <View style={[styles.cardStripe, { backgroundColor: tc.fg }]} />
        <View style={styles.cardBody}>
          {/* Who */}
          <View style={styles.personRow}>
            <View style={[styles.avatar, { backgroundColor: tc.bg }]}>
              <Text style={[styles.avatarText, { color: tc.fg }]}>
                {initials(item.employee_name)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.employee_name}
              </Text>
              {!!item.designation && (
                <Text style={styles.designation} numberOfLines={1}>
                  {item.designation}
                </Text>
              )}
            </View>
            <Text style={styles.daysText}>
              {daysLabel(item.total_leave_days)}
            </Text>
          </View>

          {/* What + when, one line */}
          <View style={styles.leaveLine}>
            <View style={[styles.typeTag, { backgroundColor: tc.bg }]}>
              <Text style={[styles.typeTagText, { color: tc.fg }]}>
                {item.leave_type}
              </Text>
            </View>
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text style={styles.dateValue} numberOfLines={1}>
              {dates}
            </Text>
          </View>

          {!!item.reason && (
            <Text style={styles.infoText} numberOfLines={1}>
              {item.reason}
            </Text>
          )}
          {!!item.manager_remarks && (
            <Text style={styles.infoText} numberOfLines={1}>
              <Text style={styles.infoLabel}>Manager: </Text>
              {item.manager_remarks}
            </Text>
          )}

          {/* e.g. "Privilege Leave of 6 days (more than 4)" */}
          {!!item.note && (
            <View style={styles.noteLine}>
              <Ionicons name="alert-circle" size={13} color={Colors.orange} />
              <Text style={styles.noteText} numberOfLines={2}>
                {item.note}
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              activeOpacity={0.8}
              onPress={() => openDecision(item, 'reject')}>
              <Ionicons name="close" size={14} color="#DC2626" />
              <Text style={[styles.actionText, { color: '#DC2626' }]}>
                Reject
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              activeOpacity={0.8}
              onPress={() => openDecision(item, 'approve')}>
              <Ionicons name="checkmark" size={14} color={Colors.white} />
              <Text style={[styles.actionText, { color: Colors.white }]}>
                Approve
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="checkmark-done" size={36} color="#15803D" />
      </View>
      <Text style={styles.emptyTitle}>All caught up</Text>
      <Text style={styles.emptySub}>No leave is waiting for your approval.</Text>
    </View>
  );

  const d = decision?.item;
  const approving = decision?.action === 'approve';

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader
        title="Leave Approval"
        navigation={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.darkButton} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={item => item.name}
          renderItem={renderItem}
          ListHeaderComponent={renderSummary()}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
        />
      )}

      {/* Approve / Reject sheet */}
      <Modal
        visible={!!decision}
        transparent
        animationType="slide"
        onRequestClose={closeDecision}>
        <KeyboardAvoidingView
          style={styles.sheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeDecision}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View
                style={[
                  styles.sheetIcon,
                  { backgroundColor: approving ? '#DCFCE7' : '#FEE2E2' },
                ]}>
                <Ionicons
                  name={approving ? 'checkmark-circle' : 'close-circle'}
                  size={26}
                  color={approving ? '#15803D' : '#DC2626'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>
                  {approving ? 'Approve leave?' : 'Reject leave?'}
                </Text>
                <Text style={styles.sheetSub}>
                  {approving
                    ? 'It will go to HR for final approval.'
                    : 'The employee will see your reason.'}
                </Text>
              </View>
            </View>

            {d && (
              <View style={styles.sheetSummary}>
                <Text style={styles.sheetName}>{d.employee_name}</Text>
                <Text style={styles.sheetDetail}>
                  {d.leave_type} · {daysLabel(d.total_leave_days)}
                </Text>
                <Text style={styles.sheetDetail}>
                  {formatLeaveDate(d.from_date)}
                  {d.from_date !== d.to_date
                    ? ` – ${formatLeaveDate(d.to_date)}`
                    : ''}
                </Text>
              </View>
            )}

            {!approving && (
              <>
                <Text style={styles.inputLabel}>
                  Reason <Text style={{ color: '#DC2626' }}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Why are you rejecting this leave?"
                  placeholderTextColor="#94A3B8"
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  autoFocus
                />
              </>
            )}

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[styles.sheetBtn, styles.sheetCancel]}
                onPress={closeDecision}
                disabled={isSubmitting}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sheetBtn,
                  { backgroundColor: approving ? '#16A34A' : '#DC2626' },
                  (isSubmitting || reasonMissing) && { opacity: 0.55 },
                ]}
                onPress={confirmDecision}
                disabled={isSubmitting || reasonMissing}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.sheetConfirmText}>
                    {approving ? 'Approve' : 'Reject'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default LeaveApprovalScreen;

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 40, flexGrow: 1 },

  // Summary
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.darkButton,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
  summarySub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },

  // Card (compact)
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardStripe: { width: 3 },
  cardBody: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.semiBold, fontSize: 11 },
  name: { fontFamily: Fonts.semiBold, fontSize: 14, color: '#0F172A' },
  designation: { fontFamily: Fonts.regular, fontSize: 11, color: '#64748B' },
  daysText: { fontFamily: Fonts.semiBold, fontSize: 13, color: '#0F172A' },

  leaveLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  typeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  typeTagText: { fontFamily: Fonts.semiBold, fontSize: 10 },
  dateValue: { flex: 1, fontFamily: Fonts.medium, fontSize: 12, color: '#1E293B' },

  infoText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  infoLabel: { fontFamily: Fonts.semiBold, color: '#15803D' },

  noteLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 5,
  },
  noteText: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.orange,
  },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rejectBtn: { borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  approveBtn: { backgroundColor: '#16A34A' },
  actionText: { fontFamily: Fonts.semiBold, fontSize: 12 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: 17, color: '#0F172A' },
  emptySub: { fontFamily: Fonts.regular, fontSize: 13, color: '#64748B', marginTop: 4 },

  // Sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: { fontFamily: Fonts.semiBold, fontSize: 17, color: '#0F172A' },
  sheetSub: { fontFamily: Fonts.regular, fontSize: 12, color: '#64748B', marginTop: 1 },
  sheetSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  sheetName: { fontFamily: Fonts.semiBold, fontSize: 14, color: '#0F172A' },
  sheetDetail: { fontFamily: Fonts.regular, fontSize: 12, color: '#475569', marginTop: 2 },
  inputLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#0F172A',
    minHeight: 84,
    textAlignVertical: 'top',
  },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  sheetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancel: { backgroundColor: '#F1F5F9' },
  sheetCancelText: { fontFamily: Fonts.semiBold, fontSize: 14, color: '#475569' },
  sheetConfirmText: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.white },
});
