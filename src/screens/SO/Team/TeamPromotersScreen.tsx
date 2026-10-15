import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import PageHeader from '../../../components/ui/PageHeader';
import {
  ChipTabs,
  FilterPicker,
  SearchInput,
  useDebounce,
} from '../../../components/SO/Team/TeamFilters';
import { ATTENDANCE_STATUS_CONFIG } from '../../../components/SO/HomeScreen/PromoterAttendanceMonth';
import { flexCol, boxShadow } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { SoAppStackParamList } from '../../../types/Navigation';
import { SupervisorPromoter } from '../../../types/baseType';
import { useGetMyPromotersQuery } from '../../../features/base/promoter-base-api';

type Props = {
  navigation: NativeStackNavigationProp<SoAppStackParamList, 'TeamPromotersScreen'>;
};

type Show = 'all' | 'posted' | 'not_posted' | 'checked_in' | 'not_checked_in';

const PAGE_SIZE = 20;

const TeamPromotersScreen = ({ navigation }: Props) => {
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('');
  const [show, setShow] = useState<Show>('all');
  const [rows, setRows] = useState<SupervisorPromoter[]>([]);
  const debouncedSearch = useDebounce(search.trim(), 400);

  // Page belongs to one set of filters; any filter change starts at page 1
  const filterKey = `${debouncedSearch}|${zone}|${show}`;
  const [paging, setPaging] = useState({ key: filterKey, page: 1 });
  const page = paging.key === filterKey ? paging.page : 1;

  const { data, isFetching, isLoading, error, refetch } = useGetMyPromotersQuery({
    search: debouncedSearch || undefined,
    zone: zone || undefined,
    show: show === 'all' ? undefined : show,
    page,
    page_size: PAGE_SIZE,
  });

  const result = data?.message?.data;
  const totalPages = result?.total_pages ?? 1;

  useEffect(() => {
    if (!result) {
      return;
    }
    const newRows = result.promoters ?? [];
    setRows(prev => ((result.page ?? 1) > 1 ? [...prev, ...newRows] : newRows));
  }, [result]);

  const zoneOptions = useMemo(
    () => (result?.zones ?? []).map(z => ({ label: z, value: z })),
    [result?.zones],
  );

  // Counts always cover the whole team, whatever the filters
  const total = result?.total ?? 0;
  const posted = result?.posted_today ?? 0;
  const checkedIn = result?.checked_in ?? 0;
  const notCheckedIn = result?.not_checked_in ?? 0;

  const showOptions: { label: string; value: Show }[] = [
    { label: `All (${total})`, value: 'all' },
    { label: `Posted (${posted})`, value: 'posted' },
    { label: `Not posted (${Math.max(0, total - posted)})`, value: 'not_posted' },
    { label: `Checked in (${checkedIn})`, value: 'checked_in' },
    { label: `Not checked in (${notCheckedIn})`, value: 'not_checked_in' },
  ];

  const loadMore = () => {
    if (!isFetching && page < totalPages) {
      setPaging({ key: filterKey, page: page + 1 });
    }
  };

  const renderStatus = (p: SupervisorPromoter) => {
    const status = p.attendance_status ?? 'Not Marked';
    const cfg = ATTENDANCE_STATUS_CONFIG[status] ?? ATTENDANCE_STATUS_CONFIG['Not Marked'];
    return (
      <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.statusChipText, { color: cfg.color }]}>{status}</Text>
      </View>
    );
  };

  const renderRow = ({ item: p }: { item: SupervisorPromoter }) => {
    const att = p.attendance;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.card, boxShadow]}
        onPress={() =>
          navigation.navigate('PromoterDayDetailScreen', {
            employee: p.employee,
            date: moment().format('YYYY-MM-DD'),
          })
        }>
        <View style={styles.rowTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {p.employee_name}
            </Text>
            <Text style={styles.muted}>{p.employee}</Text>
          </View>
          {renderStatus(p)}
        </View>

        <View style={styles.checkRow}>
          <Ionicons
            name={att?.checked_in ? 'log-in-outline' : 'remove-circle-outline'}
            size={13}
            color={att?.checked_in ? '#2563EB' : Colors.gray}
          />
          <Text style={styles.checkText}>
            {att?.checked_in
              ? `Checked in ${att.checkin_time ?? ''}${
                  att.checked_out && att.checkout_time
                    ? ` · out ${att.checkout_time}`
                    : ''
                }`
              : 'Not checked in'}
          </Text>
          {att?.stores_assigned ? (
            <Text style={styles.muted}>
              {att.stores_done}/{att.stores_assigned} stores
            </Text>
          ) : null}
        </View>

        {p.today_shifts?.length ? (
          p.today_shifts.map(shift => (
            <View key={shift.shift_assignment} style={styles.shift}>
              <View style={styles.shiftTop}>
                <Ionicons name="storefront-outline" size={13} color={Colors.darkButton} />
                <Text style={styles.storeName} numberOfLines={1}>
                  {shift.store_name}
                </Text>
                <Text style={styles.muted}>
                  {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
                </Text>
              </View>
              {shift.floater_stores?.length ? (
                <View style={styles.floaterChips}>
                  {shift.floater_stores.map(fs => (
                    <View key={fs.store} style={styles.floaterChip}>
                      <Ionicons name="storefront" size={10} color={Colors.orange} />
                      <Text style={styles.floaterChipText} numberOfLines={1}>
                        {fs.store_name}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.notPosted}>Not posted today</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader title="My Promoters" navigation={() => navigation.goBack()} />

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <View style={{ flex: 1.4 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Name or Employee No."
            />
          </View>
          <FilterPicker
            icon="map-outline"
            placeholder="All zones"
            value={zone}
            options={zoneOptions}
            onChange={setZone}
          />
        </View>
        <ChipTabs options={showOptions} value={show} onChange={setShow} />
        {result?.matching != null && (
          <Text style={styles.matching}>
            {result.matching} matching · {moment(result.date).format('ddd, DD MMM')}
          </Text>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.orange} style={styles.loading} />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>Could not load promoters.</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={styles.retry}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={p => p.employee}
          renderItem={renderRow}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            isFetching ? null : (
              <View style={styles.empty}>
                <Text style={styles.muted}>No promoters match.</Text>
              </View>
            )
          }
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator color={Colors.orange} style={{ marginVertical: 12 }} />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 1 && !isLoading}
              onRefresh={() =>
                page === 1 ? refetch() : setPaging({ key: filterKey, page: 1 })
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default TeamPromotersScreen;

const styles = StyleSheet.create({
  filters: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  filterRow: { flexDirection: 'row', gap: 8 },
  matching: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  list: { padding: 16, paddingBottom: 40 },
  loading: { marginTop: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  muted: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusChipText: { fontFamily: Fonts.medium, fontSize: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  shift: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  shiftTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storeName: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  floaterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  floaterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1E0',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    maxWidth: '100%',
  },
  floaterChipText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#C2410C',
  },
  notPosted: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
  },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  retry: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.orange,
  },
});
