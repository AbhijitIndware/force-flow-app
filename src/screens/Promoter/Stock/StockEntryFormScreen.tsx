/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol, flexRow} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {
  useCreateStockBalanceMutation,
  useGetStoreStockStatusQuery,
} from '../../../features/base/promoter-base-api';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {Save} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import SaleItemDropdown from '../../../components/ui-lib/sale-item-dropdown';
import {StockDashboardItem} from '../../../types/baseType';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getUserFacingError,
  getSafeServerMessage,
} from '../../../utils/errorMessage';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'StockEntryFormScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

interface StockItemEntry {
  itemCode: string;
  itemName: string;
  quantity: string;
  isPrev: boolean;
}

// ─── Stock Row (vertical stacked layout) ────────────────────────────────────────
interface StockRowProps {
  index: number;
  entry: StockItemEntry;
  allItemsDropdown: {label: string; value: string}[];
  onQtyChange: (index: number, val: string) => void;
  onItemChange: (index: number, itemCode: string, itemName: string) => void;
  onRemove: (index: number) => void;
  matchItem: StockDashboardItem;
}

const StockRow: React.FC<StockRowProps> = ({
  index,
  entry,
  allItemsDropdown,
  onQtyChange,
  onItemChange,
  onRemove,
  matchItem,
}) => {
  const [search, setSearch] = useState('');

  const filteredDropdown = useMemo(() => {
    const q = search.toLowerCase();
    return allItemsDropdown.filter(d => d.label.toLowerCase().includes(q));
  }, [allItemsDropdown, search]);

  const isEven = index % 2 === 0;
  const isFilled = entry.itemCode && entry.quantity !== '';
  const currentStock = matchItem?.current_stock ?? 0;
  const enteredQty = parseInt(entry.quantity, 10);
  const showDeliveryReminder =
    !entry.isPrev &&
    !isNaN(enteredQty) &&
    enteredQty > currentStock &&
    currentStock > 0;

  return (
    <View
      style={[
        styles.row,
        isEven ? styles.evenRow : styles.oddRow,
        entry.isPrev && styles.prevRow,
        isFilled && !entry.isPrev && styles.filledRow,
      ]}>
      <View style={styles.rowContent}>
        {/* ── Item Name ── */}
        <View style={styles.itemNameWrap}>
          {entry.isPrev ? (
            <Text style={styles.prevItemName} numberOfLines={2}>
              {entry.itemName || entry.itemCode}
            </Text>
          ) : (
            <SaleItemDropdown
              field={`stock_item_${index}`}
              value={entry.itemCode}
              data={filteredDropdown}
              placeholder="Select item..."
              onChange={(val: string) => {
                const found = allItemsDropdown.find(d => d.value === val);
                onItemChange(index, val, found?.label ?? val);
              }}
              searchText={search}
              setSearchText={setSearch}
            />
          )}
        </View>

        {/* ── Stock Details (Opening / Received / Sold MTD) ── */}
        <View style={styles.stockDetailsWrap}>
          <View style={styles.stockDetailItem}>
            <Text style={styles.stockDetailLabel} numberOfLines={1}>
              Open
            </Text>
            <Text style={styles.stockDetailValue} numberOfLines={1}>
              {matchItem?.opening_stock ?? 0}
            </Text>
          </View>
          <View style={styles.stockDetailItem}>
            <Text style={styles.stockDetailLabel} numberOfLines={1}>
              Rcvd
            </Text>
            <Text style={styles.stockDetailValue} numberOfLines={1}>
              {matchItem?.received_this_month ?? 0}
            </Text>
          </View>
          <View style={styles.stockDetailItem}>
            <Text style={styles.stockDetailLabel} numberOfLines={1}>
              Sold
            </Text>
            <Text style={styles.stockDetailValue} numberOfLines={1}>
              {matchItem?.mtd_territory ?? 0}
            </Text>
          </View>
        </View>

        {/* ── On Shelf Now Input ── */}
        <View style={styles.qtyInputWrap}>
          <TextInput
            style={styles.qtyInput}
            keyboardType="numeric"
            placeholder=""
            placeholderTextColor="#9ca3af"
            value={entry.quantity}
            onChangeText={v => onQtyChange(index, v.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* ── Delete ── */}
        <TouchableOpacity
          onPress={() => onRemove(index)}
          style={styles.deleteBtn}
          disabled={entry.isPrev}>
          <Ionicons name="trash-outline" size={18} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {showDeliveryReminder && (
        <View style={styles.deliveryReminder}>
          <Ionicons name="alert-circle-outline" size={12} color="#B45309" />
          <Text style={styles.deliveryReminderText}>
            More than your stock — did a delivery arrive? Record it in Receive
            Stock first.
          </Text>
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const StockEntryFormScreen = ({navigation, route}: Props) => {
  const {store, storeName} = route.params;
  const {data: stockStatusData} = useGetStoreStockStatusQuery(
    {store},
    {refetchOnMountOrArgChange: true},
  );
  const [createStockBalance, {isLoading: isSubmitting}] =
    useCreateStockBalanceMutation();

  const [entries, setEntries] = useState<StockItemEntry[]>([]);
  const [allItems, setAllItems] = useState<StockDashboardItem[]>([]);

  const allItemsDropdown = useMemo(() => {
    return (stockStatusData?.message?.all_items ?? []).map((s: any) => ({
      label: s.item_name,
      value: s.item_code ?? s.item_name,
    }));
  }, [stockStatusData]);

  useEffect(() => {
    const prev: StockItemEntry[] = (
      stockStatusData?.message?.previous_items ?? []
    ).map((it: any) => ({
      itemCode: it.item_code,
      itemName: it.item_name ?? it.item_code,
      quantity: '',
      isPrev: true,
    }));

    setEntries([...prev]);
  }, [stockStatusData]);

  const handleAddItem = () => {
    setEntries(prev => [
      ...prev,
      {itemCode: '', itemName: '', quantity: '', isPrev: false},
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleQtyChange = (index: number, val: string) => {
    setEntries(prev =>
      prev.map((e, i) => (i === index ? {...e, quantity: val} : e)),
    );
  };

  const handleItemChange = (
    index: number,
    itemCode: string,
    itemName: string,
  ) => {
    setEntries(prev =>
      prev.map((e, i) => (i === index ? {...e, itemCode, itemName} : e)),
    );
  };

  const handleSubmit = async () => {
    const itemsToSubmit = entries
      .filter(e => e.itemCode && e.quantity !== '')
      .map(e => ({
        item_code: e.itemCode,
        quantity: parseInt(e.quantity, 10),
        batch: '',
      }));

    if (itemsToSubmit.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No items filled',
        text2: 'Please enter a stock count for at least one item',
      });
      return;
    }

    try {
      const response = await createStockBalance({
        store,
        items: JSON.stringify(itemsToSubmit),
      }).unwrap();

      if (response.message) {
        Toast.show({type: 'success', text1: 'Stock count saved'});
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        getUserFacingError(error, 'Failed to update stock. Please try again.'),
      );
    }
  };

  const prevCount = entries.filter(e => e.isPrev).length;
  const newCount = entries.filter(e => !e.isPrev).length;
  const totalItems = entries.length;

  useEffect(() => {
    if (stockStatusData?.message) {
      let all = [
        ...stockStatusData.message.all_items,
        ...stockStatusData.message.previous_items,
      ];
      setAllItems(all);
    }
  }, [stockStatusData]);

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: '#ffffff'}]}>
      <PageHeader
        title={`Count Stock Update`}
        navigation={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={{paddingBottom: 100}}>
          <View style={styles.tableContainer}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerText, styles.headerItem]}>Item</Text>
              <Text
                style={[styles.headerText, styles.headerStock]}
                numberOfLines={1}>
                Stock Details
              </Text>
              <Text
                style={[styles.headerText, styles.headerQty]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                On shelf now
              </Text>
              <View style={styles.headerAction} />
            </View>

            {prevCount > 0 && (
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionDividerText}>
                  Previous items ({prevCount})
                </Text>
              </View>
            )}

            {entries.map((entry, index) => {
              const showNewLabel =
                !entry.isPrev && (index === 0 || entries[index - 1]?.isPrev);
              const matchItem = allItems?.find(
                item => item?.item_code === entry.itemCode,
              );

              return (
                <React.Fragment key={index}>
                  {showNewLabel && newCount > 0 && (
                    <View
                      style={[styles.sectionDivider, styles.sectionDividerNew]}>
                      <Text
                        style={[
                          styles.sectionDividerText,
                          {color: Colors.orange},
                        ]}>
                        New items
                      </Text>
                    </View>
                  )}
                  <StockRow
                    index={index}
                    entry={entry}
                    allItemsDropdown={allItemsDropdown}
                    onQtyChange={handleQtyChange}
                    onItemChange={handleItemChange}
                    onRemove={handleRemoveItem}
                    matchItem={matchItem as StockDashboardItem}
                  />
                </React.Fragment>
              );
            })}
          </View>

          <TouchableOpacity style={styles.tableAddBtn} onPress={handleAddItem}>
            <Text style={styles.addMoreText}>+ Select item to add...</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View style={styles.footerSummary}>
          <Text style={styles.summaryText}>{totalItems} item(s)</Text>
          <Text style={styles.summaryText}>
            {prevCount} prev · {newCount} new
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && {opacity: 0.7}]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <Save size={18} color={Colors.white} />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Count'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StockEntryFormScreen;

const STOCK_DETAILS_WIDTH = 120;
const QTY_COL_WIDTH = 78;
const ACTION_COL_WIDTH = 30;

const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  headerText: {
    color: '#6b7280',
    fontSize: 10,
    lineHeight: 13,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headerItem: {
    flex: 1,
    paddingRight: 6,
  },
  headerStock: {
    width: STOCK_DETAILS_WIDTH,
    textAlign: 'center',
  },
  headerQty: {
    width: QTY_COL_WIDTH,
    textAlign: 'center',
    letterSpacing: 0,
  },
  headerAction: {
    width: ACTION_COL_WIDTH,
  },
  sectionDivider: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderColor: '#fde68a',
  },
  sectionDividerNew: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  sectionDividerText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: '#92400e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evenRow: {backgroundColor: '#fff'},
  oddRow: {backgroundColor: '#f9fafb'},
  prevRow: {backgroundColor: '#fffbeb'},
  filledRow: {backgroundColor: '#f0fdf4'},
  itemNameWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  prevItemName: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#111827',
  },
  stockDetailsWrap: {
    width: STOCK_DETAILS_WIDTH,
    flexDirection: 'row',
  },
  stockDetailItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockDetailLabel: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  stockDetailValue: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#111827',
    marginTop: 2,
  },
  qtyInputWrap: {
    width: QTY_COL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    height: 40,
    paddingVertical: 0,
    paddingHorizontal: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#111827',
  },
  deliveryReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  deliveryReminderText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#B45309',
    flex: 1,
  },
  deleteBtn: {
    width: ACTION_COL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableAddBtn: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  addMoreText: {
    color: Colors.orange,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 10,
  },
  footerSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  submitButton: {
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
});
