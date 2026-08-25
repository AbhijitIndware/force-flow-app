import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

import PageHeader from '../../../components/ui/PageHeader';
import ReusableDatePicker from '../../../components/ui-lib/reusable-date-picker';
import { flexCol, boxShadow } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { SoAppStackParamList } from '../../../types/Navigation';
import {
  SupervisorActivityRow,
  SupervisorAttendanceByStore,
  SupervisorOrderRow,
  SupervisorStockTakeRow,
} from '../../../types/baseType';
import { getInitials } from '../../../utils/utils';
import { imageBaseUrl } from '../../../features/apiBaseUrl';
import {
  useGetMyPromotersQuery,
  useGetPromoterDayQuery,
} from '../../../features/base/promoter-base-api';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PromoterDayDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: { params?: { employee?: string; date?: string } };
};

const ORANGE_SOFT = '#FFF1E0';
const BLUE_SOFT = '#E3ECFF';
const RED_SOFT = '#FBE8E8';
const GREEN_SOFT = '#E7F8EA';
const PURPLE_SOFT = '#EDE7FE';

const SECTION_COLORS = {
  attendance: { icon: 'time-outline', color: '#2563EB', bg: BLUE_SOFT },
  stock: { icon: 'file-tray-outline', color: '#15803D', bg: GREEN_SOFT },
  orders: { icon: 'cart-outline', color: '#C2410C', bg: ORANGE_SOFT },
  activities: { icon: 'sparkles-outline', color: '#7C3AED', bg: PURPLE_SOFT },
} as const;

