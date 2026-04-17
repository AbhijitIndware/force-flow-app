import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../utils/colors';
import React, { useCallback, useEffect, useState } from 'react';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { Funnel, Search } from 'lucide-react-native';
import FilterModal from '../../../components/ui/filterModal';
import { windowHeight } from '../../../utils/utils';
import { EmployeeData } from '../../../types/baseType';

type Props = {
  navigation: any;
  data: EmployeeData[];
  refetch: any;
  isFetching: boolean;
};

// ── Initials helper ──────────────────────────────────────────────────────────
const getInitials = (name?: string) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Cycle through a few warm/neutral avatar palette pairs
const AVATAR_PALETTE = [
  { bg: '#FFF4EC', border: '#FDDBB8', text: '#C2540A' },
  { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' },
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  { bg: '#FDF4FF', border: '#E9D5FF', text: '#6B21A8' },
  { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
];

// ── Card component ────────────────────────────────────────────────────────────
const SaleCard = ({ item, index }: { item: EmployeeData; index: number }) => {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = getInitials(item?.employee_name);

  return (
    <View style={styles.card}>
      {/* Top row — avatar + name + designation */}
      <View style={styles.cardTop}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: palette.bg, borderColor: palette.border },
          ]}>
          <Text style={[styles.avatarText, { color: palette.text }]}>
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.empName} numberOfLines={1}>
            {item?.employee_name || 'Unknown'}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item?.designation || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        {/* <View style={styles.stat}>
          <Text style={styles.statLabel}>Employee ID</Text>
          <Text style={[styles.statValue, { fontSize: 12 }]} numberOfLines={1}>
            {item?.employee_id || 'N/A'}
          </Text>
        </View> */}
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={[styles.statValue, styles.orangeText]}>
            {item?.total_orders ?? 0}
          </Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Quantity</Text>
          <Text style={[styles.statValue, styles.orangeText]}>
            {item?.total_qty ?? 0}
          </Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Amount</Text>
          <Text style={[styles.statValue, styles.greenText]}>
            ₹{item?.total_value ?? 0}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
const RecentTeamSaleScreen = ({
  navigation,
  data,
  refetch,
  isFetching,
}: Props) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [sale, setSales] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
    }, 2000);
  }, [refetch]);

  useEffect(() => {
    if (data) setSales(data);
  }, [data]);

  return (
    <View style={styles.root}>
      {/* ── Header bar ── */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Recent team sales</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Search size={16} color={Colors.darkButton} strokeWidth={1.8} />
          </TouchableOpacity>
          <FilterModal
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
            onApply={() => setModalVisible(false)}>
            <Text onPress={() => { }} style={{ paddingVertical: 10 }}>
              All
            </Text>
          </FilterModal>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setModalVisible(true)}>
            <Funnel size={16} color={Colors.darkButton} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content ── */}
      {isFetching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      ) : sale.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No recent team sales found</Text>
        </View>
      ) : (
        <FlatList
          data={sale}
          nestedScrollEnabled={true}
          contentContainerStyle={{ paddingBottom: 30, paddingTop: 4 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.orange]}
              tintColor={Colors.orange}
            />
          }
          renderItem={({ item, index }) => <SaleCard item={item} index={index} />}
          keyExtractor={(item, index) =>
            `${item.employee_id}-${index}-${item?.designation}`
          }
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default RecentTeamSaleScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 20,
  },

  // ── Header ──
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E4E9',
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: '#E2E4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E2E4E9',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  empName: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 3,
  },
  badgeText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#6B7280',
  },

  divider: {
    height: 0.5,
    backgroundColor: '#E2E4E9',
    marginBottom: 12,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statSep: {
    width: 0.5,
    height: 32,
    backgroundColor: '#E2E4E9',
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 3,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
    textAlign: 'center',
  },
  orangeText: { color: Colors.orange },
  greenText: { color: Colors.sucess },

  // ── States ──
  centered: {
    height: windowHeight * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: '#9CA3AF',
  },
});
