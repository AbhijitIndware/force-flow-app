import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import { flexCol } from '../../../utils/styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import {
  User,
  CalendarDays,
  Store,
  Clock,
  MapPin,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react-native';
import { useGetAsmTeamDetailQuery } from '../../../features/base/base-api';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'TeamDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const TeamDetailScreen = ({ navigation, route }: Props) => {
  const { employee_id } = route?.params ?? {};
  const rawDate = route?.params?.date;
  const date: string =
    rawDate instanceof Date
      ? rawDate.toISOString().split('T')[0]
      : typeof rawDate === 'string'
        ? rawDate
        : new Date().toISOString().split('T')[0];

  const { data, isFetching, isError, refetch } = useGetAsmTeamDetailQuery(
    { employee: employee_id, date },
    { skip: !employee_id || !date, refetchOnMountOrArgChange: true },
  );

  const msg = data?.message;
  const emp = msg?.employee;
  const summary = msg?.summary;
  const storeList = msg?.store_list ?? [];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: '#F0F2F6' }]}>
        <PageHeader title="Employee Activity" navigation={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFB302" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError || !msg?.success) {
    return (
      <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: '#F0F2F6' }]}>
        <PageHeader title="Employee Activity" navigation={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load team detail</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = emp?.employee_name
    ? emp.employee_name
      .split(' ')
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
    : '--';

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: '#F0F2F6' }]}>
      <PageHeader title={`${emp?.employee_name || 'Employee'} Activity`} navigation={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Profile Card — tap → DetailByUserScreen */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() =>
            navigation.navigate('DetailByUserScreen', {
              employee_id,
              date,
            })
          }>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{emp?.employee_name ?? '—'}</Text>
              <Text style={styles.profileDesig}>{emp?.designation ?? ''}</Text>
              <View style={styles.dateRow}>
                <CalendarDays size={14} color="#828282" />
                <Text style={styles.dateText}>Date: {String(date)}</Text>
              </View>
              {/* Attendance badge */}
              <View
                style={[
                  styles.attBadge,
                  {
                    backgroundColor:
                      emp?.attendance_status === 'Present'
                        ? '#E7F8EA'
                        : '#FBE8E8',
                    borderColor:
                      emp?.attendance_status === 'Present'
                        ? '#0AB72A40'
                        : '#D3101040',
                  },
                ]}>
                <Text
                  style={[
                    styles.attBadgeText,
                    {
                      color:
                        emp?.attendance_status === 'Present'
                          ? '#0AB72A'
                          : '#D31010',
                    },
                  ]}>
                  {emp?.attendance_status ?? '—'}
                </Text>
              </View>
              {emp?.check_in_time && (
                <Text style={styles.checkInText}>Check-In: {emp.check_in_time}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Metrics Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#E3ECFF' }]}>
              <Store size={22} color="#367CFF" strokeWidth={2} />
            </View>
            <Text style={[styles.metricValue, { color: '#367CFF' }]}>
              {summary?.total_store ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Total Store</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#E7F8EA' }]}>
              <CheckCircle2 size={22} color="#0AB72A" strokeWidth={2} />
            </View>
            <Text style={[styles.metricValue, { color: '#0AB72A' }]}>
              {summary?.visited ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Visited</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#FFE9D4' }]}>
              <Clock size={22} color="#FF7B00" strokeWidth={2} />
            </View>
            <Text style={[styles.metricValue, { color: '#FF7B00' }]}>
              {summary?.pending ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Pending</Text>
          </View>
        </View>

        {/* Orders Summary Strip */}
        {msg?.orders_summary && (
          <View style={styles.orderStrip}>
            <View style={styles.orderStripItem}>
              <Text style={styles.orderStripVal}>
                {msg.orders_summary.orders}
              </Text>
              <Text style={styles.orderStripLabel}>Orders</Text>
            </View>
            <View style={styles.orderStripDivider} />
            <View style={styles.orderStripItem}>
              <Text style={[styles.orderStripVal, { color: '#367CFF' }]}>
                ₹{msg.orders_summary.order_value}
              </Text>
              <Text style={styles.orderStripLabel}>Value</Text>
            </View>
            <View style={styles.orderStripDivider} />
            <View style={styles.orderStripItem}>
              <Text style={[styles.orderStripVal, { color: '#FF7B00' }]}>
                {msg.orders_summary.total_items}
              </Text>
              <Text style={styles.orderStripLabel}>Total Items qty</Text>
            </View>
          </View>
        )}

        {/* Store List */}
        <View style={styles.listHeaderRow}>
          <View style={styles.listIconBox}>
            <ListOrdered size={16} color="#FFB302" strokeWidth={2.5} />
          </View>
          <Text style={styles.listTitle}>Store List</Text>
        </View>

        {storeList.length === 0 ? (
          <Text style={styles.emptyText}>No stores found</Text>
        ) : (
          storeList.map((store: any) => (
            <TouchableOpacity
              key={store.store_id}
              style={styles.storeCard}
              onPress={() =>
                navigation.navigate('DetailByStoreScreen', {
                  store_id: store.store_id,
                  date,
                  employee_id,
                })
              }>
              <View style={styles.storeIconWrap}>
                <MapPin size={18} color="#FFB302" strokeWidth={2.5} />
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.store_name}</Text>
                <Text style={styles.storeSub}>
                  {store.store_type}
                  {store.city ? ` · ${store.city}` : ''}
                </Text>
                {store.check_in_time && (
                  <Text style={styles.storeTime}>
                    Check-In: {store.check_in_time}
                    {store.spent_time ? `  ·  ${store.spent_time}` : ''}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.statusBadge,
                  store.status === 'Visited'
                    ? { backgroundColor: '#E7F8EA', borderColor: '#0AB72A40' }
                    : { backgroundColor: '#FFE9D4', borderColor: '#FF7B0040' },
                ]}>
                {store.status === 'Visited' ? (
                  <CheckCircle2
                    size={12}
                    color="#0AB72A"
                    style={{ marginRight: 4 }}
                  />
                ) : (
                  <Clock size={12} color="#FF7B00" style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    styles.statusText,
                    store.status === 'Visited'
                      ? { color: '#0AB72A' }
                      : { color: '#FF7B00' },
                  ]}>
                  {store.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeamDetailScreen;

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#828282', fontSize: 13, marginTop: 8 },
  errorText: { color: '#1A1A1A', fontSize: 14, fontWeight: '600' },
  retryBtn: {
    backgroundColor: '#FFB302',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFB302',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FF7B00',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Fonts.semiBold,
  },
  profileInfo: { marginLeft: 16, flex: 1, gap: 4 },
  profileName: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '700',
    fontFamily: Fonts.semiBold,
  },
  profileDesig: { fontSize: 12, color: '#828282', fontFamily: Fonts.medium },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dateText: {
    fontSize: 13,
    color: '#4F4F4F',
    fontWeight: '500',
    fontFamily: Fonts.medium,
  },
  attBadge: {
    alignSelf: 'flex-start',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    marginTop: 4,
  },
  attBadgeText: { fontSize: 10, fontWeight: '700' },
  checkInText: { color: '#828282', fontSize: 10, marginTop: 2 },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  metricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#828282',
    fontWeight: '600',
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
  orderStrip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
  },
  orderStripItem: { alignItems: 'center' },
  orderStripVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFB302',
    fontFamily: Fonts.bold,
  },
  orderStripLabel: {
    fontSize: 10,
    color: '#828282',
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  orderStripDivider: { width: 1, height: 30, backgroundColor: '#E0E0E0' },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  listIconBox: {
    backgroundColor: '#FFF8E1',
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  listTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
    fontFamily: Fonts.semiBold,
  },
  emptyText: {
    color: '#828282',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  storeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: { flex: 1, marginLeft: 12 },
  storeName: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    marginBottom: 2,
  },
  storeSub: { fontSize: 11, color: '#828282', fontFamily: Fonts.medium },
  storeTime: { fontSize: 10, color: '#828282', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700', fontFamily: Fonts.semiBold },
});