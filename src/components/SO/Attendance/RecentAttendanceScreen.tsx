/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors} from '../../../utils/colors';
import React, {useCallback, useState} from 'react';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  AlarmClockMinus,
  CalendarX2,
  Timer,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react-native';
import {useGetAttendanceV2Query} from '../../../features/base/base-api';
import {IAttendanceSummaryResponse} from '../../../types/baseType';
import AttendanceCalendarView from './AttendanceCalendarView'; // ← adjust path as needed
import moment from 'moment';
import {useAppSelector} from '../../../store/hook';

const PAGE_SIZE = 10;

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {bg: string; color: string}> = {
  Present: {bg: '#E6F7EE', color: '#16a34a'},
  Absent: {bg: '#FEF2F2', color: '#dc2626'},
  'Half Day': {bg: '#FFF7ED', color: '#d97706'},
  'Weekly Off': {bg: '#EFF6FF', color: '#2563eb'},
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = ({
  icon,
  iconBg,
  count,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  count: number | string;
  label: string;
}) => (
  <View style={styles.countCard}>
    <View style={[styles.boxIcon, {backgroundColor: iconBg}]}>{icon}</View>
    <Text style={styles.countNumber}>{count ?? 0}</Text>
    <Text style={styles.counttext}>{label}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const RecentAttendanceScreen = ({navigation}: any) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewMonth, setViewMonth] = useState(moment());
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const {data, isUninitialized, refetch, isFetching} = useGetAttendanceV2Query(
    {
      employee: employee?.id as string, // pass the logged-in employee id here
      from_date: viewMonth.clone().startOf('month').format('YYYY-MM-DD'),
      to_date: viewMonth.clone().endOf('month').format('YYYY-MM-DD'),
    },
    {refetchOnMountOrArgChange: true},
  );
  console.log('🚀 ~ RecentAttendanceScreen ~ data:', data);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (!isUninitialized) refetch();
    }, 2000);
  }, [isUninitialized, refetch]);

  const summary = data?.message?.status_counts;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{paddingBottom: 32}}>
        {/* ── Summary Cards ── */}
        <View style={styles.counterSection}>
          <SummaryCard
            icon={<UserRoundCheck size={20} color="#16a34a" />}
            iconBg="#E6F7EE"
            count={summary?.Present ?? 0}
            label="Present"
          />
          <SummaryCard
            icon={<UserRoundX size={20} color="#dc2626" />}
            iconBg="#FEF2F2"
            count={summary?.Absent ?? 0}
            label="Absent"
          />
          <SummaryCard
            icon={<AlarmClockMinus size={20} color="#d97706" />}
            iconBg="#FFF7ED"
            count={summary?.['Half Day'] ?? 0}
            label="Half Day"
          />
          <SummaryCard
            icon={<CalendarX2 size={20} color="#2563eb" />}
            iconBg="#EFF6FF"
            count={summary?.['Weekly Off'] ?? 0}
            label="Weekly Off"
          />
        </View>

        {/* ── Working Hours Strip ── */}
        {!!data?.message?.total_working_hours_formatted && (
          <View style={styles.hoursStrip}>
            <Timer size={13} color={Colors.orange} strokeWidth={1.8} />
            <Text style={styles.hoursStripText}>
              Total working hours:{' '}
              <Text style={styles.hoursStripValue}>
                {data.message.total_working_hours_formatted} Hrs
              </Text>
            </Text>
          </View>
        )}

        {/* ── Calendar View ── */}
        <View style={styles.calendarSection}>
          <View style={styles.bodyHeader}>
            <Text style={styles.bodyHeaderTitle}>Attendance Calendar</Text>
            <Text style={styles.bodyHeaderSub}>
              {data?.message?.total_records ?? 0} records
            </Text>
          </View>

          {isFetching ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.orange} />
            </View>
          ) : (
            <AttendanceCalendarView
              employee={employee?.id ?? ''}
              viewMonth={viewMonth}
              onMonthChange={setViewMonth}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default RecentAttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: 16,
  },

  // ── Summary ──
  counterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 16,
  },
  countCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'flex-start',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  boxIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  countNumber: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    lineHeight: 20,
  },
  counttext: {
    color: '#94A3B8',
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },

  // ── Hours strip ──
  hoursStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: Colors.orange + '40',
  },
  hoursStripText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748b',
  },
  hoursStripValue: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
  },

  // ── Calendar Section ──
  calendarSection: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4E9',
  },
  bodyHeaderTitle: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
  },
  bodyHeaderSub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
  },

  // ── Loading ──
  centered: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
