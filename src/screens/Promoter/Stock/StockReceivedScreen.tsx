/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import PageHeader from '../../../components/ui/PageHeader';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {
  useCancelStockReceivedMutation,
  useGetEmployeeAssignedStoresQuery,
  useGetStockReceivedQuery,
  useGetStoreStockStatusQuery,
  useRecordStockReceivedMutation,
} from '../../../features/base/promoter-base-api';
import {
  getSafeServerMessage,
  getUserFacingError,
} from '../../../utils/errorMessage';

type Props = NativeStackScreenProps<
  PromoterAppStackParamList,
  'StockReceivedScreen'
>;
type Tab = 'record' | 'history';

const StockReceivedScreen = ({navigation}: Props) => {
  const [tab, setTab] = useState<Tab>('record');
  const [store, setStore] = useState('');
  const [search, setSearch] = useState('');
  const [remarks, setRemarks] = useState('');
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

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
  const {
    data: historyResponse,
    isFetching: historyLoading,
    refetch: refetchHistory,
  } = useGetStockReceivedQuery({store: store || undefined});
  const [recordStock, {isLoading: saving}] = useRecordStockReceivedMutation();
  const [cancelStock, {isLoading: cancelling}] =
    useCancelStockReceivedMutation();

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

  const entries = historyResponse?.message?.data?.entries ?? [];
  const businessError =
    historyResponse?.message?.success === false
      ? getSafeServerMessage(historyResponse?.message?.message)
      : undefined;

  const setQty = (itemCode: string, value: string) => {
    const clean = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setQuantities(prev => ({...prev, [itemCode]: clean}));
  };

  const submit = async () => {
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
    try {
      const response = await recordStock({
        store: store || undefined,
        items: selected,
        ...(remarks.trim() ? {remarks: remarks.trim()} : {}),
      }).unwrap();
      if (!response?.message?.success) {
        Toast.show({
          type: 'error',
          text1:
            getSafeServerMessage(response?.message?.message) ??
            'Could not record stock received',
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1:
          getSafeServerMessage(response.message.message) ??
          'Stock received recorded',
      });
      setQuantities({});
      setRemarks('');
      setTab('history');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(error, 'Could not record stock received'),
      });
    }
  };

  const doCancel = async (name: string) => {
    try {
      const response = await cancelStock({name}).unwrap();
      if (!response?.message?.success) {
        Toast.show({
          type: 'error',
          text1:
            getSafeServerMessage(response?.message?.message) ??
            'Could not cancel delivery',
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: response.message.message || 'Delivery cancelled',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(error, 'Could not cancel delivery'),
      });
    }
  };

  const confirmCancel = (name: string) =>
    Alert.alert(
      'Cancel delivery?',
      'The received stock will be removed. To correct a quantity, cancel and record it again.',
      [
        {text: 'Keep', style: 'cancel'},
        {
          text: 'Cancel delivery',
          style: 'destructive',
          onPress: () => doCancel(name),
        },
      ],
    );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await refetchHistory();
    } finally {
      setRefreshing(false);
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
                  {item.item_code} · Current: {item.current_stock ?? 0}
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
          ListFooterComponent={
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
                  <Text style={styles.primaryButtonText}>
                    Record Stock Received
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No active stock items found.</Text>
          }
        />
      )}
    </View>
  );

  const renderHistory = () => (
    <FlatList
      data={entries}
      keyExtractor={entry => entry.name}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        businessError ? (
          <Text style={styles.errorText}>{businessError}</Text>
        ) : null
      }
      ListEmptyComponent={
        historyLoading ? (
          <ActivityIndicator style={styles.loader} color={Colors.orange} />
        ) : (
          <Text style={styles.empty}>
            No deliveries recorded for this store.
          </Text>
        )
      }
      renderItem={({item: entry}) => (
        <View style={styles.receiptCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.receiptName}>
                {entry.store_name || entry.store}
              </Text>
              <Text style={styles.itemMeta}>
                {moment(entry.posting_date).format('DD MMM YYYY')} ·{' '}
                {entry.posting_time}
              </Text>
            </View>
            {entry.can_cancel ? (
              <TouchableOpacity
                disabled={cancelling}
                onPress={() => confirmCancel(entry.name)}
                style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {entry.items?.map((item: any) => (
            <View key={item.item_code} style={styles.receiptItem}>
              <Text style={styles.receiptItemName} numberOfLines={2}>
                {item.item_name || item.item_code}
              </Text>
              <Text style={styles.receiptQty}>+{item.qty}</Text>
            </View>
          ))}
          <Text style={styles.reference}>
            {entry.name} · {entry.recorded_by}
          </Text>
        </View>
      )}
    />
  );

  return (
    <SafeAreaView style={styles.screen}>
      <PageHeader
        title="Stock Received"
        navigation={() => navigation.goBack()}
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
              {value === 'record' ? 'Record Delivery' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'record' ? renderRecord() : renderHistory()}
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
    fontFamily: Fonts.regular,
    color: Colors.gray,
    fontSize: 10,
    marginTop: 3,
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
    marginTop: 4,
    padding: 14,
    borderRadius: 10,
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
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  receiptName: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: '#FBE8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cancelText: {fontFamily: Fonts.semiBold, color: '#B91C1C', fontSize: 11},
  receiptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  receiptItemName: {
    flex: 1,
    color: Colors.darkButton,
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  receiptQty: {color: '#15803D', fontFamily: Fonts.semiBold},
  reference: {
    color: Colors.gray,
    fontFamily: Fonts.regular,
    fontSize: 9,
    marginTop: 8,
  },
});

export default StockReceivedScreen;
