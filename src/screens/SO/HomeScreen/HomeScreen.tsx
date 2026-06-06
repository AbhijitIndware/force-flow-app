/* eslint-disable react-native/no-inline-styles */
import {RefreshControl, SafeAreaView, ScrollView} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SoAppStackParamList} from '../../../types/Navigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useAppDispatch, useAppSelector} from '../../../store/hook';
import {
  resetLocation,
  setSelectedStore,
  useCheckOutMutation,
  useGetAsmAttendanceTabQuery,
  useGetAsmPjpTargetVsAchievementQuery,
  useGetAsmTargetVsAchievementQuery,
  useGetLocationTrackerQuery,
  useGetProdCountQuery,
  useStartPjpMutation,
  useGetEmployeeTargetsQuery,
  useGetSoStatsQuery,
  useGetDdnStatsQuery,
  useGetActivityCheckInStatusQuery,
  useActivityCheckOutMutation,
  usePjpInitializeMutation,
  useGetPjpNextActionQuery,
} from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';
import {ICheckOut, LocationPayload, StoreData} from '../../../types/baseType';
import moment from 'moment';
import {useIsFocused} from '@react-navigation/native';
import {
  getCurrentLocation,
  requestLocationPermission,
} from '../../../utils/utils';

// ── Sub-components ──────────────────────────────────────────────────────────
import {HeaderSection} from '../../../components/SO/HomeScreen/HeaderSection';
import {StatsOverview} from '../../../components/SO/HomeScreen/StatsOverview';
import {FilterSection} from '../../../components/SO/HomeScreen/FilterSection';
import {TeamAttendance} from '../../../components/SO/HomeScreen/TeamAttendance';
import {TeamPerformance} from '../../../components/SO/HomeScreen/TeamPerformance';
import {ActivityCheckInBlock} from '../../../components/SO/HomeScreen/ActivityCheckInBlock';
import {QuickLinks} from '../../../components/SO/HomeScreen/QuickLinks';
import {ClaimsSection} from '../../../components/SO/HomeScreen/ClaimsSection';
import {StockAndActivityLinks} from '../../../components/SO/HomeScreen/StockAndActivityLinks';
import {CheckoutConfirmModal} from '../../../components/SO/HomeScreen/CheckoutConfirmModal';
import {SetTargetsModal} from '../../../components/SO/HomeScreen/SetTargetsModal';
import {MonthPickerModal} from '../../../components/SO/HomeScreen/MonthPickerModal';
import {YearPickerModal} from '../../../components/SO/HomeScreen/YearPickerModal';

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
    const messagesArray = JSON.parse(resp._server_messages);
    if (!messagesArray?.length) return null;
    const messageObj = JSON.parse(messagesArray[0]);
    return messageObj.message || null;
  } catch (err) {
    return null;
  }
}

const today = new Date().toISOString().split('T')[0];

