import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {RefreshControl, SafeAreaView, ScrollView} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {
  getCurrentLocation,
  requestLocationPermission,
} from '../../../utils/utils';
import {useAppDispatch, useAppSelector} from '../../../store/hook';
import {SoAppStackParamList} from '../../../types/Navigation';
import {ICheckOut, LocationPayload, StoreData} from '../../../types/baseType';

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

import LoadingScreen from '../../../components/ui/LoadingScreen';
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

// ─── Types ────────────────────────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'HomeScreen'
>;
type Props = {navigation: NavigationProp; route: any};
type FilterMode = 'month' | 'month_range' | 'date_range';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

function extractServerMessage(resp: any): string | null {
  try {
    if (!resp?._server_messages) return null;
    const arr = JSON.parse(resp._server_messages);
    if (!arr?.length) return null;
    return JSON.parse(arr[0])?.message ?? null;
  } catch {
    return null;
  }
}

async function getLocation(): Promise<string | null> {
  const granted = await requestLocationPermission();
  if (!granted) {
    Toast.show({type: 'error', text1: '📍 Location permission required'});
    return null;
  }
  return await getCurrentLocation();
}

async function getParsedLocation() {
  const location = await getLocation();
  if (!location) return null;
  const [latitude, longitude] = location.split(',').map(Number);
  if (isNaN(latitude) || isNaN(longitude)) return null;
  return {latitude, longitude};
}

// ─── Component ────────────────────────────────────────────────────────────────

