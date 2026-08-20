/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../../../utils/colors';
import React, {useCallback, useState} from 'react';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  CalendarCheck,
  CalendarClock,
  CalendarX2,
  Timer,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react-native';
import {useGetMonthlyAttendanceQuery} from '../../../features/base/promoter-base-api';
import PromoterAttendanceCalendarView from './PromoterAttendanceCalendarView';
import moment from 'moment';
import {useAppSelector} from '../../../store/hook';

const {width} = Dimensions.get('window');

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

// ─── Mini Stat Card ───────────────────────────────────────────────────────────

const MiniStatCard = ({value, label}: {value: number; label: string}) => (
  <View style={styles.miniCard}>
    <Text style={styles.miniNumber}>{value ?? 0}</Text>
    <Text style={styles.miniLabel}>{label}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const RecentPromoterAttendanceScreen = ({navigation}: any) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewMonth, setViewMonth] = useState(moment());

  const promoterStatus = useAppSelector(
    state => state?.persistedReducer?.promoterSlice?.promoterStatus,
  );

  const {data, isUninitialized, refetch, isFetching} =
    useGetMonthlyAttendanceQuery(
      {
        month: viewMonth.month() + 1,
        year: viewMonth.year(),
      },
      {refetchOnMountOrArgChange: true},
    );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (!isUninitialized) {
        refetch();
      }
    }, 2000);
  }, [isUninitialized, refetch]);

  const summary = data?.message?.data?.summary;
  const days = data?.message?.data?.days ?? [];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{paddingBottom: 100}}>
        {/* ── Summary Cards ── */}
        <View style={styles.counterSection}>
          <SummaryCard
            icon={<UserRoundCheck size={20} color="#16a34a" />}
            iconBg="#E6F7EE"
            count={summary?.present ?? 0}
            label="Present"
          />
          <SummaryCard
            icon={<UserRoundX size={20} color="#dc2626" />}
            iconBg="#FEF2F2"
            count={summary?.absent ?? 0}
            label="Absent"
          />
          <SummaryCard
            icon={<CalendarClock size={20} color="#64748b" />}
            iconBg="#F1F5F9"
            count={summary?.not_marked ?? 0}
            label="Not Marked"
          />
          <SummaryCard
            icon={<CalendarX2 size={20} color="#7c3aed" />}
            iconBg="#F3E8FF"
            count={summary?.on_leave ?? 0}
            label="Leave"
          />
        </View>

        {/* ── Remaining Summary Grid ── */}
        {/* <View style={styles.summaryGrid}>
          <MiniStatCard value={summary?.missed ?? 0} label="Missed" />
          <MiniStatCard value={summary?.split ?? 0} label="Split" />
          <MiniStatCard value={summary?.scheduled ?? 0} label="Scheduled" />
          <MiniStatCard value={summary?.worked ?? 0} label="Worked" />
          <MiniStatCard value={summary?.late ?? 0} label="Late" />
        </View> */}

        {/* ── Hours & Percentage Chips ── */}
        <View style={styles.hoursStrip}>
          <View style={styles.hoursChip}>
            <Text style={styles.hoursStripText}>
              <Timer size={13} color={Colors.orange} strokeWidth={1.8} /> Total
            </Text>
            <Text style={styles.hoursStripValue}>
              {summary?.total_working_hours ?? 0} Hrs
            </Text>
          </View>
          <View style={styles.chipDivider} />
          <View style={styles.hoursChip}>
            <Text style={styles.hoursStripText}>Average</Text>
            <Text style={styles.hoursStripValue}>
              {summary?.average_working_hours ?? 0} Hrs
            </Text>
          </View>
          <View style={styles.chipDivider} />
          <View style={styles.hoursChip}>
            <Text style={styles.hoursStripText}>Attendance</Text>
            <Text style={styles.hoursStripValue}>
              {summary?.attendance_percentage ?? 0}%
            </Text>
          </View>
        </View>

        {/* ── Calendar View ── */}
        <View style={styles.calendarSection}>
          <View style={styles.bodyHeader}>
            <Text style={styles.bodyHeaderTitle}>Attendance Calendar</Text>
            <Text style={styles.bodyHeaderSub}>
              {summary?.attendance_percentage ?? 0}% attendance
            </Text>
          </View>

          <PromoterAttendanceCalendarView
            viewMonth={viewMonth}
            onMonthChange={setViewMonth}
            days={days}
            isFetching={isFetching}
          />
        </View>
      </ScrollView>

      {promoterStatus?.actions?.can_check_in ? (
        <TouchableOpacity
          style={styles.checkinButton}
          onPress={() => navigation.navigate('CheckingScreen')}>
          <CalendarCheck strokeWidth={1.4} color={Colors.white} />
          <Text style={styles.checkinButtonText}>Check-in</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.checkinButton}
          onPress={() => navigation.navigate('CheckOutScreen')}>
          <CalendarCheck strokeWidth={1.4} color={Colors.white} />
          <Text style={styles.checkinButtonText}>Check-out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RecentPromoterAttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
    paddingHorizontal: 16,
    position: 'relative',
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

  // ── Summary grid ──
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  miniCard: {
    flexBasis: '22%',
    flexGrow: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  miniNumber: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    lineHeight: 20,
  },
  miniLabel: {
    color: '#94A3B8',
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },

  // ── Hours strip ──
  hoursStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.lightOrange + '20',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: Colors.orange + '40',
  },
  hoursChip: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  chipDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.orange + '30',
  },
  hoursStripText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#64748b',
  },
  hoursStripValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
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

  // ── Check-in ──
  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'absolute',
    bottom: 30,
    gap: 5,
    zIndex: 1,
    width: width * 0.9,
    alignSelf: 'center',
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
