/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PageHeader from '../../../components/ui/PageHeader';
import StockMovementHistory from '../../../components/Promoter/Stock/StockMovementHistory';
import {
  STOCK_SCREENS,
  StockScreenIcon,
} from '../../../components/Promoter/Stock/stockScreens';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {
  useGetCustomerReturnsQuery,
  useGetEmployeeAssignedStoresQuery,
  useGetStockReturnsQuery,
  useGetStoreStockStatusQuery,
  useRecordCustomerReturnMutation,
  useRecordStockReturnMutation,
} from '../../../features/base/promoter-base-api';
import {
  getSafeServerMessage,
  getUserFacingError,
} from '../../../utils/errorMessage';

type Props = NativeStackScreenProps<
  PromoterAppStackParamList,
  'CustomerReturnScreen' | 'DistributorReturnScreen'
>;
type Tab = 'record' | 'history';
// customer: shopper brings stock back (+qty). distributor: store sends it away (−qty).
type Mode = 'customer' | 'distributor';
type Condition = 'resaleable' | 'not_resaleable';

const CONDITIONS: {value: Condition; label: string}[] = [
  {value: 'resaleable', label: 'Can sell'},
  {value: 'not_resaleable', label: "Can't sell"},
];

// Used only if the API sends no reasons list.
const FALLBACK_REASONS: Record<Mode, string[]> = {
  customer: [
    'Damaged or defective',
    'Expired',
    'Wrong item bought',
    'Customer changed mind',
    'Other',
  ],
  distributor: [
    'Expired',
    'Near expiry',
    'Damaged',
    'Not selling',
    'Wrong item',
    'Other',
  ],
};

// Customer-return quantities are kept per item and condition.
const qtyKey = (itemCode: string, condition?: Condition) =>
  condition ? `${itemCode}|${condition}` : itemCode;

