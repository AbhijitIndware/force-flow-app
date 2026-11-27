import React from 'react';
import {StyleSheet, View} from 'react-native';
import moment from 'moment';
import {SectionTitle, TargetMetricBox} from './Common';

interface TeamPerformanceProps {
  filterMode: 'month' | 'month_range' | 'date_range';
  selectedMonth: number;
  startDate: Date;
  endDate: Date;
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
        {/* Targets are view-only: they are set from the beat plan Excel. */}
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
          // Employee-wise amount target vs achieved
          onPress={() =>
            navigation.navigate('TeamPerformanceListScreen', {
              apiParams,
              today,
              mode: 'value',
            })
          }
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
