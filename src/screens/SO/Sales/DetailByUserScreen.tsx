import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import { SoAppStackParamList } from '../../../types/Navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import PageHeader from '../../../components/ui/PageHeader';
import {
  ShoppingCart,
  IndianRupee,
  Clock,
  MapPin,
  Package,
  CheckCircle,
  UserCheck,
  UserX,
  ListOrdered,
} from 'lucide-react-native';
import { useGetAsmUserDetailQuery } from '../../../features/base/base-api';
import { FlatList } from 'react-native';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'DetailByUserScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const C = {
  surface: '#FFFFFF',
  text: Colors.darkButton || '#1A1A1A',
  textSub: '#4F4F4F',
  textMuted: '#828282',
  border: '#E0E0E0',
  bg: '#F0F2F6',
  accent: Colors.orange || '#FF7B00',
  accentSoft: '#FFE9D4',
  green: Colors.sucess || '#0AB72A',
  greenSoft: '#E7F8EA',
  purple: Colors.blue || '#367CFF',
  purpleSoft: '#E3ECFF',
  amber: '#FFB302',
  amberSoft: '#FFF8E1',
  red: Colors.denger || '#D31010',
  redSoft: Colors.lightDenger || '#FBE8E8',
};

// ─── Time Converter ───────────────────────────────────────────────────────────
const toReadableTime = (raw: string | number | null | undefined): string => {
  if (raw === null || raw === undefined || raw === '') return '—';
  if (typeof raw === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(raw.trim())) {
    const parts = raw.trim().split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  const seconds = typeof raw === 'number' ? raw : parseFloat(raw as string);
  if (isNaN(seconds)) return String(raw);
  const hh = Math.floor(seconds / 3600) % 24;
  const mm = Math.floor((seconds % 3600) / 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, accent = C.amber }: any) => (
  <View style={styles.sectionHeaderRow}>
    <View style={[styles.sectionIconBox, { backgroundColor: `${accent}18` }]}>
      <Icon size={14} color={accent} strokeWidth={2.2} />
    </View>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

// ─── Stat Box ─────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, color }: any) => (
  <View style={styles.statBox}>
    <Text style={[styles.statVal, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const DetailByUserScreen = ({ navigation, route }: Props) => {
  const { employee_id } = route?.params ?? {};
  const rawDate = route?.params?.date;
  const date: string =
    rawDate instanceof Date
      ? rawDate.toISOString().split('T')[0]
      : typeof rawDate === 'string'
        ? rawDate
        : new Date().toISOString().split('T')[0];

  const { data, isFetching, isError, refetch } = useGetAsmUserDetailQuery(
    { employee: employee_id, date },
    { skip: !employee_id || !date, refetchOnMountOrArgChange: true },
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: C.bg }]}>
        <PageHeader title="Detail By User" navigation={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.amber} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !data?.message?.success) {
    return (
      <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: C.bg }]}>
        <PageHeader title="Detail By User" navigation={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load user detail</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const msg = data.message;
  const emp = msg.employee;
  const pjp = msg.pjp_summary;
  const ordersSummary = msg.orders_summary;
  const storesCreated = msg.stores_created;
  const orders = msg.orders ?? [];
  const visits = msg.visits ?? [];

  const isPresent = emp?.attendance_status === 'Present';
  const initials = emp?.employee_name
    ? emp.employee_name
      .split(' ')
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
    : '--';

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: C.bg }]}>
      <PageHeader title="Detail By User" navigation={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Employee Hero Card ───────────────────────────────────── */}
        <View style={styles.heroCard}>
          {/* Top accent bar */}
          <View style={styles.heroAccentBar} />

          <View style={styles.heroInner}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* Info */}
            <View style={styles.heroInfo}>
              <Text style={styles.empName}>{emp?.employee_name ?? '—'}</Text>
              <Text style={styles.empDesig}>{emp?.designation ?? ''}</Text>

              {/* Attendance badge + times */}
              <View style={styles.attRow}>
                <View
                  style={[
                    styles.attBadge,
                    {
                      backgroundColor: isPresent ? C.greenSoft : C.redSoft,
                      borderColor: isPresent ? `${C.green}40` : `${C.red}40`,
                    },
                  ]}>
                  {isPresent ? (
                    <UserCheck size={11} color={C.green} strokeWidth={2.5} />
                  ) : (
                    <UserX size={11} color={C.red} strokeWidth={2.5} />
                  )}
                  <Text style={[styles.attBadgeText, { color: isPresent ? C.green : C.red }]}>
                    {emp?.attendance_status ?? '—'}
                  </Text>
                </View>

                {emp?.check_in_time ? (
                  <View style={styles.timeTag}>
                    <Clock size={10} color={C.green} strokeWidth={2} />
                    <Text style={[styles.timeTagText, { color: C.green }]}>
                      In {toReadableTime(emp.check_in_time)}
                    </Text>
                  </View>
                ) : null}

                {emp?.check_out_time ? (
                  <View style={styles.timeTag}>
                    <Clock size={10} color={C.red} strokeWidth={2} />
                    <Text style={[styles.timeTagText, { color: C.red }]}>
                      Out {toReadableTime(emp.check_out_time)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* ── Stats row: PJP + Orders + Stores ── */}
          <View style={styles.heroStatsRow}>
            {/* PJP block */}
            <View style={[styles.heroStatBlock, { borderRightWidth: 1, borderRightColor: C.border, flex: 1.5 }]}>
              <Text style={styles.heroStatTitle}>PJP</Text>
              <View style={styles.heroStatInner}>
                <StatBox label="Planned" value={pjp?.planned ?? 0} color={C.textSub} />
                <StatBox label="Visited" value={pjp?.visited ?? 0} color={C.purple} />
                {/* <StatBox label="Done" value={pjp?.completed ?? 0} color={C.green} /> */}
                <StatBox label="Pending" value={pjp?.pending ?? 0} color={C.accent} />
              </View>
            </View>

            {/* Stores block */}
            <View style={styles.heroStatBlock}>
              <Text style={styles.heroStatTitle}>Stores Created</Text>
              <View style={[styles.heroStatInner, { justifyContent: 'flex-start' }]}>
                <StatBox label="Created" value={storesCreated?.created ?? 0} color={C.amber} />
                {/* <StatBox label="Success" value={storesCreated?.successful ?? 0} color={C.green} /> */}
              </View>
            </View>
          </View>
        </View>

        {/* ── Orders Section ───────────────────────────────────────── */}
        <View style={[styles.card, { marginTop: 14 }]}>
          <SectionHeader icon={ShoppingCart} title="Orders" accent={C.purple} />

          {/* Order summary bar */}
          <View style={styles.orderSummaryBar}>
            <View style={styles.orderSummaryItem}>
              <Text style={[styles.orderSummaryVal, { color: C.amber }]}>
                {ordersSummary?.orders ?? 0}
              </Text>
              <Text style={styles.orderSummaryLabel}>Total Orders</Text>
            </View>
            <View style={styles.orderSummaryDivider} />
            <View style={styles.orderSummaryItem}>
              <Text style={[styles.orderSummaryVal, { color: C.purple }]}>
                {ordersSummary?.total_items ?? ordersSummary?.orders ?? 0}
              </Text>
              <Text style={styles.orderSummaryLabel}>Total Items</Text>
            </View>
            <View style={styles.orderSummaryDivider} />
            <View style={styles.orderSummaryItem}>
              <Text style={[styles.orderSummaryVal, { color: C.green }]}>
                {ordersSummary?.order_value > 0
                  ? `₹${(ordersSummary.order_value / 1000).toFixed(1)}K`
                  : '—'}
              </Text>
              <Text style={styles.orderSummaryLabel}>Value</Text>
            </View>
          </View>

          {/* Order list */}
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>No orders for this date</Text>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item: any) => String(item.order_id)}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              renderItem={({ item: order }: { item: any }) => (
                <View>
                  {/* Order ID + status badge */}
                  <View style={styles.orderTopRow}>
                    <View style={styles.orderIdRow}>
                      <Package size={13} color={C.amber} strokeWidth={2} />
                      <Text style={styles.orderId}>{order.order_id}</Text>
                    </View>
                    <View
                      style={[
                        styles.pill,
                        {
                          backgroundColor:
                            order.delivery_display_status === 'Pending'
                              ? C.amberSoft
                              : C.greenSoft,
                          borderColor:
                            order.delivery_display_status === 'Pending'
                              ? `${C.amber}40`
                              : `${C.green}40`,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.pillText,
                          {
                            color:
                              order.delivery_display_status === 'Pending'
                                ? C.amber
                                : C.green,
                          },
                        ]}>
                        {order.delivery_display_status}
                      </Text>
                    </View>
                  </View>

                  {/* Store name */}
                  <Text style={styles.orderStore}>{order.store}</Text>

                  {/* Meta: time · value · qty */}
                  <View style={styles.orderMeta}>
                    <View style={styles.orderMetaItem}>
                      <Clock size={11} color={C.textMuted} strokeWidth={2} />
                      <Text style={styles.orderMetaText}>{toReadableTime(order.time)}</Text>
                    </View>
                    <Text style={styles.orderMetaDot}>·</Text>
                    <View style={styles.orderMetaItem}>
                      <IndianRupee size={11} color={C.purple} strokeWidth={2} />
                      <Text style={[styles.orderMetaText, { color: C.purple, fontWeight: '700' }]}>
                        {order.grand_total?.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <Text style={styles.orderMetaDot}>·</Text>
                    <View style={styles.orderMetaItem}>
                      <ShoppingCart size={11} color={C.textMuted} strokeWidth={2} />
                      <Text style={styles.orderMetaText}>{order.total_qty} qty</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* ── Store Visits Section ─────────────────────────────────── */}
        {visits.length > 0 && (
          <View style={[styles.card, { marginTop: 14 }]}>
            <SectionHeader icon={ListOrdered} title="Visited Store" accent={C.amber} />

            {/* Visit summary strip */}
            {/* <View style={styles.visitSummaryStrip}>
              <View style={styles.visitSummaryItem}>
                <Text style={[styles.visitSummaryVal, { color: C.purple }]}>{visits.length}</Text>
                <Text style={styles.visitSummaryLabel}>Total</Text>
              </View>
              <View style={styles.visitSummaryDivider} />
              <View style={styles.visitSummaryItem}>
                <Text style={[styles.visitSummaryVal, { color: C.green }]}>
                  {visits.filter((v: any) => v.check_in_time).length}
                </Text>
                <Text style={styles.visitSummaryLabel}>Visited</Text>
              </View>
              <View style={styles.visitSummaryDivider} />
              <View style={styles.visitSummaryItem}>
                <Text style={[styles.visitSummaryVal, { color: C.accent }]}>
                  {visits.filter((v: any) => !v.check_in_time).length}
                </Text>
                <Text style={styles.visitSummaryLabel}>Pending</Text>
              </View>
            </View> */}

            {/* Visit list */}
            {visits.map((v: any, idx: number) => {
              const visited = !!v.check_in_time;
              return (
                <View key={v.store_id ?? idx}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.visitRow}>
                    {/* Icon */}
                    <View
                      style={[
                        styles.visitIconWrap,
                        { backgroundColor: visited ? C.greenSoft : C.amberSoft },
                      ]}>
                      <MapPin
                        size={16}
                        color={visited ? C.green : C.amber}
                        strokeWidth={2.5}
                      />
                    </View>

                    {/* Info */}
                    <View style={styles.visitInfo}>
                      <View style={styles.visitNameRow}>
                        <Text style={styles.visitName} numberOfLines={1}>
                          {v.store_name}
                        </Text>
                        <View
                          style={[
                            styles.visitStatusBadge,
                            {
                              backgroundColor: visited ? C.greenSoft : C.amberSoft,
                              borderColor: visited ? `${C.green}40` : `${C.amber}40`,
                            },
                          ]}>
                          {visited ? (
                            <CheckCircle size={10} color={C.green} strokeWidth={2.5} />
                          ) : (
                            <Clock size={10} color={C.amber} strokeWidth={2.5} />
                          )}
                          <Text
                            style={[
                              styles.visitStatusText,
                              { color: visited ? C.green : C.amber },
                            ]}>
                            {visited ? 'Visited' : 'Pending'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.visitSub}>
                        {v.store_type}
                        {v.zone ? `  ·  ${v.zone}` : ''}
                      </Text>

                      {visited ? (
                        <View style={styles.visitTimeRow}>
                          <View style={styles.visitTimeChip}>
                            <Text style={[styles.visitTimeLabel, { color: C.green }]}>Check-In</Text>
                            <Text style={[styles.visitTimeVal, { color: C.green }]}>
                              {toReadableTime(v.check_in_time)}
                            </Text>
                          </View>
                          {v.check_out_time ? (
                            <View style={styles.visitTimeChip}>
                              <Text style={[styles.visitTimeLabel, { color: C.red }]}>Check-Out</Text>
                              <Text style={[styles.visitTimeVal, { color: C.red }]}>
                                {toReadableTime(v.check_out_time)}
                              </Text>
                            </View>
                          ) : null}
                          {v.spent_time ? (
                            <View style={styles.visitTimeChip}>
                              <Text style={[styles.visitTimeLabel, { color: C.purple }]}>Spent</Text>
                              <Text style={[styles.visitTimeVal, { color: C.purple }]}>
                                {v.spent_time}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailByUserScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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
  scrollContent: { padding: 16, paddingBottom: 40 },

  // ── Hero card ────────────────────────────────────────────────
  heroCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroAccentBar: { height: 4, backgroundColor: C.amber },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFB302',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#FF7B00', fontSize: 18, fontWeight: '800', fontFamily: Fonts.semiBold },
  heroInfo: { flex: 1 },
  empName: { fontSize: 16, color: '#1A1A1A', fontWeight: '700', fontFamily: Fonts.semiBold },
  empDesig: { fontSize: 12, color: '#828282', fontFamily: Fonts.medium, marginTop: 2 },
  attRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  attBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  attBadgeText: { fontSize: 10, fontWeight: '700' },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F2F6',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  timeTagText: { fontSize: 10, fontWeight: '600', fontFamily: Fonts.medium },

  // Stats row inside hero
  heroStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
    marginHorizontal: 0,
  },
  heroStatBlock: { flex: 1, padding: 14 },
  heroStatTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#828282',
    fontFamily: Fonts.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroStatInner: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '800', fontFamily: Fonts.bold },
  statLabel: { fontSize: 9, color: '#828282', fontFamily: Fonts.medium, marginTop: 2, textAlign: 'center' },

  // ── Generic card ────────────────────────────────────────────
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: { height: 1, backgroundColor: '#F0F2F6', marginVertical: 12 },
  emptyText: { color: '#828282', fontSize: 13, textAlign: 'center', paddingVertical: 16 },

  // Section header
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', fontFamily: Fonts.semiBold },

  // ── Order summary bar ────────────────────────────────────────
  orderSummaryBar: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${C.purple}18`,
  },
  orderSummaryItem: { flex: 1, alignItems: 'center' },
  orderSummaryVal: { fontSize: 17, fontWeight: '800', fontFamily: Fonts.bold },
  orderSummaryLabel: { fontSize: 9, color: '#828282', fontFamily: Fonts.medium, marginTop: 3 },
  orderSummaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // Order row
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderId: { color: '#FFB302', fontSize: 12, fontWeight: '700', fontFamily: Fonts.semiBold },
  orderStore: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', fontFamily: Fonts.semiBold, marginBottom: 6 },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  orderMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  orderMetaText: { color: '#828282', fontSize: 11 },
  orderMetaDot: { color: '#C0C0C0', fontSize: 11 },
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillText: { fontSize: 10, fontFamily: Fonts.semiBold, fontWeight: '700' },

  // ── Visit summary strip ──────────────────────────────────────
  visitSummaryStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF0',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: `${C.amber}25`,
  },
  visitSummaryItem: { flex: 1, alignItems: 'center' },
  visitSummaryVal: { fontSize: 17, fontWeight: '800', fontFamily: Fonts.bold },
  visitSummaryLabel: { fontSize: 9, color: '#828282', fontFamily: Fonts.medium, marginTop: 3 },
  visitSummaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // Visit row
  visitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  visitIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  visitInfo: { flex: 1 },
  visitNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 3,
  },
  visitName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: Fonts.semiBold,
    flex: 1,
  },
  visitStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  visitStatusText: { fontSize: 9, fontWeight: '700', fontFamily: Fonts.semiBold },
  visitSub: { fontSize: 11, color: '#828282', fontFamily: Fonts.medium },
  visitTimeRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  visitTimeChip: {
    backgroundColor: '#F0F2F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 60,
  },
  visitTimeLabel: { fontSize: 9, fontWeight: '600', fontFamily: Fonts.medium },
  visitTimeVal: { fontSize: 12, fontWeight: '800', fontFamily: Fonts.bold, marginTop: 1 },

  // Misc
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowRight: { flex: 1 },
  label: { fontSize: Size.xs || 12, color: '#828282', fontFamily: Fonts.medium, marginBottom: 4 },
  value: { fontSize: Size.sm || 14, fontFamily: Fonts.semiBold, color: '#1A1A1A' },
});