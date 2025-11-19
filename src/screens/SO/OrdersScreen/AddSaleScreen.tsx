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
import {useEffect, useRef, useState} from 'react';
import {useFormik} from 'formik';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import Toast from 'react-native-toast-message';
import AddSaleForm from '../../../components/SO/Order/Sale/AddSaleForm';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {addSalesOrderSchema} from '../../../types/schema'; // ✅ create schema for sales order
import {IAddSalesOrder, RSoDetailData} from '../../../types/baseType';
import {
  useAddSaleOrderMutation,
  useGetSalesOrderByIdQuery,
  useUpdateSaleOrderMutation,
} from '../../../features/base/base-api';
import {
  useGetAllDropdownForSalesOrderQuery,
  useGetItemsQuery,
  useLazyGetDailyStoreQuery,
} from '../../../features/dropdown/dropdown-api';
import {Item, SoItem, SoStore} from '../../../types/dropdownType';
import {useAppSelector} from '../../../store/hook';
import {Search} from 'lucide-react-native';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {uniqueByValue} from '../../../utils/utils';
const {width} = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddSaleScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// helper: transform API data (RSoDetailData) -> Formik's IAddSalesOrder
const mapSalesDetailToForm = (detail: RSoDetailData): IAddSalesOrder => {
  return {
    transaction_date: detail.order_details.transaction_date,
    delivery_date: detail.order_details.delivery_date,
    custom_warehouse: detail.order_details.custom_warehouse || '',
    items: detail.items.map(it => ({
      item_code: it.item_code,
      qty: it.qty,
      rate: it.rate,
      delivery_date: it.delivery_date,
    })),
    terms: detail.order_details.terms,
    submit_order: false, // 👈 keep false, because edit is not auto-submitting
  };
};

// ✅ Initial values for Sales Order
const initial: IAddSalesOrder = {
  transaction_date: moment().format('YYYY-MM-DD'),
  delivery_date: moment().add(7, 'days').format('YYYY-MM-DD'),
  custom_warehouse: '',
  items: [
    {
      item_code: '',
      qty: 0,
      rate: 0,
      delivery_date: moment().add(7, 'days').format('YYYY-MM-DD'),
    },
  ],
  terms: null,
  submit_order: false,
};
// For original item data (API objects)
const uniqueByItemCode = <T extends {item_code: string}>(arr: T[]) => {
  const seen = new Set<string>();
  return arr.filter(item => {
    if (seen.has(item.item_code)) return false;
    seen.add(item.item_code);
    return true;
  });
};

