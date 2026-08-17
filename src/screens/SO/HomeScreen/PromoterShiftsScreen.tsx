import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import PageHeader from '../../../components/ui/PageHeader';
import {MonthPickerModal} from '../../../components/SO/HomeScreen/MonthPickerModal';
import {YearPickerModal} from '../../../components/SO/HomeScreen/YearPickerModal';
import {flexCol, boxShadow} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {SoAppStackParamList} from '../../../types/Navigation';
import {SupervisorRosterAssignment} from '../../../types/baseType';
import {getInitials} from '../../../utils/utils';
import {
  useGetMyPromotersQuery,
  useGetPromoterRosterQuery,
} from '../../../features/base/promoter-base-api';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PromoterShiftsScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

type StatusFilter = 'all' | 'active' | 'cancelled';

const ORANGE_SOFT = '#FFF1E0';
const BLUE_SOFT = '#E3ECFF';
const RED_SOFT = '#FBE8E8';

const PromoterShiftsScreen = ({navigation}: Props) => {
  const now = moment();
  const [employee, setEmployee] = useState('');
  const [month, setMonth] = useState(now.month() + 1);
  const [year, setYear] = useState(now.year());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [promoterModalVisible, setPromoterModalVisible] = useState(false);
  const [promoterSearch, setPromoterSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {data: promotersData, isLoading: promotersLoading} =
    useGetMyPromotersQuery();

  const promoterOptions = useMemo(() => {
    return (promotersData?.message?.data?.promoters ?? []).map(p => ({
      label: `${p.employee_name} (${p.employee})`,
      value: p.employee,
    }));
  }, [promotersData]);

  const selectedPromoterLabel = useMemo(() => {
    return promoterOptions.find(o => o.value === employee)?.label ?? '';
  }, [promoterOptions, employee]);

  const {
    data: rosterData,
    isFetching: rosterFetching,
    refetch,
  } = useGetPromoterRosterQuery(
    {employee, month, year},
    {skip: !employee},
  );

  const employeeName = rosterData?.message?.data?.employee_name ?? '';
  const aonDays = rosterData?.message?.data?.aon_days ?? 0;
  const monthLabel = moment().month(month - 1).format('MMMM');

  const assignments = useMemo(
    () => rosterData?.message?.data?.assignments ?? [],
    [rosterData],
  );
  const activeCount = assignments.filter(a => a.docstatus !== 2).length;
  const cancelledCount = assignments.length - activeCount;

  const filteredAssignments = useMemo(() => {
    if (statusFilter === 'all') {return assignments;}
    if (statusFilter === 'active') {
      return assignments.filter(a => a.docstatus !== 2);
    }
    return assignments.filter(a => a.docstatus === 2);
  }, [assignments, statusFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (employee) {
      try {
        await refetch();
      } catch {
        // ignore
      }
    }
    setRefreshing(false);
  };

  const renderStatusPill = (assignment: SupervisorRosterAssignment) => {
    const cancelled = assignment.docstatus === 2;
    const isSecondary = assignment.custom_secondary_shift === 1;
    const isFloater = assignment.floater === 1;

    if (cancelled) {
      return (
        <View style={[styles.statusPill, styles.statusPillCancelled]}>
          <Ionicons name="close-circle" size={11} color="#B91C1C" />
          <Text style={[styles.statusPillText, styles.statusTextCancelled]}>
            Cancelled
          </Text>
        </View>
      );
    }
    if (isSecondary) {
      return (
        <View style={[styles.statusPill, styles.statusPillSecondary]}>
          <Ionicons name="time" size={11} color="#2563EB" />
          <Text style={[styles.statusPillText, styles.statusTextSecondary]}>
            Secondary
          </Text>
        </View>
      );
    }
    if (isFloater) {
      return (
        <View style={[styles.statusPill, styles.statusPillFloater]}>
          <Ionicons name="swap-horizontal" size={11} color="#C2410C" />
          <Text style={[styles.statusPillText, styles.statusTextFloater]}>
            Floater
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusPill, styles.statusPillActive]}>
        <Ionicons name="checkmark-circle" size={11} color="#15803D" />
        <Text style={[styles.statusPillText, styles.statusTextActive]}>
          Active
        </Text>
      </View>
    );
  };

  const renderAssignment = (assignment: SupervisorRosterAssignment) => {
    const cancelled = assignment.docstatus === 2;

    return (
      <View
        key={assignment.name}
        style={[
          styles.card,
          boxShadow,
          cancelled && styles.cardCancelled,
        ]}>
        <View style={styles.cardAccent} />

        <View style={styles.cardTopRow}>
          <View style={styles.timeChip}>
            <Ionicons name="time-outline" size={13} color={Colors.orange} />
            <Text style={styles.timeChipText}>
              {assignment.start_time} - {assignment.end_time}
            </Text>
          </View>
          {renderStatusPill(assignment)}
        </View>

        <Text
          style={[styles.cardTitle, cancelled && styles.textCancelled]}
          numberOfLines={1}>
          {assignment.shift_type || 'General Shift'}
        </Text>

        <View style={styles.cardRow}>
          <View style={styles.iconBox}>
            <Ionicons
              name="storefront-outline"
              size={14}
              color={Colors.darkButton}
            />
          </View>
          <Text style={styles.cardText} numberOfLines={1}>
            {assignment.store_name}
          </Text>
          <Text style={styles.cardId}>{assignment.store}</Text>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.iconBox}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.darkButton}
            />
          </View>
          <Text style={styles.cardText}>
            {moment(assignment.start_date).format('DD MMM YYYY')} -{' '}
            {moment(assignment.end_date).format('DD MMM YYYY')}
          </Text>
        </View>

        {assignment.floater_stores?.length > 0 && (
          <View style={styles.floaterWrap}>
            <Text style={styles.floaterLabel}>Covers also</Text>
            <View style={styles.floaterChips}>
              {assignment.floater_stores.map(fs => (
                <View key={fs.store} style={styles.floaterChip}>
                  <Ionicons name="storefront" size={10} color={Colors.orange} />
                  <Text style={styles.floaterChipText} numberOfLines={1}>
                    {fs.store_name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.assignmentRef}>{assignment.name}</Text>
      </View>
    );
  };

  const renderStatTile = (
    label: string,
    value: number,
    target: StatusFilter,
    activeColor: string,
  ) => {
    const active = statusFilter === target;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.statTile, active && {backgroundColor: activeColor}]}
        onPress={() => setStatusFilter(target)}>
        <Text style={[styles.statValue, active && {color: Colors.white}]}>
          {value}
        </Text>
        <Text style={[styles.statLabel, active && {color: Colors.white}]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Promoter Shifts"
        navigation={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* ── Compact filter row ── */}
        <View style={[styles.filterCard, boxShadow]}>
          <TouchableOpacity
            style={[styles.filterBox, styles.filterBoxPromoter]}
            activeOpacity={0.8}
            onPress={() => setPromoterModalVisible(true)}>
            <Ionicons
              name="person-outline"
              size={16}
              color={Colors.orange}
            />
            <View style={styles.filterBoxTextWrap}>
              <Text
                style={[
                  styles.filterBoxText,
                  employee === '' && styles.filterBoxPlaceholder,
                ]}
                numberOfLines={1}>
                {promotersLoading
                  ? 'Loading...'
                  : employee === ''
                    ? 'Promoter'
                    : selectedPromoterLabel}
              </Text>
            </View>
            {employee !== '' && (
              <TouchableOpacity
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                onPress={() => setEmployee('')}>
                <Ionicons name="close" size={14} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterBox}
            activeOpacity={0.8}
            onPress={() => setMonthModalVisible(true)}>
            <Ionicons name="calendar-outline" size={16} color={Colors.orange} />
            <View style={styles.filterBoxTextWrap}>
              <Text style={styles.filterBoxText} numberOfLines={1}>
                {monthLabel}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={14} color={Colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBox, styles.filterBoxYear]}
            activeOpacity={0.8}
            onPress={() => setYearModalVisible(true)}>
            <Ionicons
              name="calendar-number-outline"
              size={16}
              color={Colors.orange}
            />
            <View style={styles.filterBoxTextWrap}>
              <Text style={styles.filterBoxText} numberOfLines={1}>
                {year}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={14} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {rosterFetching ? (
          <ActivityIndicator
            size="large"
            color={Colors.orange}
            style={{marginTop: 40}}
          />
        ) : employee === '' ? (
          <View style={[styles.emptyState, boxShadow]}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="calendar-outline"
                size={28}
                color={Colors.gray}
              />
            </View>
            <Text style={styles.emptyTitle}>No promoter selected</Text>
            <Text style={styles.emptySub}>
              Pick a promoter above to see their shifts for the month.
            </Text>
          </View>
        ) : assignments.length === 0 ? (
          <View style={[styles.emptyState, boxShadow]}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="file-tray-outline"
                size={28}
                color={Colors.gray}
              />
            </View>
            <Text style={styles.emptyTitle}>No shifts this month</Text>
            <Text style={styles.emptySub}>
              {employeeName} has no assignments for {monthLabel} {year}.
            </Text>
          </View>
        ) : (
          <>
            {/* ── Summary / hero ── */}
            <View style={styles.summaryBar}>
              <View style={styles.summaryTopRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(employeeName)}</Text>
                </View>
                <View style={styles.summaryMeta}>
                  <Text style={styles.summaryName} numberOfLines={1}>
                    {employeeName}
                  </Text>
                  <Text style={styles.summaryPeriod}>
                    {monthLabel} {year} roster
                  </Text>
                </View>
                <View style={styles.aonChip}>
                  <Text style={styles.aonValue}>{aonDays}</Text>
                  <Text style={styles.aonLabel}>AON days</Text>
                </View>
              </View>

              <View style={styles.statTiles}>
                {renderStatTile(
                  'All',
                  assignments.length,
                  'all',
                  Colors.orange,
                )}
                {renderStatTile(
                  'Active',
                  activeCount,
                  'active',
                  '#15803D',
                )}
                {renderStatTile(
                  'Cancelled',
                  cancelledCount,
                  'cancelled',
                  '#B91C1C',
                )}
              </View>
            </View>

            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderText}>
                {filteredAssignments.length} assignment
                {filteredAssignments.length === 1 ? '' : 's'}
              </Text>
              {statusFilter !== 'all' && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setStatusFilter('all')}>
                  <Text style={styles.showAllText}>Show all</Text>
                </TouchableOpacity>
              )}
            </View>

            {filteredAssignments.map(renderAssignment)}
          </>
        )}
      </ScrollView>

      <MonthPickerModal
        visible={monthModalVisible}
        monthPickerTarget="single"
        selectedMonth={month}
        fromMonth={month}
        toMonth={month}
        onSelectMonth={value => {
          setMonth(value);
          setMonthModalVisible(false);
        }}
        onClose={() => setMonthModalVisible(false)}
      />

      <YearPickerModal
        visible={yearModalVisible}
        selectedYear={year}
        currentYear={year}
        onSelectYear={value => {
          setYear(value);
          setYearModalVisible(false);
        }}
        onClose={() => setYearModalVisible(false)}
      />

      {/* ── Promoter selection modal ── */}
      <Modal
        visible={promoterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setPromoterModalVisible(false);
          setPromoterSearch('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Promoter</Text>
                <Text style={styles.modalSubtitle}>
                  {promoterOptions.length} in your team
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setPromoterModalVisible(false);
                  setPromoterSearch('');
                }}>
                <Ionicons name="close-circle" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color={Colors.gray} />
              <TextInput
                value={promoterSearch}
                onChangeText={setPromoterSearch}
                placeholder="Search promoter..."
                placeholderTextColor={Colors.gray}
                style={styles.searchInput}
              />
              {promoterSearch.length > 0 && (
                <TouchableOpacity onPress={() => setPromoterSearch('')}>
                  <Ionicons name="close" size={15} color={Colors.gray} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={promoterOptions.filter(o =>
                o.label.toLowerCase().includes(promoterSearch.toLowerCase()),
              )}
              keyExtractor={item => item.value}
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
              renderItem={({item}) => {
                const selected = item.value === employee;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, selected && styles.modalItemSel]}
                    onPress={() => {
                      setEmployee(item.value);
                      setPromoterSearch('');
                      setPromoterModalVisible(false);
                    }}>
                    <View
                      style={[
                        styles.modalAvatar,
                        selected && styles.modalAvatarSel,
                      ]}>
                      <Text
                        style={[
                          styles.modalAvatarText,
                          selected && styles.modalAvatarTextSel,
                        ]}>
                        {getInitials(item.label.split(' (')[0])}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.modalItemText,
                        selected && {color: Colors.darkButton},
                      ]}
                      numberOfLines={1}>
                      {item.label}
                    </Text>
                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={Colors.orange}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>No promoters found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PromoterShiftsScreen;

const styles = StyleSheet.create({
  content: {padding: 16, paddingBottom: 40},

  // ── Filter panel ──────────────────────────────────────────────────────────────
  filterCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  filterBoxPromoter: {
    flex: 1.5,
  },
  filterBoxYear: {
    flex: 0.8,
  },
  filterBoxTextWrap: {flex: 1},
  filterBoxText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  filterBoxPlaceholder: {
    color: Colors.gray,
    fontFamily: Fonts.regular,
  },

  // ── Promoter selection modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: Size.sm,
    fontFamily: Fonts.semiBold,
    color: '#1A1A1A',
  },
  modalSubtitle: {
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#1A1A1A',
    padding: 0,
  },
  modalList: {maxHeight: 420},
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
    borderRadius: 8,
  },
  modalItemSel: {backgroundColor: '#FFF7ED'},
  modalAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarSel: {backgroundColor: Colors.orange},
  modalAvatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.textSecondary,
  },
  modalAvatarTextSel: {color: Colors.white},
  modalItemText: {
    flex: 1,
    fontSize: Size.xs,
    fontFamily: Fonts.regular,
    color: '#374151',
  },
  modalEmptyText: {
    textAlign: 'center',
    color: Colors.gray,
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    paddingVertical: 24,
  },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    textAlign: 'center',
  },

  // ── Summary bar ──────────────────────────────────────────────────────────────
  summaryBar: {
    backgroundColor: Colors.darkButton,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  summaryMeta: {flex: 1},
  summaryName: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  summaryPeriod: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#C4C4C4',
    marginTop: 2,
  },
  aonChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  aonValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.orange,
  },
  aonLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#C4C4C4',
  },
  statTiles: {
    flexDirection: 'row',
    gap: 8,
  },
  statTile: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#C4C4C4',
    marginTop: 2,
  },

  // ── List header ──────────────────────────────────────────────────────────────
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  listHeaderText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  showAllText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.orange,
  },

  // ── Assignment cards ─────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  cardCancelled: {opacity: 0.55},
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.orange,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ORANGE_SOFT,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  timeChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.orange,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusPillActive: {backgroundColor: '#E7F8EA'},
  statusPillSecondary: {backgroundColor: BLUE_SOFT},
  statusPillFloater: {backgroundColor: ORANGE_SOFT},
  statusPillCancelled: {backgroundColor: RED_SOFT},
  statusPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
  },
  statusTextActive: {color: '#15803D'},
  statusTextSecondary: {color: '#2563EB'},
  statusTextFloater: {color: '#C2410C'},
  statusTextCancelled: {color: '#B91C1C'},
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
    marginBottom: 10,
  },
  textCancelled: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textSecondary,
  },
  cardId: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.gray,
  },
  floaterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  floaterLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.gray,
  },
  floaterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  floaterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  floaterChipText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  assignmentRef: {
    marginTop: 8,
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.gray,
  },
});
