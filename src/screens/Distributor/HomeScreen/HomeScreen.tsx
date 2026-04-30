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
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  FilePlus2,
} from 'lucide-react-native';
import { useAppSelector } from '../../../store/hook';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import moment from 'moment';
import { useGetDashboardCountsQuery, useGetDeliveryNotesListQuery, useGetPurchaseOrdersListQuery } from '../../../features/base/distributor-api';

// ─── Update with your actual navigation type ──────────────────────────────────
type DistributorAppStackParamList = {
  DistributorHomeScreen: undefined;
  PurchaseOrderDetail: { order_id: string };
  DeliveryNoteDetail: { note_name: string };
  PurchaseOrders: undefined;
  DeliveryNotes: undefined;
  ProfileScreen: undefined;
};

const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<
  DistributorAppStackParamList,
  'DistributorHomeScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// ─── Color palette (matches HomeScreen) ───────────────────────────────────────
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

// ─── Reusable Section Title ───────────────────────────────────────────────────
const SectionTitle: React.FC<{ title: string; sub?: string }> = ({
  title,
  sub,
}) => (
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

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    Pending: { bg: '#FEF3C7', text: '#92400E' },
    Approved: { bg: '#DCFCE7', text: '#166534' },
    Delivered: { bg: '#DBEAFE', text: '#1E40AF' },
    'Partially Delivered': { bg: '#FEE2E2', text: '#991B1B' },
  };
  const colors = colorMap[status] ?? { bg: C.background, text: C.textMuted };
  return (
    <View style={[badgeStyles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[badgeStyles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const DistributorHomeScreen = ({ navigation }: Props) => {
  const [refreshing, setRefreshing] = useState(false);

  const distributor = useAppSelector(
    state => (state?.persistedReducer as any)?.authSlice?.distributor,
  );

  const today = moment().format('YYYY-MM-DD');
  const firstOfMonth = moment().startOf('month').format('YYYY-MM-DD');

  // ── API Calls ──────────────────────────────────────────────────────────────
  const {
    data: dashboardData,
    refetch: refetchDashboard,
    isFetching: isDashboardFetching,
  } = useGetDashboardCountsQuery({ from_date: firstOfMonth, to_date: today });

  const {
    data: poData,
    refetch: refetchPO,
  } = useGetPurchaseOrdersListQuery({ page: 1, page_size: 5 });

  const {
    data: dnData,
    refetch: refetchDN,
  } = useGetDeliveryNotesListQuery({ page: 1, page_size: 5 });

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

  const counts = dashboardData?.message;
  const purchaseOrders = poData?.data ?? [];
  const deliveryNotes = dnData?.data ?? [];

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

              {/* Date box */}
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{moment().format('DD')}</Text>
                <Text style={styles.dateMonth}>
                  {moment().format('MMM').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Sub-info row */}
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

          {/* ── Summary Stats ── */}
          <View style={styles.statsSection}>
            {isDashboardFetching ? (
              <ActivityIndicator color={Colors.orange} />
            ) : (
              <View style={styles.statsRow}>
                <StatCard
                  label="Total POs"
                  value={counts?.purchase_counts?.total ?? 0}
                  accentColor="#534AB7"
                  icon={<ShoppingCart size={20} color="#534AB7" />}
                  onPress={() => navigation.navigate('PurchaseOrders')}
                />
                <StatCard
                  label="Pending"
                  value={counts?.purchase_counts?.status_wise?.Pending ?? 0}
                  accentColor="#F59E0B"
                  icon={<Clock size={20} color="#F59E0B" />}
                  onPress={() => navigation.navigate('PurchaseOrders')}
                />
                <StatCard
                  label="Approved"
                  value={counts?.purchase_counts?.status_wise?.Approved ?? 0}
                  accentColor="#10B981"
                  icon={<CheckCircle2 size={20} color="#10B981" />}
                  onPress={() => navigation.navigate('PurchaseOrders')}
                />
                <StatCard
                  label="Deliveries"
                  value={counts?.dn_counts?.total ?? 0}
                  accentColor="#185FA5"
                  icon={<Truck size={20} color="#185FA5" />}
                  onPress={() => navigation.navigate('DeliveryNotes')}
                />
              </View>
            )}
          </View>

          {/* ── Recent Purchase Orders ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SectionTitle
                title="Recent Purchase Orders"
                sub={`${moment().format('MMMM YYYY')}`}
              />
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate('PurchaseOrders')}>
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
              purchaseOrders.map((po, idx) => (
                <TouchableOpacity
                  key={po.order_id}
                  style={styles.listCard}
                  onPress={() =>
                    navigation.navigate('PurchaseOrderDetail', {
                      order_id: po.order_id,
                    })
                  }>
                  {/* Left accent */}
                  <View
                    style={[
                      styles.listCardStripe,
                      { backgroundColor: '#534AB7' },
                    ]}
                  />
                  <View style={styles.listCardBody}>
                    <View style={styles.listCardTop}>
                      <Text style={styles.listCardId}>{po.order_id}</Text>
                      <StatusBadge status={po.status} />
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
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={C.textMuted}
                  />
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
                onPress={() => navigation.navigate('DeliveryNotes')}>
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
              deliveryNotes.map((dn, idx) => (
                <TouchableOpacity
                  key={dn.name}
                  style={styles.listCard}
                  onPress={() =>
                    navigation.navigate('DeliveryNoteDetail', {
                      note_name: dn.name,
                    })
                  }>
                  <View
                    style={[
                      styles.listCardStripe,
                      { backgroundColor: '#185FA5' },
                    ]}
                  />
                  <View style={styles.listCardBody}>
                    <View style={styles.listCardTop}>
                      <Text style={styles.listCardId}>{dn.name}</Text>
                      <StatusBadge status={dn.workflow_state} />
                    </View>
                    <View style={styles.listCardBottom}>
                      <Text style={styles.listCardMeta}>
                        PO: {dn.purchase_order}
                      </Text>
                      <Text style={styles.listCardMeta}>
                        {moment(dn.date).format('DD MMM YYYY')}
                      </Text>
                    </View>
                    {dn.invoice_no ? (
                      <Text style={styles.listCardInvoice}>
                        Inv: {dn.invoice_no}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={C.textMuted}
                  />
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
              onPress={() => navigation.navigate('PurchaseOrders')}>
              <View style={styles.iconBox}>
                <ShoppingCart strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Purchase Orders</Text>
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
              onPress={() => navigation.navigate('DeliveryNotes')}>
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

            <TouchableOpacity
              style={styles.iconLinkBox}
              onPress={() => navigation.navigate('ProfileScreen')}>
              <View style={styles.iconBox}>
                <ClipboardList strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>My Profile</Text>
              <View style={[styles.arrowBox, { marginLeft: 'auto' }]}>
                <Ionicons name="chevron-forward-outline" size={12} color={Colors.darkButton} />
              </View>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DistributorHomeScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
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
  welcomeText: {
    fontFamily: Fonts.light,
    color: Colors.white,
    fontSize: Size.sm,
    marginBottom: 8,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.white,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  metaChipText: {
    fontSize: 11,
    color: Colors.white,
    fontFamily: Fonts.medium,
  },
  dateBox: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  dateDay: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 18,
  },
  dateMonth: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.white,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 4,
  },
  subInfoText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: C.textMuted,
  },
  subInfoDot: {
    color: C.border,
    fontSize: 14,
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  sectionSub: {
    fontSize: 12,
    color: C.textMuted,
  },
  sectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.accent,
    fontFamily: Fonts.medium,
  },

  // ── List Cards ─────────────────────────────────────────────────────────────
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
  listCardStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  listCardBody: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  listCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardId: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    fontFamily: Fonts.semiBold,
  },
  listCardMeta: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: Fonts.regular,
  },
  listCardAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: C.accent,
    fontFamily: Fonts.semiBold,
  },
  listCardInvoice: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },

  // ── Empty State ────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  emptyText: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: Fonts.regular,
  },

  // ── Quick Links ────────────────────────────────────────────────────────────
  linkSection: {
    backgroundColor: Colors.white,
  },
  iconLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  iconBox: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: Colors.darkButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
  },
  arrowBox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
});

// ─── Sub-component styles ─────────────────────────────────────────────────────
const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: (width - 56) / 4,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    borderTopWidth: 3,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
});

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
  },
});