const HomeScreen = ({navigation}: Props) => {
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
  const currentMonth = moment().month() + 1;
  const currentYear = moment().year();

  // ── Filters State ──────────────────────────────────────────────────────────
  const [filterMode, setFilterMode] = useState<
    'month' | 'month_range' | 'date_range'
  >('month');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [fromMonth, setFromMonth] = useState(
    currentMonth > 1 ? currentMonth - 1 : 1,
  );
  const [toMonth, setToMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(
    new Date(currentYear, currentMonth - 1, 1),
  );
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickingType, setPickingType] = useState<'start' | 'end'>('start');

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [monthPickerTarget, setMonthPickerTarget] = useState<
    'single' | 'from' | 'to'
  >('single');
  const [targetModalVisible, setTargetModalVisible] = useState(false);

  const {data: pjpWorkflowData, refetch: refetchPjpWorkflow} =
    useGetPjpNextActionQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const pjpState = pjpWorkflowData?.message.data?.current_state;
  const pjpActions = pjpWorkflowData?.message.data?.allowed_actions ?? [];
  const pjpDocName = pjpWorkflowData?.message.data?.pjp_document_name;
  const activeStoreId = pjpWorkflowData?.message.data?.active_store_id;
  const activeActivityId = pjpWorkflowData?.message.data?.active_activity_id;

  const apiParams = useMemo(() => {
    const base = {employee: employee?.id as string};
    if (filterMode === 'month') {
      return {...base, month: selectedMonth, year: selectedYear};
    }
    if (filterMode === 'month_range') {
      return {
        ...base,
        from_month: fromMonth,
        to_month: toMonth,
        year: selectedYear,
      };
    }
    return {
      ...base,
      from_date: moment(startDate).format('YYYY-MM-DD'),
      to_date: moment(endDate).format('YYYY-MM-DD'),
    };
  }, [
    filterMode,
    selectedMonth,
    selectedYear,
    fromMonth,
    toMonth,
    startDate,
    endDate,
    employee,
  ]);

  const ddnDateParams = useMemo(() => {
    if (filterMode === 'month') {
      const from = moment({
        year: selectedYear,
        month: selectedMonth - 1,
        day: 1,
      }).format('YYYY-MM-DD');
      const to = moment({year: selectedYear, month: selectedMonth - 1})
        .endOf('month')
        .format('YYYY-MM-DD');
      return {from_date: from, to_date: to};
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
        from_date: moment({
          year: selectedYear,
          month: selectedMonth - 1,
          day: 1,
        }).format('YYYY-MM-DD'),
        to_date: moment({year: selectedYear, month: selectedMonth - 1})
          .endOf('month')
          .format('YYYY-MM-DD'),
      };
    }
    return {
      from_date: moment(startDate).format('YYYY-MM-DD'),
      to_date: moment(endDate).format('YYYY-MM-DD'),
    };
  }, [filterMode, selectedMonth, selectedYear, startDate, endDate]);

  const {data: attendanceData, refetch: refetchAttendance} =
    useGetAsmAttendanceTabQuery(apiParams, {skip: !employee?.id});
  const {data: pjpTargetData, refetch: refetchPjpTarget} =
    useGetAsmPjpTargetVsAchievementQuery(apiParams, {skip: !employee?.id});
  const {data: valueTargetData, refetch: refetchValueTarget} =
    useGetAsmTargetVsAchievementQuery(apiParams, {skip: !employee?.id});
  const {data: ddnData, refetch: refetchDdnStats} = useGetDdnStatsQuery(
    ddnDateParams,
    {skip: !employee?.id},
  );
  const {data: employeeTargetsData, refetch: refetchEmployeeTargets} =
    useGetEmployeeTargetsQuery(
      {month: selectedMonth, year: selectedYear},
      {skip: !employee?.id},
    );

  const {data: soStatsData, refetch: refetchSoAchievement} = useGetSoStatsQuery(
    soDateParams,
    {skip: !employee?.id},
  );
  const selectedStore = useAppSelector(
    state => state?.persistedReducer?.pjpSlice?.selectedStore,
  );
  const {data: prodData, refetch} = useGetProdCountQuery(
    {date: today},
    {refetchOnMountOrArgChange: true},
  );

  const [pjpInitialize, {data, error}] = usePjpInitializeMutation();
  const [checkOut, {isLoading}] = useCheckOutMutation();
  const {
    data: locationTrackerData,
    isFetching: isLocationTrackerFetching,
    refetch: refetchLocationTracker,
  } = useGetLocationTrackerQuery(undefined, {refetchOnMountOrArgChange: true});
  const {data: activityStatusData, refetch: refetchActivityStatus} =
    useGetActivityCheckInStatusQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const [activityCheckOut, {isLoading: isActivityCheckingOut}] =
    useActivityCheckOutMutation();
  const [startPjp] = useStartPjpMutation();

  const isActivityCheckedIn =
    activityStatusData?.message?.is_checked_in === true;

  // ── Refresh ──────────────────────────────────────────────────────────────────
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
      refetchSoAchievement();
      refetchEmployeeTargets();
      refetchActivityStatus();
      refetchPjpWorkflow();
    }, 2000);
  }, [
    pjpInitialize,
    refetch,
    refetchAttendance,
    refetchPjpTarget,
    refetchValueTarget,
    refetchLocationTracker,
    refetchDdnStats,
    refetchSoAchievement,
    refetchEmployeeTargets,
    refetchActivityStatus,
  ]);

  // ── Location helpers ─────────────────────────────────────────────────────────
  const handleCallLocationPermission = async () => {
    let hasPermission = await requestLocationPermission();
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
    const location = await getCurrentLocation();
    if (!location) return null;
    const [latitude, longitude] = location.split(',').map(Number);
    if (isNaN(latitude) || isNaN(longitude)) return null;
    return {latitude, longitude};
  };

  const handleSetValue = async () => {
    const location = await getCurrentLocation();
    return location;
  };

  // ── Check-out flow ───────────────────────────────────────────────────────────
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
    setCheckoutModalVisible(false);
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

  // ── Start PJP ────────────────────────────────────────────────────────────────
  const handleStartPjp = async () => {
    try {
      setIsStartingPjp(true);
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

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFocused) {
      pjpInitialize();
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

  // ── Derived values ───────────────────────────────────────────────────────────
  const isDisabled =
    isLocationTrackerFetching ||
    locationTrackerData?.message?.data?.enabled === false;

  const pjpSummary = pjpTargetData?.message?.summary;
  const ddnStats = ddnData?.message;

  const employeeTargets = employeeTargetsData?.message;
  const salesTarget = employeeTargets?.sales_target ?? 0;
  const ddnTarget = employeeTargets?.ddn_target ?? 0;
  const soAchievement = soStatsData?.message?.value ?? 0;
  const ddnPct =
    ddnTarget > 0
      ? parseFloat((((ddnStats?.value ?? 0) / ddnTarget) * 100).toFixed(2))
      : 0;
  const soPct =
    salesTarget > 0
      ? parseFloat(((soAchievement / salesTarget) * 100).toFixed(2))
      : 0;

  const handleOpenTargetModal = () => {
    setTargetModalVisible(true);
  };

  // ── Activity check-out ───────────────────────────────────────────────────────
  const handleActivityCheckOut = async () => {
    try {
      const logId = activityStatusData?.message?.log_id;
      if (!logId) return;
      const location = await getCurrentLocation();
      if (!location) {
        Toast.show({type: 'error', text1: 'Unable to fetch location'});
        return;
      }
      const res = await activityCheckOut({
        log_id: logId,
        current_location: location,
      }).unwrap();
      if (res.message.success) {
        Toast.show({type: 'success', text1: 'Activity Checked Out'});
        refetchActivityStatus();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.data?.message || 'Failed to check out',
      });
    }
  };

  // ── Month picker handler ─────────────────────────────────────────────────────
  const handleMonthSelect = (mValue: number) => {
    if (monthPickerTarget === 'single') setSelectedMonth(mValue);
    else if (monthPickerTarget === 'from') setFromMonth(mValue);
    else setToMonth(mValue);
    setShowMonthModal(false);
  };

  // ── Year picker handler ──────────────────────────────────────────────────────
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearModal(false);
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════
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
          {/* ── Header (greeting, store, activity status, PJP, beat plan) ── */}
          <HeaderSection
            employee={employee}
            selectedStoreValue={selectedStoreValue}
            isActivityCheckedIn={isActivityCheckedIn}
            activityStatusData={activityStatusData}
            isActivityCheckingOut={isActivityCheckingOut}
            handleActivityCheckOut={handleActivityCheckOut}
            locationTrackerData={locationTrackerData}
            isStartingPjp={isStartingPjp}
            handleStartPjp={handleStartPjp}
            handleCheckOut={handleCheckOut}
            isLoading={isLoading}
            isDisabled={isDisabled}
            errorMessage={errorMessage}
            navigation={navigation}
            pjpState={pjpState}
            pjpActions={pjpActions}
          />

          {/* ── Count boxes (Total call / Productive call) ── */}
          <StatsOverview prodData={prodData} />

          {/* ── Dashboard Filters ── */}
          <FilterSection
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            fromMonth={fromMonth}
            toMonth={toMonth}
            startDate={startDate}
            endDate={endDate}
            setMonthPickerTarget={setMonthPickerTarget}
            setShowMonthModal={setShowMonthModal}
            setShowYearModal={setShowYearModal}
            setPickingType={setPickingType}
            setShowDatePicker={setShowDatePicker}
          />

          {/* ── Native date picker (rendered conditionally) ── */}
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
          <MonthPickerModal
            visible={showMonthModal}
            monthPickerTarget={monthPickerTarget}
            selectedMonth={selectedMonth}
            fromMonth={fromMonth}
            toMonth={toMonth}
            onSelectMonth={handleMonthSelect}
            onClose={() => setShowMonthModal(false)}
          />

          {/* ── Year Picker Modal ── */}
          <YearPickerModal
            visible={showYearModal}
            selectedYear={selectedYear}
            currentYear={currentYear}
            onSelectYear={handleYearSelect}
            onClose={() => setShowYearModal(false)}
          />

          {/* ── Checkout Confirm Modal ── */}
          <CheckoutConfirmModal
            visible={checkoutModalVisible}
            checkoutPayload={checkoutPayload}
            onCancel={() => {
              setCheckoutModalVisible(false);
              setCheckoutPayload(null);
            }}
            onConfirm={confirmCheckOut}
          />

          {/* ── Team Attendance ── */}
          <TeamAttendance
            attendanceData={attendanceData}
            filterMode={filterMode}
            selectedMonth={selectedMonth}
            startDate={startDate}
            endDate={endDate}
            today={today}
            navigation={navigation}
          />

          {/* ── Target vs Achievement ── */}
          <TeamPerformance
            filterMode={filterMode}
            selectedMonth={selectedMonth}
            startDate={startDate}
            endDate={endDate}
            handleOpenTargetModal={handleOpenTargetModal}
            pjpSummary={pjpSummary}
            apiParams={apiParams}
            today={today}
            soAchievement={soAchievement}
            salesTarget={salesTarget}
            soPct={soPct}
            ddnStats={ddnStats}
            ddnTarget={ddnTarget}
            ddnPct={ddnPct}
            navigation={navigation}
          />

          {/* ── Set Targets Modal ── */}
          <SetTargetsModal
            visible={targetModalVisible}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onCancel={() => setTargetModalVisible(false)}
            onSaveSuccess={(sales, ddn) => {
              setTargetModalVisible(false);
            }}
          />

          {/* ── Activity Check-In ── */}
          <ActivityCheckInBlock
            // isPjpActive={isPjpActive}
            pjpState={pjpState}
            navigation={navigation}
          />

          {/* ── Quick Links ── */}
          <QuickLinks navigation={navigation} />

          {/* ── Claims ── */}
          <ClaimsSection navigation={navigation} />

          {/* ── Stock & Activity Location ── */}
          <StockAndActivityLinks navigation={navigation} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
