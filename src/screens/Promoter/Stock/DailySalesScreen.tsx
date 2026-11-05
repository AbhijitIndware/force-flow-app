/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

import PageHeader from '../../../components/ui/PageHeader';
import {
  STOCK_SCREENS,
  StockScreenIcon,
} from '../../../components/Promoter/Stock/stockScreens';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {
  useGetDailySalesQuery,
  useSaveDailySalesMutation,
  useSetOpeningMutation,
} from '../../../features/base/promoter-base-api';
import {useStockStores} from '../../../hooks/useStockStores';
import {DailySalesItem, DailySalesSheet} from '../../../types/baseType';
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

// The item whose opening is being given (new item) or corrected.
type OpeningTarget = {
  item_code: string;
  item_name: string;
  current?: number;
};

const API_DATE = 'YYYY-MM-DD';

const toCount = (value: string) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const DailySalesScreen = ({navigation, route}: Props) => {
  const today = moment().format(API_DATE);
  const [store, setStore] = useState(route?.params?.store ?? '');
  const [date, setDate] = useState(today);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Sold figures typed on this screen, by item code; rows not here keep the
  // day's saved figure.
  const [edits, setEdits] = useState<Record<string, string>>({});
  // The latest sheet: from the query, or from a save's reply.
  const [sheet, setSheet] = useState<DailySalesSheet | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [opening, setOpening] = useState<OpeningTarget | null>(null);
  const [openingQty, setOpeningQty] = useState('');

  const {data: storesResponse} = useStockStores();
  const stores = useMemo(
    () => storesResponse?.message?.data?.stores ?? [],
    [storesResponse],
  );
  const storeOptions = useMemo(
    () => stores.map(s => ({label: s.store_name, value: s.store_id})),
    [stores],
  );

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

  const {
    data: sheetResponse,
    isFetching,
    refetch,
  } = useGetDailySalesQuery(
    {store, date},
    {skip: !store, refetchOnMountOrArgChange: true},
  );
  const [saveDailySales, {isLoading: saving}] = useSaveDailySalesMutation();
  const [setOpeningMutation, {isLoading: savingOpening}] =
    useSetOpeningMutation();

  const sheetError =
    sheetResponse?.message && sheetResponse.message.success === false
      ? getSafeServerMessage(sheetResponse.message.message) ??
        'Could not load daily sales.'
      : '';

  useEffect(() => {
    setSheet(sheetResponse?.message?.data ?? null);
  }, [sheetResponse]);

  // A new store or day starts from that day's saved figures.
  useEffect(() => {
    setEdits({});
  }, [store, date]);

  const canEdit = !!sheet?.can_edit;
  const isToday = date === today;
  const soldLabel = isToday
    ? 'Sold today'
    : `Sold on ${moment(date).format('DD MMM')}`;

  const items = useMemo(() => {
    const all = sheet?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) {
      return all;
    }
    return all.filter(
      item =>
        item.item_name?.toLowerCase().includes(q) ||
        item.item_code?.toLowerCase().includes(q),
    );
  }, [sheet, search]);

  const addItems = useMemo(() => {
    const all = sheet?.add_items ?? [];
    const q = addSearch.trim().toLowerCase();
    if (!q) {
      return all;
    }
    return all.filter(
      item =>
        item.item_name?.toLowerCase().includes(q) ||
        item.item_code?.toLowerCase().includes(q),
    );
  }, [sheet, addSearch]);

  // Only the rows the promoter changed are sent.
  const changedRows = useMemo(
    () =>
      (sheet?.items ?? [])
        .filter(
          item =>
            edits[item.item_code] !== undefined &&
            toCount(edits[item.item_code]) !== Number(item.sold || 0),
        )
        .map(item => ({
          item_code: item.item_code,
          qty: toCount(edits[item.item_code]),
        })),
    [sheet, edits],
  );

  const showServerError = (message: string) =>
    Alert.alert(STOCK_SCREENS.dailySales.title, message);

  const save = async () => {
    if (!sheet) {
      return;
    }
    if (!changedRows.length) {
      Toast.show({type: 'info', text1: 'Nothing changed'});
      return;
    }
    try {
      const response = await saveDailySales({
        store: sheet.store,
        date,
        items: changedRows,
      }).unwrap();
      const result = response?.message;
      if (!result?.success) {
        showServerError(
          getSafeServerMessage(result?.message) ?? 'Could not save sales.',
        );
        return;
      }
      Toast.show({
        type: 'success',
        text1: getSafeServerMessage(result.message) ?? 'Sales saved',
      });
      // The reply is the refreshed sheet: redraw from it.
      if (result.data) {
        setSheet(result.data);
      }
      setEdits({});
    } catch (error: any) {
      showServerError(getUserFacingError(error, 'Could not save sales.'));
    }
  };

  const openOpeningDialog = (target: OpeningTarget) => {
    setOpening(target);
    setOpeningQty(
      target.current !== undefined ? String(target.current) : '',
    );
  };

  const saveOpening = async () => {
    if (!opening || !sheet) {
      return;
    }
    if (openingQty.trim() === '') {
      Toast.show({type: 'error', text1: 'Enter how many are on the shelf.'});
      return;
    }
    try {
      const response = await setOpeningMutation({
        store: sheet.store,
        items: [{item_code: opening.item_code, qty: toCount(openingQty)}],
      }).unwrap();
      const result = response?.message;
      if (!result?.success) {
        showServerError(
          getSafeServerMessage(result?.message) ?? 'Could not save opening.',
        );
        return;
      }
      Toast.show({
        type: 'success',
        text1: getSafeServerMessage(result.message) ?? 'Opening saved',
      });
      setOpening(null);
      setOpeningQty('');
      // The reply is today's sheet; on another day, reload that day.
      if (result.data && result.data.date === date) {
        setSheet(result.data);
      } else {
        refetch();
      }
    } catch (error: any) {
      showServerError(getUserFacingError(error, 'Could not save opening.'));
    }
  };

  const renderItem = ({item}: {item: DailySalesItem}) => {
    const value =
      edits[item.item_code] ?? (item.sold ? String(item.sold) : '');
    const overMax =
      edits[item.item_code] !== undefined &&
      toCount(edits[item.item_code]) > Number(item.max_sold ?? 0);
    const extras = [
      item.customer_returned
        ? `Customer returns ${item.customer_returned}`
        : '',
      item.returned ? `Store returns ${item.returned}` : '',
    ].filter(Boolean);
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemTop}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <View style={styles.soldBox}>
            <Text style={styles.soldLabel}>{soldLabel}</Text>
            <TextInput
              style={[
                styles.qtyInput,
                !canEdit && styles.qtyInputDisabled,
                overMax && styles.qtyInputError,
              ]}
              editable={canEdit}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.gray}
              value={value}
              onChangeText={text =>
                setEdits(prev => ({
                  ...prev,
                  [item.item_code]: text.replace(/[^0-9]/g, ''),
                }))
              }
            />
            {canEdit ? (
              <Text style={[styles.maxHint, overMax && {color: '#B91C1C'}]}>
                up to {item.max_sold ?? 0}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel} numberOfLines={1}>
              Opening
              {item.opening_date
                ? ` · ${moment(item.opening_date).format('DD MMM')}`
                : ''}
            </Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{item.opening ?? 0}</Text>
              {item.can_correct_opening ? (
                <TouchableOpacity
                  style={styles.correctLink}
                  hitSlop={10}
                  onPress={() =>
                    openOpeningDialog({
                      item_code: item.item_code,
                      item_name: item.item_name,
                      current: item.opening,
                    })
                  }>
                  <Ionicons name="create-outline" size={12} color="#2563EB" />
                  <Text style={styles.correctText}>Correct</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel} numberOfLines={1}>
              Received
            </Text>
            <Text style={styles.statValue}>{item.received ?? 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel} numberOfLines={1}>
              Sold (month)
            </Text>
            <Text style={styles.statValue}>{item.sold_mtd ?? 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={[styles.stat, styles.statShelf]}>
            <Text
              style={[styles.statLabel, {color: '#15803D'}]}
              numberOfLines={1}>
              On shelf
            </Text>
            <Text style={[styles.statValue, {color: '#15803D'}]}>
              {item.on_shelf ?? 0}
            </Text>
          </View>
        </View>
        {extras.length ? (
          <Text style={styles.itemMeta}>{extras.join(' · ')}</Text>
        ) : null}
      </View>
    );
  };

  const entry = sheet?.entry;

  return (
    <SafeAreaView style={styles.screen}>
      <PageHeader
        title={STOCK_SCREENS.dailySales.title}
        icon={<StockScreenIcon screen="dailySales" />}
        navigation={() => navigation.goBack()}
      />
      <Text style={styles.screenHint}>
        Enter how many of each item were sold.
      </Text>
      <View style={styles.header}>
        <View style={{flex: 1.4}}>
          <ReusableDropdown
            // The dropdown prefixes "Select ", so this reads "Select store".
            placeholder="store"
            data={storeOptions}
            value={store}
            onChange={value => setStore(value)}
            error={false}
            field="label"
            label="Store"
            selectedLabel={
              storeOptions.find(option => option.value === store)?.label ??
              sheet?.store_name ??
              ''
            }
            marginBottom={0}
          />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setDatePickerOpen(true)}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={Colors.darkButton}
            />
            <Text style={styles.dateText}>
              {isToday ? 'Today' : moment(date).format('DD MMM YYYY')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {sheet ? (
        <Text style={styles.entryLine}>
          {entry
            ? `Saved by ${entry.entered_by} · ${moment(entry.at).format(
                'DD MMM, hh:mm A',
              )}`
            : 'Nothing saved for this day yet.'}
          {!sheet.can_edit ? ' · Read only' : ''}
        </Text>
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
        {canEdit ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setAddSearch('');
              setAddOpen(true);
            }}>
            <Ionicons name="add" size={16} color={Colors.white} />
            <Text style={styles.addButtonText}>Add item</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isFetching && !sheet ? (
        <ActivityIndicator style={styles.loader} color={Colors.orange} />
      ) : sheetError ? (
        <Text style={styles.errorText}>{sheetError}</Text>
      ) : !store ? (
        <Text style={styles.empty}>Select a store to enter sales.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.item_code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshing={isFetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search
                ? `No items match "${search}"`
                : 'No items yet. Tap "Add item" and give what is on the shelf.'}
            </Text>
          }
        />
      )}

      {canEdit ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (saving || !changedRows.length) && styles.disabled,
            ]}
            disabled={saving}
            onPress={save}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                Save
                {changedRows.length ? ` (${changedRows.length})` : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <DateTimePickerModal
        isVisible={datePickerOpen}
        mode="date"
        date={moment(date).toDate()}
        // Any day of the current month; no future days.
        minimumDate={moment().startOf('month').toDate()}
        maximumDate={moment().toDate()}
        onConfirm={picked => {
          setDatePickerOpen(false);
          setDate(moment(picked).format(API_DATE));
        }}
        onCancel={() => setDatePickerOpen(false)}
      />

      {/* ── Add item: pick one, then give its opening ── */}
      <Modal
        visible={addOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAddOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, {maxHeight: '75%'}]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add item</Text>
              <TouchableOpacity onPress={() => setAddOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={Colors.gray} />
              </TouchableOpacity>
            </View>
            <View style={[styles.searchRow, {margin: 0, marginBottom: 8}]}>
              <Ionicons name="search" size={17} color={Colors.gray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search item"
                placeholderTextColor={Colors.gray}
                value={addSearch}
                onChangeText={setAddSearch}
              />
            </View>
            <FlatList
              data={addItems}
              keyExtractor={item => item.item_code}
              keyboardShouldPersistTaps="handled"
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.pickRow}
                  onPress={() => {
                    setAddOpen(false);
                    openOpeningDialog({
                      item_code: item.item_code,
                      item_name: item.item_name,
                    });
                  }}>
                  <Text style={styles.pickText}>{item.item_name}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={Colors.gray}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>No more items to add.</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ── Opening: give it once, or correct this month's ── */}
      <Modal
        visible={!!opening}
        transparent
        animationType="fade"
        onRequestClose={() => setOpening(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.overlay, {justifyContent: 'center'}]}>
          <View style={[styles.sheet, styles.dialog]}>
            <Text style={styles.sheetTitle}>
              {opening?.current !== undefined
                ? 'Correct opening'
                : 'Opening stock'}
            </Text>
            <Text style={styles.dialogItem}>{opening?.item_name}</Text>
            <Text style={styles.fieldLabel}>
              {opening?.current !== undefined
                ? 'Opening (what was on the shelf when you started)'
                : 'On the shelf now'}
            </Text>
            <TextInput
              style={styles.openingInput}
              keyboardType="number-pad"
              autoFocus
              placeholder="0"
              placeholderTextColor={Colors.gray}
              value={openingQty}
              onChangeText={text => setOpeningQty(text.replace(/[^0-9]/g, ''))}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setOpening(null)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {flex: 1, marginTop: 0},
                  savingOpening && styles.disabled,
                ]}
                disabled={savingOpening}
                onPress={saveOpening}>
                {savingOpening ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Save opening</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fieldLabel: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: 12,
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
  },
  dateText: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: 13,
  },
  entryLine: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 10,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    fontSize: 11,
  },
  searchRow: {
    margin: 12,
    marginBottom: 0,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 6,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.darkButton,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButtonText: {
    fontFamily: Fonts.medium,
    color: Colors.white,
    fontSize: 12,
  },
  listContent: {padding: 12, paddingBottom: 40},
  itemRow: {
    backgroundColor: Colors.white,
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 12,
  },
  soldBox: {alignItems: 'center'},
  soldLabel: {
    fontFamily: Fonts.medium,
    color: Colors.gray,
    fontSize: 10,
    marginBottom: 3,
  },
  qtyInput: {
    width: 76,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
  },
  qtyInputDisabled: {backgroundColor: '#F1F3F5', color: Colors.gray},
  qtyInputError: {borderColor: '#DC2626'},
  maxHint: {
    fontFamily: Fonts.regular,
    color: Colors.gray,
    fontSize: 10,
    marginTop: 2,
  },
  itemMeta: {
    fontFamily: Fonts.regular,
    color: '#475569',
    fontSize: 11,
    marginTop: 6,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    overflow: 'hidden',
  },
  stat: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  statShelf: {backgroundColor: '#F0FDF4'},
  statDivider: {width: 1, backgroundColor: '#EEF2F6'},
  statLabel: {
    fontFamily: Fonts.regular,
    color: Colors.gray,
    fontSize: 10,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontFamily: Fonts.semiBold,
    color: '#111827',
    fontSize: 14,
    marginTop: 1,
  },
  correctLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  correctText: {fontFamily: Fonts.medium, color: '#2563EB', fontSize: 11},
  footer: {
    backgroundColor: Colors.white,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  primaryButton: {
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  primaryButtonText: {fontFamily: Fonts.semiBold, color: Colors.white},
  secondaryButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  secondaryButtonText: {fontFamily: Fonts.medium, color: Colors.darkButton},
  disabled: {opacity: 0.6},
  loader: {marginTop: 40},
  empty: {
    textAlign: 'center',
    color: Colors.gray,
    fontFamily: Fonts.regular,
    marginTop: 40,
    paddingHorizontal: 24,
  },
  errorText: {
    margin: 16,
    color: '#B91C1C',
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  dialog: {
    borderRadius: 16,
    marginHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetTitle: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 15,
  },
  dialogItem: {
    fontFamily: Fonts.medium,
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  openingInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickText: {
    flex: 1,
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: 13,
  },
});

export default DailySalesScreen;
