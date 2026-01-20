/* eslint-disable react-native/no-inline-styles */
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  View,
  Dimensions,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useFormik} from 'formik';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import Toast from 'react-native-toast-message';
import {addSalesInvoiceSchema} from '../../../types/schema';
import {ISalesInvoiceParams, WarehouseStock} from '../../../types/baseType';
import {useGetItemsQuery} from '../../../features/dropdown/dropdown-api';
import {Item} from '../../../types/dropdownType';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {uniqueByValue} from '../../../utils/utils';
import {
  useCreateSalesInvoiceMutation,
  useLazyGetWarehousesWithStockQuery,
} from '../../../features/base/promoter-base-api';
import AddPromoterSaleForm from '../../../components/Promoter/Sales/AddSalesForm';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddSaleScreen'
>;

type Props = {
  navigation: NavigationProp;
};

/* ---------------- Initial Values ---------------- */

const initial: ISalesInvoiceParams = {
  items: [
    {
      item_code: '',
      qty: 0,
      rate: 0,
      warehouse: '',
    },
  ],
};

/* ---------------- Helpers ---------------- */

const uniqueByItemCode = <T extends {item_code: string}>(arr: T[]) => {
  const seen = new Set<string>();
  return arr.filter(item => {
    if (seen.has(item.item_code)) return false;
    seen.add(item.item_code);
    return true;
  });
};

/* ---------------- Screen ---------------- */

const AddSaleScreen = ({navigation}: Props) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);
  const [searchItem, setSearchItem] = useState('');
  const [itemPage, setItemPage] = useState(1);
  const [loadingMoreItems, setLoadingMoreItems] = useState(false);

  const [itemListData, setItemListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [itemOgListData, setItemOgListData] = useState<Item[]>([]);
  const [warehouseOgListData, setWarehouseOgListData] = useState<
    WarehouseStock[]
  >([]);

  /* ---------------- APIs ---------------- */

  const [createSalesInvoice] = useCreateSalesInvoiceMutation();

  const {data: itemData, isFetching: itemFetching} = useGetItemsQuery({
    search: searchItem,
    page: String(itemPage),
    page_size: '20',
  });

  const [
    triggerGetWarehouses,
    {data: warehouseData, isFetching: warehouseFetching, error},
  ] = useLazyGetWarehousesWithStockQuery();
  /* ---------------- Formik ---------------- */

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormik<ISalesInvoiceParams>({
    initialValues: initial,
    validationSchema: addSalesInvoiceSchema,
    onSubmit: async formValues => {
      try {
        setLoading(true);

        console.log('🚀 Create Sales Invoice Payload:', formValues);

        const res = await createSalesInvoice(formValues).unwrap();
        console.log('🚀 Create Sales Invoice res:', res);

        if (res?.message?.success) {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          navigation.navigate('OrdersScreen', {index: 1});
        } else {
          Toast.show({
            type: 'error',
            text1: '❌ Something went wrong',
            position: 'top',
          });
        }
      } catch (error: any) {
        console.error('Create Sales Invoice Error:', error);
        Toast.show({
          type: 'error',
          text1: error?.data?.message?.message || 'Internal Server Error',
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  /* ---------------- Item Pagination ---------------- */

  const handleLoadMoreItems = () => {
    if (itemFetching || loadingMoreItems) return;

    const currentPage = itemData?.message?.pagination?.page ?? 1;
    const totalPages = itemData?.message?.pagination?.total_pages ?? 1;

    if (currentPage >= totalPages) return;

    setLoadingMoreItems(true);
    setItemPage(prev => prev + 1);
  };

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (itemData?.message?.data) {
      setLoadingMoreItems(false);

      const newDropdownData = itemData.message.data.map(item => ({
        value: item.item_code,
        label: `${item.item_name} - ₹${item.selling_rate}`,
      }));

      if (searchItem || itemPage === 1) {
        setItemListData(uniqueByValue(newDropdownData));
        setItemOgListData(uniqueByItemCode(itemData.message.data));
      } else {
        setItemListData(prev => uniqueByValue([...prev, ...newDropdownData]));
        setItemOgListData(prev =>
          uniqueByItemCode([...prev, ...itemData.message.data]),
        );
      }
    }
  }, [itemData]);

  useEffect(() => {
    setItemPage(1);
  }, [searchItem]);

  /* 🔥 Call warehouse API when item selected */
  useEffect(() => {
    const itemCode = values.items?.[0]?.item_code;
    if (itemCode) {
      triggerGetWarehouses({item_code: itemCode});
    }
  }, [values.items?.[0]?.item_code]);

  /* ---------------- Warehouses Dropdown ---------------- */

  const warehouseOptions =
    warehouseData?.message?.data?.warehouses?.map(w => ({
      label: `${w.store_name} (Stock: ${w.actual_qty})`,
      value: w.warehouse_id,
    })) || [];

  useEffect(() => {
    if (warehouseData?.message?.data) {
      setWarehouseOgListData(warehouseData?.message?.data?.warehouses);
    }
  }, [warehouseData]);

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={[flexCol, styles.container]}>
      <PageHeader
        title="Add Sales Invoice"
        navigation={() => navigation.navigate('SalesScreen')}
      />

      <AddPromoterSaleForm
        values={values}
        errors={errors}
        touched={touched}
        handleChange={handleChange}
        handleBlur={handleBlur}
        setFieldValue={setFieldValue}
        scrollY={scrollY}
        itemList={itemListData}
        originalItemList={itemOgListData}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        onLoadMoreItems={handleLoadMoreItems}
        loadingMoreItems={loadingMoreItems}
        warehouseList={warehouseOptions}
        warehouseLoading={warehouseFetching}
        ogWareHouseList={warehouseOgListData}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && {opacity: 0.7}]}
          onPress={() => handleSubmit()}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddSaleScreen;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  footer: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgColor,
    width: '100%',
    height: 80,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingVertical: 18,
    width: width * 0.9,
  },
  submitText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
  },
});