const HomeScreen = ({navigation}: Props) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const currentMonth = moment().month() + 1;
  const currentYear = moment().year();

  // ── Global state ────────────────────────────────────────────────────────────
  const employee = useAppSelector(s => s.persistedReducer.authSlice.employee);
  const selectedStore = useAppSelector(
    s => s.persistedReducer.pjpSlice.selectedStore,
  );

  // ── Local state ─────────────────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const [isStartingPjp, setIsStartingPjp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedStoreValue, setSelectedStoreValue] =
    useState<StoreData | null>(null);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<ICheckOut | null>(
    null,
  );
  const [targetModalVisible, setTargetModalVisible] = useState(false);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [filterMode, setFilterMode] = useState<FilterMode>('month');
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

  // ── Computed date params ─────────────────────────────────────────────────────
  // Single source of truth for from/to dates used by SO, DDN, and summary queries
  const dateRangeParams = useMemo(() => {
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

  // Params for attendance/pjp/value-target queries (support month_range too)
  const apiParams = useMemo(() => {
    const base = {employee: employee?.id as string};
    if (filterMode === 'month')
      return {...base, month: selectedMonth, year: selectedYear};
    if (filterMode === 'month_range')
      return {
        ...base,
        from_month: fromMonth,
        to_month: toMonth,
        year: selectedYear,
      };
    return {...base, ...dateRangeParams};
  }, [
    filterMode,
    selectedMonth,
    selectedYear,
    fromMonth,
    toMonth,
    dateRangeParams,
    employee,
  ]);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const {data: pjpWorkflowData, refetch: refetchPjpWorkflow} =
    useGetPjpNextActionQuery(undefined, {refetchOnMountOrArgChange: true});

  const {data: prodData, refetch: refetchProdCount} = useGetProdCountQuery(
    {date: TODAY},
    {refetchOnMountOrArgChange: true},
  );

  const {
    data: locationTrackerData,
    isFetching: isLocationTrackerFetching,
    refetch: refetchLocationTracker,
  } = useGetLocationTrackerQuery(undefined, {refetchOnMountOrArgChange: true});

  const {data: activityStatusData, refetch: refetchActivityStatus} =
    useGetActivityCheckInStatusQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const {data: attendanceData, refetch: refetchAttendance} =
    useGetAsmAttendanceTabQuery(apiParams, {skip: !employee?.id});

  const {data: pjpTargetData, refetch: refetchPjpTarget} =
    useGetAsmPjpTargetVsAchievementQuery(apiParams, {skip: !employee?.id});

  const {data: valueTargetData, refetch: refetchValueTarget} =
    useGetAsmTargetVsAchievementQuery(apiParams, {skip: !employee?.id});

  const {data: soStatsData, refetch: refetchSoStats} = useGetSoStatsQuery(
    dateRangeParams,
    {skip: !employee?.id},
  );

  const {data: ddnData, refetch: refetchDdnStats} = useGetDdnStatsQuery(
    dateRangeParams,
    {skip: !employee?.id},
  );

  const {data: employeeTargetsData, refetch: refetchEmployeeTargets} =
    useGetEmployeeTargetsQuery(
      {month: selectedMonth, year: selectedYear},
      {skip: !employee?.id},
    );

  // ── Mutations ────────────────────────────────────────────────────────────────
  const [pjpInitialize, {data: pjpInitData}] = usePjpInitializeMutation();
  const [checkOut, {isLoading: isCheckingOut}] = useCheckOutMutation();
  const [startPjp] = useStartPjpMutation();
  const [activityCheckOut, {isLoading: isActivityCheckingOut}] =
    useActivityCheckOutMutation();

  // ── Derived values ───────────────────────────────────────────────────────────
  const pjpState = pjpWorkflowData?.message.data?.current_state;
  const pjpActions = pjpWorkflowData?.message.data?.allowed_actions ?? [];
  const activeStoreId = pjpWorkflowData?.message.data?.active_store_id;

  const isActivityCheckedIn =
    activityStatusData?.message?.is_checked_in === true;
  const isDisabled =
    isLocationTrackerFetching || !locationTrackerData?.message?.data?.enabled;

  const pjpSummary = pjpTargetData?.message?.summary;
  const ddnStats = ddnData?.message;
  const salesTarget = employeeTargetsData?.message?.sales_target ?? 0;
  const ddnTarget = employeeTargetsData?.message?.ddn_target ?? 0;
  const soAchievement = soStatsData?.message?.value ?? 0;
  const soPct =
    salesTarget > 0
      ? parseFloat(((soAchievement / salesTarget) * 100).toFixed(2))
      : 0;
  const ddnPct =
    ddnTarget > 0
      ? parseFloat((((ddnStats?.value ?? 0) / ddnTarget) * 100).toFixed(2))
      : 0;

  // ── Refresh ──────────────────────────────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      pjpInitialize();
      refetchProdCount();
      refetchAttendance();
      refetchPjpTarget();
      refetchValueTarget();
      refetchLocationTracker();
      refetchDdnStats();
      refetchSoStats();
      refetchEmployeeTargets();
      refetchActivityStatus();
      refetchPjpWorkflow();
    }, 2000);
  }, [
    pjpInitialize,
    refetchProdCount,
    refetchAttendance,
    refetchPjpTarget,
    refetchValueTarget,
    refetchLocationTracker,
    refetchDdnStats,
    refetchSoStats,
    refetchEmployeeTargets,
    refetchActivityStatus,
    refetchPjpWorkflow,
  ]);

  // ── Check-out flow ───────────────────────────────────────────────────────────
  const handleCheckOut = async () => {
    try {
      const location = await getLocation();
      if (!location) return;
      setCheckoutPayload({
        store: selectedStore as string,
        current_location: location,
        validate_geofence: false,
      });
      setCheckoutModalVisible(true);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: `❌ ${err?.message || 'Location permission denied'}`,
        position: 'top',
      });
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
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: `❌ ${err?.message || 'Internal Server Error'}`,
        position: 'top',
      });
    }
  };

  // ── Start PJP ────────────────────────────────────────────────────────────────
  const handleStartPjp = async () => {
    try {
      setIsStartingPjp(true);
      const loc = await getParsedLocation();
      if (!loc) return;

      const existingPjp =
        locationTrackerData?.message?.data?.pjp_records[0]?.name;
      if (!existingPjp) {
        Toast.show({type: 'error', text1: '❌ No PJP found for today'});
        return;
      }

      const payload: LocationPayload = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        data: {document_name: existingPjp},
      };
      const res = await startPjp(payload).unwrap();
      if (res?.message?.success) {
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

  // ── Activity check-out ───────────────────────────────────────────────────────
  const handleActivityCheckOut = async () => {
    const logId = activityStatusData?.message?.log_id;
    if (!logId) return;
    try {
      const location = await getLocation();
      if (!location) return;
      const res = await activityCheckOut({
        log_id: logId,
        current_location: location,
      }).unwrap();
      if (res.message.success) {
        Toast.show({type: 'success', text1: '✅ Activity Checked Out'});
        refetchActivityStatus();
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.data?.message || 'Failed to check out',
      });
    }
  };

  // ── Picker handlers ──────────────────────────────────────────────────────────
  const handleMonthSelect = (mValue: number) => {
    if (monthPickerTarget === 'single') setSelectedMonth(mValue);
    else if (monthPickerTarget === 'from') setFromMonth(mValue);
    else setToMonth(mValue);
    setShowMonthModal(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearModal(false);
  };

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFocused) pjpInitialize();
  }, [isFocused]);

  useEffect(() => {
    if (activeStoreId) dispatch(setSelectedStore(activeStoreId));
  }, [activeStoreId]);

  useEffect(() => {
    if (selectedStore && pjpInitData?.message?.data?.stores) {
      const match = pjpInitData.message.data.stores.find(
        s => s.store === selectedStore,
      );
      setSelectedStoreValue(match ?? null);
    }
  }, [selectedStore, pjpInitData]);

  useEffect(() => {
    const msg = extractServerMessage(pjpInitData);
    setErrorMessage(msg ?? '');
    if (pjpInitData?.message?.success === false) {
      dispatch(setSelectedStore(''));
      dispatch(resetLocation());
    }
  }, [pjpInitData]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          nestedScrollEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
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
            isLoading={isCheckingOut}
            isDisabled={isDisabled}
            errorMessage={errorMessage}
            navigation={navigation}
            pjpState={pjpState}
            pjpActions={pjpActions}
          />

          <StatsOverview prodData={prodData} />

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

          {showDatePicker && (
            <DateTimePicker
              value={pickingType === 'start' ? startDate : endDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (!date) return;
                if (pickingType === 'start') setStartDate(date);
                else setEndDate(date);
              }}
            />
          )}

          <MonthPickerModal
            visible={showMonthModal}
            monthPickerTarget={monthPickerTarget}
            selectedMonth={selectedMonth}
            fromMonth={fromMonth}
            toMonth={toMonth}
            onSelectMonth={handleMonthSelect}
            onClose={() => setShowMonthModal(false)}
          />

          <YearPickerModal
            visible={showYearModal}
            selectedYear={selectedYear}
            currentYear={currentYear}
            onSelectYear={handleYearSelect}
            onClose={() => setShowYearModal(false)}
          />

          <CheckoutConfirmModal
            visible={checkoutModalVisible}
            checkoutPayload={checkoutPayload}
            onCancel={() => {
              setCheckoutModalVisible(false);
              setCheckoutPayload(null);
            }}
            onConfirm={confirmCheckOut}
          />

          <TeamAttendance
            attendanceData={attendanceData}
            filterMode={filterMode}
            selectedMonth={selectedMonth}
            startDate={startDate}
            endDate={endDate}
            today={TODAY}
            navigation={navigation}
          />

          <TeamPerformance
            filterMode={filterMode}
            selectedMonth={selectedMonth}
            startDate={startDate}
            endDate={endDate}
            handleOpenTargetModal={() => setTargetModalVisible(true)}
            pjpSummary={pjpSummary}
            apiParams={apiParams}
            today={TODAY}
            soAchievement={soAchievement}
            salesTarget={salesTarget}
            soPct={soPct}
            ddnStats={ddnStats}
            ddnTarget={ddnTarget}
            ddnPct={ddnPct}
            navigation={navigation}
          />

          <SetTargetsModal
            visible={targetModalVisible}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onCancel={() => setTargetModalVisible(false)}
            onSaveSuccess={() => setTargetModalVisible(false)}
          />

          <ActivityCheckInBlock pjpState={pjpState} navigation={navigation} />

          <QuickLinks navigation={navigation} />

          <ClaimsSection navigation={navigation} />

          <StockAndActivityLinks navigation={navigation} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
