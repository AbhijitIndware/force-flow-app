/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { flexCol, flexRow, itemsCenter } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SoAppStackParamList } from '../../../types/Navigation';
import { Fonts } from '../../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Size } from '../../../utils/fontSize';
import { Divider } from '@rneui/themed';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  ArrowRight,
  BaggageClaim,
  BanknoteArrowDown,
  ClipboardPenLine,
  FilePlus2,
  Hotel,
  MapPinCheck,
  Package,
  ShoppingCart,
  UsersRound,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye,
  Boxes,
  MapPin,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hook';
import {
  resetLocation,
  setSelectedStore,
  useCheckOutMutation,
  useGetAsmAttendanceTabQuery,
  useGetAsmPjpTargetVsAchievementQuery,
  useGetAsmTargetVsAchievementQuery,
  useGetLocationTrackerQuery,
  useGetProdCountQuery,
  useGetSalesRepotsQuery,
  usePjpInitializeMutation,
  useStartPjpMutation,
  useGetEmployeeTargetsQuery,
  useSetEmployeeTargetsMutation,
  useGetSoStatsQuery, useGetDdnStatsQuery,
  useGetActivityCheckInStatusQuery,
  useActivityCheckOutMutation,
} from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import { ICheckOut, LocationPayload, StoreData } from '../../../types/baseType';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
import {
  getCurrentLocation,
  requestLocationPermission,
} from '../../../utils/utils';
import { TextInput } from 'react-native';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'HomeScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

function extractServerMessage(resp: any): string | null {
  try {
    if (!resp?._server_messages) return null;

    // Step 1: Parse outer array
    const messagesArray = JSON.parse(resp._server_messages);

    if (!messagesArray?.length) return null;

    // Step 2: Parse the first element into object
    const messageObj = JSON.parse(messagesArray[0]);

    return messageObj.message || null;
  } catch (err) {
    return null;
  }
}

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
  heroTop: '#3C3489',
  heroBot: '#534AB7',
};

const today = new Date().toISOString().split('T')[0];

const SectionTitle: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <View style={styles.sectionTitleRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
  </View>
);

