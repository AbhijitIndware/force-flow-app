import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  useGetApprovalListQuery,
  useBulkApproveClaimsMutation,
  useBulkRejectClaimsMutation,
} from '../../../features/tada/tadaApiv2';
import ReusableDropdownv2 from '../../ui-lib/resusable-dropdown-v2';
import {ApproverExpenseClaim} from '../../../types/tadaType';

const {width} = Dimensions.get('window');

// ─── Constants ─────────────────────────────────────────────────────────────

const MONTHS = moment.months().map((label, i) => ({
  label,
  short: moment().month(i).format('MMM'),
  value: i + 1,
}));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => CURRENT_YEAR - i);

const STATUS_CONFIG: Record<string, {bg: string; color: string; dot: string}> =
  {
    Submitted: {bg: '#fffbeb', color: '#d97706', dot: '#fbbf24'},
    'Pending Approval': {bg: '#fffbeb', color: '#d97706', dot: '#fbbf24'},
    Approved: {bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e'},
    Rejected: {bg: '#fff1f2', color: '#dc2626', dot: '#f87171'},
    Draft: {bg: '#f8fafc', color: '#475569', dot: '#94a3b8'},
    Cancelled: {bg: '#f8fafc', color: '#64748b', dot: '#94a3b8'},
    // ✅ New HR statuses
    'HR Pending': {bg: '#f5f3ff', color: '#7c3aed', dot: '#a78bfa'},
    'HR Approved': {bg: '#f0f9ff', color: '#0369a1', dot: '#38bdf8'},
    'HR Rejected': {bg: '#fff1f2', color: '#b91c1c', dot: '#fca5a5'},
  };

const getStatus = (s: string) =>
  STATUS_CONFIG[s] ?? {bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8'};

// ─── Header Component ──────────────────────────────────────────────────────

interface HeaderProps {
  selectedMonth: number;
  selectedYear: number;
  fromDate: string;
  toDate: string;
  onMonthSelect: (month: number, year: number) => void;
  onRangeSelect: (from: string, to: string) => void;
  counts: {pending: number; approved: number; rejected: number};

  setSelectedStatus: any;
  selectedStatus: string;
}

export const formatPeriodLabel = (
  month: number,
  year: number,
  fromDate: string,
  toDate: string,
) => {
  if (fromDate && toDate) {
    const from = moment(fromDate);
    const to = moment(toDate);
    const sameYear = from.year() === to.year();
    return `${from.format(sameYear ? 'DD MMM' : 'DD MMM YY')} – ${to.format(
      sameYear && to.year() === CURRENT_YEAR ? 'DD MMM' : 'DD MMM YY',
    )}`;
  }
  return `${moment()
    .month(month - 1)
    .format('MMM')} ${year}`;
};
// Max claims per bulk approve/reject call
const MAX_SELECTION = 50;

// Dropdowns treat '' as "nothing selected", so 'All' needs a real value
const ALL = 'All';
const FILTER_OPTIONS = [
  {label: 'All', value: ALL},
  {label: 'Pending Approval', value: 'Pending Approval'},
  {label: 'HR Pending', value: 'HR Pending'},
  {label: 'HR Approved', value: 'HR Approved'},
  {label: 'Rejected', value: 'Rejected'},
  {label: 'HR Rejected', value: 'HR Rejected'},
  {label: 'Draft', value: 'Draft'},
];
const ApprovalHeader: React.FC<HeaderProps> = ({
  selectedMonth,
  selectedYear,
  fromDate,
  toDate,
  onMonthSelect,
  onRangeSelect,
  setSelectedStatus,
  selectedStatus,
}) => {
  const isRange = !!(fromDate && toDate);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [tab, setTab] = useState<'month' | 'range'>('month');
  const [draftYear, setDraftYear] = useState(selectedYear);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [datePicker, setDatePicker] = useState<'from' | 'to' | null>(null);

  const openPeriodModal = () => {
    setTab(isRange ? 'range' : 'month');
    setDraftYear(selectedYear);
    setDraftFrom(fromDate);
    setDraftTo(toDate);
    setShowPeriodModal(true);
  };

  const canApplyRange =
    !!draftFrom && !!draftTo && !moment(draftTo).isBefore(draftFrom);

  return (
    <>
      <View style={hStyles.header}>
        <View style={hStyles.row}>
          {/* Single period pill: month or custom date range */}
          <TouchableOpacity
            style={[hStyles.pill, hStyles.pillActive]}
            onPress={openPeriodModal}
            activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={13} color={Colors.orange} />
            <Text
              style={[hStyles.pillText, hStyles.pillTextActive, {flex: 1}]}
              numberOfLines={1}>
              {formatPeriodLabel(selectedMonth, selectedYear, fromDate, toDate)}
            </Text>
            <Ionicons name="chevron-down" size={11} color={Colors.orange} />
          </TouchableOpacity>
          <View style={hStyles.statusDropdown}>
            <ReusableDropdownv2
              label="Status"
              field="claim_type"
              value={selectedStatus || ALL}
              data={FILTER_OPTIONS}
              onChange={(val: string) =>
                setSelectedStatus(val === ALL ? '' : val)
              }
              height={32}
              marginBottom={0}
              textSize={11}
              labelStyle={{display: 'none'}}
            />
          </View>
        </View>
      </View>

      {/* Period picker modal */}
      <Modal
        visible={showPeriodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}>
        <TouchableOpacity
          style={hStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowPeriodModal(false)}>
          <TouchableOpacity activeOpacity={1} style={hStyles.sheet}>
            <View style={hStyles.handle} />
            <View style={hStyles.sheetHeader}>
              <Text style={hStyles.sheetTitle}>Select Period</Text>
              <TouchableOpacity
                onPress={() => setShowPeriodModal(false)}
                style={hStyles.closeBtn}>
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Month / Date range tabs */}
            <View style={hStyles.segment}>
              {(['month', 'range'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    hStyles.segmentItem,
                    tab === t && hStyles.segmentActive,
                  ]}
                  onPress={() => setTab(t)}>
                  <Text
                    style={[
                      hStyles.segmentText,
                      tab === t && hStyles.segmentTextActive,
                    ]}>
                    {t === 'month' ? 'Month' : 'Date range'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {tab === 'month' ? (
              <>
                <View style={hStyles.yearRow}>
                  {YEARS.map(y => {
                    const active = draftYear === y;
                    return (
                      <TouchableOpacity
                        key={y}
                        style={[
                          hStyles.yearChip,
                          active && hStyles.gridItemActive,
                        ]}
                        onPress={() => setDraftYear(y)}>
                        <Text
                          style={[
                            hStyles.gridText,
                            active && hStyles.gridTextActive,
                          ]}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={hStyles.grid}>
                  {MONTHS.map(m => {
                    const active =
                      !isRange &&
                      selectedMonth === m.value &&
                      selectedYear === draftYear;
                    return (
                      <TouchableOpacity
                        key={m.value}
                        style={[
                          hStyles.gridItem,
                          active && hStyles.gridItemActive,
                        ]}
                        onPress={() => {
                          onMonthSelect(m.value, draftYear);
                          setShowPeriodModal(false);
                        }}>
                        <Text
                          style={[
                            hStyles.gridText,
                            active && hStyles.gridTextActive,
                          ]}>
                          {m.short}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <View style={hStyles.rangeRow}>
                  {(['from', 'to'] as const).map(key => {
                    const value = key === 'from' ? draftFrom : draftTo;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={hStyles.rangeField}
                        onPress={() => setDatePicker(key)}>
                        <Text style={hStyles.rangeLabel}>
                          {key === 'from' ? 'From' : 'To'}
                        </Text>
                        <View style={hStyles.rangeValueRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#64748B"
                          />
                          <Text
                            style={[
                              hStyles.rangeValue,
                              !value && hStyles.rangePlaceholder,
                            ]}>
                            {value
                              ? moment(value).format('DD MMM YYYY')
                              : 'Select date'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {draftFrom && draftTo && !canApplyRange ? (
                  <Text style={hStyles.rangeError}>
                    "To" date must be on or after "From" date.
                  </Text>
                ) : null}
                <TouchableOpacity
                  disabled={!canApplyRange}
                  style={[
                    hStyles.applyBtn,
                    !canApplyRange && hStyles.applyBtnDisabled,
                  ]}
                  onPress={() => {
                    onRangeSelect(draftFrom, draftTo);
                    setShowPeriodModal(false);
                  }}>
                  <Text style={hStyles.applyText}>Apply</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={datePicker !== null}
          mode="date"
          maximumDate={new Date()}
          minimumDate={
            datePicker === 'to' && draftFrom ? new Date(draftFrom) : undefined
          }
          date={
            datePicker === 'from' && draftFrom
              ? new Date(draftFrom)
              : datePicker === 'to' && (draftTo || draftFrom)
              ? new Date(draftTo || draftFrom)
              : new Date()
          }
          onConfirm={date => {
            const value = moment(date).format('YYYY-MM-DD');
            if (datePicker === 'from') {
              setDraftFrom(value);
              if (draftTo && moment(draftTo).isBefore(value)) setDraftTo('');
            } else {
              setDraftTo(value);
            }
            setDatePicker(null);
          }}
          onCancel={() => setDatePicker(null)}
        />
      </Modal>
    </>
  );
};

// ─── Main List Component ───────────────────────────────────────────────────

const ExpenseApprovalListComponent = ({navigation}: any) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [employee, setEmployee] = useState('');
  const [travelType, setTravelType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const isRange = !!(fromDate && toDate);
  const [bulkApprove, {isLoading: approving}] = useBulkApproveClaimsMutation();
  const [bulkReject, {isLoading: rejecting}] = useBulkRejectClaimsMutation();

  const {data, isLoading, refetch, isFetching} = useGetApprovalListQuery(
    {
      // A custom date range replaces the month filter
      month: isRange ? undefined : selectedMonth,
      year: isRange ? undefined : selectedYear,
      status: selectedStatus,
      search: search.trim() || undefined,
      employee: employee.trim() || undefined,
      travel_type: travelType || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      page: page,
      page_size: 20,
    },
    {refetchOnMountOrArgChange: true},
  );
  console.log('🚀 ~ ExpenseApprovalListComponent ~ data:', data);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const claimList = data?.message?.data?.expense_claims || [];
  const pagination = data?.message?.data?.pagination;

  const handleLoadMore = () => {
    if (pagination?.has_more && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [
    selectedMonth,
    selectedYear,
    selectedStatus,
    search,
    employee,
    travelType,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    setSelectedClaims([]);
  }, [
    selectedMonth,
    selectedYear,
    selectedStatus,
    search,
    employee,
    travelType,
    fromDate,
    toDate,
  ]);

  const toggleClaim = (claimId: string) => {
    setSelectedClaims(current => {
      if (current.includes(claimId))
        return current.filter(id => id !== claimId);
      if (current.length >= MAX_SELECTION) {
        Alert.alert(
          'Selection limit',
          'You can select up to 50 claims at a time.',
        );
        return current;
      }
      return [...current, claimId];
    });
  };

  const selectableIds: string[] = claimList
    .filter(
      (c: ApproverExpenseClaim) => c.workflow_state === 'Pending Approval',
    )
    .map((c: ApproverExpenseClaim) => c.name);
  const selectAllTarget = selectableIds.slice(0, MAX_SELECTION);
  const allSelected =
    selectAllTarget.length > 0 &&
    selectAllTarget.every(id => selectedClaims.includes(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedClaims([]);
      return;
    }
    if (selectableIds.length > MAX_SELECTION) {
      Alert.alert(
        'Selection limit',
        `Only the first ${MAX_SELECTION} pending claims were selected.`,
      );
    }
    setSelectedClaims(selectAllTarget);
  };

  const showBulkResult = (response: any) => {
    const result = response?.message;
    const data = result?.data;
    const failures =
      data?.results?.filter((item: any) => item.status === 'error') || [];
    const summary =
      result?.message ||
      `${data?.succeeded || 0} approved; ${data?.failed || 0} failed.`;
    if (failures.length) {
      Alert.alert(
        summary,
        failures
          .map((item: any) => `${item.claim_id}: ${item.message}`)
          .join('\n'),
      );
    } else {
      Alert.alert('Bulk action complete', summary);
    }
    setSelectedClaims([]);
    refetch();
  };

  const handleBulkApprove = async () => {
    try {
      const response = await bulkApprove({claim_ids: selectedClaims}).unwrap();
      showBulkResult(response);
    } catch (error: any) {
      Alert.alert(
        'Approval failed',
        error?.data?.message || 'Unable to approve selected claims.',
      );
    }
  };

  const handleBulkReject = async () => {
    try {
      const response = await bulkReject({
        claim_ids: selectedClaims,
        reason: rejectReason.trim(),
      }).unwrap();
      setRejectModalVisible(false);
      setRejectReason('');
      showBulkResult(response);
    } catch (error: any) {
      Alert.alert(
        'Rejection failed',
        error?.data?.message || 'Unable to reject selected claims.',
      );
    }
  };

  // Derive counts from the full list (before client-side filter)
  const counts = claimList.reduce(
    (acc, item) => {
      const s = item.approval_status;
      if (s === 'Submitted' || s === 'Pending Approval') acc.pending += 1;
      else if (s === 'Approved') acc.approved += 1;
      else if (s === 'Rejected') acc.rejected += 1;
      return acc;
    },
    {pending: 0, approved: 0, rejected: 0},
  );

  const renderItem = ({item}: {item: ApproverExpenseClaim}) => {
    const st = getStatus(item.workflow_state);
    const isSelected = selectedClaims.includes(item.name);
    const canSelect = item.workflow_state === 'Pending Approval';

    return (
      <View style={styles.card}>
        <View style={styles.cardMain}>
          {canSelect && (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => toggleClaim(item.name)}>
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={22}
                color={isSelected ? Colors.darkButton : '#94a3b8'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{flex: 1}}
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate('ExpenseApprovalDetailScreen', {
                claimId: item.name,
              })
            }>
            {/* Row 1: employee + date + status badge */}
            <View style={styles.row1}>
              <Text style={styles.employeeName} numberOfLines={1}>
                {item.employee_name}
              </Text>
              <Text style={styles.dateText}>
                {moment(item.posting_date).format('DD MMM YY')}
              </Text>
              <View style={[styles.badge, {backgroundColor: st.bg}]}>
                <View style={[styles.dot, {backgroundColor: st.dot}]} />
                <Text style={[styles.badgeText, {color: st.color}]}>
                  {item.workflow_state}
                </Text>
              </View>
            </View>

            {/* Row 2: total amount + chevron */}
            <View style={styles.row2}>
              <View style={styles.amountChip}>
                <Text style={styles.amountLabel}>Total Claimed</Text>
                <Text style={styles.amountValue}>
                  ₹{Number(item.total_claimed_amount).toLocaleString('en-IN')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ApprovalHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        fromDate={fromDate}
        toDate={toDate}
        onMonthSelect={(m, y) => {
          setSelectedMonth(m);
          setSelectedYear(y);
          setFromDate('');
          setToDate('');
        }}
        onRangeSelect={(from, to) => {
          setFromDate(from);
          setToDate(to);
        }}
        setSelectedStatus={setSelectedStatus}
        selectedStatus={selectedStatus}
        counts={counts}
      />

      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={15} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search employee or claim"
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          <TextInput
            value={employee}
            onChangeText={setEmployee}
            placeholder="Employee ID"
            placeholderTextColor="#94a3b8"
            style={[styles.filterInput, styles.flex1]}
            autoCapitalize="characters"
          />
          <View style={styles.flex1}>
            <ReusableDropdownv2
              label="Travel type"
              field="travel_type"
              value={travelType || ALL}
              data={[
                {label: 'All travel', value: ALL},
                {label: 'HQ', value: 'HQ'},
                {label: 'Ex-HQ', value: 'Ex-HQ'},
                {label: 'Outstation', value: 'Outstation'},
              ]}
              onChange={(value: string) =>
                setTravelType(value === ALL ? '' : value)
              }
              height={38}
              marginBottom={0}
              textSize={12}
              labelStyle={{display: 'none'}}
            />
          </View>
          {search || employee || travelType ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearch('');
                setEmployee('');
                setTravelType('');
              }}>
              <Ionicons name="refresh" size={13} color={Colors.darkButton} />
              <Text style={styles.clearFilters}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Status Filter Strip ── */}

      {!isLoading && selectableIds.length > 0 && (
        <TouchableOpacity
          style={styles.selectAllRow}
          activeOpacity={0.7}
          onPress={toggleSelectAll}>
          <Ionicons
            name={allSelected ? 'checkbox' : 'square-outline'}
            size={20}
            color={allSelected ? Colors.darkButton : '#94a3b8'}
          />
          <Text style={styles.selectAllText}>
            Select all pending ({Math.min(selectableIds.length, MAX_SELECTION)})
          </Text>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={Colors.darkButton} />
        </View>
      ) : (
        <FlatList
          data={claimList}
          keyExtractor={item => item.name.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>No Claims Found</Text>
              <Text style={styles.emptySub}>
                No expense claims for{' '}
                {isRange
                  ? formatPeriodLabel(
                      selectedMonth,
                      selectedYear,
                      fromDate,
                      toDate,
                    )
                  : `${
                      MONTHS.find(m => m.value === selectedMonth)?.label
                    } ${selectedYear}`}
                . Try a different period.
              </Text>
            </View>
          }
        />
      )}
      {selectedClaims.length > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkCount}>{selectedClaims.length} selected</Text>
          <TouchableOpacity
            disabled={approving || rejecting}
            style={styles.rejectButton}
            onPress={() => setRejectModalVisible(true)}>
            <Text style={styles.bulkButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={approving || rejecting}
            style={styles.approveButton}
            onPress={handleBulkApprove}>
            <Text style={styles.bulkButtonText}>
              {approving ? 'Approving…' : 'Approve'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.reasonModal}>
            <Text style={styles.reasonTitle}>
              Reject {selectedClaims.length} claim(s)
            </Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Reason (optional)"
              multiline
              style={styles.reasonInput}
            />
            <View style={styles.reasonActions}>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={rejecting} onPress={handleBulkReject}>
                <Text style={styles.confirmReject}>
                  {rejecting ? 'Rejecting…' : 'Reject claims'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ── Additional styles to merge into your StyleSheet ──
const additionalStyles = StyleSheet.create({
  filterStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: Colors.darkButton,
    borderColor: Colors.darkButton,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
});

export default ExpenseApprovalListComponent;

// ─── Header Styles ─────────────────────────────────────────────────────────

const hStyles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusDropdown: {
    width: 150,
  },
  pill: {
    flex: 1,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  pillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  pillText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#475569',
  },

  pillTextActive: {
    color: Colors.orange,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
  },
  segmentText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontFamily: Fonts.semiBold,
  },
  yearRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  yearChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rangeField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 4,
  },
  rangeLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  rangeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangeValue: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#0F172A',
  },
  rangePlaceholder: {
    color: '#94A3B8',
  },
  rangeError: {
    marginTop: 8,
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#DC2626',
  },
  applyBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.darkButton,
  },
  applyBtnDisabled: {
    opacity: 0.4,
  },
  applyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  vDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 1,
    minWidth: 36,
  },
  statCount: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  totalBlock: {
    alignItems: 'center',
    minWidth: 32,
  },
  totalLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  totalCount: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: (width - 40 - 24) / 4,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridItemActive: {
    backgroundColor: Colors.darkButton,
    borderColor: Colors.darkButton,
  },
  gridTextActive: {
    color: '#FFFFFF',
  },
  gridText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: '#475569',
  },
});

// ─── List Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loaderBox: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  listContent: {
    paddingTop: 12,
    paddingBottom: 20,
    gap: 8,
    paddingHorizontal: 14,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },
  cardMain: {flexDirection: 'row', alignItems: 'center', gap: 8},
  selectButton: {padding: 4},
  filters: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  flex1: {flex: 1},
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    color: '#0f172a',
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  filterInput: {
    height: 38,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#0f172a',
    fontSize: 12,
    fontFamily: Fonts.regular,
    backgroundColor: '#f8fafc',
  },
  filterRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 38,
    paddingHorizontal: 6,
  },
  clearFilters: {
    color: Colors.darkButton,
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selectAllText: {
    color: '#334155',
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  bulkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  bulkCount: {
    flex: 1,
    color: '#334155',
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  approveButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: Colors.darkButton,
  },
  rejectButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  bulkButtonText: {color: '#fff', fontFamily: Fonts.semiBold, fontSize: 12},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  reasonModal: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    gap: 14,
  },
  reasonTitle: {fontFamily: Fonts.bold, fontSize: 16, color: '#0f172a'},
  reasonInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    color: '#0f172a',
  },
  reasonActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 22,
  },
  cancelText: {color: '#64748b', fontFamily: Fonts.medium},
  confirmReject: {color: '#dc2626', fontFamily: Fonts.bold},

  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  employeeName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.darkButton,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94a3b8',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    gap: 3,
  },
  dot: {width: 5, height: 5, borderRadius: 3},
  badgeText: {fontSize: 10, fontFamily: Fonts.medium},

  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  amountLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94a3b8',
  },
  amountValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.darkButton,
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  emptySub: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
