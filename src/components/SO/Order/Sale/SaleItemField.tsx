import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../../../../constants';
import { StockDashboardItem } from '../../../../types/baseType';
import { flexRow } from '../../../../utils/styles';
import SaleItemDropdown from '../../../ui-lib/sale-item-dropdown';
import { Size } from '../../../../utils/fontSize';

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
  const [search, setSearch] = useState('');

  const stockInfo = useMemo(
    () => allItems.find(i => i.item_code === item.item_code) ?? null,
    [allItems, item.item_code],
  );

  // 🔍 Filter + transform
  const dropdownData = useMemo(() => {
    const searchText = search.toLowerCase();

    return allItems
      .filter(i => `${i.item_name}`.toLowerCase().includes(searchText))
      .map(i => ({
        label: `${i.item_name} - ₹${Number(i.item_rate).toFixed(2)}`,
        value: i.item_code,
      }));
  }, [allItems, search]);

  const isOrderLocked =
    (stockInfo?.has_history ?? false) && stockInfo?.physical_count === null;

  const canOrder = !isOrderLocked && !isStockFetching;

  const handleChange = (field: string, val: string) => {
    const cleanVal =
      field === 'rate'
        ? val.replace(/[^0-9.]/g, '')
        : val.replace(/[^0-9]/g, '');

    setFieldValue(
      `items[${index}].${field}`,
      cleanVal === '' ? 0 : Number(cleanVal),
    );
  };

  return (
    <View
      style={[
        styles.rowContainer,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
        stockInfo?.has_history && styles.lockedRow,
      ]}>
      {/* --- Item Dropdown OR Text --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.item }]}>
        {stockInfo?.has_history && (
          <View style={styles.floatingBadge}>
            <Text style={styles.badgeText}>Prev</Text>
          </View>
        )}

        {stockInfo?.has_history ? (
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTextLabel}>
              {stockInfo?.item_name || item.item_code}
            </Text>
            {/* <Text style={styles.itemTextCode}>({item.item_code})</Text> */}
          </View>
        ) : (
          <SaleItemDropdown
            field={`items[${index}].item_code`}
            value={item.item_code}
            data={dropdownData}
            placeholder="item..."
            onChange={(val: string) => {
              setFieldValue(`items[${index}].item_code`, val);

              const selected = allItems.find(i => i.item_code === val);
              if (selected) {
                setFieldValue(`items[${index}].rate`, selected.item_rate);
              }
            }}
            searchText={search}
            setSearchText={setSearch}
          />
        )}
      </View>

      {/* --- Stock --- */}
      <View style={[flexRow, { width: COLUMN_WIDTHS.stock }]}>
        <View style={styles.col}>
          <Text style={styles.stockLabel}>
            Opening:{' '}
            <Text style={styles.boldText}>{stockInfo?.opening_stock ?? 0}</Text>
          </Text>
          <Text style={styles.stockLabel}>
            Current:{' '}
            <Text style={styles.boldText}>{stockInfo?.current_stock ?? 0}</Text>
          </Text>
        </View>

        <View style={styles.col}>
          <Text style={styles.stockLabel}>
            MTD:{' '}
            <Text style={styles.boldText}>{stockInfo?.mtd_territory ?? 0}</Text>
          </Text>
          <Text style={styles.stockLabel}>
            New:{' '}
            <Text style={styles.boldText}>{stockInfo?.new_orders ?? 0}</Text>
          </Text>
        </View>
      </View>
      {/* --- Physical Qty --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.qty }]}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={item.physical_qty === 0 ? '0' : String(item.physical_qty)}
          onChangeText={v => handleChange('physical_qty', v)}
          placeholder="0"
        />
      </View>

      {/* --- Order Qty --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.qty }]}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={item.qty === 0 ? '0' : String(item.qty)}
          onChangeText={v => handleChange('qty', v)}
          placeholder="0"
        />
      </View>

      {/* --- Rate --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.rate }]}>
        <TextInput
          style={[styles.input, !canOrder && styles.inputDisabled]}
          editable={canOrder}
          keyboardType="numeric"
          value={!item.rate ? '0' : Number(item.rate).toFixed(2)}
          onChangeText={v => handleChange('rate', v)}
          placeholder="0.00"
        />
      </View>

      {/* --- Amount --- */}
      <View style={[styles.col, { width: COLUMN_WIDTHS.amount }]}>
        <Text style={styles.amountText}>
          ₹
          {((item.qty || 0) * (item.rate || 0)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* --- Delete --- */}
      <TouchableOpacity
        onPress={() => removeItem(index)}
        style={[styles.col, { width: COLUMN_WIDTHS.action }]}>
        <Ionicons name="trash-outline" size={18} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  evenRow: { backgroundColor: '#fff' },
  oddRow: { backgroundColor: '#f9fafb' },
  lockedRow: { backgroundColor: '#fffbeb' },
  col: { paddingHorizontal: 6 },
  floatingBadge: {
    position: 'absolute',
    top: -2,
    right: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  badgeText: { color: '#fff', fontSize: 9 },
  stockLabel: { fontSize: 10, color: '#6b7280' },
  itemTextContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  itemTextLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#111827',
  },
  itemTextCode: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#6b7280',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    height: 35,
    textAlign: 'center',
    borderRadius: 4,
    fontSize: Size.xxs,
  },
  inputDisabled: { backgroundColor: '#f3f4f6' },
  amountText: { fontSize: 12, fontFamily: Fonts.semiBold },
  boldText: {
    fontWeight: 'bold',
  },
});
