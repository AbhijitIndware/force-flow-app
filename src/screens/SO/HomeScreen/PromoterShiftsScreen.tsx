import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import Toast from 'react-native-toast-message';

import PageHeader from '../../../components/ui/PageHeader';
import { MonthPickerModal } from '../../../components/SO/HomeScreen/MonthPickerModal';
import { YearPickerModal } from '../../../components/SO/HomeScreen/YearPickerModal';
import { flexCol, boxShadow } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { SoAppStackParamList } from '../../../types/Navigation';
import { SupervisorRosterAssignment } from '../../../types/baseType';
import { getInitials } from '../../../utils/utils';
import {
  useGetMyPromotersQuery,
  useGetPromoterRosterQuery,
  useCancelShiftAssignmentMutation,
} from '../../../features/base/promoter-base-api';
import { getUserFacingError, getSafeServerMessage } from '../../../utils/errorMessage';
import { imageBaseUrl } from '../../../features/apiBaseUrl';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PromoterShiftsScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ORANGE_SOFT = '#FFF1E0';
const BLUE_SOFT = '#E3ECFF';
const RED_SOFT = '#FBE8E8';

const assignmentDays = (a: SupervisorRosterAssignment) =>
  Math.max(1, moment(a.end_date).diff(moment(a.start_date), 'days') + 1);

