import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useMemo } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import {
  useGetMyExpenseClaimsQuery,
  useGetMyTadaSummaryQuery,
} from '../../../features/tada/tadaApiv2';
import ExpenseHeader from './ExpenseComponent/ExpenseHeader';
import ExpenseClaimCard from './ExpenseComponent/Expenseclaimcard';

const CURRENT_YEAR = new Date().getFullYear();

interface ConsumedData {
  DA?: number;
  TA?: number;
  Lodging?: number;
  Telecom?: number;
  Incidental?: number;
}

const ExpenseComponent = ({ navigation }: any) => {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(CURRENT_YEAR);

  const { data: claimsData, isLoading: claimsLoading, isFetching: claimsFetching } =
    useGetMyExpenseClaimsQuery({ month: selectedMonth, year: selectedYear });

  const { data: summaryData, isLoading: summaryLoading } = useGetMyTadaSummaryQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const claims = claimsData?.message?.data || [];
  const consumed = (summaryData?.message?.data?.consumed || {}) as ConsumedData;

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
    return (
      (consumed.DA || 0) +
      (consumed.Lodging || 0) +
      (consumed.TA || 0) +
      (consumed.Telecom || 0) +
      (consumed.Incidental || 0)
    );
  }, [consumed]);

  if (claimsLoading || summaryLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.orange} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* ── Sticky Header with embedded summary ── */}
        <ExpenseHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          totalConsumed={totalConsumed}
          consumed={consumed}
          counts={counts}
        />

        {/* ── Claims List ── */}
        <View style={styles.listContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Claims</Text>
            {claimsFetching
              ? <ActivityIndicator size="small" color={Colors.orange} />
              : <Text style={styles.sectionCount}>{claims.length}</Text>
            }
          </View>

          {claims.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={28} color="#CBD5E1" />
              <Text style={styles.emptyText}>No claims this period</Text>
            </View>
          ) : (
            claims.map((claim: any) => (
              <ExpenseClaimCard
                key={claim.name}
                claim={claim}
                onPress={() =>
                  navigation.navigate('AddExpenseScreen', { claimId: claim.name })
                }
              />
            ))
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddExpenseScreen')}
        style={styles.fab}
        activeOpacity={0.85}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Claim</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExpenseComponent;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  sectionCount: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#94A3B8',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: Colors.orange,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 999,
  },
  fabText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: '#FFFFFF',
  },
});