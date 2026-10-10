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
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {
  useGetEmployeeAssignedStoresQuery,
  useGetStockReturnsQuery,
  useGetStoreStockStatusQuery,
  useRecordStockReturnMutation,
} from '../../../features/base/promoter-base-api';
import {
  getSafeServerMessage,
  getUserFacingError,
} from '../../../utils/errorMessage';

type NavigationProp = NativeStackScreenProps<
  PromoterAppStackParamList,
  'StockReturnScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
type Tab = 'record' | 'history';

const StockReturnScreen = ({navigation}: Props) => {
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
  // Only needed here for the reason picker; history has its own list.
  const {data: historyResponse} = useGetStockReturnsQuery({
    store: store || undefined,
  });
  const [recordReturn, {isLoading: saving}] = useRecordStockReturnMutation();

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

  const reasons: string[] = historyResponse?.message?.data?.reasons ?? [];

  const setQty = (itemCode: string, value: string) => {
    setQuantities(prev => ({
      ...prev,
      [itemCode]: value.replace(/[^0-9]/g, ''),
    }));
  };

  const submit = async () => {
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
        store: store || undefined,
        items: selected,
        ...(reason ? {reason} : {}),
        ...(remarks.trim() ? {remarks: remarks.trim()} : {}),
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
        Toast.show({
          type: 'error',
          text1: 'Could not record return',
          text2:
            getSafeServerMessage(result?.message) ?? 'Please try again later.',
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: getSafeServerMessage(result.message) ?? 'Return saved',
      });
      setQuantities({});
      setReason('');
      setRemarks('');
      setTab('history');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(error, 'Could not record return'),
      });
    }
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
                keyboardType="number-pad"
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
        {reasons.length > 0 ? (
          <>
            <Text style={styles.fieldLabel}>Reason</Text>
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
          placeholder="Who picked it up, batch, etc."
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
            <Text style={styles.primaryButtonText}>Save Return</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <PageHeader
        title="Return Stock"
        navigation={() => navigation.navigation.goBack()}
      />
      <View style={styles.storePicker}>
        <ReusableDropdown
          placeholder="Select store"
          data={storeOptions}
          value={store}
          onChange={value => {
            setStore(value);
            setQuantities({});
          }}
          error={false}
          field="label"
          label=""
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
              {value === 'record' ? 'New Return' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'record' ? (
        renderRecord()
      ) : (
        <StockMovementHistory store={store} defaultFilter="return" />
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

export default StockReturnScreen;
