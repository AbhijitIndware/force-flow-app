import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import {useState} from 'react';
import {LogIn, LogOut, Timer, X, CalendarDays} from 'lucide-react-native';
import {IAttendanceRecord, IGetAttendanceParams} from '../../../types/baseType';
import {Colors} from '../../../utils/colors';
import {useGetAttendanceV2Query} from '../../../features/base/base-api';
import {Fonts} from '../../../constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarViewProps {
  employee: string;
  viewMonth: moment.Moment;
  onMonthChange: (m: moment.Moment) => void;
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

const STATUS_CONFIG: Record<string, {bg: string; color: string; dot: string}> =
  {
    Present: {bg: '#E6F7EE', color: '#16a34a', dot: '#16a34a'},
    Absent: {bg: '#FEF2F2', color: '#dc2626', dot: '#dc2626'},
    'Half Day': {bg: '#FFF7ED', color: '#d97706', dot: '#d97706'},
    'Weekly Off': {bg: '#EFF6FF', color: '#2563eb', dot: '#2563eb'},
  };

const getStatusCfg = (s: string) =>
  STATUS_CONFIG[s] ?? {bg: '#F1F5F9', color: '#64748b', dot: '#94a3b8'};

// ─── Helper: format time-only string "HH:mm:ss" → "hh:mm A" ─────────────────

const formatTime = (t: string): string => {
  if (!t || t === '--') return '—';
  return moment(t, 'HH:mm:ss').format('hh:mm A');
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({
  record,
  onClose,
}: {
  record: IAttendanceRecord | null;
  onClose: () => void;
}) => {
  if (!record) return null;
  const st = getStatusCfg(record.status);

  const rows: {icon: React.ReactNode; label: string; value: string}[] = [
    {
      icon: <LogIn size={14} color="#16a34a" strokeWidth={1.8} />,
      label: 'Check In',
      value: formatTime(record.first_check_in),
    },
    {
      icon: <LogOut size={14} color="#dc2626" strokeWidth={1.8} />,
      label: 'Check Out',
      value: formatTime(record.last_check_out),
    },
    {
      icon: <Timer size={14} color="#d97706" strokeWidth={1.8} />,
      label: 'Working Hours',
      value:
        record.working_hours_formatted === '--'
          ? '—'
          : `${record.working_hours_formatted} hrs` || '—',
    },
  ];

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
                  {moment(record.date).format('dddd, DD MMMM YYYY')}
                </Text>
              </View>
              <View style={[modalStyles.statusBadge, {backgroundColor: st.bg}]}>
                <View
                  style={[modalStyles.statusDot, {backgroundColor: st.dot}]}
                />
                <Text style={[modalStyles.statusText, {color: st.color}]}>
                  {record.status}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <X size={16} color="#64748b" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.divider} />

          {/* Detail rows */}
          {rows.map((row, i) => (
            <View
              key={i}
              style={[
                modalStyles.detailRow,
                i === rows.length - 1 && {borderBottomWidth: 0},
              ]}>
              <View style={modalStyles.detailIconWrap}>{row.icon}</View>
              <Text style={modalStyles.detailLabel}>{row.label}</Text>
              <Text style={modalStyles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

// ─── Calendar View ────────────────────────────────────────────────────────────

const AttendanceCalendarView = ({
  employee,
  viewMonth,
  onMonthChange,
}: CalendarViewProps) => {
  const [selectedRecord, setSelectedRecord] =
    useState<IAttendanceRecord | null>(null);

  const params: IGetAttendanceParams = {
    employee,
    from_date: viewMonth.clone().startOf('month').format('YYYY-MM-DD'),
    to_date: viewMonth.clone().endOf('month').format('YYYY-MM-DD'),
    limit: 31,
    offset: 0,
  };

  const {data, isFetching} = useGetAttendanceV2Query(params, {
    refetchOnMountOrArgChange: true,
  });

  const records: IAttendanceRecord[] = data?.message?.data ?? [];

  const recordMap = new Map<string, IAttendanceRecord>(
    records.map(r => [r.date, r]),
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
  while (cells.length % 7 !== 0) cells.push(null);

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
              if (!date) return <View key={col} style={calStyles.cell} />;

              const record = recordMap.get(date);
              const isToday = date === today;
              const isPast = moment(date).isBefore(today, 'day');
              const st = record ? getStatusCfg(record.status) : null;

              return (
                <TouchableOpacity
                  key={col}
                  style={calStyles.cell}
                  onPress={() => record && setSelectedRecord(record)}
                  activeOpacity={record ? 0.7 : 1}>
                  <View
                    style={[
                      calStyles.dateCircle,
                      // today always takes priority — solid orange
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
                          ? calStyles.todayDateText // white on orange
                          : st
                          ? {color: st.color, fontFamily: Fonts.medium}
                          : isPast
                          ? calStyles.pastDateText
                          : null,
                      ]}>
                      {moment(date).date()}
                    </Text>
                  </View>
                  {/* dot under today if it has a record */}
                  {/* small status dot below today's circle */}
                  {isToday && !!record && (
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
          {bg: Colors.orange, border: Colors.orange, label: 'Today'},
          {bg: Colors.lightGray, border: Colors.gray, label: 'No PJP'},
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
      <DetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </View>
  );
};

export default AttendanceCalendarView;

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
    paddingBottom: 36,
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
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {height: 1, backgroundColor: '#F1F5F9', marginBottom: 4},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 10,
  },
  detailIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.darkButton,
  },
});
