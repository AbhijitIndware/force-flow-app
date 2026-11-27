import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { CalendarPlus } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import PageHeader from '../../../components/ui/PageHeader';
import { SoAppStackParamList } from '../../../types/Navigation';
import {
  useCancelLeaveMutation,
  useGetLeaveBalancesQuery,
  useGetMyLeavesQuery,
} from '../../../features/base/base-api';
import { LeaveApplication, leaveRows } from '../../../types/leaveType';
import {
  getSafeServerMessage,
  isServerSuccess,
  getUserFacingError,
} from '../../../utils/errorMessage';

type Props = {
  navigation: NativeStackNavigationProp<SoAppStackParamList, 'LeaveScreen'>;
};

export const LEAVE_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  Open: { bg: '#FEF3C7', fg: '#B45309' },
  Approved: { bg: '#DCFCE7', fg: '#15803D' },
  Rejected: { bg: '#FEE2E2', fg: '#B91C1C' },
  Cancelled: { bg: '#F1F5F9', fg: '#475569' },
};

/** Label for a leave row from its stage (falls back to status). */
function stageLabel(item: LeaveApplication): string {
  if (item.status === 'Cancelled') return 'Cancelled';
  switch (item.stage) {
    case 'With Manager':
      return 'Waiting for manager';
    case 'With HR':
      return 'Approved by manager, waiting for HR';
    case 'Done':
      return item.status;
    default:
      return item.status === 'Open' ? 'Waiting for approval' : item.status;
  }
}

function formatDays(n?: number) {
  if (n === undefined || n === null) return '';
  return `${n} day${n === 1 ? '' : 's'}`;
}

const LeaveScreen = ({ navigation }: Props) => {
  const {
    data: balanceData,
    isFetching: isFetchingBalances,
    refetch: refetchBalances,
  } = useGetLeaveBalancesQuery(undefined, { refetchOnMountOrArgChange: true });
  const {
    data: leavesData,
    isLoading,
    isFetching,
    refetch: refetchLeaves,
  } = useGetMyLeavesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [cancelLeave] = useCancelLeaveMutation();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const balances = balanceData?.message?.data?.balances ?? [];
  const leaves = leaveRows(leavesData?.message?.data);

  const onRefresh = useCallback(() => {
    refetchBalances();
    refetchLeaves();
  }, [refetchBalances, refetchLeaves]);

  const withdraw = (item: LeaveApplication) => {
    Alert.alert(
      'Withdraw leave',
      `Withdraw your ${item.leave_type} from ${moment(item.from_date).format(
        'DD MMM',
      )}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(item.name);
              const res = await cancelLeave({
                leave_application_id: item.name,
              }).unwrap();
              const msg = getSafeServerMessage(res?.message?.message);
              Toast.show({
                type: isServerSuccess(res) ? 'success' : 'error',
                text1:
                  msg ??
                  (isServerSuccess(res)
                    ? 'Leave withdrawn'
                    : 'Could not withdraw the leave'),
              });
            } catch (err: any) {
              Toast.show({
                type: 'error',
                text1: getUserFacingError(err, 'Could not withdraw the leave'),
              });
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View>
      <Text style={styles.sectionTitle}>Leave balance</Text>
      <View style={styles.balanceRow}>
        {balances.length === 0 && !isFetchingBalances ? (
          <Text style={styles.mutedText}>No leave balance found.</Text>
        ) : (
          balances.map(b => (
            <View key={b.leave_type} style={styles.balanceCard}>
              <Text style={styles.balanceType}>{b.leave_type}</Text>
              <Text style={styles.balanceValue}>{b.available ?? 0}</Text>
              <Text style={styles.balanceSub}>available</Text>
              <View style={styles.balanceMeta}>
                <Text style={styles.metaText}>Balance {b.balance ?? 0}</Text>
                <Text style={styles.metaText}>Pending {b.pending ?? 0}</Text>
              </View>
              <View style={styles.balanceMeta}>
                <Text style={styles.metaText}>Credited {b.credited ?? 0}</Text>
                <Text style={styles.metaText}>Taken {b.taken ?? 0}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() =>
          navigation.navigate('ApplyLeaveScreen', {
            leaveTypes: balanceData?.message?.data?.leave_types,
          })
        }>
        <CalendarPlus size={18} strokeWidth={1.8} color={Colors.white} />
        <Text style={styles.applyButtonText}>Apply for Leave</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>My leaves</Text>
    </View>
  );

  const renderItem = ({ item }: { item: LeaveApplication }) => {
    const colors =
      LEAVE_STATUS_COLORS[item.status] ?? LEAVE_STATUS_COLORS.Open;
    const sameDay = item.from_date === item.to_date;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardType}>{item.leave_type}</Text>
            <Text style={styles.cardDates}>
              {moment(item.from_date).format('DD MMM YYYY')}
              {sameDay ? '' : ` – ${moment(item.to_date).format('DD MMM YYYY')}`}
              {item.total_leave_days !== undefined
                ? `  ·  ${formatDays(item.total_leave_days)}`
                : ''}
              {item.half_day ? '  ·  Half day' : ''}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.fg }]}>
              {stageLabel(item)}
            </Text>
          </View>
        </View>

        {!!(item.reason || item.description) && (
          <Text style={styles.reasonText}>
            {item.reason || item.description}
          </Text>
        )}
        {!!item.note && <Text style={styles.noteText}>{item.note}</Text>}
        {!!item.manager_remarks && (
          <Text style={styles.remarkText}>
            Manager: {item.manager_remarks}
          </Text>
        )}
        {!!item.hr_remarks && (
          <Text style={styles.remarkText}>HR: {item.hr_remarks}</Text>
        )}

        {item.status === 'Open' && (
          <TouchableOpacity
            style={styles.withdrawButton}
            disabled={cancellingId === item.name}
            onPress={() => withdraw(item)}>
            {cancellingId === item.name ? (
              <ActivityIndicator size="small" color={Colors.danger} />
            ) : (
              <Text style={styles.withdrawText}>Withdraw</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader title="Leave" navigation={() => navigation.goBack()} />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.darkButton} />
        </View>
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={item => item.name}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <Text style={[styles.mutedText, { textAlign: 'center', marginTop: 20 }]}>
              No leave applied yet.
            </Text>
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching || isFetchingBalances}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default LeaveScreen;

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    marginBottom: 10,
  },
  mutedText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#64748b',
  },
  balanceRow: { flexDirection: 'row', gap: 10 },
  balanceCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
  },
  balanceType: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: '#475569',
  },
  balanceValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 26,
    color: Colors.darkButton,
    marginTop: 4,
  },
  balanceSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#64748b',
    marginTop: -2,
    marginBottom: 6,
  },
  balanceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaText: { fontFamily: Fonts.regular, fontSize: 10, color: '#64748b' },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.darkButton,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 14,
  },
  applyButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardType: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  cardDates: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#475569',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '50%',
  },
  badgeText: { fontFamily: Fonts.semiBold, fontSize: 10, textAlign: 'center' },
  reasonText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#334155',
    marginTop: 8,
  },
  noteText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.orange,
    marginTop: 6,
  },
  remarkText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#64748b',
    marginTop: 4,
  },
  withdrawButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    minWidth: 90,
    alignItems: 'center',
  },
  withdrawText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.danger,
  },
});
