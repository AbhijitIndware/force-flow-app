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
  Animated,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol, flexRow} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {
  useCreateStockBalanceMutation,
  useGetStoreStockStatusQuery,
} from '../../../features/base/base-api';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {Save} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import SaleItemDropdown from '../../../components/ui-lib/sale-item-dropdown';
import {StockDashboardItem} from '../../../types/baseType';
import Ionicons from 'react-native-vector-icons/Ionicons';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'StockManagementFormScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

interface StockItemEntry {
  itemCode: string;
  itemName: string;
  quantity: string;
  isPrev: boolean; // locked previous item
}

// ─── Column widths — mirrors SaleItemField ────────────────────────────────────
const COL = {
  item: 190,
  stock: 150,
  qty: 90,
  action: 40,
};

// ─── Stock Row ────────────────────────────────────────────────────────────────

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

  return (
    <View
      style={[
        styles.row,
        isEven ? styles.evenRow : styles.oddRow,
        entry.isPrev && styles.prevRow,
        isFilled && !entry.isPrev && styles.filledRow,
      ]}>
      {/* ── Item column ── */}
      <View style={[styles.col, {width: COL.item}]}>
        {entry.isPrev ? (
          // Locked previous item — mirrors SaleItemField locked text display
          <View style={styles.prevItemWrap}>
            <Text style={styles.prevItemName} numberOfLines={2}>
              {entry.itemName || entry.itemCode}
            </Text>
          </View>
        ) : (
          // New item — dropdown from all available items
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

      {/* --- Stock --- */}
      <View style={[flexRow, {width: COL.stock}]}>
        <View style={styles.col}>
          <Text style={styles.stockLabel}>
            Opening:{' '}
            <Text style={styles.boldText}>{matchItem?.opening_stock ?? 0}</Text>
          </Text>
          <Text style={styles.stockLabel}>
            Current:{' '}
            <Text style={styles.boldText}>{matchItem?.current_stock ?? 0}</Text>
          </Text>
        </View>

        <View style={styles.col}>
          <Text style={styles.stockLabel}>
            MTD:{' '}
            <Text style={styles.boldText}>{matchItem?.mtd_territory ?? 0}</Text>
          </Text>
          <Text style={styles.stockLabel}>
            New:{' '}
            <Text style={styles.boldText}>{matchItem?.new_orders ?? 0}</Text>
          </Text>
        </View>
      </View>

      {/* ── Stock Count Input ── */}
      <View style={[styles.col, {width: COL.qty, alignItems: 'center'}]}>
        <TextInput
          style={styles.qtyInput}
          keyboardType="numeric"
          placeholder="0"
          value={String(entry.quantity)}
          placeholderTextColor="#9ca3af"
          onChangeText={v => onQtyChange(index, v.replace(/[^0-9]/g, ''))}
        />
      </View>

      {/* ── Delete ── */}
      <TouchableOpacity
        onPress={() => onRemove(index)}
        style={[styles.col, {width: COL.action, alignItems: 'center'}]}
        disabled={entry.isPrev}>
        <Ionicons name="trash-outline" size={18} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const StockManagementFormScreen = ({navigation, route}: Props) => {
  const {store, storeName} = route.params;
  // All items from stock status for dropdowns + stock info
  const {data: stockStatusData} = useGetStoreStockStatusQuery(
    {store},
    {refetchOnMountOrArgChange: true},
  );
  const [createStockBalance, {isLoading: isSubmitting}] =
    useCreateStockBalanceMutation();

  const [entries, setEntries] = useState<StockItemEntry[]>([]);
  const [allItems, setAllItems] = useState<StockDashboardItem[]>([]);

  // Build dropdown list from stockStatusData
  const allItemsDropdown = useMemo(() => {
    return (stockStatusData?.message?.all_items ?? []).map((s: any) => ({
      label: s.item_name,
      value: s.item_code ?? s.item_name,
    }));
  }, [stockStatusData]);

  // Seed previous items as locked rows and always keep one editable new row.
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
        Toast.show({type: 'success', text1: 'Stock updated successfully'});
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to update stock. Please try again.',
      );
    }
  };

  // Summary
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
      <PageHeader title={storeName} navigation={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={{paddingBottom: 100}}>
          {/* ── Table ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.tableScroll}>
            <View>
              {/* Header — matches AddSaleForm headerRow */}
              <View style={styles.headerRow}>
                <Text style={[styles.headerText, {width: COL.item}]}>Item</Text>
                <Text
                  style={[
                    styles.headerText,
                    {width: COL.stock, textAlign: 'center'},
                  ]}>
                  Stock
                </Text>
                <Text
                  style={[
                    styles.headerText,
                    {width: COL.qty, textAlign: 'center'},
                  ]}>
                  Stock Count
                </Text>
                <View style={{width: COL.action}} />
              </View>

              {/* Previous items section label */}
              {prevCount > 0 && (
                <View style={styles.sectionDivider}>
                  <Text style={styles.sectionDividerText}>
                    Previous items ({prevCount})
                  </Text>
                </View>
              )}

              {/* Rows */}
              {entries.map((entry, index) => {
                // Section label between prev and new items
                const showNewLabel =
                  !entry.isPrev && (index === 0 || entries[index - 1]?.isPrev);
                const matchItem = allItems?.find(
                  item => item?.item_code === entry.itemCode,
                );

                return (
                  <React.Fragment key={index}>
                    {showNewLabel && newCount > 0 && (
                      <View
                        style={[
                          styles.sectionDivider,
                          styles.sectionDividerNew,
                        ]}>
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
          </ScrollView>

          {/* Add Item — matches AddSaleForm tableAddBtn */}
          <TouchableOpacity style={styles.tableAddBtn} onPress={handleAddItem}>
            <Text style={styles.addMoreText}>+ Select item to add...</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer — matches AddSaleForm footerSummary + submit */}
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
            {isSubmitting ? 'Submitting...' : 'Submit Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StockManagementFormScreen;

const styles = StyleSheet.create({
  // ── Table shell — matches AddSaleForm ──
  tableScroll: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerText: {
    color: '#6b7280',
    fontSize: 11,
    fontFamily: Fonts.medium,
    paddingHorizontal: 8,
  },

  // ── Section dividers ──
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

  // ── Row styles — mirrors SaleItemField ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  evenRow: {backgroundColor: '#fff'},
  oddRow: {backgroundColor: '#f9fafb'},
  prevRow: {backgroundColor: '#fffbeb'}, // yellow tint — matches lockedRow
  filledRow: {backgroundColor: '#f0fdf4'}, // green tint when qty filled
  col: {paddingHorizontal: 6, justifyContent: 'center'},

  // ── Prev item display — mirrors SaleItemField itemTextContainer ──
  prevItemWrap: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: 'relative',
  },
  prevBadge: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    zIndex: 1,
  },
  prevBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: Fonts.semiBold,
  },
  prevItemName: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#111827',
    paddingRight: 30,
  },

  // ── Stock value cells ──
  stockVal: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#374151',
    textAlign: 'center',
  },

  // ── Qty input ──
  qtyInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#d1d5db',
    height: 40,
    textAlign: 'center',
    borderRadius: 4,
    fontSize: Size.xxs,
  },

  deleteIcon: {fontSize: 15},
  deleteIconDisabled: {color: '#9ca3af'},

  // ── Add row — matches AddSaleForm tableAddBtn ──
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

  // ── Footer — matches AddSaleForm footerSummary ──
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
  boldText: {
    fontWeight: 'bold',
  },
  stockLabel: {fontSize: 10, color: '#6b7280'},
});
