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
import { useAppSelector } from '../../../../store/hook';

interface Props {
  index: number;
  item: any;
  setFieldValue: (field: string, value: any) => void;
  removeItem: (index: number) => void;
  //   originalItemList: any[];
  errors: any;
  touched: any;
  handleBlur: any;
}

const SaleItemField: React.FC<Props> = ({
  index,
  item,
  setFieldValue,
  removeItem,
  errors,
  touched,
  handleBlur,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemList, setItemList] = useState<any[]>([]);
  const [rawItemList, setRawItemList] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const selectedStore = useAppSelector(
    state => state?.persistedReducer?.pjpSlice?.selectedStore,
  );
  const { data, isFetching } = useGetItemsQuery({
    page: String(page),
    page_size: '20',
    search,
  });

  // ── Stock status query ──────────────────────────────────────────────────────
  const { data: stockData } = useGetStoreStockStatusQuery(
    { store: selectedStore as string },
    { skip: !selectedStore || !item.item_code }, // only fetch once an item is selected
  );

  // Find the stock entry matching the selected item
  const stockInfo = stockData?.message?.data?.find(
    s => s.item_code === item.item_code,
  ) ?? null;
  // ────────────────────────────────────────────────────────────────────────────


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
          setFieldValue(`items[${index}].item_code`, val);
          handleSelectedItemValues(val);
        }}
        searchText={search}
        setSearchText={setSearch}
        onLoadMore={handleLoadMore}
        loadingMore={loadingMore}
      />

      {/* ── Stock info strip (read-only) ────────────────────────────────────── */}
      {stockInfo && (
        <View style={styles.stockDetailsRow}>
          <View style={styles.stockInfoItem}>
            <Text style={styles.stockMiniLabel}>
              Opening:{' '}
              <Text style={styles.stockMiniValue}>{stockInfo.opening_stock}</Text>
            </Text>
          </View>
          <View style={styles.stockInfoItem}>
            <Text style={styles.stockMiniLabel}>
              Current:{' '}
              <Text style={styles.stockMiniValue}>{stockInfo.current_stock}</Text>
            </Text>
          </View>
          <View style={styles.stockInfoItem}>
            <Text style={styles.stockMiniLabel}>
              MTD Territory:{' '}
              <Text style={styles.stockMiniValue}>{stockInfo.mtd_territory}</Text>
            </Text>
          </View>
          <View style={styles.stockInfoItem}>
            <Text style={styles.stockMiniLabel}>
              Last:{' '}
              <Text style={styles.stockMiniValue}>
                {stockInfo.physical_count ?? '—'}
              </Text>
            </Text>
          </View>
        </View>
      )}
      {/* ────────────────────────────────────────────────────────────────────── */}


      <View style={styles.row}>

        <View style={styles.flex1}>
          <ReusableInput
            label="Qty"
            value={item.qty ? String(item.qty) : ''}
            keyboardType="numeric"
            onChangeText={text =>
              setFieldValue(
                `items[${index}].qty`,
                Number(text.replace(/[^0-9]/g, '')),
              )
            }
            onBlur={() => handleBlur(`items[${index}].qty`)}
            error={touched.items?.[index]?.qty && errors.items?.[index]?.qty}
          />
        </  View>
        <View style={styles.flex1}>
          <ReusableInput
            label="Rate"
            value={item.rate ? String(item.rate) : ''}
            keyboardType="numeric"
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

      {/* <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setTimePickerVisible(true)}>
        <Text>
          {item.delivery_date
            ? moment(item.delivery_date).format('YYYY-MM-DD')
            : 'Select Date'}
        </Text>
      </TouchableOpacity> */}
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
  // ── Stock strip ────────────────────────────────────────────────────────────
  stockDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f0f7ff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 8,
    gap: 6,
  },
  stockInfoItem: {
    flexBasis: '45%', // 2 columns
    flexGrow: 1,
  },
  stockMiniLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#64748B',
  },
  stockMiniValue: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: Size.xs
  },
  // ──────────────
  label: { fontSize: Size.xs, marginBottom: 4, color: Colors.black, fontFamily: Fonts.regular },
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
