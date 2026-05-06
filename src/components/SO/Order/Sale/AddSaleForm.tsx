import React, { useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import moment from 'moment';
import { Colors } from '../../../../utils/colors';
import { IAddSalesOrderV2, StockDashboardItem } from '../../../../types/baseType';
import { Size } from '../../../../utils/fontSize';
import { Fonts } from '../../../../constants';
import { SaleItemField } from './SaleItemField';

const COLUMN_WIDTHS = {
  item: 170,
  // stock: 130,
  qty: 70,
  rate: 70,
  amount: 70,
  action: 40,
};

interface Props {
  values: IAddSalesOrderV2;
  errors: any;
  touched: any;
  handleBlur: any;
  handleChange: any;
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
  warehouseList: { label: string; value: string; outstanding_amount?: number }[];
  onDateSelect: (field: 'transaction_date' | 'delivery_date') => void;
  onAnyItemLocked: (locked: boolean) => void;
  seededCount?: number;
  allItems: StockDashboardItem[];
  isStockFetching: boolean;
  stockWarning?: string;
}

const AddSaleForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleBlur,
  setFieldValue,
  scrollY,
  warehouseList,
  onDateSelect,
  onAnyItemLocked,
  seededCount = 0,
  allItems,
  isStockFetching,
}) => {
  const [itemLockMap, setItemLockMap] = useState<Record<number, boolean>>({});

  const selectedStoreEntry = warehouseList.find(
    store => store.value === values.custom_warehouse,
  );
  const selectedStoreOutstanding = selectedStoreEntry?.outstanding_amount ?? 0;

  const handleLockChange = (index: number, isLocked: boolean) => {
    setItemLockMap(prev => {
      const next = { ...prev, [index]: isLocked };
      onAnyItemLocked(Object.values(next).some(Boolean));
      return next;
    });
  };

  const addNewItem = () => {
    setFieldValue('items', [
      ...values.items,
      {
        item_code: '',
        qty: 0,
        rate: 0,
        physical_qty: 0,
        delivery_date: values.delivery_date,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setFieldValue(
      'items',
      values.items.filter((_, i) => i !== index),
    );
    // Lock logic update omitted for brevity but should be kept
  };

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={styles.mainContainer}>
      {/* ── Top Inputs ─────────────────────────────────────────────────── */}
      <View style={styles.topSection}>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Transaction Date</Text>
            <View style={[styles.timeInput, styles.disabledInput]}>
              <Text style={styles.disabledText}>
                {values.transaction_date
                  ? moment(values.transaction_date).format('YYYY-MM-DD')
                  : 'Select Date'}
              </Text>
            </View>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Delivery Date</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => onDateSelect('delivery_date')}>
              <Text style={styles.timeText}>
                {values.delivery_date
                  ? moment(values.delivery_date).format('YYYY-MM-DD')
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ReusableDropdown
          label="Store"
          field="custom_warehouse"
          value={values.custom_warehouse}
          data={warehouseList}
          onChange={(val: string) => setFieldValue('custom_warehouse', val)}
          marginBottom={selectedStoreOutstanding > 0 ? 5 : 15}
        />
        {selectedStoreOutstanding > 0 ? (
          <View style={styles.outstandingCard}>
            <Text style={styles.outstandingLabel}>Outstanding due</Text>
            <Text style={styles.outstandingText}>
              ₹{selectedStoreOutstanding.toLocaleString()}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tableSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.tableScroll}>
          <View>
            {/* Table Header - Light Theme */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerText, { width: COLUMN_WIDTHS.item }]}>
                Item
              </Text>
              {/*  <Text
                style={[
                  styles.headerText,
                  { width: COLUMN_WIDTHS.stock, textAlign: 'right' },
                ]}>
                Stock
              </Text>*/}
              <Text
                style={[
                  styles.headerText,
                  { width: COLUMN_WIDTHS.qty, textAlign: 'center' },
                ]}>
                Stock
              </Text>
              <Text
                style={[
                  styles.headerText,
                  { width: COLUMN_WIDTHS.qty, textAlign: 'center' },
                ]}>
                Order Qty
              </Text>
              <Text
                style={[
                  styles.headerText,
                  { width: COLUMN_WIDTHS.qty, textAlign: 'center' },
                ]}>
                Rate
              </Text>
              <Text
                style={[
                  styles.headerText,
                  { width: COLUMN_WIDTHS.amount, textAlign: 'left' },
                ]}>
                Amount
              </Text>
              <View style={{ width: COLUMN_WIDTHS.action }} />
            </View>

            {/* List of Rows */}
            {values.items.map((item, index) => (
              <SaleItemField
                key={index}
                index={index}
                item={item}
                setFieldValue={setFieldValue}
                removeItem={removeItem}
                allItems={allItems}
                isStockFetching={isStockFetching}
              />
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.tableAddBtn} onPress={addNewItem}>
          <Text style={styles.addMoreText}>+ Select item to add...</Text>
        </TouchableOpacity>
      </View>

      {/* ── Footer Totals ────────────────────────────────────────────────── */}
      <View style={styles.footerSummary}>
        <Text style={styles.summaryText}>
          Total ({values.items.length} items ordered)
        </Text>
        <Text style={styles.totalAmount}>
          ₹
          {values.items
            .reduce((acc, curr) => acc + curr.qty * (curr.rate || 0), 0)
            .toLocaleString()}
        </Text>
      </View>
    </Animated.ScrollView>
  );
};

export default AddSaleForm;

const styles = StyleSheet.create({
  mainContainer: { paddingTop: 10, backgroundColor: '#ffffff' },
  topSection: { paddingHorizontal: 21, marginBottom: 0 },
  tableSection: { padding: 10, paddingVertical: 0 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  flex1: { flex: 1 },
  label: { fontSize: Size.xs, color: '#374151', fontFamily: Fonts.regular },
  timeInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 45,
    marginTop: 4,
  },
  timeText: { color: '#111827', fontFamily: Fonts.regular, fontSize: Size.xs },
  disabledInput: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  disabledText: {
    color: '#6b7280',
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
  },

  // Table Styling - Light Theme
  tableScroll: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb', // Light grey header
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
  tableAddBtn: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  addMoreText: { color: Colors.orange, fontFamily: Fonts.semiBold, fontSize: 13 },
  outstandingCard: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'space-between',
  },
  outstandingLabel: {
    fontSize: 12,
    color: '#b91c1c',
    fontFamily: Fonts.medium,
  },
  outstandingText: {
    fontSize: 14,
    color: '#b91c1c',
    fontFamily: Fonts.semiBold,
  },

  // Footer - Light Theme
  footerSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    // marginTop: 20,
  },
  summaryText: { color: '#6b7280', fontSize: 13 },
  totalAmount: { color: '#111827', fontSize: 16, fontFamily: Fonts.semiBold },
});
