import {
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, { JSX, useMemo } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import {
  useGetMyExpenseClaimsQuery,
  useGetMyTadaSummaryQuery,
} from '../../../features/tada/tadaApiv2';
import {
  CircleCheckBig,
  CircleX,
  RotateCw,
  Wallet,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MONTHS = moment.months().map((label, i) => ({ label, short: moment().month(i).format('MMM'), value: i + 1 }));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const ExpenseComponent = ({ navigation }: any) => {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(CURRENT_YEAR);
  const [showMonthModal, setShowMonthModal] = React.useState(false);
  const [showYearModal, setShowYearModal] = React.useState(false);

  const { data: claimsData, isLoading: claimsLoading, isFetching: claimsFetching } =
    useGetMyExpenseClaimsQuery({ month: selectedMonth, year: selectedYear });

  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useGetMyTadaSummaryQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const claims = claimsData?.message?.data || [];
  console.log("🚀 ~ ExpenseComponent ~ claims:", claims)

  const counts = useMemo(() => {
    return claims.reduce(
      (acc: any, claim: any) => {
        const status = (claim.approval_status || '').toLowerCase();
        if (status === 'pending' || status === 'submitted') acc.pending++;
        else if (status === 'approved') acc.approved++;
        else if (status === 'rejected') acc.rejected++;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 },
    );
  }, [claims]);

  const totalConsumed = useMemo(() => {
    const consumed = summaryData?.message?.data?.consumed;
    if (!consumed) return 0;
    return (
      (consumed.DA || 0) +
      (consumed.Lodging || 0) +
      (consumed.TA || 0) +
      (consumed.Telecom || 0) +
      (consumed.Incidental || 0)
    );
  }, [summaryData]);

  const selectedMonthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || '';

  if (claimsLoading || summaryLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.orange} />
        <Text style={styles.loadingText}>Loading Expense Data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Filter Row: Year + Month Dropdowns ── */}
        <View style={styles.filterRow}>
          {/* Year Dropdown Trigger */}
          <TouchableOpacity
            style={styles.yearTrigger}
            onPress={() => setShowYearModal(true)}
            activeOpacity={0.8}>
            <Text style={styles.yearTriggerText}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.white} />
          </TouchableOpacity>

          {/* Month Dropdown Trigger */}
          <TouchableOpacity
            style={styles.monthTrigger}
            onPress={() => setShowMonthModal(true)}
            activeOpacity={0.8}>
            <Ionicons name="calendar-outline" size={16} color={Colors.orange} />
            <Text style={styles.monthTriggerText}>{selectedMonthLabel}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* ── Minimal Summary Card: Breakdown + Total ── */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={['#2D3748', '#1A202C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>DA</Text>
                  <Text style={styles.breakdownValue}>₹{summaryData?.message?.data?.consumed?.DA || 0}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>TA</Text>
                  <Text style={styles.breakdownValue}>₹{summaryData?.message?.data?.consumed?.TA || 0}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Lodging</Text>
                  <Text style={styles.breakdownValue}>₹{summaryData?.message?.data?.consumed?.Lodging || 0}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Telecom</Text>
                  <Text style={styles.breakdownValue}>₹{summaryData?.message?.data?.consumed?.Telecom || 0}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Incid</Text>
                  <Text style={styles.breakdownValue}>₹{summaryData?.message?.data?.consumed?.Incidental || 0}</Text>
                </View>
              </View>

              <View style={styles.hSeparator} />

              <View style={styles.totalRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Wallet size={16} color={Colors.orange} />
                  <Text style={styles.totalLabel}>Total Consumption</Text>
                </View>
                <Text style={styles.totalAmount}>₹ {totalConsumed.toLocaleString()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Consolidated Status Card ── */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <View style={[styles.miniIconBox, { backgroundColor: '#FFF7ED' }]}>
                <RotateCw size={14} color={Colors.orange} />
              </View>
              <View>
                <Text style={[styles.overviewCount, { color: Colors.orange }]}>{counts.pending}</Text>
                <Text style={styles.overviewLabel}>Pending</Text>
              </View>
            </View>
            <View style={styles.vSeparator} />
            <View style={styles.overviewItem}>
              <View style={[styles.miniIconBox, { backgroundColor: '#F0FDF4' }]}>
                <CircleCheckBig size={14} color={Colors.success} />
              </View>
              <View>
                <Text style={[styles.overviewCount, { color: Colors.success }]}>{counts.approved}</Text>
                <Text style={styles.overviewLabel}>Approved</Text>
              </View>
            </View>
            <View style={styles.vSeparator} />
            <View style={styles.overviewItem}>
              <View style={[styles.miniIconBox, { backgroundColor: '#FEF2F2' }]}>
                <CircleX size={14} color={Colors.error} />
              </View>
              <View>
                <Text style={[styles.overviewCount, { color: Colors.error }]}>{counts.rejected}</Text>
                <Text style={styles.overviewLabel}>Rejected</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Recent Claims ── */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.SectionHeading}>Recent claims</Text>
            {claimsFetching && <ActivityIndicator size="small" color={Colors.orange} />}
          </View>

          {claims.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No claims found for this month</Text>
            </View>
          ) : (
            claims.map((claim) => {
              const statusMap: Record<string, {
                color: string; bg: string; icon: JSX.Element; label: string;
              }> = {
                Approved: {
                  color: '#3B6D11', bg: '#EAF3DE',
                  icon: <CircleCheckBig size={20} color="#3B6D11" />,
                  label: 'Approved',
                },
                Rejected: {
                  color: '#A32D2D', bg: '#FCEBEB',
                  icon: <CircleX size={20} color="#A32D2D" />,
                  label: 'Rejected',
                },
              };
              const s = statusMap[claim.approval_status] ?? {
                color: '#854F0B', bg: '#FAEEDA',
                icon: <RotateCw size={20} color="#854F0B" />,
                label: claim.approval_status || 'Pending',
              };

              return (
                <TouchableOpacity
                  key={claim.name}
                  style={styles.claimCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('AddExpenseScreen', { claimId: claim.name })
                  }>
                  {/* Status icon box */}
                  <View style={[styles.claimIconBox, { backgroundColor: s.bg }]}>
                    {s.icon}
                  </View>

                  {/* Body */}
                  <View style={styles.claimBody}>
                    <Text style={styles.claimId}>{claim.name}</Text>
                    <Text style={styles.claimDate}>
                      {moment(claim.custom_travel_end_date).format('DD MMM YYYY')}
                    </Text>
                  </View>

                  {/* Right */}
                  <View style={styles.claimRight}>
                    <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
                      <Text style={[styles.claimStatus, { color: s.color }]}>{s.label}</Text>
                    </View>
                    <Text style={styles.claimAmount}>
                      ₹ {Number(claim.total_claimed_amount).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {/* Chevron */}
                  <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Floating Claim Button ── */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddExpenseScreen')}
        style={styles.floatingButton}
        activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.white} />
        <Text style={styles.floatingButtonText}>Add Claim</Text>
      </TouchableOpacity>

      {/* ── Month Picker Modal ── */}
      <Modal
        visible={showMonthModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthModal(false)}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                <Ionicons name="close" size={24} color={Colors.darkButton} />
              </TouchableOpacity>
            </View>
            <View style={styles.monthGrid}>
              {MONTHS.map(m => {
                const isActive = selectedMonth === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.monthItem, isActive && styles.monthItemActive]}
                    onPress={() => {
                      setSelectedMonth(m.value);
                      setShowMonthModal(false);
                    }}>
                    <Text style={[styles.monthItemText, isActive && styles.monthItemTextActive]}>
                      {m.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Year Picker Modal ── */}
      <Modal
        visible={showYearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearModal(false)}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Ionicons name="close" size={24} color={Colors.darkButton} />
              </TouchableOpacity>
            </View>
            <View style={styles.yearGrid}>
              {YEARS.map(y => {
                const isActive = selectedYear === y;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearItem, isActive && styles.yearItemActive]}
                    onPress={() => {
                      setSelectedYear(y);
                      setShowYearModal(false);
                    }}>
                    <Text style={[styles.yearItemText, isActive && styles.yearItemTextActive]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ExpenseComponent;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },

  // ── Filter Row ──
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  yearTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  yearTriggerText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
  },
  monthTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  monthTriggerText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },

  // ── Minimal Summary Card ──
  summaryContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryContent: {
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownItem: {
    alignItems: 'center',
    gap: 2,
  },
  breakdownLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  breakdownValue: {
    fontFamily: Fonts.bold,
    fontSize: Size.xs,
    color: Colors.white,
  },
  hSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  totalAmount: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.orange,
  },

  // ── Overview Card ──
  overviewContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  overviewItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  miniIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCount: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    lineHeight: 16,
  },
  overviewLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.gray,
    textTransform: 'uppercase',
  },
  vSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: '#F0F2F6',
  },

  // ── Floating Action Button ──
  floatingButton: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: Colors.orange,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 6,
    elevation: 10,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 999,
  },
  floatingButtonText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.white,
  },

  // ── Claims List ──
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  SectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  claimLeft: { gap: 6 },
  claimId: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: '#1E293B',
  },
  claimDate: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.gray,
  },
  claimRight: { alignItems: 'flex-end', gap: 8 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  claimStatus: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  claimAmount: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: '#1E293B',
  },
  emptyBox: { padding: 30, alignItems: 'center' },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.gray,
  },

  // ── Modals ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthItem: {
    width: (width - 40 - 24) / 4,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F5F4F1',
    alignItems: 'center',
  },
  monthItemActive: {
    backgroundColor: Colors.orange,
  },
  monthItemText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: '#444',
  },
  monthItemTextActive: {
    fontFamily: Fonts.medium,
    color: Colors.white,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearItem: {
    width: (width - 40 - 16) / 3,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F5F4F1',
    alignItems: 'center',
  },
  yearItemActive: {
    backgroundColor: Colors.darkButton,
  },
  yearItemText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: '#444',
  },
  yearItemTextActive: {
    fontFamily: Fonts.medium,
    color: Colors.white,
  },
  claimCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  claimIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  claimBody: {
    flex: 1,
    gap: 3,
  }
});