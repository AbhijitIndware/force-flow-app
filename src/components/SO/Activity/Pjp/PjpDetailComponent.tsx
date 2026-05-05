import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { LocationPayload, PjpDailyStore } from '../../../../types/baseType';
import moment from 'moment';
import { Colors } from '../../../../utils/colors';
import {
  useEndPjpMutation,
  useStartPjpMutation,
} from '../../../../features/base/base-api';
import {
  getCurrentLocation,
  requestLocationPermission,
} from '../../../../utils/utils';
import Toast from 'react-native-toast-message';
import MinStoresWarningModal from './MinStoresWarningModal';

type Props = {
  detail: PjpDailyStore;
  navigation: any;
  refetch: any;
};

const STATUS_CONFIG = {
  Completed: {
    color: '#10b981',
    bg: '#d1fae5',
    label: 'Completed',
    dot: '#10b981',
  },
  Running: {
    color: '#f59e0b',
    bg: '#fef3c7',
    label: 'Running',
    dot: '#f59e0b',
  },
  Pending: {
    color: '#6366f1',
    bg: '#ede9fe',
    label: 'Pending',
    dot: '#6366f1',
  },
};

const PjpDetailComponent = ({ detail, navigation, refetch }: Props) => {
  // console.log("🚀 ~ PjpDetailComponent ~ detail:", detail)
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [updatePjpRoute] = useStartPjpMutation(); // unused but kept for type compat
  const [startPjp] = useStartPjpMutation();
  const [endPjp] = useEndPjpMutation();
  const [showMinStoreModal, setShowMinStoreModal] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pjpStatus = detail?.running_status;
  const isCompleted = pjpStatus === null || pjpStatus === 'Completed';
  const isRunning = pjpStatus === 'Running';

  const statusKey = isCompleted ? 'Completed' : isRunning ? 'Running' : 'Pending';
  const statusCfg = STATUS_CONFIG[statusKey];

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const getParsedLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Toast.show({ type: 'error', text1: '📍 Location permission required' });
      return null;
    }
    const location = await getCurrentLocation();
    if (!location) return null;
    const [latitude, longitude] = location.split(',').map(Number);
    if (isNaN(latitude) || isNaN(longitude)) return null;
    return { latitude, longitude };
  };

  const handleStartPjp = async () => {
    try {
      setLoading(true);
      const loc = await getParsedLocation();
      if (!loc) {
        Toast.show({ type: 'error', text1: '❌ Unable to fetch location' });
        return;
      }
      const payload: LocationPayload = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        data: { document_name: detail?.pjp_daily_store_id },
      };
      const res = await startPjp(payload).unwrap();
      if (res?.message?.success === true) {
        Toast.show({ type: 'success', text1: '✅ PJP Started', text2: res.message.message });
        refetch?.();
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: '❌ Failed to start PJP', text2: err?.data?.message ?? 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  const handleEndPjp = async () => {
    try {
      setLoading(true);
      const loc = await getParsedLocation();
      if (!loc) {
        Toast.show({ type: 'error', text1: '❌ Unable to fetch location' });
        return;
      }
      const payload: LocationPayload = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        data: { document_name: detail?.pjp_daily_store_id },
      };
      const res = await endPjp(payload).unwrap();
      if (res?.message?.success === true) {
        Toast.show({ type: 'success', text1: '✅ PJP Completed', text2: res.message.message });
        refetch?.();
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: '❌ Failed to end PJP', text2: err?.data?.message ?? 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  const handleActionPress = () => {
    if (detail.stores.length < 15) {
      setShowMinStoreModal(true);
      return;
    }
    if (isRunning) handleEndPjp();
    else handleStartPjp();
  };

  const completedCount = detail.stores?.filter((s: any) => s.visited)?.length ?? 0;
  const totalStores = detail.stores?.length ?? 0;
  const progress = totalStores > 0 ? completedCount / totalStores : 0;

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

      {/* ── Header Card ── */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateLabel}>
              {moment(detail.date, 'YYYY-MM-DD').format('ddd, DD MMM YYYY')}
            </Text>
            <Text style={styles.employeeName}>{detail.employee_name}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
            <Animated.View
              style={[
                styles.statusDot,
                { backgroundColor: statusCfg.dot },
                isRunning && { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Stats Row */}
        {/* <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalStores}</Text>
            <Text style={styles.statLabel}>Total Stores</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Visited</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalStores - completedCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View> */}

        {/* Progress Bar */}
        {/* <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{Math.round(progress * 100)}% complete</Text> */}

        <Text style={styles.idLabel}>Created On:  {moment(detail.creation, 'YYYY-MM-DD').format('ddd, DD MMM YYYY')}</Text>
      </View>

      {/* ── Action Button ── */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isCompleted && styles.actionCompleted,
          isRunning && styles.actionRunning,
          !isCompleted && !isRunning && styles.actionStart,
          loading && styles.actionLoading,
        ]}
        onPress={handleActionPress}
        activeOpacity={0.88}
        disabled={loading || isCompleted}>
        <View style={styles.actionInner}>
          <View style={styles.actionIconWrap}>
            <Text style={styles.actionIcon}>
              {isCompleted ? '✓' : isRunning ? '⏹' : '▶'}
            </Text>
          </View>
          <View>
            <Text style={styles.actionTitle}>
              {loading ? 'Please wait...' : isCompleted ? 'Plan Completed' : isRunning ? 'End PJP' : 'Start PJP'}
            </Text>
            <Text style={styles.actionSub}>
              {loading
                ? 'Fetching your location...'
                : isCompleted
                  ? "Today's route is done"
                  : isRunning
                    ? `Tap to finish today's route`
                    : `Tap to begin today's route`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Stores List ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Stores</Text>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{totalStores}</Text>
        </View>
      </View>

      <FlatList
        data={detail.stores}
        scrollEnabled={false}
        keyExtractor={(item, index) => `${item.store_id}-${index}`}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => (
          <View style={styles.storeCard}>
            {/* Store Header */}
            <View style={styles.storeHeader}>
              <View style={styles.storeIndexBadge}>
                <Text style={styles.storeIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{item.store_name}</Text>
                <View style={styles.storeMetaRow}>
                  <Text style={styles.storeMeta}>{item.store_category}</Text>
                  {item.city ? (
                    <>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.storeMeta}>{item.city}</Text>
                    </>
                  ) : null}
                  {item.state ? (
                    <>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.storeMeta}>{item.state}</Text>
                    </>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Warehouses */}
            {item.warehouse?.length > 0 && (
              <View style={styles.warehouseSection}>
                {item.warehouse.map((wh: any, idx: number) => (
                  <View key={`${wh.warehouse_id}-${idx}`} style={styles.warehouseRow}>
                    <View style={styles.warehouseAccent} />
                    <View style={styles.warehouseDetails}>
                      <Text style={styles.warehouseName}>{wh.warehouse_name}</Text>
                      <Text style={styles.warehouseSub}>{wh.distributor_name} · {wh.company}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />

      <View style={{ height: 32 }} />

      <MinStoresWarningModal
        visible={showMinStoreModal}
        onCancel={() => setShowMinStoreModal(false)}
        onContinue={() => {
          setShowMinStoreModal(false);
          if (isRunning) handleEndPjp();
          else handleStartPjp();
        }}
      />
    </ScrollView>
  );
};

export default PjpDetailComponent;

const ACCENT = '#4f46e5'; // indigo
const ACCENT_END = '#7c3aed';
const DANGER = '#ef4444';
const SUCCESS = '#10b981';
const GRAY_50 = '#f9fafb';
const GRAY_100 = '#f3f4f6';
const GRAY_200 = '#e5e7eb';
const GRAY_400 = '#9ca3af';
const GRAY_600 = '#4b5563';
const GRAY_800 = '#1f2937';
const GRAY_900 = '#111827';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_50,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* ── Header Card ── */
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerLeft: { gap: 4 },
  dateLabel: { fontSize: 12, color: GRAY_400, fontWeight: '500', letterSpacing: 0.4 },
  employeeName: { fontSize: 20, fontWeight: '700', color: GRAY_900 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: GRAY_100, marginBottom: 14 },

  /* Stats */
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: GRAY_900 },
  statLabel: { fontSize: 11, color: GRAY_400, marginTop: 2, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: GRAY_200 },

  /* Progress */
  progressTrack: {
    height: 6,
    backgroundColor: GRAY_100,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 99,
  },
  progressLabel: { fontSize: 11, color: GRAY_400, fontWeight: '500', marginBottom: 12 },
  idLabel: { fontSize: 11, color: GRAY_400, fontWeight: '400' },

  /* ── Action Button ── */
  actionButton: {
    borderRadius: 14,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  actionStart: { backgroundColor: ACCENT },
  actionRunning: { backgroundColor: DANGER },
  actionCompleted: { backgroundColor: GRAY_400 },
  actionLoading: { opacity: 0.7 },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 20, color: '#fff' },
  actionTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  actionSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  /* ── Section Header ── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: GRAY_800 },
  sectionCount: {
    backgroundColor: ACCENT,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCountText: { fontSize: 11, color: '#fff', fontWeight: '700' },

  /* ── Store Card ── */
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  storeIndexBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeIndexText: { fontSize: 13, fontWeight: '700', color: GRAY_600 },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: '600', color: GRAY_900, marginBottom: 3 },
  storeMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 2 },
  storeMeta: { fontSize: 12, color: GRAY_400 },
  metaDot: { fontSize: 12, color: GRAY_200, marginHorizontal: 2 },

  /* Warehouse */
  warehouseSection: {
    borderTopWidth: 1,
    borderTopColor: GRAY_100,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
  },
  warehouseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  warehouseAccent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: ACCENT,
    marginTop: 2,
    alignSelf: 'stretch',
  },
  warehouseDetails: { flex: 1 },
  warehouseName: { fontSize: 13, fontWeight: '600', color: GRAY_800 },
  warehouseSub: { fontSize: 12, color: GRAY_400, marginTop: 2 },
});