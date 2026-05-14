import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { VisibilityClaim } from '../../../types/tadaType';
import { useGetApproverVisibilityClaimsQuery } from '../../../features/tada/tadaApiv2';

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> =
{
  Approved: { bg: '#16a34a20', color: '#16a34a', dot: '#22c55e' },
  Rejected: { bg: '#dc262620', color: '#dc2626', dot: '#f87171' },
  Submitted: { bg: '#d9770620', color: '#d97706', dot: '#fbbf24' },
  Pending: { bg: '#6B728020', color: '#6B7280', dot: '#94a3b8' },
};

const getStatus = (s: string) =>
  STATUS_CONFIG[s] ?? { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };

const fmt = (v: number) => (v > 0 ? `₹${v.toLocaleString('en-IN')}` : null);

const VisibilityApprovalListComponent = ({ navigation }: any) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isFetching, refetch } = useGetApproverVisibilityClaimsQuery({
    month: selectedMonth,
    year: selectedYear,
    page: page,
    page_size: 20,
  });

  const onRefresh = async () => {
    setPage(1);
    await refetch();
  };

  const claimList: VisibilityClaim[] =
    data?.message?.data?.visibility_claims || [];
  const pagination = data?.message?.data?.pagination;

  const handleLoadMore = () => {
    if (pagination?.has_more && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear]);
  const pendingClaims = claimList.filter(
    item => item.docstatus === 1 && item.approval_status === 'Submitted',
  );

  const renderItem = ({ item }: { item: VisibilityClaim }) => {
    const st = getStatus(item.approval_status);
    const amounts = [
      { label: 'Collect', value: fmt(item.collection_amount) },
      { label: 'P.Diff', value: fmt(item.price_difference_amount) },
      { label: 'Damage', value: fmt(item.damage_claim), warn: true },
    ].filter(a => a.value);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate('VisibilityApprovalDetailScreen', {
            claimId: item.claim_id,
          })
        }>
        {/* Row 1: store + date + badge */}
        <View style={styles.row1}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.claim_id}
          </Text>
          <Text style={styles.dateText}>
            {moment(item.date).format('DD MMM YY')}
          </Text>
          <View style={[styles.badge, { backgroundColor: st.bg }]}>
            <View style={[styles.dot, { backgroundColor: st.dot }]} />
            <Text style={[styles.badgeText, { color: st.color }]}>
              {item.approval_status}
            </Text>
          </View>
        </View>

        {/* Row 2: employee name */}
        <Text style={styles.employeeText} numberOfLines={1}>
          👤 {item.employee}
        </Text>

        {/* Row 3: amounts + payment pill + chevron */}
        <View style={styles.row3}>
          <View style={styles.amountsGroup}>
            {amounts.map(a => (
              <View key={a.label} style={styles.amountItem}>
                <Text style={styles.amountLabel}>{a.label}</Text>
                <Text
                  style={[styles.amountValue, a.warn && { color: '#ea580c' }]}>
                  {a.value}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.rightGroup}>
            <View style={styles.paymentPill}>
              <Text style={styles.paymentText}>{item.payment_type}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={Colors.darkButton} />
        </View>
      ) : (
        <FlatList
          data={pendingClaims}
          keyExtractor={item => item.claim_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
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
              <Text style={styles.emptyTitle}>No Pending Claims</Text>
              <Text style={styles.emptySub}>
                All visibility claims have been reviewed. Check back later.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default VisibilityApprovalListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 14,
  },
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingTop: 12, paddingBottom: 20, gap: 8 },

  // ── Compact card ──
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
    gap: 5,
  },

  // Row 1: store + date + badge
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
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

  // Row 2: employee
  employeeText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#64748b',
  },

  // Row 3: amounts + payment + chevron
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountsGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  amountItem: { alignItems: 'flex-start' },
  amountLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#94a3b8',
  },
  amountValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.darkButton,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentPill: {
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  paymentText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: '#3b82f6',
  },

  // Empty
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
