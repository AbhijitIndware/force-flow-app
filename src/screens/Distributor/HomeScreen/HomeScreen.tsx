/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Size } from '../../../utils/fontSize';
import { Divider } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  ShoppingCart,
  Truck,
  Package,
  CalendarDays,
  Clock,
  ArrowRight,
  ChevronDown,
} from 'lucide-react-native';
import { useAppSelector } from '../../../store/hook';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import moment from 'moment';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  useGetDashboardCountsQuery,
  useGetDeliveryNotesListQuery,
  useGetPendingCountsQuery,
  useGetPurchaseOrdersListQuery,
} from '../../../features/base/distributor-api';
import { DistributorAppStackParamList } from '../../../types/Navigation';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  DistributorAppStackParamList,
  'DistributorHomeScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  white: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: '#6B7280',
  accent: '#534AB7',
  accentDark: '#3C3489',
  accentSoft: 'rgba(83,74,183,0.1)',
  background: '#F5F5F7',
  card: '#FFFFFF',
  border: '#E5E7EB',
  green: '#2E7D32',
  greenSoft: 'rgba(76,175,80,0.12)',
};

// ─── Section Title ────────────────────────────────────────────────────────────
const SectionTitle: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <View style={styles.sectionTitleRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
  </View>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: number | string;
  accentColor: string;
  icon: React.ReactNode;
  onPress?: () => void;
}> = ({ label, value, accentColor, icon, onPress }) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    style={[statStyles.card, { borderTopColor: accentColor }]}>
    <View style={[statStyles.iconBox, { backgroundColor: accentColor + '18' }]}>
      {icon}
    </View>
    <Text
      style={[statStyles.value, { color: accentColor }]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.7}>
      {value}
    </Text>
    <Text style={statStyles.label}>{label}</Text>
  </TouchableOpacity>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    Pending: { bg: '#FEF3C7', text: '#92400E' },
    Approved: { bg: '#DCFCE7', text: '#1E40AF' },
    Delivered: { bg: '#8de58dff', text: ' #21974eff' },
    'Partially Delivered': { bg: '#FEE2E2', text: '#991B1B' },
    Rejected: { bg: '#ff6557ff', text: '#92400E' },
  };
  const colors = colorMap[status] ?? { bg: C.background, text: C.textMuted };
  return (
    <View style={[badgeStyles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[badgeStyles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

// ─── Date Picker Button ───────────────────────────────────────────────────────
const DatePickerButton: React.FC<{
  label: string;
  date: Date;
  onPress: () => void;
}> = ({ label, date, onPress }) => (
  <TouchableOpacity style={datePickerStyles.btn} onPress={onPress} activeOpacity={0.75}>
    <CalendarDays size={13} color={Colors.orange} />
    <View style={{ flex: 1 }}>
      <Text style={datePickerStyles.btnLabel}>{label}</Text>
      <Text style={datePickerStyles.btnDate}>{moment(date).format('DD MMM YYYY')}</Text>
    </View>
    <ChevronDown size={14} color={C.textMuted} />
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const DistributorHomeScreen = ({ navigation }: Props) => {
  const [refreshing, setRefreshing] = useState(false);

  // ── Date Range State ───────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState<Date>(moment().startOf('month').toDate());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fromDateStr = moment(fromDate).format('YYYY-MM-DD');
  const toDateStr = moment(toDate).format('YYYY-MM-DD');

  const handleFromChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (event.type === 'set' && selected) {
      // Ensure from date is not after to date
      if (moment(selected).isAfter(toDate)) {
        setToDate(selected);
      }
      setFromDate(selected);
    }
  };

  const handleToChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowToPicker(Platform.OS === 'ios');
    if (event.type === 'set' && selected) {
      setToDate(selected);
    }
  };

  const distributor = useAppSelector(
    state => (state?.persistedReducer as any)?.authSlice?.distributor,
  );

  // ── API Calls ──────────────────────────────────────────────────────────────
  const {
    data: dashboardData,
    refetch: refetchDashboard,
    isFetching: isDashboardFetching,
  } = useGetDashboardCountsQuery({ from_date: fromDateStr, to_date: toDateStr }, { refetchOnMountOrArgChange: true });

  const {
    data: pendingData,
    refetch: refetchPending,
    isFetching: isPendingFetching,
  } = useGetPendingCountsQuery({ from_date: fromDateStr, to_date: toDateStr }, { refetchOnMountOrArgChange: true });

  const { data: poData, refetch: refetchPO } = useGetPurchaseOrdersListQuery({
    page: 1,
    page_size: 3,
    from_date: fromDateStr,
    to_date: toDateStr,
  }, { refetchOnMountOrArgChange: true });

  const { data: dnData, refetch: refetchDN } = useGetDeliveryNotesListQuery({
    page: 1,
    page_size: 3,
    from_date: fromDateStr,
    to_date: toDateStr,
  }, { refetchOnMountOrArgChange: true });

  // ── Refresh ────────────────────────────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetchDashboard();
      refetchPO();
      refetchDN();
    }, 1500);
  }, [refetchDashboard, refetchPO, refetchDN]);

  const counts = dashboardData?.message?.data?.overall;
  const purchaseOrders = poData?.message?.data?.purchase_orders ?? [];
  const deliveryNotes = dnData?.message?.data?.delivery_notes ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          nestedScrollEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>

          {/* ── Hero / Welcome Banner ── */}
          <View style={styles.headerSec}>
            <View style={styles.welcomeBox}>
              <View>
                <Text style={styles.welcomeText}>
                  Welcome back,{'\n'}
                  <Text style={styles.name}>
                    {distributor?.distributor_name ?? 'Distributor'}
                  </Text>
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>
                      {distributor?.distributor_group ?? '—'}
                    </Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>
                      {distributor?.zone ?? '—'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{moment().format('DD')}</Text>
                <Text style={styles.dateMonth}>{moment().format('MMM').toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.subInfoRow}>
              <Text style={styles.subInfoText}>
                Code: {distributor?.distributor_code ?? '—'}
              </Text>
              <Text style={styles.subInfoDot}>•</Text>
              <Text style={styles.subInfoText}>
                {distributor?.city ?? ''}, {distributor?.state ?? ''}
              </Text>
            </View>
          </View>

          {/* ── Date Range Picker ── */}
          <View style={datePickerStyles.container}>
            <DatePickerButton
              label="From"
              date={fromDate}
              onPress={() => setShowFromPicker(true)}
            />
            <View style={datePickerStyles.divider} />
            <DatePickerButton
              label="To"
              date={toDate}
              onPress={() => setShowToPicker(true)}
            />
          </View>

          {showFromPicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              maximumDate={toDate}
              onChange={handleFromChange}
            />
          )}

          {showToPicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={fromDate}
              maximumDate={new Date()}
              onChange={handleToChange}
            />
          )}

          {/* ── Summary Stats ── */}
          <View style={styles.statsSection}>
            {isDashboardFetching ? (
              <ActivityIndicator color={Colors.orange} />
            ) : (
              <View style={styles.statsRow}>
                <StatCard
                  label="Total Orders"
                  value={counts?.total_purchase_orders ?? 0}
                  accentColor="#534AB7"
                  icon={<ShoppingCart size={20} color="#b79e4aff" />}
                  onPress={() => navigation.navigate('PurchaseOrdersScreen')}
                />
                <StatCard
                  label="Total Pending Orders"
                  value={pendingData?.data?.pending_purchase_orders ?? 0}
                  accentColor="#534AB7"
                  icon={<Clock size={20} color="#c2362cff" />}
                  onPress={() => navigation.navigate('PurchaseOrdersScreen')}
                />
                <StatCard
                  label="Total Deliveries"
                  value={counts?.total_delivery_notes ?? 0}
                  accentColor="#185FA5"
                  icon={<Truck size={20} color="#185FA5" />}
                  onPress={() => navigation.navigate('DeliveryNotesScreen')}
                />
                <StatCard
                  label="Total Pending Deliveries"
                  value={pendingData?.data?.pending_delivery_notes ?? 0}
                  accentColor="#185FA5"
                  icon={<Clock size={20} color="#b52929ff" />}
                  onPress={() => navigation.navigate('DeliveryNotesScreen')}
                />
              </View>
            )}
          </View>

          {/* ── Recent Purchase Orders ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SectionTitle
                title="Recent Orders"
                sub={`${moment().format('MMMM YYYY')}`}
              />
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate('PurchaseOrdersScreen')}>
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={14} color={C.accent} />
              </TouchableOpacity>
            </View>

            {purchaseOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Package size={32} color={C.textMuted} />
                <Text style={styles.emptyText}>No purchase orders yet</Text>
              </View>
            ) : (
              purchaseOrders.map((po) => (
                <TouchableOpacity
                  key={po.order_id}
                  style={styles.listCard}
                  onPress={() =>
                    navigation.navigate('PurchaseOrderDetailScreen', {
                      order_id: po.order_id,
                    })
                  }>
                  <View style={[styles.listCardStripe, { backgroundColor: '#534AB7' }]} />
                  <View style={styles.listCardBody}>
                    <View style={styles.listCardTop}>
                      <Text style={styles.listCardId}>{po.order_id}</Text>
                      <StatusBadge status={po.workflow_state} />
                    </View>
                    <View style={styles.listCardBottom}>
                      <Text style={styles.listCardMeta}>
                        {moment(po.transaction_date).format('DD MMM YYYY')}
                      </Text>
                      <Text style={styles.listCardAmount}>
                        ₹{po.grand_total.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* ── Recent Delivery Notes ── */}
          <View style={[styles.section, { marginBottom: 20 }]}>
            <View style={styles.sectionHeader}>
              <SectionTitle title="Recent Deliveries" />
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate('DeliveryNotesScreen')}>
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={14} color={C.accent} />
              </TouchableOpacity>
            </View>

            {deliveryNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Truck size={32} color={C.textMuted} />
                <Text style={styles.emptyText}>No delivery notes yet</Text>
              </View>
            ) : (
              deliveryNotes.map((dn) => (
                <TouchableOpacity
                  key={dn.delivery_note_id}
                  style={styles.listCard}
                  onPress={() =>
                    navigation.navigate('DeliveryNoteDetailScreen', {
                      id: dn.delivery_note_id,
                    })
                  }>
                  <View style={[styles.listCardStripe, { backgroundColor: '#185FA5' }]} />
                  <View style={styles.listCardBody}>
                    <View style={styles.listCardTop}>
                      <Text style={styles.listCardId}>{dn.delivery_note_id}</Text>
                      <StatusBadge status={dn.workflow_state} />
                    </View>
                    <View style={styles.listCardBottom}>
                      <Text style={styles.listCardMeta}>PO: {dn.purchase_order}</Text>
                    </View>
                    <View style={styles.listCardBottom}>
                      <Text style={styles.listCardMeta}>
                        {moment(dn.posting_date).format('DD MMM YYYY')}
                      </Text>
                      <Text style={styles.listCardAmount}>
                        ₹{dn.grand_total.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* ── Quick Links ── */}
          <View style={[styles.linkSection, { paddingVertical: 15, marginTop: 10 }]}>
            <Text style={[styles.sectionHeading, { marginBottom: 10, paddingHorizontal: 20 }]}>
              Quick Links
            </Text>

            <TouchableOpacity
              style={styles.iconLinkBox}
              onPress={() => navigation.navigate('PurchaseOrdersScreen')}>
              <View style={styles.iconBox}>
                <ShoppingCart strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Orders</Text>
              <View style={[styles.arrowBox, { marginLeft: 'auto' }]}>
                <Ionicons name="chevron-forward-outline" size={12} color={Colors.darkButton} />
              </View>
            </TouchableOpacity>

            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />

            <TouchableOpacity
              style={styles.iconLinkBox}
              onPress={() => navigation.navigate('DeliveryNotesScreen')}>
              <View style={styles.iconBox}>
                <Truck strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Delivery Notes</Text>
              <View style={[styles.arrowBox, { marginLeft: 'auto' }]}>
                <Ionicons name="chevron-forward-outline" size={12} color={Colors.darkButton} />
              </View>
            </TouchableOpacity>

            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DistributorHomeScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightBg },

  // Hero
  headerSec: {
    backgroundColor: Colors.white,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  welcomeBox: {
    backgroundColor: Colors.orange,
    borderRadius: 15,
    padding: 18,
    marginTop: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: { fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm, marginBottom: 8 },
  name: { fontFamily: Fonts.semiBold, fontSize: Size.md, color: Colors.white },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaChip: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  metaChipText: { fontSize: 11, color: Colors.white, fontFamily: Fonts.medium },
  dateBox: { width: 52, height: 52, borderWidth: 1, borderColor: Colors.white, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  dateDay: { fontFamily: Fonts.semiBold, fontSize: Size.sm, color: Colors.white, lineHeight: 18 },
  dateMonth: { fontFamily: Fonts.regular, fontSize: Size.xs, color: Colors.white },
  subInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, paddingVertical: 10, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingHorizontal: 4 },
  subInfoText: { fontFamily: Fonts.regular, fontSize: 12, color: C.textMuted },
  subInfoDot: { color: C.border, fontSize: 14 },

  // Stats
  statsSection: { paddingHorizontal: 16, paddingBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  sectionSub: { fontSize: 12, color: C.textMuted },
  sectionHeading: { fontFamily: Fonts.semiBold, fontSize: Size.md, color: Colors.darkButton },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontSize: 12, fontWeight: '600', color: C.accent, fontFamily: Fonts.medium },

  // List Cards
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, borderWidth: 0.5, borderColor: C.border, marginBottom: 8, overflow: 'hidden' },
  listCardStripe: { width: 4, alignSelf: 'stretch' },
  listCardBody: { flex: 1, padding: 12, gap: 4 },
  listCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listCardId: { fontSize: 13, fontWeight: '600', color: C.text, fontFamily: Fonts.semiBold },
  listCardMeta: { fontSize: 11, color: C.textMuted, fontFamily: Fonts.regular },
  listCardAmount: { fontSize: 13, fontWeight: '700', color: C.accent, fontFamily: Fonts.semiBold },
  listCardInvoice: { fontSize: 11, color: C.textMuted, fontFamily: Fonts.regular, marginTop: 2 },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24, backgroundColor: C.card, borderRadius: 12, borderWidth: 0.5, borderColor: C.border },
  emptyText: { fontSize: 13, color: C.textMuted, fontFamily: Fonts.regular },

  // Quick Links
  linkSection: { backgroundColor: Colors.white },
  iconLinkBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, paddingHorizontal: 20 },
  iconBox: { width: 35, height: 35, borderRadius: 10, backgroundColor: Colors.darkButton, alignItems: 'center', justifyContent: 'center' },
  linkTitle: { color: Colors.darkButton, fontSize: Size.sm, fontFamily: Fonts.medium },
  arrowBox: { width: 20, height: 20, backgroundColor: '#F0F2F6', alignItems: 'center', justifyContent: 'center', borderRadius: 100 },
});

const statStyles = StyleSheet.create({
  card: { flex: 1, minWidth: (width - 56) / 4, backgroundColor: C.card, borderRadius: 12, borderWidth: 0.5, borderColor: C.border, borderTopWidth: 3, padding: 10, alignItems: 'center', gap: 4 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  value: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 10, color: C.textMuted, textAlign: 'center', fontFamily: Fonts.regular },
});

const badgeStyles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  text: { fontSize: 10, fontWeight: '700' },
});

// ─── Date Picker Styles ───────────────────────────────────────────────────────
const datePickerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: C.border,
  },
  btnLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: C.textMuted,
    lineHeight: 13,
  },
  btnDate: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: C.text,
    lineHeight: 16,
  },
});