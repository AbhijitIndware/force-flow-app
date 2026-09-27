/* eslint-disable react-native/no-inline-styles */
import React, {useMemo, useState} from 'react';
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
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PageHeader from '../../../components/ui/PageHeader';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {
  useGetEmployeeAssignedStoresQuery,
  useGetMySalesQuery,
} from '../../../features/base/promoter-base-api';
import {getSafeServerMessage} from '../../../utils/errorMessage';

type Props = {
  navigation: any;
};
type Tab = 'day' | 'item';

const money = (value: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}`;

const MySalesScreen = ({navigation}: Props) => {
  const [month, setMonth] = useState(moment().startOf('month'));
  const [store, setStore] = useState('');
  const [tab, setTab] = useState<Tab>('day');
  const [refreshing, setRefreshing] = useState(false);

  const fromDate = month.clone().startOf('month').format('YYYY-MM-DD');
  const toDate = month.isSame(moment(), 'month')
    ? moment().format('YYYY-MM-DD')
    : month.clone().endOf('month').format('YYYY-MM-DD');

  const {data: storesResponse} = useGetEmployeeAssignedStoresQuery();
  const storeOptions = useMemo(
    () => [
      {label: 'All stores', value: ''},
      ...(storesResponse?.message?.data?.stores ?? []).map(s => ({
        label: s.store_name,
        value: s.store_id,
      })),
    ],
    [storesResponse],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetMySalesQuery({
    from_date: fromDate,
    to_date: toDate,
    ...(store ? {store} : {}),
  });
  const data = response?.message?.data;
  const totals = data?.totals ?? {
    sold: 0,
    sold_value: 0,
    received: 0,
    found: 0,
  };
  const errorMessage =
    response?.message?.success === false
      ? getSafeServerMessage(response?.message?.message)
      : undefined;

  const dayRows = useMemo(
    () =>
      (data?.stores ?? [])
        .flatMap((salesStore: any) =>
          (salesStore.days ?? []).map((day: any) => ({
            ...day,
            key: `${salesStore.store}-${day.date}`,
            store_name: salesStore.store_name,
          })),
        )
        .sort((a: any, b: any) => b.date.localeCompare(a.date)),
    [data],
  );

  const itemRows = useMemo(
    () =>
      (data?.stores ?? [])
        .flatMap((salesStore: any) =>
          (salesStore.items ?? []).map((item: any) => ({
            ...item,
            key: `${salesStore.store}-${item.item_code}`,
            store_name: salesStore.store_name,
          })),
        )
        .sort((a: any, b: any) => Number(b.sold) - Number(a.sold)),
    [data],
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const renderDay = ({item}: {item: any}) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{moment(item.date).format('DD')}</Text>
          <Text style={styles.dateMonth}>
            {moment(item.date).format('MMM')}
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.cardTitle}>{item.store_name}</Text>
          <Text style={styles.cardSub}>{moment(item.date).format('dddd')}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.value}>{money(item.sold_value)}</Text>
          <Text style={styles.cardSub}>{item.sold} sold</Text>
        </View>
      </View>
      <View style={styles.metrics}>
        <Text style={styles.metric}>
          Received <Text style={styles.metricValue}>{item.received}</Text>
        </Text>
        <Text style={[styles.metric, item.found > 0 && styles.warningText]}>
          Unrecorded <Text style={styles.metricValue}>{item.found}</Text>
        </Text>
      </View>
    </View>
  );

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.itemIcon}>
          <Ionicons name="cube-outline" size={18} color={Colors.white} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.item_name}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {item.store_name}
          </Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.value}>{item.sold} sold</Text>
          <Text style={styles.cardSub}>{money(item.sold_value)}</Text>
        </View>
      </View>
      <View style={styles.metrics}>
        <Text style={styles.metric}>
          Open <Text style={styles.metricValue}>{item.opening}</Text>
        </Text>
        <Text style={styles.metric}>
          Received <Text style={styles.metricValue}>{item.received}</Text>
        </Text>
        <Text style={styles.metric}>
          Close <Text style={styles.metricValue}>{item.closing}</Text>
        </Text>
      </View>
      {item.found > 0 ? (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" color="#B45309" size={14} />
          <Text style={styles.warningCopy}>
            Unrecorded stock: record deliveries when they arrive ({item.found})
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <PageHeader title="My Sales" navigation={() => navigation.goBack()} />
      <View style={styles.filters}>
        <View style={styles.monthRow}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() =>
              setMonth(value => value.clone().subtract(1, 'month'))
            }>
            <Ionicons name="chevron-back" size={18} color={Colors.darkButton} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{month.format('MMMM YYYY')}</Text>
          <TouchableOpacity
            style={[
              styles.monthButton,
              month.isSame(moment(), 'month') && styles.disabled,
            ]}
            disabled={month.isSame(moment(), 'month')}
            onPress={() => setMonth(value => value.clone().add(1, 'month'))}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.darkButton}
            />
          </TouchableOpacity>
        </View>
        <ReusableDropdown
          placeholder="All stores"
          data={storeOptions}
          value={store}
          onChange={setStore}
          error={false}
          field="label"
          label=""
          selectedLabel={
            storeOptions.find(option => option.value === store)?.label ??
            'All stores'
          }
          marginBottom={0}
        />
      </View>

      <View style={styles.summary}>
        <View style={styles.primaryStat}>
          <Text style={styles.primaryLabel}>Sold</Text>
          <Text style={styles.primaryValue}>{totals.sold}</Text>
          <Text style={styles.primaryMoney}>{money(totals.sold_value)}</Text>
        </View>
        <View style={styles.secondaryStats}>
          <View style={styles.smallStat}>
            <Text style={styles.smallValue}>{totals.received}</Text>
            <Text style={styles.smallLabel}>Received</Text>
          </View>
          <View style={styles.smallStat}>
            <Text
              style={[
                styles.smallValue,
                totals.found > 0 && {color: '#B45309'},
              ]}>
              {totals.found}
            </Text>
            <Text style={styles.smallLabel}>Unrecorded</Text>
          </View>
        </View>
      </View>

      {totals.found > 0 ? (
        <View style={styles.notice}>
          <Ionicons name="warning-outline" color="#B45309" size={17} />
          <Text style={styles.noticeText}>
            Unrecorded stock found. Record deliveries when they arrive.
          </Text>
        </View>
      ) : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <View style={styles.tabs}>
        {(['day', 'item'] as Tab[]).map(value => (
          <TouchableOpacity
            key={value}
            style={[styles.tab, tab === value && styles.activeTab]}
            onPress={() => setTab(value)}>
            <Text
              style={[styles.tabText, tab === value && styles.activeTabText]}>
              {value === 'day' ? 'By day' : 'By item'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={{marginTop: 50}}
          color={Colors.orange}
          size="large"
        />
      ) : (
        <FlatList
          data={tab === 'day' ? dayRows : itemRows}
          keyExtractor={item => item.key}
          renderItem={tab === 'day' ? renderDay : renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isFetching}
              onRefresh={refresh}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No sales movement for this period.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.lightBg},
  filters: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  monthButton: {padding: 7, borderRadius: 8, backgroundColor: '#F1F3F5'},
  monthLabel: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 14,
  },
  disabled: {opacity: 0.35},
  summary: {
    margin: 12,
    flexDirection: 'row',
    backgroundColor: Colors.darkButton,
    borderRadius: 14,
    padding: 16,
  },
  primaryStat: {flex: 1},
  primaryLabel: {color: '#D1D5DB', fontFamily: Fonts.medium, fontSize: 11},
  primaryValue: {color: Colors.white, fontFamily: Fonts.bold, fontSize: 30},
  primaryMoney: {
    color: Colors.orange,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  secondaryStats: {flexDirection: 'row', flex: 1, alignItems: 'center'},
  smallStat: {flex: 1, alignItems: 'center'},
  smallValue: {color: Colors.white, fontFamily: Fonts.bold, fontSize: 20},
  smallLabel: {color: '#D1D5DB', fontFamily: Fonts.regular, fontSize: 9},
  notice: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#FFF4E5',
    borderRadius: 9,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  noticeText: {
    flex: 1,
    color: '#92400E',
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  error: {
    color: '#B91C1C',
    textAlign: 'center',
    fontFamily: Fonts.medium,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  tabs: {flexDirection: 'row', marginHorizontal: 12, gap: 8},
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    backgroundColor: Colors.white,
    borderRadius: 9,
  },
  activeTab: {backgroundColor: Colors.orange},
  tabText: {color: Colors.gray, fontFamily: Fonts.medium, fontSize: 12},
  activeTabText: {color: Colors.white},
  list: {padding: 12, paddingBottom: 110},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 13,
    marginBottom: 9,
  },
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: 10},
  dateBadge: {
    width: 42,
    height: 45,
    backgroundColor: '#FFF1E0',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {fontFamily: Fonts.bold, color: Colors.orange, fontSize: 16},
  dateMonth: {
    fontFamily: Fonts.medium,
    color: Colors.gray,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  itemIcon: {
    width: 38,
    height: 38,
    backgroundColor: Colors.darkButton,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 12,
  },
  cardSub: {
    fontFamily: Fonts.regular,
    color: Colors.gray,
    fontSize: 10,
    marginTop: 2,
  },
  value: {fontFamily: Fonts.semiBold, color: '#15803D', fontSize: 13},
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 11,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  metric: {fontFamily: Fonts.regular, color: Colors.gray, fontSize: 10},
  metricValue: {fontFamily: Fonts.semiBold, color: Colors.darkButton},
  warningText: {color: '#B45309'},
  warning: {
    marginTop: 9,
    backgroundColor: '#FFF4E5',
    borderRadius: 7,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  warningCopy: {
    flex: 1,
    color: '#92400E',
    fontFamily: Fonts.regular,
    fontSize: 9,
  },
  empty: {
    textAlign: 'center',
    color: Colors.gray,
    fontFamily: Fonts.regular,
    marginTop: 45,
  },
});

export default MySalesScreen;
