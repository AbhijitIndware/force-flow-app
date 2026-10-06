import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useFocusEffect} from '@react-navigation/native';
import {CalendarDays, ChevronRight, X} from 'lucide-react-native';
import moment from 'moment';

import {Fonts} from '../../../../constants';
import {
  useGetCompletedPjpsQuery,
  useGetUpcomingPjpsQuery,
} from '../../../../features/base/base-api';
import {
  PjpDailyStore,
  PjpListItem,
  PjpListParams,
  PjpListStatus,
} from '../../../../types/baseType';
import {Colors} from '../../../../utils/colors';
import {Size} from '../../../../utils/fontSize';
import {windowHeight} from '../../../../utils/utils';
import {usePagedList} from '../../../../hooks/usePagedList';
import AssignEmployeeModal from './AssignEmployeeModal';

const PAGE_SIZE = 20;
type Tab = 'upcoming' | 'completed';
type CompletedStatus = '' | 'Completed' | 'Not ended' | 'Not started';

const COMPLETED_FILTERS: {label: string; value: CompletedStatus}[] = [
  {label: 'All', value: ''},
  {label: 'Completed', value: 'Completed'},
  {label: 'Not ended', value: 'Not ended'},
  {label: 'Missed', value: 'Not started'},
];

const STATUS_CONFIG: Record<
  PjpListStatus,
  {label: string; color: string; backgroundColor: string}
> = {
  Ready: {label: 'Today', color: '#1D4ED8', backgroundColor: '#DBEAFE'},
  Running: {
    label: 'In progress',
    color: '#A16207',
    backgroundColor: '#FEF3C7',
  },
  Scheduled: {
    label: 'Scheduled',
    color: '#4338CA',
    backgroundColor: '#EEF2FF',
  },
  Completed: {
    label: 'Completed',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
  },
  'Not ended': {
    label: 'Not ended',
    color: '#A16207',
    backgroundColor: '#FEF3C7',
  },
  'Not started': {
    label: 'Missed',
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
  },
};

