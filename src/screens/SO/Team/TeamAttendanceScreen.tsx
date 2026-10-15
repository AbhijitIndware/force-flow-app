import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import moment from 'moment';

import PageHeader from '../../../components/ui/PageHeader';
import ReusableDatePicker from '../../../components/ui-lib/reusable-date-picker';
import {
  ChipTabs,
  FilterPicker,
  MonthSwitcher,
} from '../../../components/SO/Team/TeamFilters';
import { ATTENDANCE_STATUS_CONFIG } from '../../../components/SO/HomeScreen/PromoterAttendanceMonth';
import { flexCol, boxShadow } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { SoAppStackParamList } from '../../../types/Navigation';
import {
  PromoterAttendanceStatus,
  SupervisorAttendanceDay,
  TeamAttendancePromoter,
} from '../../../types/baseType';
import {
  useGetTeamAttendanceOptionsQuery,
  useGetTeamAttendanceQuery,
} from '../../../features/base/promoter-base-api';

type Props = {
  navigation: NativeStackNavigationProp<SoAppStackParamList, 'TeamAttendanceScreen'>;
};

type ViewMode = 'day' | 'month';

const NAME_COL = 130;
const DAY_COL = 30;
const PCT_COL = 52;

const STATUS_ORDER: PromoterAttendanceStatus[] = [
  'Present',
  'Half Day',
  'Absent',
  'On Leave',
  'Not Marked',
];

// A past date missing from `days` is Not Marked. Today counts once marked;
// future dates are not counted at all.
const resolveDay = (
  byDate: Record<string, SupervisorAttendanceDay> | undefined,
  date: string,
  today: string,
): SupervisorAttendanceDay | null => {
  const day = byDate?.[date];
  if (day) {
    return day;
  }
  if (date < today) {
    return { date, status: 'Not Marked', code: '' };
  }
  return null;
};

// Attendance % = (P + ½ HD) ÷ (P + HD + A + Not Marked)
const attendancePct = (days: (SupervisorAttendanceDay | null)[]) => {
  let p = 0;
  let hd = 0;
  let a = 0;
  let nm = 0;
  days.forEach(d => {
    if (!d) {
      return;
    }
    if (d.status === 'Present') p++;
    else if (d.status === 'Half Day') hd++;
    else if (d.status === 'Absent') a++;
    else if (d.status === 'Not Marked') nm++;
  });
  const denom = p + hd + a + nm;
  return denom ? ((p + hd / 2) / denom) * 100 : null;
};

const fmtPct = (pct: number | null) => (pct == null ? '–' : `${Math.round(pct)}%`);

