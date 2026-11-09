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
  MovementType,
  ROUTE_FOR_TYPE,
  correctingLine,
  entryFigures,
  entryItemNames,
  useCancelStockEntry,
} from '../../../components/Promoter/Stock/stockCorrection';
import ConfirmSaveSheet, {
  ConfirmRow,
  ConfirmSpec,
} from '../../../components/ui/ConfirmSaveSheet';
import {confirmHeader, typoWarnings} from '../../../utils/confirmChecks';
import {StockHistoryEntry} from '../../../types/baseType';
import {
  STOCK_SCREENS,
  StockScreenIcon,
} from '../../../components/Promoter/Stock/stockScreens';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {
  useCorrectCustomerReturnMutation,
  useCorrectStockReturnMutation,
  useGetCustomerReturnsQuery,
  useGetStockReturnsQuery,
  useGetStoreStockStatusQuery,
  useRecordCustomerReturnMutation,
  useRecordStockReturnMutation,
} from '../../../features/base/promoter-base-api';
import {useStockStores} from '../../../hooks/useStockStores';
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

const StockReturnScreen = ({navigation, route, mode}: Props & {mode: Mode}) => {
  const [tab, setTab] = useState<Tab>('record');
  const [store, setStore] = useState(route?.params?.store ?? '');
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  // The History entry being corrected; null while recording a new one.
  const [correcting, setCorrecting] = useState<StockHistoryEntry | null>(null);
  const [confirm, setConfirm] = useState<ConfirmSpec | null>(null);
  // The server's refusal, kept on the form with what was typed.
  const [formError, setFormError] = useState('');
  const isCustomer = mode === 'customer';
  const ownType: MovementType = isCustomer ? 'customer_return' : 'return';

  const {data: storesResponse} = useStockStores();
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

  const startCorrecting = (entry: StockHistoryEntry) => {
    const figures = entryFigures(entry, ownType);
    setCorrecting(entry);
    setStore(entry.store);
    setQuantities(
      Object.fromEntries(
        Object.entries(figures).map(([key, qty]) => [key, String(qty)]),
      ),
    );
    setReason(entry.reason ?? '');
    setRemarks(entry.remarks ?? '');
    setSearch('');
    setFormError('');
    setTab('record');
  };

  const resetForm = () => {
    setCorrecting(null);
    setQuantities({});
    setReason('');
    setRemarks('');
    setFormError('');
  };

  // Opened from another screen's History to correct one of these entries.
  const routeStore = route?.params?.store;
  const routeCorrect = route?.params?.correct;
  useEffect(() => {
    if (routeCorrect) {
      startCorrecting(routeCorrect);
    } else if (routeStore) {
      setStore(routeStore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeCorrect, routeStore]);

  const onCorrect = (entry: StockHistoryEntry, type: MovementType) => {
    if (type === ownType) {
      startCorrecting(entry);
    } else {
      navigation.navigate(ROUTE_FOR_TYPE[type] as any, {
        store: entry.store,
        correct: entry,
      });
    }
  };

  const {data: stockResponse, isFetching: stockLoading} =
    useGetStoreStockStatusQuery({store}, {skip: !store});
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
  const [correctReturn, {isLoading: correctingDistributor}] =
    useCorrectStockReturnMutation();
  const [correctCustomerReturn, {isLoading: correctingCustomer}] =
    useCorrectCustomerReturnMutation();
  const saving =
    savingDistributor ||
    savingCustomer ||
    correctingDistributor ||
    correctingCustomer;
  const cancelSpec = useCancelStockEntry();

  const originalFigures = useMemo(
    () => (correcting ? entryFigures(correcting, ownType) : {}),
    [correcting, ownType],
  );

  const items = useMemo(() => {
    const listed = stockResponse?.message?.all_items ?? [];
    // An item on the entry but no longer listed for the store stays editable.
    const names = correcting ? entryItemNames(correcting) : {};
    const extra = Array.from(
      new Set(Object.keys(originalFigures).map(key => key.split('|')[0])),
    )
      .filter(code => !listed.some(item => item.item_code === code))
      .map(code => ({
        item_code: code,
        item_name: names[code] ?? code,
      })) as any[];
    const all = [...listed, ...extra];
    const q = search.trim().toLowerCase();
    if (!q) {
      return all;
    }
    return all.filter(
      item =>
        item.item_name?.toLowerCase().includes(q) ||
        item.item_code?.toLowerCase().includes(q),
    );
  }, [stockResponse, search, correcting, originalFigures]);

  const itemName = (itemCode: string) =>
    stockResponse?.message?.all_items?.find(i => i.item_code === itemCode)
      ?.item_name ??
    (correcting ? entryItemNames(correcting)[itemCode] : undefined) ??
    itemCode;

  const storeName =
    storeOptions.find(option => option.value === store)?.label ??
    correcting?.store_name ??
    store;

  const apiReasons: string[] | undefined = (
    isCustomer ? customerResponse : distributorResponse
  )?.message?.data?.reasons;
  const baseReasons = apiReasons?.length ? apiReasons : FALLBACK_REASONS[mode];
  // A corrected entry keeps its reason selectable even if no longer listed.
  const reasons =
    reason && !baseReasons.includes(reason)
      ? [reason, ...baseReasons]
      : baseReasons;

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

  // Refusals stay on the form, next to what was typed.
  const showSaveError = (result: any) => {
    setConfirm(null);
    setFormError(
      getSafeServerMessage(result?.message) ??
        'Could not save. Please try again later.',
    );
  };

  const onSaved = (result: any, fallback = 'Return saved') => {
    setConfirm(null);
    Toast.show({
      type: result?.data === null ? 'info' : 'success',
      text1: getSafeServerMessage(result?.message) ?? fallback,
    });
    resetForm();
    setTab('history');
  };

  const onThrown = (error: any) => {
    setConfirm(null);
    setFormError(getUserFacingError(error, 'Could not save the return.'));
  };

  // A correction refused because someone corrected it first: History has
  // the current version.
  const alreadyCorrected = (result: any) => {
    if (!/already corrected/i.test(result?.message ?? '')) {
      return false;
    }
    setConfirm(null);
    Toast.show({
      type: 'error',
      text1: 'Already corrected',
      text2: getSafeServerMessage(result?.message),
    });
    resetForm();
    setTab('history');
    return true;
  };

  const extras = () => ({
    store: store || undefined,
    ...(reason ? {reason} : {}),
    ...(remarks.trim() ? {remarks: remarks.trim()} : {}),
  });

  const typedQty = (key: string) => {
    const n = Number(quantities[key] ?? '');
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const sendCustomer = async (
    rows: {item_code: string; can_sell: number; cant_sell: number}[],
  ) => {
    setFormError('');
    try {
      if (correcting) {
        const response = await correctCustomerReturn({
          name: correcting.name,
          items: rows,
          reason,
          remarks: remarks.trim(),
        }).unwrap();
        const result = response?.message;
        if (!result?.success) {
          if (!alreadyCorrected(result)) {
            showSaveError(result);
          }
          return;
        }
        onSaved(result, 'Customer return corrected');
        return;
      }
      // New: one row per item and condition, as before.
      const newRows = rows.flatMap(row => [
        ...(row.can_sell
          ? [
              {
                item_code: row.item_code,
                qty: row.can_sell,
                condition: 'resaleable' as Condition,
              },
            ]
          : []),
        ...(row.cant_sell
          ? [
              {
                item_code: row.item_code,
                qty: row.cant_sell,
                condition: 'not_resaleable' as Condition,
              },
            ]
          : []),
      ]);
      const response = await recordCustomerReturn({
        ...extras(),
        items: newRows,
      }).unwrap();
      const result = response?.message;
      if (!result?.success) {
        showSaveError(result);
        return;
      }
      onSaved(result);
    } catch (error: any) {
      onThrown(error);
    }
  };

  const sendDistributor = async (rows: {item_code: string; qty: number}[]) => {
    setFormError('');
    try {
      if (correcting) {
        const response = await correctReturn({
          name: correcting.name,
          items: rows,
          reason,
          remarks: remarks.trim(),
        }).unwrap();
        const result = response?.message;
        if (!result?.success) {
          if (!alreadyCorrected(result)) {
            showSaveError(result);
          }
          return;
        }
        onSaved(result, 'Return corrected');
        return;
      }
      const response = await recordReturn({
        ...extras(),
        items: rows,
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
      onThrown(error);
    }
  };

  const confirmBase = (action: string) => ({
    header: confirmHeader(
      correcting ? `${action} · Correction` : action,
      storeName,
      correcting?.posting_date,
    ),
    subheader: correcting ? correctingLine(correcting) : undefined,
    reason: reason || undefined,
    remarks: remarks.trim() || undefined,
  });

  const allZeroWarning = (anyTyped: boolean) =>
    correcting && !anyTyped
      ? ['Every item is 0, so this entry will be cancelled.']
      : [];

  const submitCustomer = () => {
    const codes = new Set<string>();
    [...Object.keys(quantities), ...Object.keys(originalFigures)].forEach(key =>
      codes.add(key.split('|')[0]),
    );
    const rows = Array.from(codes)
      .map(item_code => ({
        item_code,
        can_sell: typedQty(qtyKey(item_code, 'resaleable')),
        cant_sell: typedQty(qtyKey(item_code, 'not_resaleable')),
      }))
      // New entries send only items with a quantity; corrections also send
      // the items taken off (as 0).
      .filter(
        row =>
          row.can_sell ||
          row.cant_sell ||
          (correcting &&
            (originalFigures[qtyKey(row.item_code, 'resaleable')] ||
              originalFigures[qtyKey(row.item_code, 'not_resaleable')])),
      );
    const typed = rows.filter(row => row.can_sell || row.cant_sell);
    if (!typed.length && !correcting) {
      Toast.show({
        type: 'error',
        text1: 'Enter the quantity brought back for at least one item.',
      });
      return;
    }
    const old = (code: string, cond: Condition) =>
      correcting ? originalFigures[qtyKey(code, cond)] ?? 0 : undefined;
    const confirmRows: ConfirmRow[] = rows.map(row => ({
      key: row.item_code,
      name: itemName(row.item_code),
      removed: !!correcting && !row.can_sell && !row.cant_sell,
      figures: [
        {
          label: 'Can sell',
          value: row.can_sell,
          old: old(row.item_code, 'resaleable'),
        },
        {
          label: "Can't sell",
          value: row.cant_sell,
          old: old(row.item_code, 'not_resaleable'),
        },
      ],
    }));
    const canSell = typed.reduce((sum, row) => sum + row.can_sell, 0);
    const cantSell = typed.reduce((sum, row) => sum + row.cant_sell, 0);
    setConfirm({
      ...confirmBase('Customer Return'),
      rows: confirmRows,
      totals: [
        `${typed.length} item(s) · ${canSell + cantSell} pcs`,
        `Can sell ${canSell} · Can't sell ${cantSell}`,
      ],
      warnings: [
        ...allZeroWarning(typed.length > 0),
        ...typoWarnings(
          typed.flatMap(row => [
            {name: `${itemName(row.item_code)} (can sell)`, qty: row.can_sell},
            {
              name: `${itemName(row.item_code)} (can't sell)`,
              qty: row.cant_sell,
            },
          ]),
        ),
      ],
      onConfirm: () => sendCustomer(rows),
    });
  };

  const submitDistributor = () => {
    const codes = new Set([
      ...Object.keys(quantities),
      ...Object.keys(originalFigures),
    ]);
    const rows = Array.from(codes)
      .map(item_code => ({item_code, qty: typedQty(item_code)}))
      .filter(row => row.qty || (correcting && originalFigures[row.item_code]));
    const typed = rows.filter(row => row.qty);
    if (!typed.length && !correcting) {
      Toast.show({
        type: 'error',
        text1: 'Enter the quantity going back for at least one item.',
      });
      return;
    }
    const confirmRows: ConfirmRow[] = rows.map(row => ({
      key: row.item_code,
      name: itemName(row.item_code),
      removed: !!correcting && !row.qty,
      figures: [
        {
          value: row.qty,
          old: correcting ? originalFigures[row.item_code] ?? 0 : undefined,
        },
      ],
    }));
    setConfirm({
      ...confirmBase('Store Return'),
      rows: confirmRows,
      totals: [
        `${typed.length} item(s) · ${typed.reduce(
          (s2, r) => s2 + r.qty,
          0,
        )} pcs`,
      ],
      warnings: [
        ...allZeroWarning(typed.length > 0),
        ...typoWarnings(
          typed.map(row => ({name: itemName(row.item_code), qty: row.qty})),
        ),
      ],
      onConfirm: () => sendDistributor(rows),
    });
  };

  const submit = isCustomer ? submitCustomer : submitDistributor;

  const cancelEntry = () => {
    if (!correcting) {
      return;
    }
    setConfirm(
      cancelSpec(correcting, ownType, result => {
        setConfirm(null);
        if (result.ok) {
          Toast.show({type: 'success', text1: result.message});
          resetForm();
          setTab('history');
        } else {
          setFormError(result.message);
        }
      }),
    );
  };

  const renderRecord = () => (
    <View style={{flex: 1}}>
      {correcting ? (
        <View style={styles.correctingBar}>
          <Text style={styles.correctingText}>
            {correctingLine(correcting)}
          </Text>
          <TouchableOpacity onPress={resetForm} hitSlop={8}>
            <Ionicons name="close" size={18} color="#1D4ED8" />
          </TouchableOpacity>
        </View>
      ) : null}
      <Text style={styles.modeHint}>
        {isCustomer
          ? "Can sell goes back on the shelf. Can't sell is kept aside to send back to the distributor."
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
          renderItem={({item}) => {
            const cantSell = Number(item.cant_sell_stock ?? 0);
            const canSell = Number(
              item.can_sell_stock ?? Number(item.current_stock ?? 0) - cantSell,
            );
            // Correcting a store return puts its pieces back first.
            const maxReturn =
              Number(item.current_stock ?? 0) +
              (correcting ? originalFigures[item.item_code] ?? 0 : 0);
            return (
              <View style={styles.itemRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  {isCustomer && cantSell > 0 ? (
                    <Text style={styles.itemMeta} numberOfLines={1}>
                      Can sell: <Text style={styles.stockCount}>{canSell}</Text>
                      {' · '}
                      <Text style={styles.cantSellText}>
                        Can't sell: {cantSell}
                      </Text>
                    </Text>
                  ) : (
                    <Text style={styles.itemMeta} numberOfLines={1}>
                      Current stock:{' '}
                      <Text style={styles.stockCount}>
                        {item.current_stock ?? 0}
                      </Text>
                    </Text>
                  )}
                  {!isCustomer && cantSell > 0 ? (
                    <Text style={styles.cantSellText} numberOfLines={1}>
                      Can't sell: {cantSell}
                    </Text>
                  ) : null}
                </View>
                {isCustomer ? (
                  <View style={styles.conditionInputs}>
                    {CONDITIONS.map(({value, label}) => (
                      <View key={value} style={styles.conditionCol}>
                        <Text
                          style={[
                            styles.conditionLabel,
                            value === 'not_resaleable' &&
                              styles.unsellableLabel,
                          ]}>
                          {label}
                        </Text>
                        <TextInput
                          style={[styles.qtyInput, styles.qtyInputSmall]}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={Colors.gray}
                          value={
                            quantities[qtyKey(item.item_code, value)] ?? ''
                          }
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
                      setQty(qtyKey(item.item_code), value, maxReturn)
                    }
                  />
                )}
              </View>
            );
          }}
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
        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        <View style={styles.buttonRow}>
          {correcting ? (
            <TouchableOpacity
              style={[styles.dangerButton, saving && styles.disabled]}
              disabled={saving}
              onPress={cancelEntry}>
              <Text style={styles.dangerButtonText}>Cancel Entry</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.disabled]}
            disabled={saving}
            onPress={submit}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {correcting
                  ? 'Save Correction'
                  : isCustomer
                  ? 'Save Customer Return'
                  : 'Save Return to Distributor'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ConfirmSaveSheet spec={confirm} onEdit={() => setConfirm(null)} />
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
          // A correction stays on the entry's store.
          disabled={!!correcting}
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
                ? correcting
                  ? 'Correct Entry'
                  : isCustomer
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
          onCorrect={onCorrect}
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
  buttonRow: {flexDirection: 'row', gap: 10, marginTop: 12},
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 13,
  },
  dangerButton: {
    flex: 1,
    backgroundColor: '#FBE8E8',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 13,
  },
  dangerButtonText: {fontFamily: Fonts.semiBold, color: '#B91C1C'},
  correctingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  correctingText: {fontFamily: Fonts.semiBold, color: '#1D4ED8', fontSize: 12},
  cantSellText: {
    fontFamily: Fonts.medium,
    color: '#B45309',
    fontSize: 11,
    marginTop: 2,
  },
  formError: {
    marginTop: 10,
    color: '#B91C1C',
    fontFamily: Fonts.medium,
    fontSize: 12,
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