const PromoterDayDetailScreen = ({ navigation, route }: Props) => {
  const today = moment().format('YYYY-MM-DD');
  const [employee, setEmployee] = useState(route?.params?.employee ?? '');
  const [date, setDate] = useState(route?.params?.date ?? today);
  const [promoterModalVisible, setPromoterModalVisible] = useState(false);
  const [promoterSearch, setPromoterSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
    data: dayData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPromoterDayQuery({ employee, date }, { skip: !employee });

  const data = dayData?.message?.data;
  const employeeName = data?.employee_name ?? '';
  const totalHours = Number(data?.total_working_hours ?? 0);
  const attendance = data?.attendance;
  const attendanceByStore = data?.attendance_by_store ?? [];
  const stockRows = data?.stock_take?.rows ?? [];
  const stockCount = data?.stock_take?.items_counted ?? 0;
  const orderRows = data?.orders?.rows ?? [];
  const orderTotal = data?.orders?.total_value ?? 0;
  const activityRows = data?.activities?.rows ?? [];
  // const todayShifts = data?.today_shifts ?? [];

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

  const renderAttendanceStatus = (status?: string | null) => {
    if (!status) {
      return null;
    }
    const lower = status.toLowerCase();
    let bg = ORANGE_SOFT;
    let color = '#C2410C';
    let icon: any = 'ellipse';
    if (lower.includes('check out')) {
      bg = GREEN_SOFT;
      color = '#15803D';
      icon = 'checkmark-done';
    } else if (lower.includes('check in')) {
      bg = BLUE_SOFT;
      color = '#2563EB';
      icon = 'enter-outline';
    } else if (lower.includes('absent')) {
      bg = RED_SOFT;
      color = '#B91C1C';
      icon = 'close-circle';
    }
    return (
      <View style={[styles.statusPill, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={11} color={color} />
        <Text style={[styles.statusPillText, { color }]}>{status}</Text>
      </View>
    );
  };

  const renderWorkflowPill = (state: string) => {
    const approved = state?.toLowerCase() === 'approved';
    return (
      <View
        style={[
          styles.wfPill,
          { backgroundColor: approved ? GREEN_SOFT : '#F0F0F0' },
        ]}>
        <Text
          style={[
            styles.wfPillText,
            { color: approved ? '#15803D' : '#555555' },
          ]}>
          {state}
        </Text>
      </View>
    );
  };

  const renderMismatch = (qty: number) => {
    if (qty === 0) {
      return (
        <View style={[styles.mismatchBadge, styles.mismatchOk]}>
          <Ionicons name="checkmark" size={11} color="#15803D" />
          <Text style={[styles.mismatchText, styles.mismatchTextOk]}>0</Text>
        </View>
      );
    }
    return (
      <View style={[styles.mismatchBadge, styles.mismatchBad]}>
        <Ionicons name="warning" size={11} color="#B91C1C" />
        <Text style={[styles.mismatchText, styles.mismatchTextBad]}>{qty}</Text>
      </View>
    );
  };

  const renderStockRow = (row: SupervisorStockTakeRow) => {
    const bad = row.mismatched_qty !== 0;
    return (
      <View key={row.item} style={[styles.tableRow, bad && styles.tableRowBad]}>
        <Text style={styles.colItem} numberOfLines={2}>
          {row.item}
        </Text>
        <Text style={styles.colNum}>{row.warehouse_balance}</Text>
        <Text style={styles.colNum}>{row.manual_balance_entry}</Text>
        <View style={styles.colMismatch}>
          {renderMismatch(row.mismatched_qty)}
        </View>
      </View>
    );
  };

  const renderOrderRow = (row: SupervisorOrderRow) => {
    return (
      <View key={row.name} style={styles.orderRow}>
        <View style={[styles.iconBox, styles.iconBoxOrange]}>
          <Ionicons name="receipt-outline" size={14} color="#C2410C" />
        </View>
        <View style={styles.orderMeta}>
          <Text style={styles.orderName} numberOfLines={1}>
            {row.name}
          </Text>
          <Text style={styles.orderQty}>{row.total_qty} items</Text>
        </View>
        <View style={styles.orderRight}>
          <Text style={styles.orderTotal}>
            ₹{Number(row.grand_total).toLocaleString('en-IN')}
          </Text>
          {renderWorkflowPill(row.workflow_state)}
        </View>
      </View>
    );
  };

  const renderActivityRow = (row: SupervisorActivityRow) => {
    return (
      <View
        key={`${row.activity_type}-${row.store_name}`}
        style={styles.activityRow}>
        <View style={styles.activityTop}>
          <View style={styles.categoryChip}>
            <Ionicons name="flash-outline" size={11} color="#2563EB" />
            <Text style={styles.categoryChipText}>
              {row.activities_category}
            </Text>
          </View>
          {row.activity_type ? (
            <Text style={styles.activityType}>{row.activity_type}</Text>
          ) : null}
        </View>
        <View style={styles.activityStoreRow}>
          <Ionicons name="storefront-outline" size={11} color={Colors.gray} />
          <Text style={styles.activityStore}>{row.store_name}</Text>
        </View>
        {row.images?.length > 0 && (
          <View style={styles.thumbRow}>
            {row.images.slice(0, 4).map((img, idx) => (
              <Image
                key={`${img}-${idx}`}
                source={{ uri: `${imageBaseUrl}${img}` }}
                style={styles.thumb}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderByStoreRow = (row: SupervisorAttendanceByStore) => {
    return (
      <View key={row.log_id} style={styles.byStoreRow}>
        <View style={[styles.iconBox, styles.iconBoxBlue]}>
          <Ionicons name="storefront-outline" size={14} color="#2563EB" />
        </View>
        <View style={styles.byStoreMeta}>
          <Text style={styles.byStoreName} numberOfLines={1}>
            {row.store_name}
          </Text>
          <Text style={styles.byStoreTime}>
            {row.checkin_time ?? '--'} - {row.checkout_time ?? '--'}
          </Text>
        </View>
        {renderAttendanceStatus(row.status)}
      </View>
    );
  };

  const renderSectionHeader = (
    key: keyof typeof SECTION_COLORS,
    title: string,
    right?: React.ReactNode,
  ) => {
    const meta = SECTION_COLORS[key];
    return (
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBox, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={16} color={meta.color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {right ? <View style={styles.sectionRight}>{right}</View> : null}
      </View>
    );
  };

  const renderHeroStat = (
    icon: string,
    value: string,
    label: string,
    color: string,
    bg: string,
  ) => (
    <View style={styles.heroStat}>
      <View style={[styles.heroStatIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (!employee) {
      return (
        <View style={[styles.emptyState, boxShadow]}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="person-outline" size={28} color={Colors.gray} />
          </View>
          <Text style={styles.emptyTitle}>Select a promoter</Text>
          <Text style={styles.emptySub}>
            Pick a promoter to see their full day at a glance.
          </Text>
        </View>
      );
    }
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={Colors.orange}
          style={styles.loading}
        />
      );
    }
    if (error) {
      return (
        <View style={[styles.emptyState, boxShadow]}>
          <View style={styles.emptyIconBox}>
            <Ionicons
              name="cloud-offline-outline"
              size={28}
              color={Colors.gray}
            />
          </View>
          <Text style={styles.emptyTitle}>Could not load day</Text>
          <Text style={styles.emptySub}>
            Something went wrong fetching this day.
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            activeOpacity={0.8}
            onPress={refetch}>
            <Ionicons name="refresh" size={14} color={Colors.white} />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        <View style={[styles.hero, boxShadow]}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(employeeName)}
                </Text>
              </View>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.heroName} numberOfLines={1}>
                {employeeName}
              </Text>
              <View style={styles.heroDateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={Colors.gray}
                />
                <Text style={styles.heroDate}>
                  {moment(date).format('ddd, DD MMM YYYY')}
                </Text>
              </View>
            </View>
            {renderAttendanceStatus(attendance?.status)}
          </View>

          {/* {todayShifts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.storesRow}
              contentContainerStyle={styles.storesRowContent}>
              {todayShifts.map(shift => (
                <View key={shift.shift_assignment} style={styles.storeChip}>
                  {shift.store_image ? (
                    <Image
                      source={{ uri: `${imageBaseUrl}${shift.store_image}` }}
                      style={styles.storeChipImage}
                    />
                  ) : (
                    <View style={[styles.storeChipImage, styles.storeChipImageFallback]}>
                      <Ionicons name="storefront-outline" size={14} color="#2563EB" />
                    </View>
                  )}
                  <View style={styles.storeChipMeta}>
                    <Text style={styles.storeChipName} numberOfLines={1}>
                      {shift.store_name}
                    </Text>
                    <Text style={styles.storeChipTime} numberOfLines={1}>
                      {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : null} */}

          <View style={styles.heroStatsRow}>
            {renderHeroStat(
              'hourglass-outline',
              totalHours.toFixed(1),
              'hrs worked',
              '#C2410C',
              ORANGE_SOFT,
            )}
            {renderHeroStat(
              'file-tray-outline',
              String(stockCount),
              'items counted',
              '#15803D',
              GREEN_SOFT,
            )}
            {renderHeroStat(
              'cart-outline',
              String(orderRows.length),
              'orders',
              '#2563EB',
              BLUE_SOFT,
            )}
            {renderHeroStat(
              'sparkles-outline',
              String(activityRows.length),
              'activities',
              '#7C3AED',
              PURPLE_SOFT,
            )}
          </View>
        </View>

        <View style={[styles.card, boxShadow]}>
          {renderSectionHeader(
            'attendance',
            'Attendance',
            attendance?.status
              ? renderAttendanceStatus(attendance.status)
              : null,
          )}
          {attendance ? (
            <>
              <View style={styles.infoRow}>
                <View style={[styles.iconBox, styles.iconBoxBlue]}>
                  <Ionicons
                    name="storefront-outline"
                    size={14}
                    color="#2563EB"
                  />
                </View>
                <Text style={styles.infoText} numberOfLines={1}>
                  {attendance.store_name}
                </Text>
                {attendance.checkin_selfie ? (
                  <View style={styles.selfieMini}>
                    <Image
                      source={{
                        uri: `${imageBaseUrl}${attendance.checkin_selfie}`,
                      }}
                      style={styles.selfieThumb}
                    />
                    <Text style={styles.selfieText}>Selfie</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.attTimesRow}>
                <View style={styles.attTimeBox}>
                  <Ionicons name="log-in-outline" size={15} color="#2563EB" />
                  <Text style={styles.attTimeLabel}>Check-in</Text>
                  <Text style={styles.attTimeValue}>
                    {attendance.checkin_time ?? '--'}
                  </Text>
                </View>
                <View style={styles.attTimeBox}>
                  <Ionicons name="log-out-outline" size={15} color="#B45309" />
                  <Text style={styles.attTimeLabel}>Check-out</Text>
                  <Text style={styles.attTimeValue}>
                    {attendance.checkout_time ?? '--'}
                  </Text>
                </View>
                <View style={styles.attTimeBox}>
                  <Ionicons name="time-outline" size={15} color="#15803D" />
                  <Text style={styles.attTimeLabel}>Hours</Text>
                  <Text style={styles.attTimeValue}>
                    {Number(attendance.working_hours || 0).toFixed(2)} hrs
                  </Text>
                </View>
              </View>
              {attendanceByStore.length > 0 ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.subHeader}>
                    Store-wise
                    {attendanceByStore.length > 1
                      ? ` (${attendanceByStore.length})`
                      : ''}
                  </Text>
                  {attendanceByStore.map(renderByStoreRow)}
                </>
              ) : null}
            </>
          ) : (
            <Text style={styles.inlineEmptyText}>No attendance recorded.</Text>
          )}
        </View>

        <View style={[styles.card, boxShadow]}>
          {renderSectionHeader(
            'stock',
            'Stock Take',
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{stockCount} items</Text>
            </View>,
          )}
          {stockRows.length > 0 ? (
            <>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.colItem}>Item</Text>
                <Text style={styles.colNum}>System</Text>
                <Text style={styles.colNum}>Counted</Text>
                <Text style={styles.colMismatch}>Δ</Text>
              </View>
              {stockRows.map(renderStockRow)}
            </>
          ) : (
            <Text style={styles.inlineEmptyText}>No stock take recorded.</Text>
          )}
        </View>

        <View style={[styles.card, boxShadow]}>
          {renderSectionHeader(
            'orders',
            'Orders',
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>
                ₹{Number(orderTotal).toLocaleString('en-IN')}
              </Text>
            </View>,
          )}
          {orderRows.length > 0 ? (
            orderRows.map(renderOrderRow)
          ) : (
            <Text style={styles.inlineEmptyText}>No orders recorded.</Text>
          )}
        </View>

        <View style={[styles.card, boxShadow]}>
          {renderSectionHeader(
            'activities',
            'Activities',
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{activityRows.length}</Text>
            </View>,
          )}
          {activityRows.length > 0 ? (
            activityRows.map(renderActivityRow)
          ) : (
            <Text style={styles.inlineEmptyText}>No activities recorded.</Text>
          )}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader title="Promoter Day" navigation={() => navigation.goBack()} />

      <View style={[styles.filterCard, boxShadow]}>
        <TouchableOpacity
          style={styles.promoterBox}
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
          <Ionicons name="chevron-down" size={14} color={Colors.gray} />
        </TouchableOpacity>
        <View style={styles.dateBox}>
          <ReusableDatePicker
            label=""
            value={date}
            onChange={setDate}
            height={38}
            textSize={Size.xxs}
            labelStyle={styles.hiddenLabel}
            marginBottom={0}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {isFetching && !isLoading && employee ? (
          <ActivityIndicator
            size="small"
            color={Colors.orange}
            style={styles.fetching}
          />
        ) : null}
        {renderContent()}
      </ScrollView>

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

export default PromoterDayDetailScreen;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  fetching: { marginVertical: 12 },
  loading: { marginTop: 40 },

  filterCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  promoterBox: {
    flex: 1.5,
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
  dateBox: { flex: 1 },
  hiddenLabel: { fontSize: 0, height: 0, marginBottom: 0, overflow: 'hidden' },
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

  hero: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
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
  heroMeta: { flex: 1 },
  heroName: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  heroDate: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroStat: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  heroStatIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  heroStatValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
  },
  heroStatLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: Colors.gray,
    marginTop: 2,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  sectionRight: { flexDirection: 'row', alignItems: 'center' },
  countChip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countChipText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxBlue: { backgroundColor: BLUE_SOFT },
  iconBoxOrange: { backgroundColor: ORANGE_SOFT },
  infoText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  selfieMini: {
    alignItems: 'center',
    gap: 2,
  },
  selfieThumb: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
  },
  selfieText: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: Colors.gray,
  },

  attTimesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  attTimeBox: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  attTimeLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: Colors.gray,
  },
  attTimeValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  subHeader: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.darkButton,
    marginBottom: 8,
  },
  byStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  byStoreMeta: { flex: 1 },
  byStoreName: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  byStoreTime: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.gray,
    marginTop: 1,
  },

  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  tableRowBad: {
    backgroundColor: '#FDF2F2',
  },
  colItem: {
    flex: 2,
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
    paddingRight: 6,
  },
  colNum: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.darkButton,
    textAlign: 'center',
  },
  colMismatch: {
    flex: 1,
    alignItems: 'flex-end',
  },
  mismatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  mismatchOk: { backgroundColor: GREEN_SOFT },
  mismatchBad: { backgroundColor: RED_SOFT },
  mismatchText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
  },
  mismatchTextOk: { color: '#15803D' },
  mismatchTextBad: { color: '#B91C1C' },

  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
  },
  orderMeta: { flex: 1 },
  orderName: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  orderQty: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.gray,
    marginTop: 1,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  orderTotal: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  wfPill: {
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  wfPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
  },

  activityRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
  },
  activityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BLUE_SOFT,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: '#2563EB',
  },
  activityType: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  activityStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityStore: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.gray,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },

  inlineEmptyText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    paddingVertical: 8,
  },

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
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 14,
  },
  retryBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: Colors.white,
  },

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

  storesRow: {
    marginTop: 12,
  },
  storesRowContent: {
    gap: 8,
    paddingRight: 4,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    maxWidth: 180,
  },
  storeChipImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  storeChipImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE_SOFT,
  },
  storeChipMeta: {
    flexShrink: 1,
  },
  storeChipName: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  storeChipTime: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: Colors.gray,
    marginTop: 1,
  },
});
