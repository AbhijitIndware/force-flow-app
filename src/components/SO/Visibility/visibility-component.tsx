import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {VisibilityClaim} from '../../../types/tadaType';
import VisibilityHeader from './VisibilityHeader';
import {useGetMyVisibilityClaimsQuery} from '../../../features/tada/tadaApiv2';

const STATUS_CONFIG: Record<string, {bg: string; color: string; dot: string}> =
  {
    Approved: {bg: '#16a34a20', color: '#16a34a', dot: '#22c55e'},
    Rejected: {bg: '#dc262620', color: '#dc2626', dot: '#f87171'},
    Submitted: {bg: '#d9770620', color: '#d97706', dot: '#fbbf24'},
    Draft: {bg: '#6B728020', color: '#6B7280', dot: '#94a3b8'},
    Cancelled: {bg: '#6B728020', color: '#6B7280', dot: '#94a3b8'},
  };

const getStatus = (s: string) =>
  STATUS_CONFIG[s] ?? {bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8'};

const fmt = (v: number) => (v > 0 ? `₹${v.toLocaleString('en-IN')}` : null);

const VisibilityComponent = ({navigation}: any) => {
  const [selectedMonth, setSelectedMonth] = React.useState(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = React.useState(
    new Date().getFullYear(),
  );
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [page, setPage] = React.useState(1);

  const {data, isLoading, isFetching} = useGetMyVisibilityClaimsQuery({
    month: selectedMonth,
    year: selectedYear,
    status: selectedStatus,
    page: page,
    page_size: 20,
  });
  const claimList: VisibilityClaim[] =
    data?.message?.data?.visibility_claims || [];

  const pagination = data?.message?.data?.pagination;

  const handleLoadMore = () => {
    if (pagination?.has_more && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  React.useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear, selectedStatus]);

  const renderItem = ({item}: {item: VisibilityClaim}) => {
    const st = getStatus(item.approval_status);
    const amounts = [
      {label: 'Collection Amount', value: fmt(item.collection_amount)},
      // {label: 'P.Diff', value: fmt(item.price_difference_amount)},
      // {label: 'Damage', value: fmt(item.damage_claim), warn: true},
    ].filter(a => a.value);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate('VisibilityApprovalDetailScreen', {
            claimId: item.claim_id,
            isApprover: false,
          })
        }>
        {/* Row 1: store + date */}
        <View style={styles.row1}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.claim_id}
          </Text>
          <Text style={styles.dateText}>
            {moment(item.date).format('DD MMM YY')}
          </Text>
        </View>

        {/* Row 2: amounts + badge */}
        <View style={styles.row2}>
          <View style={styles.amountsGroup}>
            {amounts.map(a => (
              <View key={a.label} style={styles.amountItem}>
                <Text style={styles.amountLabel}>{a.label}</Text>
                <Text style={[styles.amountValue]}>{a.value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.badge, {backgroundColor: st.bg}]}>
            <View style={[styles.dot, {backgroundColor: st.dot}]} />
            <Text style={[styles.badgeText, {color: st.color}]}>
              {item.approval_status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <VisibilityHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      {isLoading || isFetching ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={Colors.darkButton} />
        </View>
      ) : (
        <FlatList
          data={claimList}
          keyExtractor={item => item.claim_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>No Claims Found</Text>
              <Text style={styles.emptySub}>
                Tap below to create your first visibility claim.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddVisibilityScreen')}
        style={styles.claimButton}>
        <Text style={styles.claimButtonText}>Create Visibility Claim</Text>
        <View style={styles.iconCircle}>
          <Ionicons name="add" size={15} color={Colors.darkButton} />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VisibilityComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    // paddingHorizontal: 14,
  },
  loaderBox: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  listContent: {padding: 10, gap: 8},

  // ── Compact card ──
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
    gap: 5,
  },

  // Row 1
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
    borderRadius: 10,
    gap: 3,
  },
  dot: {width: 5, height: 5, borderRadius: 3},
  badgeText: {fontSize: 10, fontFamily: Fonts.medium},

  // Row 2
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountsGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  amountItem: {alignItems: 'flex-start'},
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

  // CTA
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 10,
    marginVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    marginHorizontal: 15,
  },
  claimButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
