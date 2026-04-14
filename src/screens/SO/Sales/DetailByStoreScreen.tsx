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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import PageHeader from '../../../components/ui/PageHeader';
import {
  Store,
  ShoppingCart,
  Activity,
  IndianRupee,
  Clock,
  CheckCircle,
  MapPin,
  Package,
  User,
  LogIn,
  LogOut,
  Timer,
} from 'lucide-react-native';
import { useGetAsmStoreDetailQuery } from '../../../features/base/base-api';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'DetailByStoreScreen'
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
  bg: '#F0F2F6',
};

// ─── Detail Row ───────────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, valueColor, bgColor, iconColor }: any) => (
  <View style={styles.row}>
    <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
      <Icon size={20} color={iconColor} strokeWidth={2} />
    </View>
    <View style={styles.rowRight}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor || C.text }]}>{value}</Text>
    </View>
  </View>
);

// ─── Time Chip ────────────────────────────────────────────────────────────────
const TimeChip = ({ icon: Icon, label, value, color, bg }: any) => (
  <View style={[styles.chip, { backgroundColor: bg, borderColor: `${color}30` }]}>
    <Icon size={13} color={color} strokeWidth={2.5} />
    <View style={styles.chipTexts}>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
      <Text style={[styles.chipVal, { color }]}>{value ?? '—'}</Text>
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const DetailByStoreScreen = ({ navigation, route }: Props) => {
  const { store_id, employee_id } = route?.params ?? {};
  const rawDate = route?.params?.date;
  const date: string =
    rawDate instanceof Date
      ? rawDate.toISOString().split('T')[0]
      : typeof rawDate === 'string'
        ? rawDate
        : new Date().toISOString().split('T')[0];

  const { data, isFetching, isError, refetch } = useGetAsmStoreDetailQuery(
    { store_id, date, employee: employee_id },
    { skip: !store_id || !date, refetchOnMountOrArgChange: true },
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: C.bg }]}>
        <PageHeader title="Detail By Store" navigation={() => navigation.goBack()} />
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
        <PageHeader title="Detail By Store" navigation={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load store detail</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const msg = data.message;
  const store = msg.store;
  const visits = msg.visit_info ?? [];
  const orders = msg.orders ?? [];

  const totalOrderValue = orders.reduce(
    (sum: number, o: any) => sum + (o.grand_total ?? 0),
    0,
  );
  const deliveredOrders = orders.filter(
    (o: any) => o.delivery_display_status !== 'Pending',
  ).length;
  const pendingOrders = orders.filter(
    (o: any) => o.delivery_display_status === 'Pending',
  ).length;

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: C.bg }]}>
      <PageHeader title="Detail By Store" navigation={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Store Info ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <DetailRow
            icon={Store}
            label="Store Name"
            value={store.store_name}
            iconColor={C.purple}
            bgColor={C.purpleSoft}
          />
          <View style={styles.divider} />

          <DetailRow
            icon={Activity}
            label="Store Type"
            value={store.store_type}
            iconColor={C.amber}
            bgColor={C.amberSoft}
          />
          <View style={styles.divider} />

          <DetailRow
            icon={MapPin}
            label="Zone · City"
            value={`${store.zone}  ·  ${store.city}`}
            iconColor={C.accent}
            bgColor={C.accentSoft}
          />

          {store.address ? (
            <>
              <View style={styles.divider} />
              <DetailRow
                icon={MapPin}
                label="Address"
                value={store.address}
                iconColor={C.textSub}
                bgColor={'#F2F2F2'}
              />
            </>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: C.greenSoft }]}>
              <CheckCircle size={20} color={C.green} strokeWidth={2} />
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.label}>Status</Text>
              <View style={[styles.pill, { backgroundColor: C.greenSoft, borderColor: `${C.green}40` }]}>
                <Text style={[styles.pillText, { color: C.green }]}>{store.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Order Summary ────────────────────────────────────────── */}
        <View style={[styles.card, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: C.amber }]}>{orders.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: C.green }]}>{deliveredOrders}</Text>
              <Text style={styles.summaryLabel}>Delivered</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: C.accent }]}>{pendingOrders}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: C.purple }]}>
                {totalOrderValue > 0
                  ? `₹${totalOrderValue}`
                  : '—'}
              </Text>
              <Text style={styles.summaryLabel}>Value</Text>
            </View>
          </View>
        </View>

        {/* ── Orders List ──────────────────────────────────────────── */}
        {orders.length > 0 && (
          <View style={[styles.card, { marginTop: 14 }]}>
            <Text style={styles.sectionTitle}>Orders</Text>
            {orders.map((order: any, idx: number) => (
              <View key={order.order_id}>
                {idx > 0 && <View style={styles.divider} />}

                {/* Order ID + delivery badge */}
                <View style={styles.orderHeaderRow}>
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

                {/* Workflow state + order status */}
                <View style={styles.workflowRow}>
                  <View style={[styles.workflowBadge, { backgroundColor: C.purpleSoft, borderColor: `${C.purple}30` }]}>
                    <Text style={[styles.workflowText, { color: C.purple }]}>
                      {order.workflow_state}
                    </Text>
                  </View>
                  <Text style={styles.orderStatusText} numberOfLines={1}>
                    {order.status}
                  </Text>
                </View>

                {/* Time · Items · Value */}
                <View style={styles.orderMetaRow}>
                  <View style={styles.orderMetaItem}>
                    <Clock size={12} color={C.textMuted} strokeWidth={2} />
                    <Text style={styles.orderMetaText}>{order.time}</Text>
                  </View>
                  <View style={styles.orderMetaItem}>
                    <ShoppingCart size={12} color={C.textMuted} strokeWidth={2} />
                    <Text style={styles.orderMetaText}>
                      {order.item_count} items · {order.total_qty} qty
                    </Text>
                  </View>
                  <View style={styles.orderMetaItem}>
                    <IndianRupee size={12} color={C.purple} strokeWidth={2} />
                    <Text style={[styles.orderMetaText, { color: C.purple, fontWeight: '700' }]}>
                      {order.grand_total?.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Visit Info ───────────────────────────────────────────── */}
        {visits.length > 0 && (
          <View style={[styles.card, { marginTop: 14 }]}>
            <Text style={styles.sectionTitle}>Visit Info</Text>
            {visits.map((v: any, idx: number) => (
              <View key={idx}>
                {idx > 0 && <View style={styles.divider} />}

                {/* Employee name + ID */}
                <View style={styles.visitEmpRow}>
                  <View style={styles.visitAvatar}>
                    <User size={16} color={C.purple} strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={styles.visitEmpName}>{v.employee_name}</Text>
                    <Text style={styles.visitEmpId}>{v.employee}</Text>
                  </View>
                </View>

                {/* Check-in / Check-out / Spent chips */}
                <View style={styles.chipsRow}>
                  <TimeChip
                    icon={LogIn}
                    label="Check In"
                    value={v.check_in_time}
                    color={C.green}
                    bg={C.greenSoft}
                  />
                  <TimeChip
                    icon={LogOut}
                    label="Check Out"
                    value={v.check_out_time}
                    color={C.red}
                    bg={C.redSoft}
                  />
                  <TimeChip
                    icon={Timer}
                    label="Spent"
                    value={v.spent_time}
                    color={C.purple}
                    bg={C.purpleSoft}
                  />
                </View>

                {/* GPS location */}
                {/* {v.location ? (
                  <View style={styles.locationRow}>
                    <MapPin size={11} color={C.textMuted} strokeWidth={2} />
                    <Text style={styles.locationText}>{v.location}</Text>
                  </View>
                ) : null} */}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailByStoreScreen;

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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: Fonts.semiBold,
    marginBottom: 14,
  },
  divider: { height: 1, backgroundColor: '#F0F2F6', marginVertical: 14 },

  // Detail row
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
  label: {
    fontSize: Size.xs || 12,
    color: '#828282',
    fontFamily: Fonts.medium,
    marginBottom: 4,
  },
  value: { fontSize: Size.sm || 14, fontFamily: Fonts.semiBold, color: '#1A1A1A' },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  pillText: { fontSize: 10, fontFamily: Fonts.semiBold, fontWeight: '700', letterSpacing: 0.4 },

  // Summary grid
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 4,
  },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '800', fontFamily: Fonts.bold },
  summaryLabel: { fontSize: 10, color: '#828282', fontFamily: Fonts.medium, marginTop: 3 },
  summaryDivider: { width: 1, height: 32, backgroundColor: '#E0E0E0' },

  // Order card
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderId: { color: '#FFB302', fontSize: 13, fontWeight: '700', fontFamily: Fonts.semiBold },
  workflowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  workflowBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  workflowText: { fontSize: 10, fontWeight: '700', fontFamily: Fonts.semiBold },
  orderStatusText: { fontSize: 11, color: '#828282', fontFamily: Fonts.medium, flex: 1 },
  orderMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  orderMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderMetaText: { color: '#828282', fontSize: 11, fontFamily: Fonts.medium },

  // Visit info
  visitEmpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  visitAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3ECFF',
    borderWidth: 1.5,
    borderColor: '#367CFF40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitEmpName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: Fonts.semiBold,
  },
  visitEmpId: { fontSize: 11, color: '#828282', fontFamily: Fonts.medium, marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  chipTexts: { gap: 2 },
  chipLabel: { fontSize: 9, fontWeight: '600', fontFamily: Fonts.medium, letterSpacing: 0.3 },
  chipVal: { fontSize: 13, fontWeight: '800', fontFamily: Fonts.bold },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#F0F2F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  locationText: { fontSize: 11, color: '#828282', fontFamily: Fonts.medium },
});