const PromoterShiftsScreen = ({ navigation }: Props) => {
  const now = moment();
  const [employee, setEmployee] = useState('');
  const [month, setMonth] = useState(now.month() + 1);
  const [year, setYear] = useState(now.year());
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [promoterModalVisible, setPromoterModalVisible] = useState(false);
  const [promoterSearch, setPromoterSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingName, setCancellingName] = useState('');

  const [cancelShiftAssignment] = useCancelShiftAssignmentMutation();

  const { data: promotersData, isLoading: promotersLoading } =
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
  } = useGetPromoterRosterQuery({ employee, month, year }, { skip: !employee });

  const employeeName = rosterData?.message?.data?.employee_name ?? '';
  const aonDays = rosterData?.message?.data?.aon_days ?? 0;
  const periodStart = rosterData?.message?.data?.period_start ?? '';
  const periodEnd = rosterData?.message?.data?.period_end ?? '';
  const monthLabel = moment()
    .month(month - 1)
    .format('MMMM');

  const assignments = useMemo(
    () => rosterData?.message?.data?.assignments ?? [],
    [rosterData],
  );

  const groupedByDay = useMemo(() => {
    const groups = new Map<
      string,
      {
        dateKey: string;
        label: string;
        weekday: string;
        items: SupervisorRosterAssignment[];
      }
    >();
    assignments.forEach(a => {
      const key = a.start_date;
      let group = groups.get(key);
      if (!group) {
        const m = moment(key);
        group = {
          dateKey: key,
          label: m.format('DD MMM'),
          weekday: m.format('dddd'),
          items: [],
        };
        groups.set(key, group);
      }
      group.items.push(a);
    });
    return Array.from(groups.values()).sort((x, y) =>
      x.dateKey.localeCompare(y.dateKey),
    );
  }, [assignments]);

  const totalWorkDays = useMemo(() => {
    if (!periodStart || !periodEnd) {
      return 0;
    }
    return (
      moment(periodEnd, 'YYYY-MM-DD').diff(
        moment(periodStart, 'YYYY-MM-DD'),
        'days',
      ) + 1
    );
  }, [periodStart, periodEnd]);

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

  const doCancel = async (assignment: SupervisorRosterAssignment) => {
    setCancellingName(assignment.name);
    try {
      const res = await cancelShiftAssignment({
        shift_assignment: assignment.name,
      }).unwrap();
      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: 'Shift cancelled',
          text2: getSafeServerMessage(res?.message?.message) ?? `${assignment.shift_type} at ${assignment.store_name}`,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Could not cancel shift',
          text2: getSafeServerMessage(res?.message?.message) ?? 'Please try again',
          position: 'top',
        });
      }
    } catch (error: any) {
      const messageText = getUserFacingError(error, 'Failed to cancel shift');
      Toast.show({
        type: 'error',
        text1: 'Could not cancel shift',
        text2: messageText,
        position: 'top',
      });
    } finally {
      setCancellingName('');
    }
  };

  const confirmCancel = (assignment: SupervisorRosterAssignment) => {
    Alert.alert(
      'Cancel shift?',
      `Cancel ${assignment.shift_type || 'this shift'} at ${assignment.store_name}?`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Shift',
          style: 'destructive',
          onPress: () => doCancel(assignment),
        },
      ],
    );
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
      <TouchableOpacity
        key={assignment.name}
        style={[styles.card, boxShadow, cancelled && styles.cardCancelled]}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('PromoterDayDetailScreen', {
            employee,
            date: assignment.start_date,
          })
        }>
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
          {assignment.store_image ? (
            <Image
              source={{ uri: `${imageBaseUrl}${assignment.store_image}` }}
              style={styles.storeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.iconBox}>
              <Ionicons name="storefront-outline" size={14} color={Colors.darkButton} />
            </View>
          )}
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
            {moment(assignment.start_date).format('ddd, DD MMM YYYY')}
            {assignment.end_date !== assignment.start_date
              ? ` - ${moment(assignment.end_date).format('DD MMM')}`
              : ''}
          </Text>
          <View style={styles.daysChip}>
            <Text style={styles.daysChipText}>
              {assignmentDays(assignment) === 1
                ? '1 day'
                : `${assignmentDays(assignment)} days`}
            </Text>
          </View>
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

        <View style={styles.cardFooter}>
          <Text style={styles.assignmentRef} numberOfLines={1}>
            {assignment.name}
          </Text>
          {!cancelled && (
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              disabled={cancellingName === assignment.name}
              onPress={() => confirmCancel(assignment)}>
              {cancellingName === assignment.name ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="close-circle-outline"
                    size={14}
                    color={Colors.white}
                  />
                  <Text style={styles.cancelBtnText}>Cancel Shift</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
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
            <Ionicons name="person-outline" size={16} color={Colors.orange} />
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
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
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
            style={{ marginTop: 40 }}
          />
        ) : employee === '' ? (
          <View style={[styles.emptyState, boxShadow]}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="calendar-outline" size={28} color={Colors.gray} />
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
            <View style={[styles.summaryBar, boxShadow]}>
              <View style={styles.summaryTopRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(employeeName)}
                  </Text>
                </View>
                <View style={styles.summaryMeta}>
                  <Text style={styles.summaryName} numberOfLines={1}>
                    {employeeName}
                  </Text>
                  <Text style={styles.summaryPeriod}>
                    {periodStart
                      ? `${moment(periodStart).format('DD MMM YYYY')} - ${moment(
                        periodEnd,
                      ).format('DD MMM YYYY')}`
                      : `${monthLabel} ${year}`}
                  </Text>
                </View>
                <View style={styles.aonChip}>
                  <Text style={styles.aonValue}>{aonDays}</Text>
                  <Text style={styles.aonLabel}>AON days</Text>
                </View>
              </View>

              <View style={styles.summaryDaysRow}>
                <Ionicons
                  name="hourglass-outline"
                  size={12}
                  color={Colors.orange}
                />
                <Text style={styles.summaryDaysText}>
                  {totalWorkDays} work day{totalWorkDays === 1 ? '' : 's'} in
                  this period
                </Text>
              </View>
            </View>

            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderText}>
                {assignments.length} assignment
                {assignments.length === 1 ? '' : 's'}
              </Text>
            </View>

            {groupedByDay.map(group => (
              <View key={group.dateKey} style={styles.dayGroup}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('PromoterDayDetailScreen', {
                      employee,
                      date: group.dateKey,
                    })
                  }>
                  <View style={styles.dayHeaderLeft}>
                    <Text style={styles.dayHeaderDate}>{group.label}</Text>
                    <Text style={styles.dayHeaderWeekday}>{group.weekday}</Text>
                  </View>
                  <View style={styles.dayHeaderCount}>
                    <Text style={styles.dayHeaderCountText}>
                      {group.items.length} shift
                      {group.items.length === 1 ? '' : 's'}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={12}
                      color={Colors.gray}
                    />
                  </View>
                </TouchableOpacity>
                {group.items.map(renderAssignment)}
              </View>
            ))}
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
              renderItem={({ item }) => {
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
                        selected && { color: Colors.darkButton },
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
  content: { padding: 16, paddingBottom: 40 },

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
  filterBoxTextWrap: { flex: 1 },
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
  modalList: { maxHeight: 420 },
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
  modalItemSel: { backgroundColor: '#FFF7ED' },
  modalAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarSel: { backgroundColor: Colors.orange },
  modalAvatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.textSecondary,
  },
  modalAvatarTextSel: { color: Colors.white },
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
  storeImage: {
    width: 30,
    height: 30,
    borderRadius: 5,
    marginRight: 6,
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
    backgroundColor: Colors.white,
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
  summaryMeta: { flex: 1 },
  summaryName: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  summaryPeriod: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    marginTop: 2,
  },
  aonChip: {
    backgroundColor: ORANGE_SOFT,
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
    color: Colors.gray,
  },
  summaryDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  summaryDaysText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
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

  // ── Day grouping ─────────────────────────────────────────────────────────────
  dayGroup: { marginBottom: 4 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  dayHeaderLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  dayHeaderDate: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  dayHeaderWeekday: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    textTransform: 'capitalize',
  },
  dayHeaderCount: {
    marginLeft: 'auto',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dayHeaderCountText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
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
  cardCancelled: { opacity: 0.55 },
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
  statusPillActive: { backgroundColor: '#E7F8EA' },
  statusPillSecondary: { backgroundColor: BLUE_SOFT },
  statusPillFloater: { backgroundColor: ORANGE_SOFT },
  statusPillCancelled: { backgroundColor: RED_SOFT },
  statusPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
  },
  statusTextActive: { color: '#15803D' },
  statusTextSecondary: { color: '#2563EB' },
  statusTextFloater: { color: '#C2410C' },
  statusTextCancelled: { color: '#B91C1C' },
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
  daysChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  daysChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: '#2563EB',
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  assignmentRef: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.gray,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#B91C1C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 96,
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.white,
  },
});
