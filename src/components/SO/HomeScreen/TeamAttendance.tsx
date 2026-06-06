import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import {C, SectionTitle} from './Common';

interface TeamAttendanceProps {
  attendanceData: any;
  filterMode: 'month' | 'month_range' | 'date_range';
  selectedMonth: number;
  startDate: Date;
  endDate: Date;
  today: string;
  navigation: any;
}

export const TeamAttendance: React.FC<TeamAttendanceProps> = ({
  attendanceData,
  filterMode,
  selectedMonth,
  startDate,
  endDate,
  today,
  navigation,
}) => {
  if (
    !attendanceData?.message ||
    attendanceData?.message?.records?.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.section}>
      <SectionTitle
        title="Team Attendance"
        sub={
          filterMode === 'month'
            ? `${moment()
                .month(selectedMonth - 1)
                .format('MMMM')}`
            : filterMode === 'date_range'
            ? `${moment(startDate).format('DD MMM')} – ${moment(endDate).format(
                'DD MMM',
              )}`
            : 'Summary'
        }
      />

      {/* Horizontal per-user scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingVertical: 5,
          paddingHorizontal: 2,
        }}>
        {attendanceData?.message?.records?.map((r: any) => {
          const rate = r.attendance_rate;
          const color =
            rate >= 75 ? '#2E7D32' : rate >= 50 ? '#F59E0B' : '#EF4444';
          const bgColor =
            rate >= 75 ? '#DCFCE7' : rate >= 50 ? '#FEF3C7' : '#FEE2E2';

          return (
            <TouchableOpacity
              key={r.employee_id}
              onPress={() =>
                navigation.navigate('TeamDetailScreen', {
                  employee_id: r.employee_id,
                  date: today,
                })
              }
              style={{
                width: 130,
                backgroundColor: C.card,
                borderRadius: 14,
                borderWidth: 0.5,
                borderColor: C.border,
                padding: 12,
                alignItems: 'center',
                gap: 6,
              }}>
              {/* Avatar */}
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: C.accentSoft,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: C.accent,
                  }}>
                  {r.initials || r.employee_name.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* Name */}
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: C.text,
                  textAlign: 'center',
                }}>
                {r.employee_name}
              </Text>

              {/* Rate badge */}
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 20,
                  backgroundColor: bgColor,
                }}>
                <Text style={{fontSize: 10, fontWeight: '700', color}}>
                  {rate}%
                </Text>
              </View>

              {/* Progress bar */}
              <View
                style={{
                  width: '100%',
                  height: 4,
                  backgroundColor: C.border,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    width: `${Math.min(rate, 100)}%` as `${number}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Stats row */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  marginTop: 2,
                }}>
                <View style={{alignItems: 'center', flex: 1}}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: C.text,
                    }}>
                    {r.total_working_days}
                  </Text>
                  <Text style={{fontSize: 9, color: C.textMuted}}>Days</Text>
                </View>

                <View
                  style={{
                    width: 1,
                    backgroundColor: C.border,
                    marginVertical: 2,
                  }}
                />

                <View style={{alignItems: 'center', flex: 1}}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: '#2E7D32',
                    }}>
                    {r.days_present}
                  </Text>
                  <Text style={{fontSize: 9, color: C.textMuted}}>Present</Text>
                </View>

                <View
                  style={{
                    width: 1,
                    backgroundColor: C.border,
                    marginVertical: 2,
                  }}
                />

                <View style={{alignItems: 'center', flex: 1}}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: '#EF4444',
                    }}>
                    {r.days_absent}
                  </Text>
                  <Text style={{fontSize: 9, color: C.textMuted}}>Absent</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {paddingHorizontal: 16, paddingTop: 10},
});
