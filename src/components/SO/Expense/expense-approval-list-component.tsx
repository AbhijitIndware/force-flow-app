import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { useGetApprovalListQuery, useGetPendingApprovalsQuery } from '../../../features/tada/tadaApiv2';
import ReusableDropdownv2 from '../../ui-lib/resusable-dropdown-v2';
import { ApproverExpenseClaim } from '../../../types/tadaType';

const { width } = Dimensions.get('window');

// ─── Constants ─────────────────────────────────────────────────────────────

const MONTHS = moment.months().map((label, i) => ({
  label,
  short: moment().month(i).format('MMM'),
  value: i + 1,
}));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> =
{
  Submitted: { bg: '#fffbeb', color: '#d97706', dot: '#fbbf24' },
  'Pending Approval': { bg: '#fffbeb', color: '#d97706', dot: '#fbbf24' },
  Approved: { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
  Rejected: { bg: '#fff1f2', color: '#dc2626', dot: '#f87171' },
};

const getStatus = (s: string) =>
  STATUS_CONFIG[s] ?? { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };

// ─── Header Component ──────────────────────────────────────────────────────

interface HeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  counts: { pending: number; approved: number; rejected: number };

  setSelectedStatus: any;
  selectedStatus: string
}
const FILTER_OPTIONS = [
  { label: 'All', value: '' },
  // { label: 'Draft', value: 'Draft' },
  { label: 'Pending Approval', value: 'Pending Approval' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
];
const ApprovalHeader: React.FC<HeaderProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  counts,

  setSelectedStatus,
  selectedStatus,
}) => {
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const selectedMonthLabel =
    MONTHS.find(m => m.value === selectedMonth)?.label || '';

  return (
    <>
      <View style={hStyles.header}>
        {/* Pills + stats row */}
        <View style={hStyles.row}>
          {/* Year pill */}
          <TouchableOpacity
            style={hStyles.pill}
            onPress={() => setShowYearModal(true)}
            activeOpacity={0.7}>
            <Text style={hStyles.pillText}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={11} color="#64748B" />
          </TouchableOpacity>

          {/* Month pill */}
          <TouchableOpacity
            style={[hStyles.pill, hStyles.pillActive]}
            onPress={() => setShowMonthModal(true)}
            activeOpacity={0.7}>
            <Text style={[hStyles.pillText, hStyles.pillTextActive]}>
              {selectedMonthLabel}
            </Text>
            <Ionicons name="chevron-down" size={11} color={Colors.darkButton} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ReusableDropdownv2
              label="Claim Status"
              field="claim_type"
              value={selectedStatus}
              data={FILTER_OPTIONS}
              onChange={(val: string) => setSelectedStatus(val)}
              height={35}
              marginBottom={0}
              textSize={Size.xs}
              labelStyle={{ display: 'none' }}
            /></View>
        </View>
      </View>

      {/* Month picker modal */}
      <Modal
        visible={showMonthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthModal(false)}>
        <TouchableOpacity
          style={hStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowMonthModal(false)}>
          <View style={hStyles.sheet}>
            <View style={hStyles.handle} />
            <View style={hStyles.sheetHeader}>
              <Text style={hStyles.sheetTitle}>Select Month</Text>
              <TouchableOpacity
                onPress={() => setShowMonthModal(false)}
                style={hStyles.closeBtn}>
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={hStyles.grid}>
              {MONTHS.map(m => {
                const active = selectedMonth === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    style={[hStyles.gridItem, active && hStyles.gridItemActive]}
                    onPress={() => {
                      onMonthChange(m.value);
                      setShowMonthModal(false);
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
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year picker modal */}
      <Modal
        visible={showYearModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowYearModal(false)}>
        <TouchableOpacity
          style={hStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowYearModal(false)}>
          <View style={hStyles.sheet}>
            <View style={hStyles.handle} />
            <View style={hStyles.sheetHeader}>
              <Text style={hStyles.sheetTitle}>Select Year</Text>
              <TouchableOpacity
                onPress={() => setShowYearModal(false)}
                style={hStyles.closeBtn}>
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={hStyles.grid}>
              {YEARS.map(y => {
                const active = selectedYear === y;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[hStyles.gridItem, active && hStyles.gridItemActive]}
                    onPress={() => {
                      onYearChange(y);
                      setShowYearModal(false);
                    }}>
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
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Main List Component ───────────────────────────────────────────────────


const ExpenseApprovalListComponent = ({ navigation }: any) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useGetApprovalListQuery({
    month: selectedMonth,
    year: selectedYear,
    status: selectedStatus,
    page: page,
    page_size: 20,
  }, { refetchOnMountOrArgChange: true });

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
  }, [selectedMonth, selectedYear, selectedStatus]);

  // Derive counts from the full list (before client-side filter)
  const counts = claimList.reduce(
    (acc, item) => {
      const s = item.approval_status;
      if (s === 'Submitted' || s === 'Pending Approval') acc.pending += 1;
      else if (s === 'Approved') acc.approved += 1;
      else if (s === 'Rejected') acc.rejected += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 },
  );

  const renderItem = ({ item }: { item: ApproverExpenseClaim }) => {
    const st = getStatus(item.workflow_state);

    return (
      <TouchableOpacity
        style={styles.card}
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
          <View style={[styles.badge, { backgroundColor: st.bg }]}>
            <View style={[styles.dot, { backgroundColor: st.dot }]} />
            <Text style={[styles.badgeText, { color: st.color }]}>
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
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ApprovalHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={m => setSelectedMonth(m)}
        onYearChange={y => setSelectedYear(y)}
        setSelectedStatus={setSelectedStatus}
        selectedStatus={selectedStatus}
        counts={counts}
      />

      {/* ── Status Filter Strip ── */}

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
                {MONTHS.find(m => m.value === selectedMonth)?.label}{' '}
                {selectedYear}. Try a different period.
              </Text>
            </View>
          }
        />
      )}
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
    gap: 0,
  },
  pill: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  pillText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#475569',
  },
  pillTextActive: {
    color: Colors.darkButton,
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
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },

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
  dot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 10, fontFamily: Fonts.medium },

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