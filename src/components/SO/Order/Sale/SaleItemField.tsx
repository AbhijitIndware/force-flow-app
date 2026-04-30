import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import ReusableInput from '../../../ui-lib/reuseable-input';
import { useGetItemsQuery } from '../../../../features/dropdown/dropdown-api';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { useGetStoreStockStatusQuery } from '../../../../features/base/base-api';

interface Props {
  index: number;
  item: any;
  setFieldValue: (field: string, value: any) => void;
  removeItem: (index: number) => void;
  errors: any;
  touched: any;
  handleBlur: any;
  store: string;
  onLockChange: (index: number, isLocked: boolean) => void; // ← NEW
}

const SaleItemField: React.FC<Props> = ({
  index,
  item,
  setFieldValue,
  removeItem,
  errors,
  touched,
  handleBlur,
  store,
  onLockChange, // ← NEW
}) => {
  console.log("🚀 ~ SaleItemField ~ store:", store)
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemList, setItemList] = useState<any[]>([]);
  const [rawItemList, setRawItemList] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [currentItemCode, setCurrentItemCode] = useState<string | null>(
    item.item_code ?? null,
  );

  const { data, isFetching } = useGetItemsQuery({
    page: String(page),
    page_size: '20',
    search,
  });

  const { data: stockData, isFetching: isStockFetching } =
    useGetStoreStockStatusQuery(
      { store: store as string },
      { skip: !store },
    );
  console.log("🚀 ~ SaleItemField ~ stockData:", stockData)

  const stockInfo =
    currentItemCode && !isStockFetching
      ? (stockData?.message?.data?.find(
        s => s.item_code === currentItemCode,
      ) ?? null)
      : null;

  // ── Order lock logic ──────────────────────────────────────────────────────
  const isExistingItem =
    stockInfo !== null &&
    (stockInfo.opening_stock > 0 || stockInfo.current_stock > 0);

  const isOrderLocked = isExistingItem && stockInfo?.physical_count === null;

  const canOrder = !currentItemCode
    ? true
    : isStockFetching
      ? false
      : !isOrderLocked;
  // ──────────────────────────────────────────────────────────────────────────

  // ── Notify parent whenever lock state changes ─────────────────────────────
  useEffect(() => {
    if (currentItemCode && !isStockFetching) {
      onLockChange(index, isOrderLocked);
    } else if (!currentItemCode) {
      // Item cleared → no longer locked
      onLockChange(index, false);
    }
  }, [isOrderLocked, isStockFetching, currentItemCode, index]);
  // ──────────────────────────────────────────────────────────────────────────

  const transform = (arr: any[] = []) =>
    arr.map(i => ({
      label: `${i.item_name} (${i.item_code}) - ₹${i.selling_rate}`,
      value: i.item_code,
    }));

  useEffect(() => {
    if (data?.message?.data) {
      const apiData = data.message.data;
      const newDropdown = transform(apiData);

      if (search || page === 1) {
        setItemList(newDropdown);
        setRawItemList(apiData);
      } else {
        setItemList(prev => {
          const merged = [...prev, ...newDropdown];
          return Array.from(new Map(merged.map(i => [i.value, i])).values());
        });
        setRawItemList(prev => {
          const merged = [...prev, ...apiData];
          return Array.from(
            new Map(merged.map(i => [i.item_code, i])).values(),
          );
        });
      }
      setLoadingMore(false);
    }
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleLoadMore = () => {
    if (isFetching || loadingMore) return;
    const current = data?.message?.pagination?.page ?? 1;
    const total = data?.message?.pagination?.total_pages ?? 1;
    if (current >= total) return;
    setLoadingMore(true);
    setPage(prev => prev + 1);
  };

  const handleSelectedItemValues = (itemCode: string) => {
    const selectedItem = rawItemList.find(i => i.item_code === itemCode);
    if (selectedItem) {
      setFieldValue(`items[${index}].rate`, selectedItem.selling_rate);
    }
    setCurrentItemCode(itemCode);
  };

  return (
    <View style={styles.itemBlock}>
      {index > 0 && (
        <TouchableOpacity
          onPress={() => removeItem(index)}
          style={styles.removeButton}>
          <Ionicons name="trash-bin-outline" size={20} color={'#FF0000'} />
        </TouchableOpacity>
      )}

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          setFieldValue(
            `items[${index}].delivery_date`,
            moment(date).format('YYYY-MM-DD'),
          );
          setTimePickerVisible(false);
        }}
        onCancel={() => setTimePickerVisible(false)}
      />

      <ReusableDropdown
        label="Item"
        field={`items[${index}].item_code`}
        value={item.item_code}
        data={itemList}
        error={
          touched.items?.[index]?.item_code && errors.items?.[index]?.item_code
        }
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

      {/* ── Stock info strip ─────────────────────────────────────────────── */}
      {stockInfo && (
        <View style={styles.stockCard}>
          <View style={styles.stockRow}>
            <View style={styles.stockCell}>
              <Text style={styles.stockLabel}>Opening</Text>
              <Text style={styles.stockValue}>
                {stockInfo.opening_stock}
              </Text>
            </View>

            <View style={styles.stockCell}>
              <Text style={styles.stockLabel}>Current</Text>
              <Text style={styles.stockValue}>
                {stockInfo.current_stock}
              </Text>
            </View>
          </View>

          <View style={styles.stockRow}>
            <View style={styles.stockCell}>
              <Text style={styles.stockLabel}>MTD Territory</Text>
              <Text style={styles.stockValue}>
                {stockInfo.mtd_territory}
              </Text>
            </View>

            <View style={styles.stockCell}>
              <Text style={styles.stockLabel}>New orders</Text>
              <Text style={styles.stockValue}>
                {stockInfo.new_orders ?? '—'}
              </Text>
            </View>
          </View>
        </View>
      )}


      {/* ── Lock warning banner ──────────────────────────────────────────── */}
      {currentItemCode && !isStockFetching && isOrderLocked && (
        <View style={styles.lockBanner}>
          <Ionicons name="lock-closed-outline" size={14} color="#b45309" />
          <Text style={styles.lockText}>
            Update physical shelf stock for this item before placing an order.
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.flex1}>
          <ReusableInput
            label="Qty"
            value={item.qty ? String(item.qty) : ''}
            keyboardType="numeric"
            disabled={!canOrder}
            onChangeText={text =>
              setFieldValue(
                `items[${index}].qty`,
                Number(text.replace(/[^0-9]/g, '')),
              )
            }
            onBlur={() => handleBlur(`items[${index}].qty`)}
            error={touched.items?.[index]?.qty && errors.items?.[index]?.qty}
          />
        </View>
        <View style={styles.flex1}>
          <ReusableInput
            label="Rate"
            value={item.rate ? String(item.rate) : ''}
            keyboardType="numeric"
            disabled={!canOrder}
            onChangeText={text =>
              setFieldValue(
                `items[${index}].rate`,
                Number(text.replace(/[^0-9]/g, '')),
              )
            }
            onBlur={() => handleBlur(`items[${index}].rate`)}
            error={touched.items?.[index]?.rate && errors.items?.[index]?.rate}
            marginBottom={0}
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountBox}>
            <Text style={styles.amountText}>
              {item.qty > 0 ? item.qty * item.rate : '0'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SaleItemField;

const styles = StyleSheet.create({
  itemBlock: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#ecececff',
    backgroundColor: '#fff',
  },
  removeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  amountBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ecececff',
  },
  amountText: {
    color: '#000',
    fontSize: 12,
  },
  stockCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    backgroundColor: '#e3e3e3ff',
  },

  stockRow: {
    flexDirection: 'row',
  },

  stockCell: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ffffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  stockCellLast: {
    borderRightWidth: 0,
  },

  // Remove bottom border for last row (optional improvement)
  stockLastRow: {
    borderBottomWidth: 0,
  },

  stockLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: Fonts.regular,
  },

  stockValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Fonts.semiBold,
  },

  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  lockText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#b45309',
    lineHeight: 16,
  },
  label: {
    fontSize: Size.xs,
    marginBottom: 4,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  flex1: {
    flex: 1,
  },
  dateBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ececec',
    marginTop: 10,
    borderRadius: 6,
  },
});