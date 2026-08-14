import {FlatList, RefreshControl, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import {CalendarX2} from 'lucide-react-native';
import moment from 'moment';
import {RosterDay} from '../../../types/baseType';
import {useGetMonthlyRosterQuery} from '../../../features/base/promoter-base-api';
import {Fonts} from '../../../constants';
import MonthlyRosterHeader from './MonthlyRosterHeader';
import RosterCard from './RosterCard';
import RosterDetailModal from './RosterDetailModal';
import SplitShiftCard from './SplitShiftCard';
import {rosterColors} from './rosterTheme';

const PromoterShiftsTab = () => {
  const [viewMonth, setViewMonth] = useState(moment());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<RosterDay | null>(null);

  const {data: rosterData, refetch: refetchRoster} = useGetMonthlyRosterQuery({
    month: viewMonth.month() + 1,
    year: viewMonth.year(),
  });

  const roster = rosterData?.message?.data;
  const rosterDays = roster?.days || [];

  const aonCount = roster?.aon_days ?? 0;
  const regularCount = (roster?.total_days_assigned ?? 0) - aonCount;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetchRoster();
    }, 2000);
  }, [refetchRoster]);

  const renderItem = ({item}: {item: RosterDay}) =>
    item.is_split || (item.slots?.length ?? 0) > 1 ? (
      <SplitShiftCard day={item} onPress={() => setSelectedDay(item)} />
    ) : (
      <RosterCard day={item} onPress={() => setSelectedDay(item)} />
    );

  return (
    <View style={styles.container}>
      <MonthlyRosterHeader
        viewMonth={viewMonth}
        onMonthChange={setViewMonth}
        regularCount={regularCount}
        aonCount={aonCount}
      />

      <FlatList
        data={rosterDays}
        keyExtractor={item => item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <CalendarX2 size={48} color="#D1D5DB" strokeWidth={1.4} />
            <Text style={styles.emptyText}>No shifts scheduled</Text>
          </View>
        }
      />

      <RosterDetailModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </View>
  );
};

export default PromoterShiftsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rosterColors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: rosterColors.secondaryText,
  },
});
