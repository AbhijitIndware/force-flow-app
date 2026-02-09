import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import ReusableInput from '../../../ui-lib/reuseable-input';
import {useGetItemsQuery} from '../../../../features/dropdown/dropdown-api';

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

  const {data, isFetching} = useGetItemsQuery({
    page: String(page),
    page_size: '20',
    search,
  });

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

      <ReusableInput
        label="Quantity"
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

      <View style={styles.amountBox}>
        <Text>{item.qty > 0 ? item.qty * item.rate : 'Total Amount'}</Text>
      </View>

      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setTimePickerVisible(true)}>
        <Text>
          {item.delivery_date
            ? moment(item.delivery_date).format('YYYY-MM-DD')
            : 'Select Date'}
        </Text>
      </TouchableOpacity>
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
    padding: 10,
    backgroundColor: '#f5f5f5',
    marginTop: 8,
    borderRadius: 6,
  },
  dateBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ececec',
    marginTop: 10,
    borderRadius: 6,
  },
});
