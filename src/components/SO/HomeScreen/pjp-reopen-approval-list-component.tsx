import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import {
  useGetPjpReopenRequestsQuery,
  useDecidePjpReopenMutation,
} from '../../../features/base/base-api';
import { PjpReopenRequest } from '../../../types/baseType';
import {
  getUserFacingError,
  getSafeServerMessage,
  isServerSuccess,
} from '../../../utils/errorMessage';

type Filter = 'waiting' | 'decided';
type Decision = { item: PjpReopenRequest; status: 'Approved' | 'Rejected' };

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  Pending: { fg: '#B45309', bg: '#FEF3C7' },
  Approved: { fg: '#15803D', bg: '#DCFCE7' },
  Rejected: { fg: '#B91C1C', bg: '#FEE2E2' },
};
const statusColor = (s?: string) => STATUS_COLORS[s ?? ''] ?? STATUS_COLORS.Pending;

function initials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function dayLabel(date?: string) {
  if (!date) return '—';
  const d = moment(date);
  if (d.isSame(moment(), 'day')) return 'Today';
  if (d.isSame(moment().subtract(1, 'day'), 'day')) return 'Yesterday';
  return d.format('DD MMM');
}

/** Manager list of PJP reopen requests from the last 7 days. */
const PjpReopenApprovalListComponent = () => {
  const { data, isLoading, isFetching, refetch } =
    useGetPjpReopenRequestsQuery({ days: 7 });
  const [decide, { isLoading: isMutating }] = useDecidePjpReopenMutation();

  const [filter, setFilter] = useState<Filter>('waiting');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [managerRemarks, setManagerRemarks] = useState('');

  const records = data?.message?.data ?? [];
  const waiting = records.filter(r => r.can_decide);
  const decided = records.filter(r => !r.can_decide);
  const showFilters = waiting.length > 0 && decided.length > 0;

  const visible = !showFilters
    ? records
    : filter === 'waiting'
    ? waiting
    : decided;

  const remarkMissing =
    decision?.status === 'Rejected' && !managerRemarks.trim();

  const openDecision = (item: PjpReopenRequest, status: Decision['status']) => {
    setManagerRemarks('');
    setDecision({ item, status });
  };

  const closeDecision = () => {
    if (isMutating) return;
    setDecision(null);
    setManagerRemarks('');
  };

  const confirmDecision = async () => {
    if (!decision) return;
    if (remarkMissing) {
      Toast.show({ type: 'error', text1: 'A remark is required to reject' });
      return;
    }
    const { item, status } = decision;
    try {
      const res = await decide({
        request_id: item.name,
        status,
        manager_remarks: managerRemarks.trim() || undefined,
      }).unwrap();
      const ok = isServerSuccess(res);
      const msg = getSafeServerMessage(res?.message?.message);
      Toast.show({
        type: ok ? 'success' : 'error',
        text1:
          msg ??
          (ok
            ? status === 'Approved'
              ? 'PJP reopen approved'
              : 'PJP reopen rejected'
            : 'Something went wrong. Please try again.'),
        position: 'top',
      });
      if (ok) {
        setDecision(null);
        setManagerRemarks('');
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Error',
        text2: getUserFacingError(err, 'Something went wrong. Please try again.'),
        position: 'top',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.darkButton} />
      </View>
    );
  }

  const renderHeader = () => {
    if (records.length === 0) return null;
    return (
      <>
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Ionicons name="refresh" size={18} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>
              {waiting.length > 0
                ? `${waiting.length} reopen request${
                    waiting.length === 1 ? '' : 's'
                  } waiting`
                : 'No requests waiting'}
            </Text>
            <Text style={styles.summarySub}>
              Last 7 days · {decided.length} decided
            </Text>
          </View>
        </View>

        {showFilters && (
          <View style={styles.filterRow}>
            {(
              [
                { key: 'waiting', label: `Waiting (${waiting.length})` },
                { key: 'decided', label: `Decided (${decided.length})` },
              ] as { key: Filter; label: string }[]
            ).map(c => {
              const active = filter === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setFilter(c.key)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </>
    );
  };

  const renderItem = ({ item }: { item: PjpReopenRequest }) => {
    const sc = statusColor(item.status);
    const requestedAt = item.creation
      ? moment(item.creation.replace(' ', 'T')).format('hh:mm A')
      : null;
    const subLine = [item.pjp, requestedAt && `requested ${requestedAt}`]
      .filter(Boolean)
      .join(' · ');
    return (
      <View style={styles.card}>
        <View style={[styles.cardStripe, { backgroundColor: sc.fg }]} />
        <View style={styles.cardBody}>
          <View style={styles.personRow}>
            <View style={[styles.avatar, { backgroundColor: sc.bg }]}>
              <Text style={[styles.avatarText, { color: sc.fg }]}>
                {initials(item.employee_name)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.employee_name}
              </Text>
              {!!subLine && (
                <Text style={styles.subLine} numberOfLines={1}>
                  {subLine}
                </Text>
              )}
            </View>
            <View style={styles.datePill}>
              <Ionicons name="calendar-outline" size={11} color="#475569" />
              <Text style={styles.datePillText}>{dayLabel(item.date)}</Text>
            </View>
          </View>

          {!!item.reason && (
            <Text style={styles.reasonText} numberOfLines={1}>
              {item.reason}
            </Text>
          )}

          {item.can_decide ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                activeOpacity={0.8}
                onPress={() => openDecision(item, 'Rejected')}>
                <Ionicons name="close" size={14} color="#DC2626" />
                <Text style={[styles.actionText, { color: '#DC2626' }]}>
                  Reject
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                activeOpacity={0.8}
                onPress={() => openDecision(item, 'Approved')}>
                <Ionicons name="checkmark" size={14} color={Colors.white} />
                <Text style={[styles.actionText, { color: Colors.white }]}>
                  Approve
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.decidedRow}>
              <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                <Text style={[styles.statusText, { color: sc.fg }]}>
                  {item.status}
                </Text>
              </View>
              {!!item.manager_remarks && (
                <Text style={styles.remarkText} numberOfLines={1}>
                  {item.manager_remarks}
                </Text>
              )}
            </View>
          )}
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
      <Text style={styles.emptySub}>
        No PJP reopen requests in the last 7 days.
      </Text>
    </View>
  );

  const d = decision?.item;
  const approving = decision?.status === 'Approved';

  return (
    <View style={styles.container}>
      <FlatList
        data={visible}
        keyExtractor={item => item.name}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      />

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
                  {approving ? 'Reopen this PJP?' : 'Reject reopen request?'}
                </Text>
                <Text style={styles.sheetSub}>
                  {approving
                    ? 'The PJP runs again and they can check in at stores.'
                    : 'The PJP stays ended. They will see your remark.'}
                </Text>
              </View>
            </View>

            {d && (
              <View style={styles.sheetSummary}>
                <Text style={styles.sheetName}>{d.employee_name}</Text>
                <Text style={styles.sheetDetail}>
                  {d.pjp}
                  {d.date ? ` · ${moment(d.date).format('DD MMM YYYY')}` : ''}
                </Text>
                {!!d.reason && (
                  <Text style={styles.sheetReason}>{d.reason}</Text>
                )}
              </View>
            )}

            <Text style={styles.inputLabel}>
              {approving ? 'Remarks (optional)' : 'Remark '}
              {!approving && <Text style={{ color: '#DC2626' }}>*</Text>}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                approving
                  ? 'Add a note for the employee'
                  : 'Why are you rejecting this request?'
              }
              placeholderTextColor="#94A3B8"
              value={managerRemarks}
              onChangeText={setManagerRemarks}
              multiline
              autoFocus={!approving}
            />

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[styles.sheetBtn, styles.sheetCancel]}
                onPress={closeDecision}
                disabled={isMutating}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sheetBtn,
                  { backgroundColor: approving ? '#16A34A' : '#DC2626' },
                  (isMutating || remarkMissing) && { opacity: 0.55 },
                ]}
                onPress={confirmDecision}
                disabled={isMutating || remarkMissing}>
                {isMutating ? (
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
    </View>
  );
};

export default PjpReopenApprovalListComponent;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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

  // Filters
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: Colors.darkButton, borderColor: Colors.darkButton },
  chipText: { fontFamily: Fonts.medium, fontSize: 12, color: '#334155' },
  chipTextActive: { color: Colors.white },

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
  subLine: { fontFamily: Fonts.regular, fontSize: 11, color: '#64748B' },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  datePillText: { fontFamily: Fonts.semiBold, fontSize: 11, color: '#475569' },
  reasonText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
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
  decidedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontFamily: Fonts.semiBold, fontSize: 11 },
  remarkText: { flex: 1, fontFamily: Fonts.regular, fontSize: 12, color: '#64748B' },

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
  emptySub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },

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
  sheetReason: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#334155',
    marginTop: 6,
    lineHeight: 17,
  },
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
    minHeight: 72,
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