const TargetMetricBox: React.FC<{
  label: string;
  achieved: string;    // e.g. "48" or "₹185K"
  target?: string;      // Optional
  rate?: number | string; // Optional
  accentColor: string;
  onPress?: () => void;
}> = ({ label, achieved, target, rate, accentColor, onPress }) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    style={targetStyles.card}>
    {/* Left accent stripe */}
    <View style={[targetStyles.stripe, { backgroundColor: accentColor }]} />

    <View style={targetStyles.body}>
      <Text style={targetStyles.label}>{label}</Text>

      {/* Achieved + target */}
      <View style={targetStyles.numRow}>
        <Text
          style={[targetStyles.achieved, { color: accentColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}>
          {achieved}
        </Text>
        {target ? (
          <>
            <Text style={targetStyles.separator}>/</Text>
            <Text
              style={targetStyles.target}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}>
              {target}
            </Text>
          </>
        ) : null}
      </View>

      {/* Progress bar */}
      {rate !== undefined && (
        <View style={targetStyles.track}>
          <View
            style={[
              targetStyles.fill,
              {
                width: `${Math.min(Number(rate), 100)}%` as `${number}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
      )}

      {/* Rate */}
      {rate !== undefined && (
        <Text style={[targetStyles.rate, { color: accentColor }]}>
          {rate}% achieved
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }: Props) => {
  const [isStartingPjp, setIsStartingPjp] = useState(false);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedStoreValue, setSelectedStoreValue] =
    useState<StoreData | null>(null);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<ICheckOut | null>(
    null,
  );

  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { data: teamReportData } = useGetSalesRepotsQuery({
    view_type: 'team_include_self',
  });
  const currentMonth = moment().month() + 1;
  const currentYear = moment().year();

  // ── Filters State ──────────────────────────────────────────────────────────
  const [filterMode, setFilterMode] = useState<'month' | 'month_range' | 'date_range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [fromMonth, setFromMonth] = useState(currentMonth > 1 ? currentMonth - 1 : 1);
  const [toMonth, setToMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(new Date(currentYear, currentMonth - 1, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickingType, setPickingType] = useState<'start' | 'end'>('start');

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [monthPickerTarget, setMonthPickerTarget] = useState<'single' | 'from' | 'to'>('single');
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [editSalesTarget, setEditSalesTarget] = useState('');
  const [editDdnTarget, setEditDdnTarget] = useState('');

  const apiParams = useMemo(() => {
    const base = { employee: employee?.id as string };
    if (filterMode === 'month') {
      return { ...base, month: selectedMonth, year: selectedYear };
    }
    if (filterMode === 'month_range') {
      return { ...base, from_month: fromMonth, to_month: toMonth, year: selectedYear };
    }
    return {
      ...base,
      from_date: moment(startDate).format('YYYY-MM-DD'),
      to_date: moment(endDate).format('YYYY-MM-DD')
    };
  }, [filterMode, selectedMonth, selectedYear, fromMonth, toMonth, startDate, endDate, employee]);

  const ddnDateParams = useMemo(() => {
    if (filterMode === 'month') {
      const from = moment({ year: selectedYear, month: selectedMonth - 1, day: 1 }).format('YYYY-MM-DD');
      const to = moment({ year: selectedYear, month: selectedMonth - 1 }).endOf('month').format('YYYY-MM-DD');
      return { from_date: from, to_date: to };
    }
    if (filterMode === 'date_range') {
      return {
        from_date: moment(startDate).format('YYYY-MM-DD'),
        to_date: moment(endDate).format('YYYY-MM-DD'),
      };
    }
    return {
      from_date: moment(startDate).format('YYYY-MM-DD'),
      to_date: moment(endDate).format('YYYY-MM-DD'),
    };
  }, [filterMode, selectedMonth, selectedYear, startDate, endDate]);

  const soDateParams = useMemo(() => {
    if (filterMode === 'month') {
      return {
        from_date: moment({ year: selectedYear, month: selectedMonth - 1, day: 1 }).format('YYYY-MM-DD'),
        to_date: moment({ year: selectedYear, month: selectedMonth - 1 }).endOf('month').format('YYYY-MM-DD'),
      };
    }
    return {
      from_date: moment(startDate).format('YYYY-MM-DD'),
      to_date: moment(endDate).format('YYYY-MM-DD'),
    };
  }, [filterMode, selectedMonth, selectedYear, startDate, endDate]);

  const { data: attendanceData, refetch: refetchAttendance } = useGetAsmAttendanceTabQuery(apiParams, { skip: !employee?.id });
  const { data: pjpTargetData, refetch: refetchPjpTarget } = useGetAsmPjpTargetVsAchievementQuery(apiParams, { skip: !employee?.id });
  const { data: valueTargetData, refetch: refetchValueTarget } = useGetAsmTargetVsAchievementQuery(apiParams, { skip: !employee?.id });
  const { data: ddnData, refetch: refetchDdnStats } = useGetDdnStatsQuery(
    ddnDateParams,
    { skip: !employee?.id }
  );
  const { data: employeeTargetsData, refetch: refetchEmployeeTargets } =
    useGetEmployeeTargetsQuery(
      { month: selectedMonth, year: selectedYear },  // ← was: undefined
      { skip: !employee?.id }
    );

  const { data: soStatsData, refetch: refetchSoAchievement } =
    useGetSoStatsQuery(soDateParams, { skip: !employee?.id });

  const [setEmployeeTargets, { isLoading: isSavingTargets }] =
    useSetEmployeeTargetsMutation();
  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );
  const selectedStore = useAppSelector(
    state => state?.persistedReducer?.pjpSlice?.selectedStore,
  );
  const { data: prodData, refetch } = useGetProdCountQuery(
    { date: today },
    { refetchOnMountOrArgChange: true },
  );

  const [pjpInitialize, { data }] = usePjpInitializeMutation();
  const [checkOut, { isLoading }] = useCheckOutMutation();
  const {
    data: locationTrackerData,
    isFetching: isLocationTrackerFetching,
    refetch: refetchLocationTracker,
  } = useGetLocationTrackerQuery(undefined, { refetchOnMountOrArgChange: true });
  const {
    data: activityStatusData,
    refetch: refetchActivityStatus
  } = useGetActivityCheckInStatusQuery(undefined, { refetchOnMountOrArgChange: true });

  const [activityCheckOut, { isLoading: isActivityCheckingOut }] = useActivityCheckOutMutation();
  const [startPjp] = useStartPjpMutation();

  // ADD THIS:
  const isActivityCheckedIn = activityStatusData?.message?.is_checked_in === true;
  const isPjpActive = !!(
    selectedStoreValue?.actions?.can_check_out ||
    selectedStoreValue?.actions?.can_mark_activity
  );


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      pjpInitialize();
      refetch();
      refetchAttendance();
      refetchPjpTarget();
      refetchValueTarget();
      refetchLocationTracker();
      refetchDdnStats();
      refetchSoAchievement();       // ← add
      refetchEmployeeTargets();
      refetchActivityStatus();
    }, 2000);
  }, [
    pjpInitialize,
    refetch,
    refetchAttendance,
    refetchPjpTarget,
    refetchValueTarget,
    refetchLocationTracker,
    refetchDdnStats,
    refetchSoAchievement,           // ← add
    refetchEmployeeTargets,
    refetchActivityStatus,
  ]);

  const handleCallLocationPermission = async () => {
    let hasPermission = await requestLocationPermission();

    // 🔁 Ask again if rejected
    if (!hasPermission) {
      Toast.show({
        type: 'info',
        text1: '📍 Location permission is required',
        text2: 'Please allow location access to continue',
      });

      hasPermission = await requestLocationPermission();
    }

    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    return await handleSetValue();
  };
  const getParsedLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: '📍 Location permission required',
      });
      return null;
    }

    const location = await getCurrentLocation(); // "lat,lng"
    if (!location) return null;

    const [latitude, longitude] = location.split(',').map(Number);

    if (isNaN(latitude) || isNaN(longitude)) return null;

    return { latitude, longitude };
  };
  const handleSetValue = async () => {
    const location = await getCurrentLocation();
    return location;
  };
  const handleCheckOut = async () => {
    try {
      const current_location = await handleCallLocationPermission();

      if (!current_location) {
        Toast.show({
          type: 'error',
          text1: '❌ Unable to fetch location',
          position: 'top',
        });
        return;
      }

      const payload = {
        store: selectedStore as string,
        current_location: current_location,
        validate_geofence: false,
      };

      // 🛑 Stop here, open confirmation modal
      setCheckoutPayload(payload);
      setCheckoutModalVisible(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: `❌ ${error?.message || 'Location permission denied'}`,
        position: 'top',
      });
      setCheckoutModalVisible(true);
    }
  };

  const confirmCheckOut = async () => {
    if (!checkoutPayload) return;

    try {
      const res = await checkOut(checkoutPayload).unwrap();

      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: `✅ ${res.message.message || 'Checked out successfully'}`,
          position: 'top',
        });

        dispatch(setSelectedStore(''));
        dispatch(resetLocation());
        setSelectedStoreValue(null);
        setCheckoutModalVisible(false);
        setCheckoutPayload(null);
      } else {
        Toast.show({
          type: 'error',
          text1: `❌ ${res.message?.message || 'Check-out failed'}`,
          position: 'top',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: `❌ ${error?.message || 'Internal Server Error'}`,
        position: 'top',
      });
    }
  };

  const handleStartPjp = async () => {
    try {
      setIsStartingPjp(true);

      // 1️⃣ Get location first
      const loc = await getParsedLocation();
      if (!loc) {
        Toast.show({
          type: 'error',
          text1: '❌ Unable to fetch location',
        });
        return;
      }

      const existingPjp =
        locationTrackerData?.message?.data?.pjp_records[0]?.name;

      if (
        locationTrackerData?.message?.data?.pjp_records?.length === 0 ||
        !existingPjp
      ) {
        Toast.show({
          type: 'error',
          text1: '❌ No PJP found for today',
        });
        return;
      }

      // 3️⃣ Start PJP
      const payload: LocationPayload = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        data: {
          document_name: existingPjp,
        },
      };

      const res = await startPjp(payload).unwrap();

      if (res?.message?.success === true) {
        Toast.show({
          type: 'success',
          text1: '✅ PJP Started',
          text2: res.message.message,
        });
        refetchLocationTracker();
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Failed to start PJP',
        text2: err?.data?.message ?? 'Please try again',
      });
    } finally {
      setIsStartingPjp(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      pjpInitialize(); // 👈 Call when screen is visible
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedStore) {
      data?.message?.data?.stores?.find(
        store => store.store === selectedStore,
      ) &&
        setSelectedStoreValue(
          data?.message?.data?.stores?.find(
            store => store.store === selectedStore,
          ) || null,
        );
    }
  }, [selectedStore, data]);

  useEffect(() => {
    if (data?._server_messages) {
      let _data = extractServerMessage(data);
      setErrorMessage(_data || '');
    } else {
      setErrorMessage('');
    }
    if (data?.message?.success === false) {
      dispatch(setSelectedStore(''));
      dispatch(resetLocation());
    }
  }, [data]);

  const isDisabled =
    isLocationTrackerFetching ||
    locationTrackerData?.message?.data?.enabled === false;


  const pjpSummary = pjpTargetData?.message?.summary;
  const valueSummary = valueTargetData?.message?.summary;
  const attendanceSummary = attendanceData?.message?.summary;
  const ddnStats = ddnData?.message;

  // ── Target vs Achievement ──
  const employeeTargets = employeeTargetsData?.message;
  const salesTarget = employeeTargets?.sales_target ?? 0;
  const ddnTarget = employeeTargets?.ddn_target ?? 0;
  const soAchievement = soStatsData?.message?.value ?? 0;
  // ✅ Keep 2 decimal places → 0.10
  const ddnPct = ddnTarget > 0 ? parseFloat(((ddnStats?.value ?? 0) / ddnTarget * 100).toFixed(2)) : 0;
  const soPct = salesTarget > 0 ? parseFloat((soAchievement / salesTarget * 100).toFixed(2)) : 0;

  const handleSaveTargets = async () => {
    try {
      await setEmployeeTargets({
        sales_target: Number(editSalesTarget),
        ddn_target: Number(editDdnTarget),
        month: selectedMonth,
        year: selectedYear,
      }).unwrap();
      Toast.show({ type: 'success', text1: '✅ Targets saved successfully' });
      setTargetModalVisible(false);
      refetchEmployeeTargets();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: `❌ ${err?.message || 'Failed to save targets'}` });
    }
  };

  const handleOpenTargetModal = () => {
    setEditSalesTarget(String(salesTarget));
    setEditDdnTarget(String(ddnTarget));
    setTargetModalVisible(true);
  };

  const handleActivityCheckOut = async () => {
    try {
      const logId = activityStatusData?.message?.log_id;
      if (!logId) return;

      const location = await getCurrentLocation();
      if (!location) {
        Toast.show({ type: 'error', text1: 'Unable to fetch location' });
        return;
      }

      const res = await activityCheckOut({
        log_id: logId,
        current_location: location,
      }).unwrap();
      console.log("🚀 ~ handleActivityCheckOut ~ res:", res)

      if (res.message.success) {
        Toast.show({ type: 'success', text1: 'Activity Checked Out' });
        refetchActivityStatus();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.data?.message || 'Failed to check out'
      });
    }
  };

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.headerSec}>
            <View style={{ position: 'relative', marginBottom: 0 }}>
              <View style={styles.welcomBox}>
                <Text style={styles.welcomeText}>
                  Hello <Text style={styles.name}>{employee?.full_name}</Text>
                </Text>
                <View style={styles.linkBox}>
                  <DateBox />
                  {selectedStoreValue && (
                    <View style={styles.linkContent}>

                      <Text style={styles.paraText}>
                        Store- {selectedStoreValue?.store_name}
                      </Text>
                      {selectedStoreValue?.times?.check_in_time && (
                        <Text style={styles.paraText}>
                          Last check-in at{' '}
                          {moment(
                            selectedStoreValue?.times.check_in_time,
                            'HH:mm:ss.SSSSS',
                          ).format('hh:mm A')}
                          .
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                {/* ── ACTIVITY STATUS BLOCK — shown at top when activity is active ── */}
                {isActivityCheckedIn && (
                  <View style={{ marginTop: 12, gap: 8 }}>
                    {/* Info card */}
                    <View style={{
                      backgroundColor: '#F8FAFC',
                      padding: 12,
                      borderRadius: 10,
                      borderLeftWidth: 4,
                      borderLeftColor: '#4ADE80',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="location-sharp" size={16} color={Colors.orange} />
                        <Text style={{
                          color: Colors.darkButton,
                          fontSize: 15,
                          fontFamily: Fonts.semiBold,
                        }}>
                          {activityStatusData.message.activity_location}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
                        <Clock size={14} color={Colors.gray} />
                        <Text style={{ color: Colors.gray, fontSize: 12, fontFamily: Fonts.regular }}>
                          Check-in at: {moment(activityStatusData.message.check_in_time, 'HH:mm:ss').format('hh:mm A')}
                        </Text>
                      </View>
                    </View>

                    {/* Activity Check-Out button */}
                    <TouchableOpacity
                      style={[styles.checkinButton, { backgroundColor: '#F87171', marginTop: 0 }]}
                      onPress={handleActivityCheckOut}
                      disabled={isActivityCheckingOut}
                    >
                      <Text style={styles.checkinButtonText}>
                        {isActivityCheckingOut ? 'Checking Out...' : 'Activity Check-Out'}
                      </Text>
                      {isActivityCheckingOut ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Ionicons name="log-out-outline" size={20} color={Colors.white} />
                      )}
                    </TouchableOpacity>

                    {/* Disabled PJP hint */}
                    <Text style={{
                      fontSize: 11,
                      color: '#ffeaea',
                      textAlign: 'center',
                      fontFamily: Fonts.regular,
                    }}>
                      ⚠️ PJP Check-In is disabled while Activity is active
                    </Text>
                  </View>
                )}

                {/* ── PJP SECTION — existing logic, unchanged except isDisabled now includes isActivityCheckedIn ── */}
                {locationTrackerData?.message?.data?.pjp_records?.length === 0 ? (
                  <>
                    <Text style={{
                      fontSize: 14, color: '#ffeaea', marginBottom: 4, textAlign: 'center',
                    }}>
                      You don't have a Daily PJP for this date.
                      {'\n'}Please add one to continue check-in.
                    </Text>
                    <TouchableOpacity
                      style={[styles.checkinButton]}
                      onPress={() => navigation.navigate('AddPjpScreen')}>
                      <Text style={styles.checkinButtonText}>Add Daily PJP</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {locationTrackerData?.message?.data?.enabled === false && (
                      <TouchableOpacity
                        style={[
                          styles.checkinButton,
                          (isStartingPjp ||
                            locationTrackerData?.message?.data?.pjp_records?.length === 0 ||
                            isActivityCheckedIn) &&   // ← disabled when activity active
                          styles.checkinButtonDisabled,
                        ]}
                        disabled={
                          isStartingPjp ||
                          locationTrackerData?.message?.data?.pjp_records?.length === 0 ||
                          isActivityCheckedIn         // ← disabled when activity active
                        }
                        onPress={handleStartPjp}>
                        <Text style={styles.checkinButtonText}>
                          {isStartingPjp ? 'Starting PJP...' : 'Start PJP'}
                        </Text>
                        {isStartingPjp ? (
                          <ActivityIndicator color={Colors.white} />
                        ) : (
                          <Ionicons name="chevron-forward-circle-sharp" size={24} color={Colors.white} />
                        )}
                      </TouchableOpacity>
                    )}

                    {selectedStoreValue?.actions?.can_check_out ||
                      selectedStoreValue?.actions?.can_mark_activity ? (
                      <View>
                        <TouchableOpacity
                          style={styles.checkinButton}
                          onPress={handleCheckOut}
                          disabled={!selectedStoreValue?.actions?.can_check_out || isLoading}>
                          <Text style={styles.checkinButtonText}>Check Out</Text>
                          {isLoading ? (
                            <ActivityIndicator size="small" />
                          ) : (
                            <Ionicons name="chevron-forward-circle-sharp" size={24} color={Colors.white} />
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.checkinButton,
                          isDisabled && styles.checkinButtonDisabled,
                        ]}
                        disabled={isDisabled}
                        onPress={() => {
                          if (errorMessage !== '') {
                            Toast.show({ type: 'error', text1: `❌ ${errorMessage}`, position: 'top' });
                          } else {
                            navigation.navigate('CheckInForm');
                          }
                        }}>
                        <Text style={[
                          styles.checkinButtonText,
                          isDisabled && styles.checkinButtonTextDisabled,
                        ]}>
                          Check In
                        </Text>
                        <Ionicons
                          name="chevron-forward-circle-sharp"
                          size={24}
                          color={isDisabled ? Colors.gray : Colors.white}
                        />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
              <View style={styles.planLink}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => navigation.navigate('AttendanceScreen')}>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: Size.sm,
                      color: Colors.darkButton,
                    }}>
                    See todays beat plan
                  </Text>
                  <ArrowRight
                    strokeWidth={2}
                    color={Colors.darkButton}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.countBoxSection}>
            <View style={styles.countBox}>
              <View style={[flexCol]}>
                <Text style={styles.countBoxDay}>
                  {prodData?.message?.counts?.total_stores}
                </Text>
                <Text style={styles.countBoxTitle}>Total call</Text>
              </View>
              <View
                style={[
                  styles.countBoxIcon,
                  { backgroundColor: Colors.holdLight },
                ]}>
                <ClipboardPenLine strokeWidth={1.4} color={Colors.orange} />
              </View>
            </View>
            <View style={styles.countBox}>
              <View style={[flexCol]}>
                <Text style={styles.countBoxDay}>
                  {prodData?.message?.counts?.status_counts?.Visited}
                </Text>
                <Text style={styles.countBoxTitle}>Productive Call</Text>
              </View>
              <View
                style={[
                  styles.countBoxIcon,
                  { backgroundColor: Colors.lightSuccess },
                ]}>
                <MapPinCheck strokeWidth={1.4} color={Colors.success} />
              </View>
            </View>
          </View>


          {/* ── Dashboard Filters ── */}
          <View style={styles.filterSection}>
            <View style={styles.filterTabRow}>
              {[
                { label: 'Monthly', mode: 'month' },
                // { label: 'Range', mode: 'month_range' },
                { label: 'Range', mode: 'date_range' }
              ].map(opt => (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => setFilterMode(opt.mode as any)}
                  style={[
                    styles.filterChip,
                    filterMode === opt.mode && styles.filterChipActive
                  ]}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterMode === opt.mode && styles.filterChipTextActive
                  ]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterPickerRow}>
              {filterMode === 'month' && (
                <TouchableOpacity
                  style={styles.filterValueBtn}
                  onPress={() => {
                    setMonthPickerTarget('single');
                    setShowMonthModal(true);
                  }}>
                  <Calendar size={14} color={C.accent} />
                  <Text style={styles.filterValueText}>
                    {moment().month(selectedMonth - 1).format('MMMM')}, {selectedYear}
                  </Text>
                  <ChevronDown size={14} color={C.textMuted} />
                </TouchableOpacity>
              )}
              {filterMode === 'month_range' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.filterLabelSmall}>From:</Text>
                  <TouchableOpacity
                    style={styles.filterValueBtnSmall}
                    onPress={() => {
                      setMonthPickerTarget('from');
                      setShowMonthModal(true);
                    }}>
                    <Text style={styles.filterValueTextSmall}>
                      {moment().month(fromMonth - 1).format('MMM')}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.filterLabelSmall}>To:</Text>
                  <TouchableOpacity
                    style={styles.filterValueBtnSmall}
                    onPress={() => {
                      setMonthPickerTarget('to');
                      setShowMonthModal(true);
                    }}>
                    <Text style={styles.filterValueTextSmall}>
                      {moment().month(toMonth - 1).format('MMM')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.filterValueBtnSmall}
                    onPress={() => setShowYearModal(true)}>
                    <Text style={styles.filterValueTextSmall}>{selectedYear}</Text>
                    <ChevronDown size={10} color={C.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
              {filterMode === 'date_range' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.filterDateBtn}
                    onPress={() => { setPickingType('start'); setShowDatePicker(true); }}
                  >
                    <Text style={styles.filterDateLabel}>From</Text>
                    <Text style={styles.filterDateVal}>{moment(startDate).format('DD MMM')}</Text>
                  </TouchableOpacity>
                  <ChevronRight size={14} color={C.textMuted} />
                  <TouchableOpacity
                    style={styles.filterDateBtn}
                    onPress={() => { setPickingType('end'); setShowDatePicker(true); }}
                  >
                    <Text style={styles.filterDateLabel}>To</Text>
                    <Text style={styles.filterDateVal}>{moment(endDate).format('DD MMM')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={pickingType === 'start' ? startDate : endDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  if (pickingType === 'start') setStartDate(date);
                  else setEndDate(date);
                }
              }}
            />
          )}

          {/* ── Month Picker Modal ── */}
          <Modal
            visible={showMonthModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowMonthModal(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowMonthModal(false)}>
              <View style={styles.pickerModalContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Month</Text>
                  <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                    <Ionicons name="close" size={24} color={C.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.monthGrid}>
                  {moment.months().map((month, index) => {
                    const mValue = index + 1;
                    const isActive =
                      monthPickerTarget === 'single' ? selectedMonth === mValue :
                        monthPickerTarget === 'from' ? fromMonth === mValue :
                          toMonth === mValue;

                    return (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.monthItem,
                          isActive && styles.monthItemActive
                        ]}
                        onPress={() => {
                          if (monthPickerTarget === 'single') setSelectedMonth(mValue);
                          else if (monthPickerTarget === 'from') setFromMonth(mValue);
                          else setToMonth(mValue);
                          setShowMonthModal(false);
                        }}>
                        <Text style={[
                          styles.monthTextBlack,
                          isActive && styles.monthTextActive
                        ]}>{moment().month(index).format('MMM')}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ── Year Picker Modal ── */}
          <Modal
            visible={showYearModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowYearModal(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowYearModal(false)}>
              <View style={styles.pickerModalContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Year</Text>
                  <TouchableOpacity onPress={() => setShowYearModal(false)}>
                    <Ionicons name="close" size={24} color={C.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.yearList}>
                  {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearItem,
                        selectedYear === year && styles.yearItemActive
                      ]}
                      onPress={() => {
                        setSelectedYear(year);
                        setShowYearModal(false);
                      }}>
                      <Text style={[
                        styles.yearText,
                        selectedYear === year && styles.yearTextActive
                      ]}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={checkoutModalVisible}
            transparent
            animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Confirm Check-out</Text>

                <Text style={styles.modalLabel}>Store</Text>
                <Text style={styles.modalValue}>{checkoutPayload?.store}</Text>

                <Text style={styles.modalLabel}>Current Location</Text>
                <Text style={styles.modalValue}>
                  {checkoutPayload?.current_location}
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setCheckoutModalVisible(false);
                      setCheckoutPayload(null);
                    }}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={confirmCheckOut}>
                    <Text style={styles.confirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ── Team Attendance ── */}
          {attendanceData?.message && attendanceData?.message?.records?.length > 0 && <View style={styles.section}>
            <SectionTitle
              title="Team Attendance"
              sub={
                filterMode === 'month'
                  ? `${moment().month(selectedMonth - 1).format('MMMM')} Summary`
                  : filterMode === 'date_range'
                    ? `${moment(startDate).format('DD MMM')} – ${moment(endDate).format('DD MMM')}`
                    : 'Summary'
              }
            />



            {/* Horizontal per-user scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 5, paddingHorizontal: 2 }}
            >
              {attendanceData?.message?.records?.map((r) => {
                const rate = r.attendance_rate;
                const color = rate >= 75 ? '#2E7D32' : rate >= 50 ? '#F59E0B' : '#EF4444';
                const bgColor = rate >= 75 ? '#DCFCE7' : rate >= 50 ? '#FEF3C7' : '#FEE2E2';

                return (
                  <TouchableOpacity
                    key={r.employee_id}
                    onPress={() => navigation.navigate('TeamDetailScreen', {
                      employee_id: r.employee_id,
                      date: today
                    })}
                    style={{
                      width: 130,
                      backgroundColor: C.card,
                      borderRadius: 14,
                      borderWidth: 0.5,
                      borderColor: C.border,
                      padding: 12,
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {/* Avatar */}
                    <View style={{
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: C.accentSoft,
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: C.accent }}>
                        {r.initials || r.employee_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Name */}
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 12, fontWeight: '600', color: C.text, textAlign: 'center' }}
                    >
                      {r.employee_name}
                    </Text>

                    {/* Rate badge */}
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 2,
                      borderRadius: 20, backgroundColor: bgColor,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color }}>
                        {rate}%
                      </Text>
                    </View>

                    {/* Progress bar */}
                    <View style={{
                      width: '100%', height: 4,
                      backgroundColor: C.border, borderRadius: 2, overflow: 'hidden',
                    }}>
                      <View style={{
                        width: `${Math.min(rate, 100)}%` as `${number}%`,
                        height: '100%', backgroundColor: color, borderRadius: 2,
                      }} />
                    </View>

                    {/* Stats row */}
                    <View style={{
                      flexDirection: 'row', justifyContent: 'space-between',
                      width: '100%', marginTop: 2,
                    }}>


                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>
                          {r.total_working_days}
                        </Text>
                        <Text style={{ fontSize: 9, color: C.textMuted }}>Days</Text>
                      </View>

                      <View style={{ width: 1, backgroundColor: C.border, marginVertical: 2 }} />

                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#2E7D32' }}>
                          {r.days_present}
                        </Text>
                        <Text style={{ fontSize: 9, color: C.textMuted }}>Present</Text>
                      </View>

                      <View style={{ width: 1, backgroundColor: C.border, marginVertical: 2 }} />

                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>
                          {r.days_absent}
                        </Text>
                        <Text style={{ fontSize: 9, color: C.textMuted }}>Absent</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>}

          {/* ── Target vs Achievement ── */}
          <View style={[styles.section, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <SectionTitle
                title="Team Performance"
                sub={
                  filterMode === 'month'
                    ? `${moment().month(selectedMonth - 1).format('MMMM')} Performance`
                    : `${moment(startDate).format('DD MMM')} – ${moment(endDate).format('DD MMM')}`
                }
              />
              {/* Edit targets button */}
              <TouchableOpacity
                onPress={handleOpenTargetModal}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  paddingHorizontal: 10, paddingVertical: 5,
                  borderRadius: 20, borderWidth: 0.5, borderColor: '#534AB7',
                  backgroundColor: 'rgba(83,74,183,0.07)',
                }}>
                <Text style={{ fontSize: 11, color: '#534AB7', fontFamily: Fonts.medium }}>
                  Set Targets
                </Text>
              </TouchableOpacity>
            </View>

            {/* Source hint — shown only when using global defaults */}
            {/* {employeeTargets?.source === 'global' && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: '#FEF3C7', borderRadius: 8,
                paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8,
              }}>
                <Text style={{ fontSize: 11, color: '#92400E', fontFamily: Fonts.medium }}>
                  Using system default targets. Tap "Set Targets" to personalise.
                </Text>
              </View>
            )} */}

            <View style={styles.metricRow}>
              <TargetMetricBox
                label="PJP Visits"
                achieved={`${pjpSummary?.total_visited ?? 0}`}
                target={`${pjpSummary?.total_planned ?? 0}`}
                rate={pjpSummary?.achievement_rate ?? 0}
                accentColor="#534AB7"
                onPress={() => navigation.navigate('TeamPerformanceListScreen', { apiParams, today, mode: 'pjp' })}
              />

              <TargetMetricBox
                label="Orders"
                achieved={`₹${soAchievement % 1 !== 0 ? soAchievement.toFixed(2) : soAchievement}`}
                target={`₹${salesTarget}`}
                rate={soPct}
                accentColor="#0F6E56"
              />
            </View>
            <View style={[styles.metricRow, { marginTop: 10 }]}>
              <TargetMetricBox
                label="Delivery Note"
                achieved={`₹${(ddnStats?.value ?? 0) % 1 !== 0 ? (ddnStats?.value ?? 0).toFixed(2) : (ddnStats?.value ?? 0)}`}
                target={`₹${ddnTarget}`}
                rate={ddnPct}
                accentColor="#185FA5"
              />
            </View>
          </View>

          {/* ── Set Targets Modal ── */}
          <Modal
            visible={targetModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setTargetModalVisible(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setTargetModalVisible(false)}>
              <View style={[styles.modalContainer, { gap: 14 }]}>
                <Text style={styles.modalTitle}>Set Monthly Targets</Text>

                {/* Period info */}
                <Text style={{ fontSize: 12, color: '#828282', fontFamily: Fonts.regular, marginTop: -8 }}>
                  {moment().format('MMMM YYYY')} — targets apply to current month only
                </Text>

                {/* Sales Target */}
                <View>
                  <Text style={styles.modalLabel}>Order Target (₹)</Text>
                  <TextInput
                    value={editSalesTarget}
                    onChangeText={setEditSalesTarget}
                    keyboardType="numeric"
                    placeholder="e.g. 5000000"
                    style={{
                      borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
                      paddingHorizontal: 14, paddingVertical: 12,
                      fontSize: 14, fontFamily: Fonts.medium, color: '#1A1A1A',
                      backgroundColor: '#FAFAFA', marginTop: 4,
                    }}
                  />
                </View>

                {/* DDN Target */}
                <View>
                  <Text style={styles.modalLabel}>Delivery Note Target (₹)</Text>
                  <TextInput
                    value={editDdnTarget}
                    onChangeText={setEditDdnTarget}
                    keyboardType="numeric"
                    placeholder="e.g. 4000000"
                    style={{
                      borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
                      paddingHorizontal: 14, paddingVertical: 12,
                      fontSize: 14, fontFamily: Fonts.medium, color: '#1A1A1A',
                      backgroundColor: '#FAFAFA', marginTop: 4,
                    }}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setTargetModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmButton, isSavingTargets && { opacity: 0.6 }]}
                    disabled={isSavingTargets}
                    onPress={handleSaveTargets}>
                    {isSavingTargets
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.confirmText}>Save</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* ── Attendance Preview ── */}
          {/* {attendanceData?.message?.records?.length !== 0 && <View style={{ marginTop: 20, marginHorizontal: 20 }}>
            <SectionTitle title="Team Attendance" sub="Quick Glance" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attendancePreviewScroll}
            >
              {(attendanceData?.message?.records || []).map((r: any) => (
                <TouchableOpacity
                  key={r.employee_id}
                  style={styles.attendanceAvatarItem}
                  onPress={() => navigation.navigate('TeamDetailScreen', {
                    employee_id: r.employee_id,
                    date: today
                  })}
                >
                  <View style={[
                    styles.attendanceAvatar,
                    { borderColor: r.attendance_status === 'Present' ? C.green : '#EF4444' }
                  ]}>
                    <Text style={styles.attendanceInitial}>{r.initials}</Text>
                    <View style={[
                      styles.attendanceStatusDot,
                      { backgroundColor: r.attendance_status === 'Present' ? '#10B981' : '#EF4444' }
                    ]} />
                  </View>
                  <Text style={styles.attendanceShortName} numberOfLines={1}>{r.employee_name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>} */}

          {/* ── Team Performance Details ── */}
          {/* <View style={styles.section}>
            <SectionTitle title="Team Details" sub="Live Achievement" />
            {teamRecords.slice(0, 2).map((r: any) => (
              <PerformanceCard
                key={r.id}
                onPress={() => navigation.navigate('TeamDetailScreen', {
                  employee_id: r.id,
                  date: today
                })}
                name={r.attendance?.employee_name || r.pjp?.employee_name || r.value?.employee_name || 'Unknown'}
                role={r.attendance?.designation || r.pjp?.designation || r.value?.designation || 'Team Member'}
                status={r.attendance?.attendance_status || 'Absent'}
                checkIn={r.attendance?.check_in_time}
                pjp={`${r.pjp?.total_visited ?? 0}/${r.pjp?.total_planned ?? 0}`}
                pjpRate={r.pjp?.achievement_rate ?? 0}
                value={`₹${((r.value?.so_total || 0) / 1000).toFixed(1)}K`}
                valueRate={r.value?.achievement_pct ?? 0}
              />
            ))}

            {teamRecords.length > 2 && (
              <TouchableOpacity
                style={styles.viewMoreBtn}
                onPress={() => navigation.navigate('TeamAttendanceListScreen', { apiParams: apiParams, today: today })}
              >
                <Text style={styles.viewMoreText}>Show More</Text>
                <ChevronRight size={16} color={C.accent} />
              </TouchableOpacity>
            )}
          </View> */}

          {/* <View style={[styles.container, { paddingTop: 20 }]}>
            <Text style={styles.SectionHeading}>Team Performance</Text>
            <View
              style={[
                styles.dataBox,
                {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginTop: 10,
                },
              ]}>
              <View style={styles.incentiveContent}>
                <View style={styles.iconbox}>
                  <UsersRound strokeWidth={2} color={Colors.white} size={30} />
                </View>
                <View>
                  <Text style={styles.quantityCount}>
                    ₹ {teamReportData?.message?.mtd_summary?.total_value || 0}
                  </Text>
                  <Text style={styles.quantitytime}>Sales this month</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('SalesScreen', { index: 1 })}
                style={[
                  styles.positionValue,
                  {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                    height: 40,
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    borderColor: Colors.sucess,
                    backgroundColor: '#C8F8D1',
                    borderRadius: 8,
                    width: '100%',
                  },
                ]}>
                <Text style={[styles.incressValu]}>
                  See how your team is doing
                </Text>
                <Ionicons
                  name="chevron-forward-circle-sharp"
                  size={24}
                  color={Colors.sucess}
                />
              </TouchableOpacity>
            </View>
          </View> */}


          <View style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
            <Text style={[styles.SectionHeading, { marginBottom: 10, paddingHorizontal: 20 }]}>
              Activity Check-In
            </Text>

            <View style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity
                style={[
                  styles.checkinButton,
                  { backgroundColor: Colors.darkButton, marginTop: 5 },
                  isPjpActive && styles.checkinButtonDisabled,   // ← greyed out when PJP active
                ]}
                disabled={isPjpActive}                           // ← blocked when PJP active
                onPress={() => navigation.navigate('ActivityCheckInScreen')}
              >
                <View style={[flexRow, itemsCenter]}>
                  <Text style={[
                    styles.checkinButtonText,
                    isPjpActive && styles.checkinButtonTextDisabled,
                  ]}>
                    Activity Check-In
                  </Text>
                  <Ionicons name="chevron-forward-circle-sharp" size={20}
                    color={isPjpActive ? Colors.gray : Colors.white}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>

              {isPjpActive && (
                <Text style={{
                  fontSize: 11, color: Colors.gray,
                  textAlign: 'center', marginTop: 6,
                  fontFamily: Fonts.regular,
                }}>
                  ⚠️ Activity Check-In is disabled while PJP is active
                </Text>
              )}
            </View>
          </View>

          <View
            style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
            <Text
              style={[
                styles.SectionHeading,
                { marginBottom: 10, paddingHorizontal: 20 },
              ]}>
              Quick links
            </Text>
            <TouchableOpacity
              style={styles.IconlinkBox}
              onPress={() => navigation.navigate('AddPjpScreen')}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <FilePlus2 strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Add PJP</Text>
              <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('AddStoreScreen')}
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <Hotel strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Add Store</Text>
              <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />
            <TouchableOpacity
              style={styles.IconlinkBox}
              onPress={() => navigation.navigate('OrdersScreen', { index: 0 })}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <BaggageClaim strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Orders</Text>
              <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('AddDistributorScreen')}
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <Package strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Add Distributor</Text>
              <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
            <Text
              style={[
                styles.SectionHeading,
                { marginBottom: 10, paddingHorizontal: 20 },
              ]}>
              Claims
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ExpenseScreen')}
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <BanknoteArrowDown
                  strokeWidth={2}
                  color={Colors.white}
                  size={20}
                />
              </View>
              <Text style={styles.linkTitle}>Expense Claim</Text>
              <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('VisibilityScreen')}
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <Eye strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Visibility Claim</Text>
              <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
            <Text
              style={[
                styles.SectionHeading,
                { marginBottom: 10, paddingHorizontal: 20 },
              ]}>
              Stock
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('StockManagementScreen')
              }
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <Boxes strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Stock Management</Text>
              <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
            <Text
              style={[
                styles.SectionHeading,
                { marginBottom: 10, paddingHorizontal: 20 },
              ]}>
              Activity
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ActivityLocationScreen')
              }
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <MapPin strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Activity Location</Text>
              <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const DateBox = () => {
  const today = moment(); // current date
  const day = today.format('DD'); // e.g. "21"
  const month = today.format('MMM').toUpperCase(); // e.g. "APR"

  return (
    <View style={styles.dateBox}>
      <Text style={styles.dateText}>{day}</Text>
      <Text style={styles.monthTextWhite}>{month}</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },

  //header-box-section css start
  headerSec: {
    backgroundColor: Colors.white,
    minHeight: 200,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android Shadow
    elevation: 2,
    marginBottom: 10
  },
  welcomeText: {
    fontFamily: Fonts.light,
    color: Colors.white,
    fontSize: Size.sm,
  },
  name: { fontFamily: Fonts.medium, fontSize: Size.sm, color: Colors.white },
  welcomBox: {
    padding: 15,
    backgroundColor: Colors.orange,
    borderRadius: 15,
    paddingVertical: 20,
    marginTop: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    position: 'relative',
  },

  linkBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 15,
    marginTop: 8,
    gap: 10,
  },

  dateBox: {
    width: 50,
    height: 50,
    borderColor: Colors.white,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.transparent,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },

  dateText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  monthTextWhite: {
    fontFamily: Fonts.regular,
    color: Colors.white,
    fontSize: Size.xs,
  },
  monthTextBlack: {
    fontFamily: Fonts.regular,
    color: Colors.black,
    fontSize: Size.xs,
  },

  linkContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: Colors.white,
    gap: 1,
    alignItems: 'flex-start',
    width: '80%',
  },

  planLink: {
    backgroundColor: Colors.white,
    padding: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  paraText: { fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm },
  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'relative',
    gap: 5,
    marginTop: 15,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },

  //header-box-section css end
  //countBox-section css start
  countBoxSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBox: {
    backgroundColor: Colors.white,
    width: width * 0.44,
    borderRadius: 12,
    padding: 12,
    height: 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  countBoxIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
  },
  countBoxTitle: {
    fontFamily: Fonts.regular,
    color: Colors.black,
    fontSize: 14,
    marginTop: 2,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 20,
  },
  //countBox-section css end

  //target&achivement section css start
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  //   checkinButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   backgroundColor: Colors.primary,
  //   padding: 14,
  //   borderRadius: 10,
  // },

  checkinButtonDisabled: {
    backgroundColor: Colors.black,
    opacity: 0.8,
  },

  checkinButtonTextDisabled: {
    color: Colors.gray,
  },

  dataBoxSection: { paddingTop: 15 },
  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionValue: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  incressValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: Colors.sucess,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },
  quantityCount: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
    lineHeight: 22,
  },
  quantitytime: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
    lineHeight: 20,
  },

  decriseValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },

  //incentive section css start
  incentiveContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  iconbox: {
    width: 60,
    height: 60,
    backgroundColor: Colors.sucess,
    borderRadius: 18,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listLink: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
  },
  listLinkText: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.regular,
  },
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },

  //incentive section css start
  LinkSection: { backgroundColor: Colors.white },

  IconlinkBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  linkTitle: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  modalValue: {
    fontSize: 14,
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },

  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
  },

  cancelText: {
    color: '#374151',
    fontWeight: '500',
  },

  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // ── Sections ────────────────────────────────────────────────────────────────
  section: { paddingHorizontal: 16, paddingTop: 10 },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  sectionSub: { fontSize: 12, color: C.textMuted },




  // ── Metric boxes ─────────────────────────────────────────────────────────────
  metricRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metricBox: {
    flex: 1, backgroundColor: C.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: C.border,
    padding: 12, alignItems: 'center', gap: 4,
  },
  metricValue: { fontSize: 15, fontWeight: '600', color: C.text, textAlign: 'center' },
  metricLabel: { fontSize: 10, color: C.textMuted, textAlign: 'center' },
  metricRatePill: {
    marginTop: 4, backgroundColor: C.accentSoft,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  metricRate: { fontSize: 11, fontWeight: '600', color: C.accent },

  // ── Performance Cards ────────────────────────────────────────────────────────
  perfCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 0.5, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  perfTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  perfAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  perfAvatarText: { color: C.white, fontSize: 16, fontWeight: 'bold' },
  perfName: { fontSize: 15, fontWeight: '600', color: C.text },
  perfRole: { fontSize: 12, color: C.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  perfMetrics: {
    flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5,
    borderTopColor: C.border, paddingTop: 12,
  },
  perfMetricCol: { flex: 1, alignItems: 'center' },
  perfMetricDivider: { width: 1, height: 20, backgroundColor: C.border },
  perfMetricTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  perfMetricLabel: { fontSize: 10, color: C.textMuted },
  perfMetricVal: { fontSize: 12, fontWeight: '600', color: C.text },

  // ── Attendance Preview ───────────────────────────────────────────────────────
  attendancePreviewScroll: { paddingLeft: 16, paddingBottom: 10 },
  attendanceAvatarItem: { alignItems: 'center', marginRight: 16, gap: 4 },
  attendanceAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.white,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  attendanceStatusDot: {
    position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
    borderRadius: 6, borderWidth: 2, borderColor: C.white,
  },
  attendanceInitial: { fontSize: 14, fontWeight: '600', color: C.text },
  attendanceShortName: { fontSize: 10, color: C.textMuted, width: 44, textAlign: 'center' },

  // ── Filters ──────────────────────────────────────────────────────────────────
  filterSection: {
    backgroundColor: C.white, marginHorizontal: 16, marginTop: 0,
    borderRadius: 16, padding: 12, borderWidth: 0.5, borderColor: C.border,
  },
  filterTabRow: { flexDirection: 'row', gap: 8, },
  filterChip: {
    flex: 1, paddingVertical: 6, borderRadius: 8,
    backgroundColor: C.background, alignItems: 'center',
  },
  filterChipActive: { backgroundColor: C.accentSoft, borderWidth: 1, borderColor: C.accent },
  filterChipText: { fontSize: 12, color: '#000', fontWeight: '500' },
  filterChipTextActive: { color: C.accent, fontWeight: '700' },

  filterPickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  filterValueBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterValueText: { fontSize: 14, fontWeight: '600', color: C.text },
  filterLabelSmall: { fontSize: 12, color: C.textMuted },
  filterDateVal: { fontSize: 14, fontWeight: '700', color: C.accent },
  filterDateBtn: { alignItems: 'center' },
  filterDateLabel: { fontSize: 9, color: C.textMuted, textTransform: 'uppercase' },

  filterValueBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: C.border,
    gap: 4
  },
  filterValueTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: C.accent
  },

  pickerModalContainer: {
    width: '80%',
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center'
  },
  monthItem: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: C.background,
  },
  monthItemActive: {
    backgroundColor: C.accent,
  },
  // monthText: {
  //   fontSize: 13,
  //   fontWeight: '600',
  //   color: C.text,
  // },
  monthTextActive: {
    color: C.white,
  },
  yearList: {
    gap: 10,
  },
  yearItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: C.background,
  },
  yearItemActive: {
    backgroundColor: C.accent,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  yearTextActive: {
    color: C.white,
  },

  viewMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, paddingVertical: 10, gap: 6,
    backgroundColor: C.white, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
  },
  viewMoreText: { fontSize: 13, fontWeight: '700', color: C.accent },

});
const targetStyles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    overflow: 'hidden',
  },
  stripe: {
    width: 3,
  },
  body: {
    flex: 1,
    padding: 11,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: C.textMuted,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 6,
  },
  achieved: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    fontSize: 11,
    color: C.textMuted,
  },
  target: {
    fontSize: 11,
    color: C.textMuted,
  },
  track: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 5,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  rate: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
});