const TeamAttendanceScreen = ({ navigation }: Props) => {
  const [mode, setMode] = useState<ViewMode>('day');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [month, setMonth] = useState(moment().startOf('month'));
  const [zone, setZone] = useState('');
  const [promoter, setPromoter] = useState('');

  const fromDate = mode === 'day' ? date : month.format('YYYY-MM-DD');
  const toDate =
    mode === 'day' ? date : month.clone().endOf('month').format('YYYY-MM-DD');

  const { data: optionsData } = useGetTeamAttendanceOptionsQuery();
  const { data, isFetching, isLoading, error, refetch } = useGetTeamAttendanceQuery({
    from_date: fromDate,
    to_date: toDate,
    zone: zone || undefined,
    promoter: promoter || undefined,
  });

  const zoneOptions = useMemo(
    () => (optionsData?.message?.zones ?? []).map(z => ({ label: z, value: z })),
    [optionsData],
  );
  const promoterOptions = useMemo(
    () =>
      (optionsData?.message?.promoters ?? [])
        .filter(p => !zone || p.zone === zone)
        .map(p => ({ label: p.label, value: p.name })),
    [optionsData, zone],
  );

  const result = data?.message;
  const today = result?.today ?? moment().format('YYYY-MM-DD');
  const promoters = useMemo(() => result?.promoters ?? [], [result]);
  const days = useMemo(() => result?.days ?? {}, [result]);

  const monthDates = useMemo(() => {
    const start = month.clone().startOf('month');
    return Array.from({ length: start.daysInMonth() }, (_, i) =>
      start.clone().add(i, 'days').format('YYYY-MM-DD'),
    );
  }, [month]);

  const dayRows = useMemo(
    () =>
      promoters.map(p => ({
        promoter: p,
        day:
          resolveDay(days[p.employee], date, today) ??
          ({ date, status: 'Not Marked', code: '' } as SupervisorAttendanceDay),
      })),
    [promoters, days, date, today],
  );

  const dayCounts = useMemo(() => {
    const counts: Partial<Record<PromoterAttendanceStatus, number>> = {};
    dayRows.forEach(r => {
      counts[r.day.status] = (counts[r.day.status] ?? 0) + 1;
    });
    return counts;
  }, [dayRows]);

  const gridRows = useMemo(
    () =>
      promoters.map(p => {
        const cells = monthDates.map(d => resolveDay(days[p.employee], d, today));
        return { promoter: p, cells, pct: attendancePct(cells) };
      }),
    [promoters, days, monthDates, today],
  );

  const teamPct = useMemo(
    () =>
      mode === 'day'
        ? attendancePct(dayRows.map(r => r.day))
        : attendancePct(gridRows.flatMap(r => r.cells)),
    [mode, dayRows, gridRows],
  );

  const renderStatusChip = (status: PromoterAttendanceStatus) => {
    const cfg = ATTENDANCE_STATUS_CONFIG[status];
    return (
      <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.statusChipText, { color: cfg.color }]}>{status}</Text>
      </View>
    );
  };

  const renderPromoterName = (p: TeamAttendancePromoter) => (
    <>
      <Text style={styles.name} numberOfLines={1}>
        {p.employee_name}
      </Text>
      <Text style={styles.muted} numberOfLines={1}>
        {p.employee_number}
        {p.zone ? ` · ${p.zone}` : ''}
      </Text>
    </>
  );

  const renderDayView = () => (
    <>
      <View style={[styles.card, boxShadow, styles.countsRow]}>
        {STATUS_ORDER.map(s => {
          const cfg = ATTENDANCE_STATUS_CONFIG[s];
          return (
            <View key={s} style={[styles.countBox, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.countValue, { color: cfg.color }]}>
                {dayCounts[s] ?? 0}
              </Text>
              <Text style={[styles.countLabel, { color: cfg.color }]} numberOfLines={1}>
                {s}
              </Text>
            </View>
          );
        })}
      </View>
      {dayRows.map(({ promoter: p, day }) => (
        <View key={p.employee} style={[styles.card, styles.dayRow, boxShadow]}>
          <View style={styles.dayRowTop}>
            <View style={{ flex: 1 }}>{renderPromoterName(p)}</View>
            {renderStatusChip(day.status)}
          </View>
          {day.first_in ? (
            <Text style={styles.dayDetail}>
              {day.first_in} → {day.open ? 'still checked in' : day.last_out || '—'}
              {day.hours != null ? `  ·  ${day.hours} h` : ''}
            </Text>
          ) : null}
          {day.stores ? (
            <Text style={styles.muted} numberOfLines={2}>
              {day.stores}
            </Text>
          ) : null}
        </View>
      ))}
    </>
  );

  const renderGridView = () => (
    <View style={[styles.card, boxShadow, styles.gridCard]}>
      <View style={styles.gridWrap}>
        {/* Fixed promoter column */}
        <View style={{ width: NAME_COL }}>
          <View style={[styles.gridHeaderCell, styles.gridNameCell]}>
            <Text style={styles.gridHeaderText}>Promoter</Text>
          </View>
          {gridRows.map(r => (
            <View key={r.promoter.employee} style={[styles.gridRow, styles.gridNameCell]}>
              {renderPromoterName(r.promoter)}
            </View>
          ))}
        </View>
        {/* Scrollable dates */}
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={styles.gridHeaderRow}>
              <View style={[styles.gridHeaderCell, { width: PCT_COL }]}>
                <Text style={styles.gridHeaderText}>%</Text>
              </View>
              {monthDates.map(d => (
                <View key={d} style={[styles.gridHeaderCell, { width: DAY_COL }]}>
                  <Text style={styles.gridHeaderText}>{moment(d).date()}</Text>
                  <Text style={styles.gridWeekday}>{moment(d).format('dd')[0]}</Text>
                </View>
              ))}
            </View>
            {gridRows.map(r => (
              <View key={r.promoter.employee} style={[styles.gridRow, styles.gridHeaderRow]}>
                <View style={[styles.gridCell, { width: PCT_COL }]}>
                  <Text style={styles.gridPct}>{fmtPct(r.pct)}</Text>
                </View>
                {r.cells.map((c, i) => {
                  const cfg = c ? ATTENDANCE_STATUS_CONFIG[c.status] : undefined;
                  return (
                    <View key={monthDates[i]} style={[styles.gridCell, { width: DAY_COL }]}>
                      {c && cfg ? (
                        <View style={[styles.codeBox, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.codeText, { color: cfg.color }]}>
                            {c.code || '–'}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader title="Team Attendance" navigation={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
        }>
        <ChipTabs
          options={[
            { label: 'Day-wise', value: 'day' },
            { label: 'Monthly grid', value: 'month' },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === 'day' ? (
          <ReusableDatePicker
            label="Date"
            value={date}
            onChange={setDate}
            height={38}
            textSize={Size.xxs}
            marginBottom={0}
          />
        ) : (
          <MonthSwitcher month={month} onChange={setMonth} />
        )}

        <View style={styles.filterRow}>
          <FilterPicker
            icon="map-outline"
            placeholder="All zones"
            value={zone}
            options={zoneOptions}
            onChange={v => {
              setZone(v);
              setPromoter('');
            }}
          />
          <FilterPicker
            icon="person-outline"
            placeholder="All promoters"
            value={promoter}
            options={promoterOptions}
            onChange={setPromoter}
          />
        </View>

        {!isLoading && !error && promoters.length > 0 && (
          <View style={styles.pctRow}>
            <Text style={styles.pctLabel}>
              {promoters.length} promoter{promoters.length === 1 ? '' : 's'} · Attendance
            </Text>
            <Text style={styles.pctValue}>{fmtPct(teamPct)}</Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.orange} style={styles.loading} />
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>Could not load attendance.</Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={styles.retry}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : promoters.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>No promoters found.</Text>
          </View>
        ) : mode === 'day' ? (
          renderDayView()
        ) : (
          renderGridView()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeamAttendanceScreen;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  filterRow: { flexDirection: 'row', gap: 8 },
  loading: { marginTop: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
  },
  countsRow: { flexDirection: 'row', gap: 6 },
  countBox: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  countValue: { fontFamily: Fonts.semiBold, fontSize: Size.sm },
  countLabel: { fontFamily: Fonts.regular, fontSize: 9 },
  pctRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  pctLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.textSecondary,
  },
  pctValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.orange,
  },
  dayRow: { gap: 4 },
  dayRowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  muted: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  dayDetail: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusChipText: { fontFamily: Fonts.medium, fontSize: 10 },
  gridCard: { paddingHorizontal: 0, paddingVertical: 4 },
  gridWrap: { flexDirection: 'row' },
  gridHeaderRow: { flexDirection: 'row' },
  gridHeaderCell: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  gridNameCell: {
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  gridHeaderText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.darkButton,
  },
  gridWeekday: {
    fontFamily: Fonts.regular,
    fontSize: 8,
    color: Colors.gray,
  },
  gridRow: {
    height: 42,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  gridCell: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridPct: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.orange,
  },
  codeBox: {
    width: 26,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: { fontFamily: Fonts.semiBold, fontSize: 9 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  retry: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.orange,
  },
});
