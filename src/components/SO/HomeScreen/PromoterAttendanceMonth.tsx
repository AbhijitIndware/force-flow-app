import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { boxShadow } from '../../../utils/styles';
import {
  PromoterAttendanceStatus,
  SupervisorAttendanceDay,
} from '../../../types/baseType';

// Same status colours as the promoter's own attendance calendar
export const ATTENDANCE_STATUS_CONFIG: Record<
  PromoterAttendanceStatus,
  { bg: string; color: string; short: string }
> = {
  Present: { bg: '#E6F7EE', color: '#16a34a', short: 'P' },
  'Half Day': { bg: '#FFF7ED', color: '#d97706', short: 'HD' },
  Absent: { bg: '#FEF2F2', color: '#dc2626', short: 'A' },
  'On Leave': { bg: '#F3E8FF', color: '#7c3aed', short: 'L' },
  'Not Marked': { bg: '#F1F5F9', color: '#64748b', short: '–' },
};

const STATUS_ORDER: PromoterAttendanceStatus[] = [
  'Present',
  'Half Day',
  'Absent',
  'On Leave',
  'Not Marked',
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  month: number; // 1-12
  year: number;
  days: SupervisorAttendanceDay[];
  totals: Partial<Record<PromoterAttendanceStatus, number>>;
}

const PromoterAttendanceMonth = ({ month, year, days, totals }: Props) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, SupervisorAttendanceDay>();
    days.forEach(d => map.set(d.date, d));
    return map;
  }, [days]);

  // Leading blanks so the 1st lands on its weekday, then one cell per day
  const cells = useMemo(() => {
    const first = moment({ year, month: month - 1, day: 1 });
    const blanks: (string | null)[] = Array(first.day()).fill(null);
    const dates = Array.from({ length: first.daysInMonth() }, (_, i) =>
      first.clone().add(i, 'days').format('YYYY-MM-DD'),
    );
    return [...blanks, ...dates];
  }, [month, year]);

  const selected = selectedDate ? byDate.get(selectedDate) : undefined;

  return (
    <View style={[styles.card, boxShadow]}>
      <Text style={styles.title}>Attendance</Text>

      <View style={styles.totalsRow}>
        {STATUS_ORDER.map(status => {
          const cfg = ATTENDANCE_STATUS_CONFIG[status];
          return (
            <View key={status} style={[styles.totalChip, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.totalValue, { color: cfg.color }]}>
                {totals[status] ?? 0}
              </Text>
              <Text style={[styles.totalLabel, { color: cfg.color }]} numberOfLines={1}>
                {status}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((d, i) => (
          <View key={`wd${i}`} style={styles.cell}>
            <Text style={styles.weekday}>{d}</Text>
          </View>
        ))}
        {cells.map((date, i) => {
          if (!date) {
            return <View key={`b${i}`} style={styles.cell} />;
          }
          const day = byDate.get(date);
          const cfg = day ? ATTENDANCE_STATUS_CONFIG[day.status] : undefined;
          const isSelected = date === selectedDate;
          return (
            <View key={date} style={styles.cell}>
              <TouchableOpacity
                disabled={!day}
                activeOpacity={0.7}
                onPress={() => setSelectedDate(isSelected ? null : date)}
                style={[
                  styles.dayBox,
                  cfg && { backgroundColor: cfg.bg },
                  isSelected && cfg && { borderColor: cfg.color },
                ]}>
                <Text style={[styles.dayNum, !day && styles.dayNumFuture]}>
                  {moment(date).date()}
                </Text>
                {day?.code ? (
                  <Text style={[styles.dayCode, { color: cfg?.color }]}>
                    {day.code}
                  </Text>
                ) : null}
                {day?.open ? <View style={styles.openDot} /> : null}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {selected && (
        <View style={styles.detail}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailDate}>
              {moment(selected.date).format('ddd, DD MMM')}
            </Text>
            <Text
              style={[
                styles.detailStatus,
                { color: ATTENDANCE_STATUS_CONFIG[selected.status]?.color },
              ]}>
              {selected.status}
            </Text>
          </View>
          {selected.first_in ? (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="log-in-outline" size={13} color={Colors.gray} />
                <Text style={styles.detailText}>
                  {selected.first_in}
                  {'  →  '}
                  {selected.open ? 'still checked in' : selected.last_out || '—'}
                </Text>
                {selected.hours != null && (
                  <Text style={styles.detailHours}>{selected.hours} h</Text>
                )}
              </View>
              {selected.stores ? (
                <View style={styles.detailRow}>
                  <Ionicons name="storefront-outline" size={13} color={Colors.gray} />
                  <Text style={styles.detailText}>{selected.stores}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.detailText}>No check-in</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default PromoterAttendanceMonth;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    marginBottom: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  totalChip: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  totalValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
  },
  totalLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    padding: 2,
    alignItems: 'center',
  },
  weekday: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.gray,
    paddingVertical: 4,
  },
  dayBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  dayNumFuture: {
    color: '#CBD5E1',
  },
  dayCode: {
    fontFamily: Fonts.semiBold,
    fontSize: 9,
  },
  openDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  detail: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 6,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailDate: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  detailStatus: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  detailHours: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.orange,
  },
});
