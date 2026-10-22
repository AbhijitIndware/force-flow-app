/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import PageHeader from '../../../components/ui/PageHeader';
import {
  STOCK_SCREENS,
  StockScreenIcon,
} from '../../../components/Promoter/Stock/stockScreens';
import StockMovementHistory from '../../../components/Promoter/Stock/StockMovementHistory';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {
  useGetEmployeeAssignedStoresQuery,
  useGetStoreStockStatusQuery,
  useRecordStockReceivedMutation,
} from '../../../features/base/promoter-base-api';
import {
  getSafeServerMessage,
  getUserFacingError,
} from '../../../utils/errorMessage';

// Rendered both as a stack screen and as a bottom-bar tab, so only the
// navigation calls it uses are typed.
type Props = {
  navigation: {goBack: () => void};
  route?: {params?: {store?: string}};
};
type Tab = 'record' | 'history';
type ReceivedRow = {item_code: string; qty: number};

// An earlier delivery the server matched within its 3-day repeat check.
type AlreadyRecorded = {
  kind: 'ddn' | 'store_receipt';
  name: string;
  date: string;
  item_code: string;
  qty: number;
  by?: string;
};

const StockReceivedScreen = ({navigation, route}: Props) => {
  const [tab, setTab] = useState<Tab>('record');
  const [store, setStore] = useState(route?.params?.store ?? '');
  const [search, setSearch] = useState('');
  const [remarks, setRemarks] = useState('');
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const {data: storesResponse} = useGetEmployeeAssignedStoresQuery();
  const stores = useMemo(
    () => storesResponse?.message?.data?.stores ?? [],
    [storesResponse],
  );
  const storeOptions = useMemo(
    () => stores.map(s => ({label: s.store_name, value: s.store_id})),
    [stores],
  );

  // Opened from Count Stock for a specific store.
  const routeStore = route?.params?.store;
  useEffect(() => {
    if (routeStore) {
      setStore(routeStore);
    }
  }, [routeStore]);

  useEffect(() => {
    if (!store && stores.length > 0) {
      setStore(stores[0].store_id);
    }
  }, [store, stores]);

  const {data: stockResponse, isFetching: stockLoading} =
    useGetStoreStockStatusQuery({store}, {skip: !store});
  const [recordStock, {isLoading: saving}] = useRecordStockReceivedMutation();

  const items = useMemo(() => {
    const all = stockResponse?.message?.all_items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) {
      return all;
    }
    return all.filter(
      item =>
        item.item_name?.toLowerCase().includes(q) ||
        item.item_code?.toLowerCase().includes(q),
    );
  }, [stockResponse, search]);

  const setQty = (itemCode: string, value: string) => {
    const clean = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setQuantities(prev => ({...prev, [itemCode]: clean}));
  };

  const finish = (savedSomething: boolean) => {
    setQuantities({});
    setRemarks('');
    if (savedSomething) {
      setTab('history');
    }
  };

  const itemName = (itemCode: string) =>
    stockResponse?.message?.all_items?.find(i => i.item_code === itemCode)
      ?.item_name ?? itemCode;

  // The server skips items matching a delivery recorded for this store in
  // the last 3 days. Let the promoter say whether this is a second delivery.
  const askAboutRepeat = (
    rows: ReceivedRow[],
    result: any,
    already: AlreadyRecorded[],
  ) => {
    const savedSome = !!result?.success;
    const repeatCodes = new Set(already.map(a => a.item_code));
    // Resend only what was left out, so nothing already saved is added twice.
    const leftOut = result?.duplicate
      ? rows
      : rows.filter(row => repeatCodes.has(row.item_code));
    const earlier = already.map(a => {
      const source =
        a.kind === 'ddn' ? 'distributor delivery note' : STOCK_SCREENS.receive.title;
      const by = a.by ? ` by ${a.by}` : '';
      return `• ${itemName(a.item_code)}: ${a.qty}${by} on ${moment(
        a.date,
      ).format('DD MMM')} (${source})`;
    });
    Alert.alert(
      'Already recorded?',
      [
        getSafeServerMessage(result?.message) ??
          'This delivery looks like one already recorded.',
        ...(earlier.length ? ['', ...earlier] : []),
      ].join('\n'),
      [
        {
          text: "It's the same delivery",
          style: 'cancel',
          onPress: () => finish(savedSome),
        },
        {
          text: 'This is another delivery',
          onPress: () =>
            leftOut.length ? save(leftOut, true) : finish(savedSome),
        },
      ],
      {cancelable: false},
    );
  };

  const save = async (rows: ReceivedRow[], confirmDuplicate = false) => {
    try {
      const response = await recordStock({
        store: store || undefined,
        items: rows,
        ...(remarks.trim() ? {remarks: remarks.trim()} : {}),
        ...(confirmDuplicate ? {confirm_duplicate: 1 as const} : {}),
      }).unwrap();
      const result = response?.message;
      const already: AlreadyRecorded[] = result?.data?.already ?? [];
      if (!confirmDuplicate && (result?.duplicate || already.length > 0)) {
        askAboutRepeat(rows, result, already);
        return;
      }
      if (!result?.success) {
        Toast.show({
          type: 'error',
          text1:
            getSafeServerMessage(result?.message) ??
            'Could not record stock received',
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: getSafeServerMessage(result.message) ?? 'Delivery saved',
      });
      finish(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(error, 'Could not record stock received'),
      });
    }
  };

  const submit = () => {
    const selected = Object.entries(quantities)
      .map(([item_code, qty]) => ({item_code, qty: Number(qty)}))
      .filter(row => Number.isFinite(row.qty) && row.qty > 0);
    if (!selected.length) {
      Toast.show({
        type: 'error',
        text1: 'Enter the quantity received for at least one item.',
      });
      return;
    }
    save(selected);
  };

  const renderRecord = () => (
    <View style={{flex: 1}}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={17} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search item name or code"
          placeholderTextColor={Colors.gray}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {stockResponse?.message?.warning ? (
        <Text style={styles.errorText}>{stockResponse.message.warning}</Text>
      ) : null}
      {stockLoading ? (
        <ActivityIndicator style={styles.loader} color={Colors.orange} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.item_code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <View style={styles.itemRow}>
              <View style={{flex: 1}}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  Current stock:{' '}
                  <Text style={styles.stockCount}>
                    {item.current_stock ?? 0}
                  </Text>
                </Text>
              </View>
              <TextInput
                style={styles.qtyInput}
                keyboardType="decimal-pad"
                placeholder="Qty"
                placeholderTextColor={Colors.gray}
                value={quantities[item.item_code] ?? ''}
                onChangeText={value => setQty(item.item_code, value)}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No active stock items found.</Text>
          }
        />
      )}
      <View style={styles.footerForm}>
        <Text style={styles.fieldLabel}>Remarks (optional)</Text>
        <TextInput
          style={styles.remarksInput}
          placeholder="Challan or invoice number"
          placeholderTextColor={Colors.gray}
          value={remarks}
          onChangeText={setRemarks}
        />
        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.disabled]}
          disabled={saving}
          onPress={submit}>
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Save Delivery</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <PageHeader
        title={STOCK_SCREENS.receive.title}
        icon={<StockScreenIcon screen="receive" />}
        navigation={() => navigation.goBack()}
      />
      <Text style={styles.screenHint}>Enter goods delivered to your store.</Text>
      <View style={styles.storePicker}>
        <ReusableDropdown
          // The dropdown prefixes "Select ", so this reads "Select store".
          placeholder="store"
          data={storeOptions}
          value={store}
          onChange={value => {
            setStore(value);
            setQuantities({});
          }}
          error={false}
          field="label"
          label="Store"
          selectedLabel={
            storeOptions.find(option => option.value === store)?.label ?? ''
          }
          marginBottom={0}
        />
      </View>
      <View style={styles.tabs}>
        {(['record', 'history'] as Tab[]).map(value => (
          <TouchableOpacity
            key={value}
            style={[styles.tab, tab === value && styles.activeTab]}
            onPress={() => setTab(value)}>
            <Text
              style={[styles.tabText, tab === value && styles.activeTabText]}>
              {value === 'record' ? 'New Delivery' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'record' ? (
        renderRecord()
      ) : (
        <StockMovementHistory store={store} defaultFilter="receipt" />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.lightBg},
  screenHint: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: 12,
  },
  storePicker: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#F1F3F5',
  },
  activeTab: {backgroundColor: Colors.darkButton},
  tabText: {fontFamily: Fonts.medium, color: Colors.gray, fontSize: 12},
  activeTabText: {color: Colors.white},
  searchRow: {
    margin: 12,
    marginBottom: 0,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: Colors.darkButton,
    fontFamily: Fonts.regular,
  },
  listContent: {padding: 12, paddingBottom: 40},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
  },
  itemName: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 12,
  },
  itemMeta: {
    fontFamily: Fonts.medium,
    color: '#111827',
    fontSize: 12,
    marginTop: 4,
  },
  stockCount: {
    fontFamily: Fonts.semiBold,
    color: '#111827',
  },
  qtyInput: {
    width: 76,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    textAlign: 'center',
    color: Colors.darkButton,
  },
  footerForm: {
    backgroundColor: Colors.white,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  fieldLabel: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: 12,
    marginBottom: 6,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: Colors.darkButton,
  },
  primaryButton: {
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 13,
    marginTop: 12,
  },
  primaryButtonText: {fontFamily: Fonts.semiBold, color: Colors.white},
  disabled: {opacity: 0.6},
  loader: {marginTop: 40},
  empty: {
    textAlign: 'center',
    color: Colors.gray,
    fontFamily: Fonts.regular,
    marginTop: 40,
  },
  errorText: {
    margin: 12,
    color: '#B91C1C',
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
});

export default StockReceivedScreen;
