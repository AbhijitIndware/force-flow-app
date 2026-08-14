/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import moment from 'moment';
import {
  CalendarDays,
  LogIn,
  LogOut,
  Timer,
  X,
  AlertTriangle,
  Store,
} from 'lucide-react-native';
import {MonthlyAttendanceDay} from '../../../types/baseType';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PromoterAttendanceCalendarViewProps {
  viewMonth: moment.Moment;
  onMonthChange: (m: moment.Moment) => void;
  days: MonthlyAttendanceDay[];
  isFetching: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const STATUS_CONFIG: Record<string, {bg: string; color: string; dot: string}> = {
  Present: {bg: '#E6F7EE', color: '#16a34a', dot: '#16a34a'},
  Absent: {bg: '#FEF2F2', color: '#dc2626', dot: '#dc2626'},
  'Half Day': {bg: '#FFF7ED', color: '#d97706', dot: '#d97706'},
  'Weekly Off': {bg: '#EFF6FF', color: '#2563eb', dot: '#2563eb'},
  'On Leave': {bg: '#F3E8FF', color: '#7c3aed', dot: '#7c3aed'},
  'Not Marked': {bg: '#F1F5F9', color: '#64748b', dot: '#94a3b8'},
  Upcoming: {bg: '#F8FAFC', color: '#94a3b8', dot: '#CBD5E1'},
  Missed: {bg: '#FEF2F2', color: '#dc2626', dot: '#dc2626'},
};

const getStatusCfg = (s: string) =>
  STATUS_CONFIG[s] ?? {bg: '#F1F5F9', color: '#64748b', dot: '#94a3b8'};

// ─── Helper: format time / datetime strings defensively ──────────────────────

const formatTime = (t: string): string => {
  if (!t || t === '--') {
    return '—';
  }
  const clean = t.replace(/\.\d+$/, '');
  const m = clean.includes('-')
    ? moment(clean)
    : moment(clean, ['HH:mm:ss', 'H:mm:ss']);
  return m.isValid() ? m.format('hh:mm A') : clean;
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({
  day,
  onClose,
}: {
  day: MonthlyAttendanceDay | null;
  onClose: () => void;
}) => {
  if (!day) {
    return null;
  }
  const cfg = day.missed
    ? STATUS_CONFIG.Missed
    : getStatusCfg(day.status);

  const stores = day.stores ?? [];
  const scheduled = day.scheduled_stores ?? [];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          {/* Handle */}
          <View style={modalStyles.handle} />

          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <View style={modalStyles.dateChip}>
                <CalendarDays
                  size={13}
                  color={Colors.orange}
                  strokeWidth={1.8}
                />
                <Text style={modalStyles.dateChipText}>
                  {moment(day.date).format('dddd, DD MMMM YYYY')}
                </Text>
              </View>
              <View style={modalStyles.badgeRow}>
                <View style={[modalStyles.statusBadge, {backgroundColor: cfg.bg}]}>
                  <View style={[modalStyles.statusDot, {backgroundColor: cfg.dot}]} />
                  <Text style={[modalStyles.statusText, {color: cfg.color}]}>
                    {day.missed ? 'Missed' : day.status}
                  </Text>
                </View>
                {day.is_split && (
                  <View style={modalStyles.flagChip}>
                    <View style={[modalStyles.flagDot, {backgroundColor: '#d97706'}]} />
                    <Text style={modalStyles.flagChipText}>Split</Text>
                  </View>
                )}
                {day.late_checkin && (
                  <View style={modalStyles.flagChip}>
                    <View style={[modalStyles.flagDot, {backgroundColor: '#d97706'}]} />
                    <Text style={modalStyles.flagChipText}>Late</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <X size={16} color="#64748b" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={modalStyles.scroll}
            contentContainerStyle={modalStyles.scrollContent}>
            {/* Missed warning */}
            {day.missed && (
              <View style={modalStyles.warning}>
                <AlertTriangle size={14} color="#dc2626" strokeWidth={1.8} />
                <Text style={modalStyles.warningText}>
                  Posted but never checked in
                </Text>
              </View>
            )}

            {/* Stores section */}
            {stores.length > 0 && (
              <>
                <Text style={modalStyles.sectionTitle}>Stores</Text>
                {stores.map((store, i) => {
                  const checkedOut = store.status?.toLowerCase().includes('out');
                  const statusColor = checkedOut ? '#dc2626' : '#16a34a';
                  const statusBg = checkedOut ? '#FEF2F2' : '#E6F7EE';

                  return (
                    <View key={i} style={modalStyles.storeCard}>
                      <View style={modalStyles.storeCardHeader}>
                        <View style={modalStyles.storeTitleBlock}>
                          <Text style={modalStyles.storeName} numberOfLines={1}>
                            {store.store_name}
                          </Text>
                          <Text style={modalStyles.storeCode}>{store.store}</Text>
                        </View>
                        <View
                          style={[
                            modalStyles.storeStatusPill,
                            {backgroundColor: statusBg},
                          ]}>
                          <Text
                            style={[
                              modalStyles.storeStatusText,
                              {color: statusColor},
                            ]}>
                            {store.status}
                          </Text>
                        </View>
                      </View>

                      <View style={modalStyles.storeRow}>
                        <View style={modalStyles.storeIconWrap}>
                          <LogIn size={13} color="#16a34a" strokeWidth={1.8} />
                        </View>
                        <Text style={modalStyles.storeRowLabel}>Check In</Text>
                        <Text style={modalStyles.storeRowValue}>
                          {formatTime(store.checkin_time)}
                        </Text>
                      </View>
                      <View style={modalStyles.storeRow}>
                        <View style={modalStyles.storeIconWrap}>
                          <LogOut size={13} color="#dc2626" strokeWidth={1.8} />
                        </View>
                        <Text style={modalStyles.storeRowLabel}>Check Out</Text>
                        <Text style={modalStyles.storeRowValue}>
                          {formatTime(store.checkout_time)}
                        </Text>
                      </View>
                      <View style={[modalStyles.storeRow, {borderBottomWidth: 0}]}>
                        <View style={modalStyles.storeIconWrap}>
                          <Timer size={13} color="#d97706" strokeWidth={1.8} />
                        </View>
                        <Text style={modalStyles.storeRowLabel}>Working Hours</Text>
                        <Text style={modalStyles.storeRowValue}>
                          {store.working_hours ?? 0} hrs
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {/* Scheduled section */}
            {scheduled.length > 0 && (
              <>
                <Text style={modalStyles.sectionTitle}>Scheduled</Text>
                {scheduled.map((s, i) => (
                  <View key={i} style={modalStyles.schedRow}>
                    <View style={modalStyles.schedIconWrap}>
                      <Store size={14} color={Colors.orange} strokeWidth={1.8} />
                    </View>
                    <View style={modalStyles.schedTextBlock}>
                      <Text style={modalStyles.schedStore} numberOfLines={1}>
                        {s.store_name}
                      </Text>
                      <Text style={modalStyles.schedTime}>
                        {formatTime(s.start_time)} to {formatTime(s.end_time)}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Total working hours */}
            <View style={modalStyles.totalRow}>
              <View style={modalStyles.totalIconWrap}>
                <Timer size={15} color={Colors.orange} strokeWidth={1.8} />
              </View>
              <Text style={modalStyles.totalLabel}>Total Working Hours</Text>
              <Text style={modalStyles.totalValue}>
                {day.working_hours ?? 0} hrs
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Calendar View ────────────────────────────────────────────────────────────

const PromoterAttendanceCalendarView = ({
  viewMonth,
  onMonthChange,
  days,
  isFetching,
}: PromoterAttendanceCalendarViewProps) => {
  const [selectedDay, setSelectedDay] =
    useState<MonthlyAttendanceDay | null>(null);

  const dayMap = new Map<string, MonthlyAttendanceDay>(
    days.map(d => [d.date, d]),
  );

  const today = moment().format('YYYY-MM-DD');
  const startDay = viewMonth.clone().startOf('month').day();
  const daysInMonth = viewMonth.daysInMonth();

  const cells: (string | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({length: daysInMonth}, (_, i) =>
      viewMonth
        .clone()
        .date(i + 1)
        .format('YYYY-MM-DD'),
    ),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <View>
      {/* ── Month Nav ── */}
      <View style={calStyles.navRow}>
        <TouchableOpacity
          style={calStyles.navBtn}
          onPress={() => onMonthChange(viewMonth.clone().subtract(1, 'month'))}>
          <Text style={calStyles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={calStyles.monthLabel}>
          {MONTHS[viewMonth.month()]} {viewMonth.year()}
        </Text>
        <TouchableOpacity
          style={calStyles.navBtn}
          onPress={() => onMonthChange(viewMonth.clone().add(1, 'month'))}>
          <Text style={calStyles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Day Headers ── */}
      <View style={calStyles.weekRow}>
        {DAYS.map(d => (
          <Text key={d} style={calStyles.dayHeader}>
            {d}
          </Text>
        ))}
      </View>

      {/* ── Grid ── */}
      {isFetching ? (
        <View style={calStyles.loadingBox}>
          <ActivityIndicator size="small" color={Colors.orange} />
        </View>
      ) : (
        Array.from({length: cells.length / 7}, (_, row) => (
          <View key={row} style={calStyles.weekRow}>
            {cells.slice(row * 7, row * 7 + 7).map((date, col) => {
              if (!date) {
                return <View key={col} style={calStyles.cell} />;
              }

              const day = dayMap.get(date);
              const isToday = date === today;
              const isPast = moment(date).isBefore(today, 'day');
              const st = day
                ? day.missed
                  ? STATUS_CONFIG.Missed
                  : getStatusCfg(day.status)
                : null;

              return (
                <TouchableOpacity
                  key={col}
                  style={calStyles.cell}
                  onPress={() => day && setSelectedDay(day)}
                  activeOpacity={day ? 0.7 : 1}>
                  <View
                    style={[
                      calStyles.dateCircle,
                      isToday
                        ? calStyles.todayCircle
                        : st
                        ? {backgroundColor: st.bg}
                        : null,
                    ]}>
                    <Text
                      style={[
                        calStyles.dateText,
                        isToday
                          ? calStyles.todayDateText
                          : st
                          ? {color: st.color, fontFamily: Fonts.medium}
                          : isPast
                          ? calStyles.pastDateText
                          : null,
                      ]}>
                      {moment(date).date()}
                    </Text>
                  </View>
                  {isToday && !!day && (
                    <View
                      style={[
                        calStyles.todayDot,
                        {backgroundColor: st?.dot ?? Colors.orange},
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))
      )}

      {/* ── Legend ── */}
      <View style={calStyles.legend}>
        {[
          {bg: '#E6F7EE', border: '#16a34a', label: 'Present'},
          {bg: '#FEF2F2', border: '#dc2626', label: 'Absent'},
          {bg: '#FFF7ED', border: '#d97706', label: 'Half Day'},
          {bg: '#EFF6FF', border: '#2563eb', label: 'Weekly Off'},
          {bg: '#F3E8FF', border: '#7c3aed', label: 'On Leave'},
          {bg: Colors.orange, border: Colors.orange, label: 'Today'},
          {bg: Colors.lightGray, border: Colors.gray, label: 'Upcoming'},
        ].map(item => (
          <View key={item.label} style={calStyles.legendItem}>
            <View
              style={[
                calStyles.legendDot,
                {
                  backgroundColor: item.bg,
                  borderWidth: 1,
                  borderColor: item.border,
                },
              ]}
            />
            <Text style={calStyles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Detail Modal ── */}
      <DetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
    </View>
  );
};

export default PromoterAttendanceCalendarView;

// ─── Styles ───────────────────────────────────────────────────────────────────

const calStyles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {fontSize: 20, color: Colors.text, lineHeight: 24},
  monthLabel: {fontFamily: Fonts.medium, fontSize: 14, color: Colors.text},
  weekRow: {flexDirection: 'row'},
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    paddingBottom: 6,
  },
  cell: {flex: 1, alignItems: 'center', paddingVertical: 3},
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: Colors.orange,
  },
  dateText: {fontFamily: Fonts.regular, fontSize: 13, color: Colors.text},
  todayDateText: {
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  pastDateText: {color: Colors.textMuted},
  todayDot: {width: 4, height: 4, borderRadius: 2, marginTop: 1},
  loadingBox: {height: 180, alignItems: 'center', justifyContent: 'center'},
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  legendDot: {width: 11, height: 11, borderRadius: 6},
  legendText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textMuted,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  headerLeft: {gap: 8, flex: 1},
  dateChip: {flexDirection: 'row', alignItems: 'center', gap: 6},
  dateChipText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.darkButton,
  },
  badgeRow: {flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap'},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {width: 6, height: 6, borderRadius: 3},
  statusText: {fontFamily: Fonts.medium, fontSize: 12},
  flagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
  },
  flagDot: {width: 6, height: 6, borderRadius: 3},
  flagChipText: {fontFamily: Fonts.medium, fontSize: 12, color: '#d97706'},
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {height: 1, backgroundColor: '#F1F5F9', marginBottom: 12},
  scroll: {flexGrow: 0},
  scrollContent: {paddingBottom: 8},
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  warningText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#dc2626',
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  storeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  storeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  storeTitleBlock: {flex: 1, gap: 1},
  storeName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.darkButton,
  },
  storeCode: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  storeStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  storeStatusText: {fontFamily: Fonts.medium, fontSize: 10},
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  storeIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeRowLabel: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748b',
  },
  storeRowValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.darkButton,
  },
  schedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  schedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.lightOrange + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schedTextBlock: {flex: 1, gap: 1},
  schedStore: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.darkButton,
  },
  schedTime: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748b',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.lightOrange + '20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  totalIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.lightOrange + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.darkButton,
  },
  totalValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.darkButton,
  },
});
