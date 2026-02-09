import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, Text, Alert, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import ReusableInput from '../../ui-lib/reuseable-input';

import {useGetItemsQuery} from '../../../features/dropdown/dropdown-api';
import {useLazyGetWarehousesWithStockQuery} from '../../../features/base/promoter-base-api';

import {uniqueByValue} from '../../../utils/utils';

/* ---------------- Types ---------------- */

interface ItemRow {
  item_code: string;
  qty: number;
  rate: number;
  warehouse: string;
}

interface Warehouse {
  warehouse_id: string;
  store_name: string;
  actual_qty: number;
}

interface Props {
  index: number;
  item: ItemRow;
  errors: any;
  touched: any;
  setFieldValue: any;
  handleBlur: any;
  removeItem: (index: number) => void;
}

/* ---------------- Component ---------------- */

const PromoterSaleItemRow: React.FC<Props> = ({
  index,
  item,
  errors,
  touched,
  setFieldValue,
  handleBlur,
  removeItem,
}) => {
  /* ---------- Item API ---------- */

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemList, setItemList] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const {data, isFetching} = useGetItemsQuery({
    search,
    page: String(page),
    page_size: '20',
  });

  /* Reset pagination on search */
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (data?.message?.data) {
      const newData = data.message.data.map((i: any) => ({
        label: `${i.item_name} - ₹${i.selling_rate}`,
        value: i.item_code,
        rate: i.selling_rate,
      }));

      if (page === 1) {
        setItemList(uniqueByValue(newData));
      } else {
        setItemList(prev => uniqueByValue([...prev, ...newData]));
      }

      setLoadingMore(false);
    }
  }, [data]);

  const handleLoadMore = () => {
    if (isFetching || loadingMore) return;
    setLoadingMore(true);
    setPage(p => p + 1);
  };

  /* ---------- Warehouse API ---------- */

  const [warehouseList, setWarehouseList] = useState<any[]>([]);
  const [ogWarehouseList, setOgWarehouseList] = useState<Warehouse[]>([]);

  const [
    triggerGetWarehouses,
    {data: warehouseData, isFetching: warehouseLoading},
  ] = useLazyGetWarehousesWithStockQuery();

  useEffect(() => {
    if (item.item_code) {
      triggerGetWarehouses({item_code: item.item_code});
    }
  }, [item.item_code]);

  useEffect(() => {
    if (warehouseData?.message?.data) {
      const wh: Warehouse[] = warehouseData.message.data.warehouses;

      setOgWarehouseList(wh);

      setWarehouseList(
        wh.map(w => ({
          label: `${w.store_name} (Stock: ${w.actual_qty})`,
          value: w.warehouse_id,
        })),
      );
    }
  }, [warehouseData]);

  const selectedWh = ogWarehouseList.find(
    w => w.warehouse_id === item.warehouse,
  );

  /* ---------- UI ---------- */

  return (
    <View style={styles.itemBlock}>
      {index > 0 && (
        <TouchableOpacity
          onPress={() => removeItem(index)}
          style={styles.removeButton}>
          <Ionicons name="trash-bin-outline" size={20} color="#FF0000" />
        </TouchableOpacity>
      )}

      <ReusableDropdown
        label="Item"
        field={`items[${index}].item_code`}
        value={item.item_code}
        data={itemList}
        onChange={(val: string) => {
          const selected = itemList.find(i => i.value === val);

          setFieldValue(`items[${index}].item_code`, val);
          setFieldValue(`items[${index}].rate`, selected?.rate || 0);
          setFieldValue(`items[${index}].warehouse`, '');
        }}
        searchText={search}
        setSearchText={setSearch}
        onLoadMore={handleLoadMore}
        loadingMore={loadingMore}
        error={
          touched.items?.[index]?.item_code && errors.items?.[index]?.item_code
        }
      />

      <ReusableDropdown
        label="Warehouse"
        field={`items[${index}].warehouse`}
        value={item.warehouse}
        data={warehouseList}
        // loading={warehouseLoading}
        disabled={!item.item_code}
        onChange={(val: string) =>
          setFieldValue(`items[${index}].warehouse`, val)
        }
        error={
          touched.items?.[index]?.warehouse && errors.items?.[index]?.warehouse
        }
      />

      <ReusableInput
        label={`Quantity ${
          selectedWh ? `(Available: ${selectedWh.actual_qty})` : ''
        }`}
        value={item.qty ? String(item.qty) : ''}
        keyboardType="numeric"
        onChangeText={text => {
          let qty = Number(text.replace(/[^0-9]/g, ''));

          if (selectedWh && qty > selectedWh.actual_qty) {
            Alert.alert('Stock Limit', `Max stock ${selectedWh.actual_qty}`);
            qty = selectedWh.actual_qty;
          }

          setFieldValue(`items[${index}].qty`, qty);
        }}
        onBlur={() => handleBlur(`items[${index}].qty`)}
        error={touched.items?.[index]?.qty && errors.items?.[index]?.qty}
      />

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
      />

      <Text style={styles.amount}>
        Amount: {item.qty && item.rate ? item.qty * item.rate : '—'}
      </Text>
    </View>
  );
};

export default PromoterSaleItemRow;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  itemBlock: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  amount: {
    marginTop: 6,
    fontWeight: '600',
  },
});
