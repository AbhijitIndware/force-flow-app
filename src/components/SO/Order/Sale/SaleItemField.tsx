import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../../../../constants';
import { StockDashboardItem } from '../../../../types/baseType';
import { flexRow } from '../../../../utils/styles';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';

const COLUMN_WIDTHS = {
  item: 180,
  stock: 130,
  qty: 90,
  rate: 75,
  amount: 85,
  action: 40,
};

interface Props {
  index: number;
  item: any;
  setFieldValue: (field: string, value: any) => void;
  removeItem: (index: number) => void;
  allItems: StockDashboardItem[];
  isStockFetching: boolean;
}

export const SaleItemField: React.FC<Props> = ({
  index,
  item,
  setFieldValue,
  removeItem,
  allItems,
  isStockFetching,
}) => {
  const stockInfo = useMemo(
    () => allItems.find(i => i.item_code === item.item_code) ?? null,
    [allItems, item.item_code],
  );

  const isOrderLocked = (stockInfo?.has_history ?? false) && stockInfo?.physical_count === null;
  const canOrder = !isOrderLocked && !isStockFetching;

  const handleChange = (field: string, val: string) => {
    const cleanVal = field === 'rate' ? val.replace(/[^0-9.]/g, '') : val.replace(/[^0-9]/g, '');
    setFieldValue(`items[${index}].${field}`, cleanVal === '' ? 0 : Number(cleanVal));
  };

  return (
    <View style={[
      styles.rowContainer,
      index % 2 === 0 ? styles.evenRow : styles.oddRow, // Alternating light grey
      isOrderLocked && styles.lockedRow
    ]}>
      {/* --- Column 1: Item Info --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.item, position: 'relative' }]}>
        {/* The Badge is now absolute positioned */}
        {stockInfo?.has_history && (
          <View style={styles.floatingBadge}>
            <Text style={styles.badgeText}>Prev</Text>
          </View>
        )}
        <ReusableDropdown
          field={`items[${index}].item_code`}
          value={item.item_code}
          data={itemList}
          placeholder="Select Item"
          onChange={(val: string) => {
            setCurrentItemCode(null);
            setFieldValue(`items[${index}].item_code`, val);
            handleSelectedItemValues(val);
          }}
          searchText={search}
          setSearchText={setSearch}
          onLoadMore={handleLoadMore}
          loadingMore={loadingMore}
        />

      </View>

      {/* --- Column 2: Stock --- */}
      <View style={[flexRow, { width: COLUMN_WIDTHS.stock, alignItems: 'flex-start' }]}>
        <View style={[styles.col, { alignItems: 'flex-start' }]}>
          <Text style={styles.stockLabel}>Opening: {stockInfo?.opening_stock ?? 0}</Text>
          <Text style={styles.stockLabel}>Current: {stockInfo?.current_stock ?? 0}</Text>
        </View>
        <View style={[styles.col, { alignItems: 'flex-start' }]}>
          <Text style={styles.stockLabel}>MTD: {stockInfo?.mtd_territory ?? 0}</Text>
          <Text style={styles.stockLabel}>New: {stockInfo?.new_orders ?? 0}</Text>
        </View>
      </View>

      {/* --- Column 3: Phys Qty --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.qty }]}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={item.physical_qty === 0 ? '' : String(item.physical_qty)}
          onChangeText={(v) => handleChange('physical_qty', v)}
          placeholder="0"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* --- Column 4: Order Qty --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.qty }]}>
        <TextInput
          style={[styles.input,]}
          // editable={canOrder}
          keyboardType="numeric"
          value={item.qty === 0 ? '' : String(item.qty)}
          onChangeText={(v) => handleChange('qty', v)}
          placeholder="0"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* --- Column 5: Rate --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.rate }]}>
        <TextInput
          style={[styles.input, !canOrder && styles.inputDisabled]}
          editable={canOrder}
          keyboardType="numeric"
          value={!item.rate ? '' : Number(item.rate).toFixed(2)}
          onChangeText={(v) => handleChange('rate', v)}
          placeholder="0.0"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* --- Column 6: Amount --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.amount, alignItems: 'center' }]}>
        <Text style={styles.amountText}>
          ₹{((item.qty || 0) * (item.rate || 0)).toFixed(2).toLocaleString()}
        </Text>
      </View>

      {/* --- Action --- */}
      <TouchableOpacity
        onPress={() => removeItem(index)}
        style={[styles.col, { width: COLUMN_WIDTHS.action, alignItems: 'center' }]}
      >
        <Ionicons name="trash-outline" size={18} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  floatingBadge: {
    position: 'absolute',
    top: 4,               // Adjust based on row padding
    right: 8,             // Pulls it to the right side of the item column
    backgroundColor: '#2563eb',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    zIndex: 1,            // Ensures it stays above the text
  },
  evenRow: {
    backgroundColor: '#ffffff', // White background
  },
  oddRow: {
    backgroundColor: '#f9fafb', // Light grey for each item
  },
  lockedRow: {
    backgroundColor: '#fffbeb', // Light amber tint for locked rows
  },
  col: {
    paddingHorizontal: 6,
  },
  itemName: {
    color: '#111827',
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  itemSubtext: {
    color: '#6b7280',
    fontSize: 10,
    marginTop: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  prevBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 4,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  lockBadgeText: {
    color: '#b45309',
    fontSize: 9,
    fontWeight: 'bold',
  },
  stockLabel: {
    color: '#6b7280',
    fontSize: 10,
  },
  stockStatus: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#ffffff',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    height: 34,
    textAlign: 'center',
    fontSize: 12,
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    color: '#9ca3af',
  },
  amountText: {
    color: '#111827',
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
});