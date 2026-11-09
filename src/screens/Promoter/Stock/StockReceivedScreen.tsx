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
import {
  confirmHeader,
  typoWarnings,
  usualPerEntry,
} from '../../../utils/confirmChecks';
import {StockHistoryEntry} from '../../../types/baseType';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {
  useCorrectStockReceivedMutation,
  useGetStockReceivedQuery,
  useGetStoreStockStatusQuery,
  useRecordStockReceivedMutation,
} from '../../../features/base/promoter-base-api';
import {useStockStores} from '../../../hooks/useStockStores';
import {
  getSafeServerMessage,
  getUserFacingError,
} from '../../../utils/errorMessage';

// Rendered both as a stack screen and as a bottom-bar tab, so only the
// navigation calls it uses are typed.
type Props = {
  navigation: {
    goBack: () => void;
    navigate: (route: any, params?: any) => void;
  };
  route?: {params?: {store?: string; correct?: StockHistoryEntry}};
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
  // The History entry being corrected; null while recording a new one.
  const [correcting, setCorrecting] = useState<StockHistoryEntry | null>(null);
  const [confirm, setConfirm] = useState<ConfirmSpec | null>(null);
  // The server's refusal, kept on the form with what was typed.
  const [formError, setFormError] = useState('');

  const {data: storesResponse} = useStockStores();
  const stores = useMemo(
    () => storesResponse?.message?.data?.stores ?? [],
    [storesResponse],
  );
  const storeOptions = useMemo(
    () => stores.map(s => ({label: s.store_name, value: s.store_id})),
    [stores],
  );

  // Opened from another stock screen for a specific store.
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

  const startCorrecting = (entry: StockHistoryEntry) => {
    const figures = entryFigures(entry, 'receipt');
    setCorrecting(entry);
    setStore(entry.store);
    setQuantities(
      Object.fromEntries(
        Object.entries(figures).map(([code, qty]) => [code, String(qty)]),
      ),
    );
    setRemarks(entry.remarks ?? '');
    setSearch('');
    setFormError('');
    setTab('record');
  };

  const stopCorrecting = () => {
    setCorrecting(null);
    setQuantities({});
    setRemarks('');
    setFormError('');
  };

  // Opened from another screen's History to correct a delivery.
  const routeCorrect = route?.params?.correct;
  useEffect(() => {
    if (routeCorrect) {
      startCorrecting(routeCorrect);
    }
  }, [routeCorrect]);

  const onCorrect = (entry: StockHistoryEntry, type: MovementType) => {
    if (type === 'receipt') {
      startCorrecting(entry);
    } else {
      navigation.navigate(ROUTE_FOR_TYPE[type], {
        store: entry.store,
        correct: entry,
      });
    }
  };

  const {data: stockResponse, isFetching: stockLoading} =
    useGetStoreStockStatusQuery({store}, {skip: !store});
  // Same call History makes: used for each item's usual delivery.
  const {data: receivedResponse} = useGetStockReceivedQuery(
    {store: store || undefined},
    {skip: !store},
  );
  const [recordStock, {isLoading: savingNew}] =
    useRecordStockReceivedMutation();
  const [correctStock, {isLoading: savingCorrection}] =
    useCorrectStockReceivedMutation();
  const saving = savingNew || savingCorrection;
  const cancelSpec = useCancelStockEntry();

  const originalFigures = useMemo(
    () => (correcting ? entryFigures(correcting, 'receipt') : {}),
    [correcting],
  );

  const items = useMemo(() => {
    const listed = stockResponse?.message?.all_items ?? [];
    // An item on the entry but no longer listed for the store stays editable.
    const names = correcting ? entryItemNames(correcting) : {};
    const extra = Object.keys(originalFigures)
      .filter(code => !listed.some(item => item.item_code === code))
      .map(code => ({
        item_code: code,
        item_name: names[code] ?? code,
        current_stock: undefined,
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

  const setQty = (itemCode: string, value: string) => {
    const clean = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setQuantities(prev => ({...prev, [itemCode]: clean}));
  };

  const finish = (savedSomething: boolean) => {
    setQuantities({});
    setRemarks('');
    setCorrecting(null);
    setFormError('');
    if (savedSomething) {
      setTab('history');
    }
  };

  const itemName = (itemCode: string) =>
    stockResponse?.message?.all_items?.find(i => i.item_code === itemCode)
      ?.item_name ??
    (correcting ? entryItemNames(correcting)[itemCode] : undefined) ??
    itemCode;

  const storeName =
    storeOptions.find(option => option.value === store)?.label ??
    correcting?.store_name ??
    store;

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
        a.kind === 'ddn'
          ? 'distributor delivery note'
          : STOCK_SCREENS.receive.title;
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
    setFormError('');
    try {
      const response = await recordStock({
        store: store || undefined,
        items: rows,
        ...(remarks.trim() ? {remarks: remarks.trim()} : {}),
        ...(confirmDuplicate ? {confirm_duplicate: 1 as const} : {}),
      }).unwrap();
      const result = response?.message;
      setConfirm(null);
      const already: AlreadyRecorded[] = result?.data?.already ?? [];
      if (!confirmDuplicate && (result?.duplicate || already.length > 0)) {
        askAboutRepeat(rows, result, already);
        return;
      }
      if (!result?.success) {
        setFormError(
          getSafeServerMessage(result?.message) ??
            'Could not record stock received',
        );
        return;
      }
      Toast.show({
        type: 'success',
        text1: getSafeServerMessage(result.message) ?? 'Delivery saved',
      });
      finish(true);
    } catch (error: any) {
      setConfirm(null);
      setFormError(
        getUserFacingError(error, 'Could not record stock received'),
      );
    }
  };

  const saveCorrection = async (rows: ReceivedRow[]) => {
    if (!correcting) {
      return;
    }
    setFormError('');
    try {
      const response = await correctStock({
        name: correcting.name,
        items: rows,
        remarks: remarks.trim(),
      }).unwrap();
      const result = response?.message;
      setConfirm(null);
      const message = getSafeServerMessage(result?.message);
      if (!result?.success) {
        // Corrected by someone else meanwhile: History has the current one.
        if (/already corrected/i.test(result?.message ?? '')) {
          Toast.show({
            type: 'error',
            text1: 'Already corrected',
            text2: message,
          });
          finish(true);
          return;
        }
        setFormError(message ?? 'Could not correct the delivery.');
        return;
      }
      Toast.show({
        type: result.data ? 'success' : 'info',
        text1: message ?? 'Delivery corrected',
      });
      finish(true);
    } catch (error: any) {
      setConfirm(null);
      setFormError(
        getUserFacingError(error, 'Could not correct the delivery.'),
      );
    }
  };

  const submit = () => {
    const typed = Object.entries(quantities)
      .map(([item_code, qty]) => ({item_code, qty: Number(qty)}))
      .filter(row => Number.isFinite(row.qty) && row.qty > 0);
    if (!typed.length && !correcting) {
      Toast.show({
        type: 'error',
        text1: 'Enter the quantity received for at least one item.',
      });
      return;
    }
    // A correction sends the whole entry: items taken off go as 0, and all
    // at 0 cancels it.
    const removedCodes = Object.keys(originalFigures).filter(
      code => !typed.some(row => row.item_code === code),
    );
    const rows: ReceivedRow[] = [
      ...typed,
      ...removedCodes.map(item_code => ({item_code, qty: 0})),
    ];

    const usual = usualPerEntry(
      receivedResponse?.message?.data?.entries,
      correcting?.name,
    );
    const confirmRows: ConfirmRow[] = rows.map(row => ({
      key: row.item_code,
      name: itemName(row.item_code),
      removed: !!correcting && row.qty === 0,
      figures: [
        {
          value: row.qty,
          old: correcting ? originalFigures[row.item_code] ?? 0 : undefined,
        },
      ],
    }));
    const pieces = typed.reduce((sum, row) => sum + row.qty, 0);
    setConfirm({
      header: confirmHeader(
        correcting ? 'Receive Stock · Correction' : 'Receive Stock',
        storeName,
        correcting?.posting_date,
      ),
      subheader: correcting ? correctingLine(correcting) : undefined,
      rows: confirmRows,
      totals: [`${typed.length} item(s) · ${pieces} pcs`],
      remarks: remarks.trim() || undefined,
      warnings: [
        ...(correcting && !typed.length
          ? ['Every item is 0, so this delivery will be cancelled.']
          : []),
        ...typoWarnings(
          typed.map(row => ({
            name: itemName(row.item_code),
            qty: row.qty,
            usual: usual[row.item_code],
          })),
        ),
      ],
      onConfirm: () => (correcting ? saveCorrection(rows) : save(typed)),
    });
  };

  const cancelEntry = () => {
    if (!correcting) {
      return;
    }
    setConfirm(
      cancelSpec(correcting, 'receipt', result => {
        setConfirm(null);
        if (result.ok) {
          Toast.show({type: 'success', text1: result.message});
          finish(true);
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
          <TouchableOpacity onPress={stopCorrecting} hitSlop={8}>
            <Ionicons name="close" size={18} color="#1D4ED8" />
          </TouchableOpacity>
        </View>
      ) : null}
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
                {correcting ? 'Save Correction' : 'Save Delivery'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ConfirmSaveSheet spec={confirm} onEdit={() => setConfirm(null)} />
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <PageHeader
        title={STOCK_SCREENS.receive.title}
        icon={<StockScreenIcon screen="receive" />}
        navigation={() => navigation.goBack()}
      />
      <Text style={styles.screenHint}>
        Enter goods delivered to your store.
      </Text>
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
                  ? 'Correct Delivery'
                  : 'New Delivery'
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
          defaultFilter="receipt"
          onCorrect={onCorrect}
        />
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

export default StockReceivedScreen;
