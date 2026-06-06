import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {Fonts} from '../../../constants';
import {SectionTitle, TargetMetricBox} from './Common';
import {useAppSelector} from '../../../store/hook';

interface TeamPerformanceProps {
  filterMode: 'month' | 'month_range' | 'date_range';
  selectedMonth: number;
  startDate: Date;
  endDate: Date;
  handleOpenTargetModal: () => void;
  pjpSummary: any;
  apiParams: any;
  today: string;
  soAchievement: number;
  salesTarget: number;
  soPct: number;
  ddnStats: any;
  ddnTarget: number;
  ddnPct: number;
  navigation: any;
}

export const TeamPerformance: React.FC<TeamPerformanceProps> = ({
  filterMode,
  selectedMonth,
  startDate,
  endDate,
  handleOpenTargetModal,
  pjpSummary,
  apiParams,
  today,
  soAchievement,
  salesTarget,
  soPct,
  ddnStats,
  ddnTarget,
  ddnPct,
  navigation,
}) => {
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const isAsm =
    employee?.designation === 'ASM' ||
    employee?.designation === 'Area Sales Executive' ||
    employee?.designation === 'ASE';
  return (
    <View style={[styles.section, {marginBottom: 10}]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
        <SectionTitle
          title="Team Performance"
          sub={
            filterMode === 'month'
              ? `${moment()
                  .month(selectedMonth - 1)
                  .format('MMMM')}`
              : `${moment(startDate).format('DD MMM')} – ${moment(
                  endDate,
                ).format('DD MMM')}`
          }
        />
        {/* Edit targets button */}
        {isAsm && (
          <TouchableOpacity
            onPress={handleOpenTargetModal}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 0.5,
              borderColor: '#534AB7',
              backgroundColor: 'rgba(83,74,183,0.07)',
            }}>
            <Text
              style={{
                fontSize: 11,
                color: '#534AB7',
                fontFamily: Fonts.medium,
              }}>
              Set Targets
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metricRow}>
        <TargetMetricBox
          label="PJP Visits"
          achieved={`${pjpSummary?.total_visited ?? 0}`}
          target={`${pjpSummary?.total_planned ?? 0}`}
          rate={pjpSummary?.achievement_rate ?? 0}
          accentColor="#534AB7"
          onPress={() =>
            navigation.navigate('TeamPerformanceListScreen', {
              apiParams,
              today,
              mode: 'pjp',
            })
          }
        />

        <TargetMetricBox
          label="Orders"
          achieved={`₹${
            soAchievement % 1 !== 0 ? soAchievement.toFixed(2) : soAchievement
          }`}
          target={`₹${salesTarget}`}
          rate={soPct}
          accentColor="#0F6E56"
        />
      </View>
      <View style={[styles.metricRow, {marginTop: 10}]}>
        <TargetMetricBox
          label="Delivery Note"
          achieved={`₹${
            (ddnStats?.value ?? 0) % 1 !== 0
              ? (ddnStats?.value ?? 0).toFixed(2)
              : ddnStats?.value ?? 0
          }`}
          target={`₹${ddnTarget}`}
          rate={ddnPct}
          accentColor="#185FA5"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {paddingHorizontal: 16, paddingTop: 10},
  metricRow: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
});