const AddSaleScreen = ({navigation, route}: Props) => {
  const [loading, setLoading] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [activeField, setActiveField] = useState<
    null | 'transaction_date' | 'delivery_date'
  >(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const {orderId} = route.params;
  const [initialValues, setInitialValues] = useState<IAddSalesOrder>(initial);
  const [searchItem, setSearchItem] = useState('');
  const [itemListData, setItemListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [itemOgListData, setItemOgListData] = useState<Item[]>([]);
  const [itemPage, setItemPage] = useState(1);
  const [loadingMoreItems, setLoadingMoreItems] = useState(false);

  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );

  const [addSalesOrder] = useAddSaleOrderMutation();
  const [updateSaleOrder] = useUpdateSaleOrderMutation();
  const [triggerStoreFetch, {data: storeData, error}] =
    useLazyGetDailyStoreQuery();
  const {data: salesDetails, isFetching} = useGetSalesOrderByIdQuery(orderId, {
    skip: orderId === null || orderId === undefined,
  });
  const {data: itemData, isFetching: itemFetching} = useGetItemsQuery({
    search: searchItem,
    page: String(itemPage),
    page_size: '20',
  });

  useEffect(() => {
    if (salesDetails?.message?.data) {
      let _initial_value = mapSalesDetailToForm(salesDetails.message.data);
      setInitialValues(_initial_value);
    }
  }, [salesDetails, orderId]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormik<IAddSalesOrder>({
    initialValues: initialValues,
    validationSchema: addSalesOrderSchema,
    enableReinitialize: true,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);
        let res;

        if (orderId) {
          // 🔹 Update API
          res = await updateSaleOrder({
            ...formValues,
            order_id: orderId,
          }).unwrap();
        } else {
          // 🔹 Add API
          console.log('🚀 ~ AddSaleScreen ~ formValues:', formValues);
          res = await addSalesOrder(formValues).unwrap();
          console.log('🚀 ~ AddSaleScreen ~ res:', res);
        }

        if (res?.message?.success) {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          actions.resetForm();
          navigation.navigate('OrdersScreen', {index: 1});
        } else {
          Toast.show({
            type: 'error',
            text1: `❌ ${res.message.message || 'Something went wrong'}`,
            position: 'top',
          });
        }
      } catch (error: any) {
        console.error('Sales Order API Error:', error);
        Toast.show({
          type: 'error',
          text1:
            `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
          text2: 'Please try again later.',
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleLoadMoreItems = () => {
    if (itemFetching || loadingMoreItems) return;

    const currentPage = itemData?.message?.pagination?.page ?? 1;
    const totalPages = itemData?.message?.pagination?.total_pages ?? 1;

    if (currentPage >= totalPages) return; // 🚫 No more pages

    setLoadingMoreItems(true);
    setItemPage(prev => prev + 1);
  };

  // ✅ Transform Stores/Warehouses for dropdown
  const warehouseList = storeData?.message?.stores?.map(store => ({
    value: store.warehouse_id, // what will be stored
    label: `${store.store_name} | ${store.store_category}`,
  }));

  if (orderId && isFetching) {
    return (
      <SafeAreaView
        style={[
          flexCol,
          {flex: 1, justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (itemData?.message?.data) {
      setLoadingMoreItems(false);
      const newData = itemData.message.data.map(item => ({
        value: item.item_code,
        label: `${item.item_name} (${item.item_code}) - ₹${item.selling_rate}`,
      }));

      // If search text exists → replace the list (fresh search)
      // Else → append (pagination)
      if (searchItem.trim() !== '' || itemPage === 1) {
        setItemListData(uniqueByValue(newData));
        setItemOgListData(uniqueByItemCode(itemData.message.data));
      } else {
        setItemListData(prev => uniqueByValue([...prev, ...newData]));
        setItemOgListData(prev =>
          uniqueByItemCode([...prev, ...itemData.message.data]),
        );
      }
    }
  }, [itemData]);

  useEffect(() => {
    setItemPage(() => 1); // ensures page resets immediately & cleanly
  }, [searchItem]);

  useEffect(() => {
    if (salesDetails?.message?.data) {
      let _initial_value = mapSalesDetailToForm(salesDetails.message.data);
      setInitialValues(_initial_value);
    }
  }, [salesDetails, orderId]);

  useEffect(() => {
    if (user?.email && values?.transaction_date) {
      triggerStoreFetch({
        user: user.email,
        date: values?.transaction_date,
      });
    }
  }, [user?.email, values?.transaction_date]);

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Add Sales Order"
        navigation={
          () => navigation.navigate('OrdersScreen', {index: 1})
          //  navigation.navigate('Home')
        }
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          if (activeField) {
            const formatted = moment(date).format('YYYY-MM-DD');

            // ✅ Apply delivery_date to all items
            const updatedItems = values.items.map(it => ({
              ...it,
              delivery_date: formatted,
            }));

            setFieldValue('items', updatedItems);
            setFieldValue(activeField, formatted);
          }
          setTimePickerVisible(false);
        }}
        onCancel={() => setTimePickerVisible(false)}
      />

      <AddSaleForm
        values={values}
        errors={errors}
        touched={touched}
        handleChange={handleChange}
        handleBlur={handleBlur}
        setFieldValue={setFieldValue}
        scrollY={scrollY}
        itemList={itemListData || []}
        originalItemList={itemOgListData || []}
        warehouseList={warehouseList || []}
        onDateSelect={field => {
          setActiveField(field);
          setTimePickerVisible(true);
        }}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        // ✅ Pagination props
        onLoadMoreItems={handleLoadMoreItems}
        loadingMoreItems={loadingMoreItems}
      />
      <View
        style={{
          paddingHorizontal: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.bgColor,
          width: '100%',
          height: 80,
        }}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && {opacity: 0.7}]}
          onPress={() => handleSubmit()}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddSaleScreen;

const styles = StyleSheet.create({
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'absolute',
    bottom: 15,
    gap: 5,
    zIndex: 1,
    width: width * 0.9,
  },
  submitText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