const PJPScreen = ({navigation, onRefresh: onParentRefresh}: any) => {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPjp, setSelectedPjp] = useState<PjpListItem | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [completedStatus, setCompletedStatus] = useState<CompletedStatus>('');

  const commonParams = useMemo<PjpListParams>(
    () => ({
      page,
      page_size: PAGE_SIZE,
      ...(selectedDate ? {from_date: selectedDate, to_date: selectedDate} : {}),
    }),
    [page, selectedDate],
  );

  const upcomingQuery = useGetUpcomingPjpsQuery(
    {...commonParams, order: 'asc'},
    {
      skip: activeTab !== 'upcoming',
      refetchOnMountOrArgChange: true,
    },
  );
  const completedQuery = useGetCompletedPjpsQuery(
    {
      ...commonParams,
      order: 'desc',
      ...(completedStatus ? {status: completedStatus} : {}),
    },
    {
      skip: activeTab !== 'completed',
      refetchOnMountOrArgChange: true,
    },
  );

  const activeQuery = activeTab === 'upcoming' ? upcomingQuery : completedQuery;
  const {data, isLoading, isFetching, isError, isUninitialized, refetch} =
    activeQuery;
  const responseData = data?.message?.data;
  const serverToday = responseData?.today;
  const businessError =
    data?.message?.status === 'fail' ? data.message.message : undefined;

  const pjps = usePagedList(
    activeQuery.currentData?.message?.data?.pjps,
    page,
    item => item.name,
    `${activeTab}|${completedStatus}|${selectedDate}`,
  );

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      if (!isUninitialized) {
        refetch();
      }
    }, [isUninitialized, refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    onParentRefresh?.();
    try {
      if (page !== 1) {
        setPage(1);
      } else if (!isUninitialized) {
        await refetch();
      }
    } finally {
      setRefreshing(false);
    }
  }, [page, isUninitialized, refetch, onParentRefresh]);

  const loadMore = () => {
    if (!isFetching && responseData?.pagination?.has_more) {
      setPage(current => current + 1);
    }
  };

  const handleDateChange = (_: unknown, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setPage(1);
      setSelectedDate(moment(date).format('YYYY-MM-DD'));
    }
  };

  const selectTab = (tab: Tab) => {
    if (tab !== activeTab) {
      setPage(1);
      setActiveTab(tab);
    }
  };

  const getRelativeDateLabel = (date: string, day: string) => {
    if (!serverToday) {
      return day;
    }
    const difference = moment(date, 'YYYY-MM-DD').diff(
      moment(serverToday, 'YYYY-MM-DD'),
      'days',
    );
    if (difference === 0) {
      return 'Today';
    }
    if (difference === 1) {
      return 'Tomorrow';
    }
    return day;
  };

  const openPjp = (item: PjpListItem) => {
    navigation.navigate('PjpDetailScreen', {
      details: {
        pjp_daily_store_id: item.name,
      } as PjpDailyStore,
      readOnly: item.status === 'Scheduled',
      listStatus: item.status,
    });
  };

  const renderItem = ({item}: {item: PjpListItem}) => {
    const status = STATUS_CONFIG[item.status];
    const isToday = item.date === serverToday;

    return (
      <View style={[styles.pjpCard, isToday && styles.todayCard]}>
        <TouchableOpacity
          style={styles.cardMain}
          onPress={() => openPjp(item)}
          activeOpacity={0.8}>
          <View style={[styles.dateBox, isToday && styles.todayDateBox]}>
            <Text style={[styles.dateText, isToday && styles.todayDateText]}>
              {moment(item.date, 'YYYY-MM-DD').format('DD')}
            </Text>
            <Text style={[styles.monthText, isToday && styles.todayDateText]}>
              {moment(item.date, 'YYYY-MM-DD').format('MMM')}
            </Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>
                {getRelativeDateLabel(item.date, item.day)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: status.backgroundColor},
                ]}>
                <Text style={[styles.statusText, {color: status.color}]}>
                  {status.label}
                </Text>
              </View>
            </View>

            <Text style={styles.fullDate}>
              {moment(item.date, 'YYYY-MM-DD').format('DD MMM YYYY')}
            </Text>

            <View style={styles.countRow}>
              <Text style={styles.countText}>{item.total_stores} stores</Text>
              <Text style={styles.countDot}>·</Text>
              <Text style={styles.visitedText}>
                {item.visited_stores} visited
              </Text>
              {item.pending_stores > 0 ? (
                <>
                  <Text style={styles.countDot}>·</Text>
                  <Text style={styles.countText}>
                    {item.pending_stores} pending
                  </Text>
                </>
              ) : null}
              {item.missed_stores > 0 ? (
                <>
                  <Text style={styles.countDot}>·</Text>
                  <Text style={styles.missedText}>
                    {item.missed_stores} missed
                  </Text>
                </>
              ) : null}
            </View>

            {item.beat_plan ||
            item.unplanned_stores > 0 ||
            item.planned_activities > 0 ? (
              <View style={styles.badgeRow}>
                {item.beat_plan ? (
                  <Text style={styles.beatPlanBadge}>Monthly beat plan</Text>
                ) : null}
                {item.unplanned_stores > 0 ? (
                  <Text style={styles.unplannedBadge}>
                    {item.unplanned_stores} unplanned
                  </Text>
                ) : null}
                {item.planned_activities > 0 ? (
                  <Text style={styles.activityBadge}>
                    {item.planned_activities} activities
                  </Text>
                ) : null}
              </View>
            ) : null}

            {activeTab === 'completed' &&
            (item.first_check_in ||
              item.last_check_out ||
              item.travel_distance_km !== null) ? (
              <Text style={styles.daySummary}>
                {item.first_check_in
                  ? `In ${item.first_check_in.slice(0, 5)}`
                  : ''}
                {item.first_check_in && item.last_check_out ? '  ·  ' : ''}
                {item.last_check_out
                  ? `Out ${item.last_check_out.slice(0, 5)}`
                  : ''}
                {(item.first_check_in || item.last_check_out) &&
                item.travel_distance_km !== null
                  ? '  ·  '
                  : ''}
                {item.travel_distance_km !== null
                  ? `${item.travel_distance_km.toFixed(1)} km`
                  : ''}
              </Text>
            ) : null}
          </View>

          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.cardFooter}>
          <Text style={styles.pjpId} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() => setSelectedPjp(item)}>
            <Text style={styles.assignButtonText}>Assign</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const initialLoading = (isLoading || isFetching) && pjps.length === 0;

  return (
    <View style={styles.screen}>
      <View style={styles.bodyContent}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => selectTab('upcoming')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'upcoming' && styles.activeTabText,
              ]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => selectTab('completed')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'completed' && styles.activeTabText,
              ]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[
              styles.dateChip,
              selectedDate ? styles.dateChipActive : undefined,
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}>
            <CalendarDays
              size={14}
              color={selectedDate ? Colors.darkButton : '#6B7280'}
            />
            <Text
              style={[
                styles.dateChipText,
                selectedDate ? styles.dateChipTextActive : undefined,
              ]}>
              {selectedDate
                ? moment(selectedDate, 'YYYY-MM-DD').format('DD MMM YYYY')
                : 'Filter by date'}
            </Text>
          </TouchableOpacity>

          {selectedDate ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setPage(1);
                setSelectedDate('');
              }}
              activeOpacity={0.7}>
              <X size={13} color="#6B7280" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {showDatePicker ? (
          <DateTimePicker
            value={
              selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        ) : null}

        {activeTab === 'completed' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusFiltersScroll}
            contentContainerStyle={styles.statusFilters}>
            {COMPLETED_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.label}
                style={[
                  styles.statusFilter,
                  completedStatus === filter.value && styles.activeStatusFilter,
                ]}
                onPress={() => {
                  setPage(1);
                  setCompletedStatus(filter.value);
                }}>
                <Text
                  style={[
                    styles.statusFilterText,
                    completedStatus === filter.value &&
                      styles.activeStatusFilterText,
                  ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.listContainer}>
          {initialLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={Colors.orange} />
            </View>
          ) : isError || businessError ? (
            <View style={styles.stateContainer}>
              <Text style={styles.errorTitle}>Could not load PJP list</Text>
              <Text style={styles.errorMessage}>
                {businessError || 'Please check your connection and try again.'}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : pjps.length === 0 ? (
            <View style={styles.stateContainer}>
              <Text style={styles.emptyText}>
                {selectedDate
                  ? `No ${activeTab} PJP found for ${moment(
                      selectedDate,
                      'YYYY-MM-DD',
                    ).format('DD MMM YYYY')}`
                  : `No ${activeTab} PJP found`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={pjps}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={renderItem}
              keyExtractor={item => item.name}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.4}
              contentContainerStyle={styles.listContent}
              ListFooterComponent={
                isFetching && page > 1 ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.orange}
                    style={styles.footerLoader}
                  />
                ) : null
              }
            />
          )}
        </View>
      </View>

      {selectedPjp ? (
        <AssignEmployeeModal
          visible
          onClose={() => setSelectedPjp(null)}
          sourcePjp={selectedPjp.name}
          date={selectedPjp.date}
        />
      ) : null}
    </View>
  );
};

