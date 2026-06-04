import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Fonts} from '../../constants';
import {Colors} from '../../utils/colors';
import moment from 'moment';
import {useState} from 'react';

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

const CalendarView = ({weeklyOffs}: {weeklyOffs: string[]}) => {
  const [viewMonth, setViewMonth] = useState(moment());

  const startOfMonth = viewMonth.clone().startOf('month');
  const daysInMonth = viewMonth.daysInMonth();
  const startDay = startOfMonth.day(); // 0 = Sun

  const today = moment().format('YYYY-MM-DD');

  const cells: (string | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({length: daysInMonth}, (_, i) =>
      viewMonth
        .clone()
        .date(i + 1)
        .format('YYYY-MM-DD'),
    ),
  ];

  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const offCount = weeklyOffs.filter(d =>
    moment(d).isSame(viewMonth, 'month'),
  ).length;

  return (
    <View>
      {/* Month Nav */}
      <View style={calStyles.navRow}>
        <TouchableOpacity
          style={calStyles.navBtn}
          onPress={() => setViewMonth(m => m.clone().subtract(1, 'month'))}>
          <Text style={calStyles.navArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{alignItems: 'center'}}>
          <Text style={calStyles.monthLabel}>
            {MONTHS[viewMonth.month()]} {viewMonth.year()}
          </Text>
          {offCount > 0 && (
            <Text style={calStyles.offCount}>
              {offCount} weekly off{offCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={calStyles.navBtn}
          onPress={() => setViewMonth(m => m.clone().add(1, 'month'))}>
          <Text style={calStyles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={calStyles.weekRow}>
        {DAYS.map(d => (
          <Text key={d} style={calStyles.dayHeader}>
            {d}
          </Text>
        ))}
      </View>

      {/* Grid */}
      {Array.from({length: cells.length / 7}, (_, row) => (
        <View key={row} style={calStyles.weekRow}>
          {cells.slice(row * 7, row * 7 + 7).map((date, col) => {
            const isOff = date ? weeklyOffs.includes(date) : false;
            const isToday = date === today;
            const isPast = date ? moment(date).isBefore(today, 'day') : false;
            return (
              <View key={col} style={calStyles.cell}>
                {date ? (
                  <View
                    style={[
                      calStyles.dateCircle,
                      isOff && calStyles.offCircle,
                      isToday && !isOff && calStyles.todayCircle,
                    ]}>
                    <Text
                      style={[
                        calStyles.dateText,
                        isOff && calStyles.offDateText,
                        isToday && !isOff && calStyles.todayDateText,
                        !isOff && isPast && calStyles.pastDateText,
                      ]}>
                      {moment(date).date()}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={calStyles.legend}>
        <View style={calStyles.legendItem}>
          <View
            style={[
              calStyles.legendDot,
              {
                backgroundColor: '#FEF2F2',
                borderWidth: 1,
                borderColor: '#dc2626',
              },
            ]}
          />
          <Text style={calStyles.legendText}>Weekly Off</Text>
        </View>
        <View style={calStyles.legendItem}>
          <View
            style={[
              calStyles.legendDot,
              {
                backgroundColor: Colors.orange + '20',
                borderWidth: 1,
                borderColor: Colors.orange,
              },
            ]}
          />
          <Text style={calStyles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
};
export default CalendarView;
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
  navArrow: {
    fontSize: 20,
    color: Colors.text,
    lineHeight: 24,
  },
  monthLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.text,
  },
  offCount: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.success,
    marginTop: 2,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    paddingBottom: 6,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offCircle: {
    backgroundColor: '#FEF2F2',
  },
  offDateText: {
    fontFamily: Fonts.medium,
    color: '#dc2626',
  },
  todayCircle: {
    backgroundColor: Colors.orange + '20',
    borderWidth: 1,
    borderColor: Colors.orange,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text,
  },
  todayDateText: {
    fontFamily: Fonts.medium,
    color: Colors.orange,
  },
  pastDateText: {
    color: Colors.textMuted,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