const StockReturnScreen = ({navigation, mode}: Props & {mode: Mode}) => {
  const [tab, setTab] = useState<Tab>('record');
  const [store, setStore] = useState('');
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('');
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

  useEffect(() => {
    if (!store && stores.length > 0) {
      setStore(stores[0].store_id);
    }
  }, [store, stores]);

  const {data: stockResponse, isFetching: stockLoading} =
    useGetStoreStockStatusQuery({store}, {skip: !store});
  const isCustomer = mode === 'customer';
  // Only needed here for the reason picker; history has its own list.
  const {data: distributorResponse} = useGetStockReturnsQuery(
    {store: store || undefined},
    {skip: isCustomer},
  );
  const {data: customerResponse} = useGetCustomerReturnsQuery(
    {store: store || undefined},
    {skip: !isCustomer},
  );
  const [recordReturn, {isLoading: savingDistributor}] =
    useRecordStockReturnMutation();
  const [recordCustomerReturn, {isLoading: savingCustomer}] =
    useRecordCustomerReturnMutation();
  const saving = savingDistributor || savingCustomer;

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

  const apiReasons: string[] | undefined = (
    isCustomer ? customerResponse : distributorResponse
  )?.message?.data?.reasons;
  const reasons = apiReasons?.length ? apiReasons : FALLBACK_REASONS[mode];

  const setQty = (key: string, value: string, maxQty?: number) => {
    let clean = value.replace(/[^0-9]/g, '');
    // Can't send back more than the store holds.
    if (maxQty != null && clean !== '' && Number(clean) > maxQty) {
      clean = String(Math.max(maxQty, 0));
      Toast.show({
        type: 'error',
        text1: `Only ${Math.max(maxQty, 0)} in stock`,
        text2: 'Count the item first if this figure is out of date.',
      });
    }
    setQuantities(prev => ({...prev, [key]: clean}));
  };

  const showSaveError = (result: any) => {
    Toast.show({
      type: 'error',
      text1: 'Could not record return',
      text2: getSafeServerMessage(result?.message) ?? 'Please try again later.',
    });
  };

  const onSaved = (result: any) => {
    Toast.show({
      type: 'success',
      text1: getSafeServerMessage(result?.message) ?? 'Return saved',
    });
    setQuantities({});
    setReason('');
    setRemarks('');
    setTab('history');
  };

  const extras = () => ({
    store: store || undefined,
    ...(reason ? {reason} : {}),
    ...(remarks.trim() ? {remarks: remarks.trim()} : {}),
  });

  const submitCustomer = async () => {
    const selected = Object.entries(quantities)
      .map(([key, qty]) => {
        const [item_code, condition] = key.split('|');
        return {item_code, qty: Number(qty), condition: condition as Condition};
      })
      .filter(row => Number.isFinite(row.qty) && row.qty > 0);
    if (!selected.length) {
      Toast.show({
        type: 'error',
        text1: 'Enter the quantity brought back for at least one item.',
      });
      return;
    }
    try {
      const response = await recordCustomerReturn({
        ...extras(),
        items: selected,
      }).unwrap();
      const result = response?.message;
      if (!result?.success) {
        showSaveError(result);
        return;
      }
      onSaved(result);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(error, 'Could not record return'),
      });
    }
  };

  const submitDistributor = async () => {
    const selected = Object.entries(quantities)
      .map(([item_code, qty]) => ({item_code, qty: Number(qty)}))
      .filter(row => Number.isFinite(row.qty) && row.qty > 0);
    if (!selected.length) {
      Toast.show({
        type: 'error',
        text1: 'Enter the quantity going back for at least one item.',
      });
      return;
    }
    try {
      const response = await recordReturn({
        ...extras(),
        items: selected,
      }).unwrap();
      const result = response?.message;
      if (!result?.success) {
        // Store holds less than requested: prefill what is actually there.
        if (
          result?.error_code === 'NOT_ENOUGH_STOCK' &&
          result?.data?.item_code &&
          result?.data?.available != null
        ) {
          setQuantities(prev => ({
            ...prev,
            [result.data.item_code]: String(result.data.available),
          }));
        }
        showSaveError(result);
        return;
      }
      onSaved(result);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(error, 'Could not record return'),
      });
    }
  };

  const submit = isCustomer ? submitCustomer : submitDistributor;

  const renderRecord = () => (
    <View style={{flex: 1}}>
      <Text style={styles.modeHint}>
        {isCustomer
          ? 'A shopper brought it back. It is added to store stock.'
          : 'The store sends it away. It is taken out of store stock.'}
      </Text>
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
              {isCustomer ? (
                <View style={styles.conditionInputs}>
                  {CONDITIONS.map(({value, label}) => (
                    <View key={value} style={styles.conditionCol}>
                      <Text
                        style={[
                          styles.conditionLabel,
                          value === 'not_resaleable' && styles.unsellableLabel,
                        ]}>
                        {label}
                      </Text>
                      <TextInput
                        style={[styles.qtyInput, styles.qtyInputSmall]}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={Colors.gray}
                        value={quantities[qtyKey(item.item_code, value)] ?? ''}
                        onChangeText={text =>
                          setQty(qtyKey(item.item_code, value), text)
                        }
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="number-pad"
                  placeholder="Qty"
                  placeholderTextColor={Colors.gray}
                  value={quantities[qtyKey(item.item_code)] ?? ''}
                  onChangeText={value =>
                    setQty(
                      qtyKey(item.item_code),
                      value,
                      Number(item.current_stock ?? 0),
                    )
                  }
                />
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No active stock items found.</Text>
          }
        />
      )}
      <View style={styles.footerForm}>
        {reasons.length > 0 ? (
          <>
            <Text style={styles.fieldLabel}>Reason (optional)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reasonRow}>
              {reasons.map(value => {
                const active = reason === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.reasonChip, active && styles.reasonActive]}
                    onPress={() => setReason(active ? '' : value)}>
                    <Text
                      style={[
                        styles.reasonText,
                        active && styles.reasonTextActive,
                      ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        ) : null}
        <Text style={styles.fieldLabel}>Remarks (optional)</Text>
        <TextInput
          style={styles.remarksInput}
          placeholder={
            isCustomer
              ? 'Bill number, etc.'
              : 'Who collected it, challan number'
          }
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
            <Text style={styles.primaryButtonText}>
              {isCustomer
                ? 'Save Customer Return'
                : 'Save Return to Distributor'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const screenKey = isCustomer ? 'customerReturn' : 'distributorReturn';
  const screen = STOCK_SCREENS[screenKey];

  return (
    <SafeAreaView style={styles.screen}>
      <PageHeader
        title={screen.title}
        icon={<StockScreenIcon screen={screenKey} />}
        navigation={() => navigation.goBack()}
      />
      <View style={styles.storePicker}>
        <ReusableDropdown
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
              {value === 'record'
                ? isCustomer
                  ? 'New Customer Return'
                  : 'New Return'
                : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'record' ? (
        renderRecord()
      ) : (
        <StockMovementHistory
          store={store}
          defaultFilter={isCustomer ? 'customer_return' : 'return'}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.lightBg},
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
  modeHint: {
    marginHorizontal: 14,
    marginTop: 6,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    fontSize: 11,
  },
  conditionInputs: {flexDirection: 'row', gap: 6},
  conditionCol: {alignItems: 'center'},
  conditionLabel: {
    fontFamily: Fonts.medium,
    color: '#15803D',
    fontSize: 9,
    marginBottom: 3,
  },
  unsellableLabel: {color: '#B45309'},
  qtyInputSmall: {width: 58},
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
  reasonRow: {gap: 6, paddingBottom: 10},
  reasonChip: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.white,
  },
  reasonActive: {
    backgroundColor: Colors.darkButton,
    borderColor: Colors.darkButton,
  },
  reasonText: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: 11,
  },
  reasonTextActive: {color: Colors.white},
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

export const CustomerReturnScreen = (props: Props) => (
  <StockReturnScreen {...props} mode="customer" />
);

export const DistributorReturnScreen = (props: Props) => (
  <StockReturnScreen {...props} mode="distributor" />
);