export default PJPScreen;

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  bodyContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    // paddingBottom: 70,
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    backgroundColor: Colors.orange,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: '#FFBF83',
  },
  tabText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.white,
  },
  activeTabText: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.white,
  },
  dateChipActive: {
    borderColor: Colors.darkButton,
    backgroundColor: '#F8FAFC',
  },
  dateChipText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#6B7280',
  },
  dateChipTextActive: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  clearButtonText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#6B7280',
  },
  // Without flexGrow: 0 the horizontal ScrollView stretches to fill the
  // remaining height of the (now bounded) screen and squeezes the list.
  statusFiltersScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  statusFilters: {
    gap: 7,
    paddingBottom: 10,
    alignItems: 'center',
  },
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: Colors.white,
  },
  activeStatusFilter: {
    borderColor: Colors.orange,
    backgroundColor: '#FFF7ED',
  },
  statusFilterText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: '#64748B',
  },
  activeStatusFilterText: {
    color: Colors.orange,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  listContent: {
    paddingBottom: 12,
  },
  pjpCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    shadowColor: '#1F2937',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  todayCard: {
    borderColor: '#93C5FD',
    borderWidth: 1.5,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateBox: {
    width: 40,
    height: 42,
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayDateBox: {
    backgroundColor: Colors.darkButton,
    borderColor: Colors.darkButton,
  },
  dateText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.darkButton,
    lineHeight: 16,
  },
  monthText: {
    fontFamily: Fonts.regular,
    color: '#64748B',
    fontSize: 9,
  },
  todayDateText: {
    color: Colors.white,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.darkButton,
  },
  fullDate: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: 8,
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  countText: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#64748B',
  },
  visitedText: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: '#15803D',
  },
  missedText: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: '#B91C1C',
  },
  countDot: {
    color: '#CBD5E1',
    fontSize: 9,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 4,
  },
  beatPlanBadge: {
    fontFamily: Fonts.medium,
    fontSize: 8,
    color: '#4338CA',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  unplannedBadge: {
    fontFamily: Fonts.medium,
    fontSize: 8,
    color: '#9A3412',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  activityBadge: {
    fontFamily: Fonts.medium,
    fontSize: 8,
    color: '#0369A1',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  daySummary: {
    fontFamily: Fonts.regular,
    fontSize: 8,
    color: '#475569',
    marginTop: 4,
  },
  cardFooter: {
    minHeight: 28,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pjpId: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 8,
    color: '#94A3B8',
  },
  assignButton: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 7,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  assignButtonText: {
    color: Colors.black,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  stateContainer: {
    minHeight: windowHeight * 0.42,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.gray,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  errorTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: '#B91C1C',
  },
  errorMessage: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 5,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: Colors.darkButton,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.white,
  },
  footerLoader: {
    paddingVertical: 14,
  },
});
