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
import { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import Toast from 'react-native-toast-message';
import AddSaleForm from '../../../components/SO/Order/Sale/AddSaleForm';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { addSalesOrderSchema } from '../../../types/schema';
import { IAddSalesOrder, RSoDetailData } from '../../../types/baseType';
import {
  useAddSaleOrderMutation,
  useGetSalesOrderByIdQuery,
  useUpdateSaleOrderMutation,
} from '../../../features/base/base-api';
import { useLazyGetDailyStoreQuery } from '../../../features/dropdown/dropdown-api';
import { useAppSelector } from '../../../store/hook';
import { History } from 'lucide-react-native'; // ← NEW
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { getStoreLabel } from '../../../utils/utils';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddSaleScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const mapSalesDetailToForm = (detail: RSoDetailData): IAddSalesOrder => ({
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
  submit_order: false,
});

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

const AddSaleScreen = ({ navigation, route }: Props) => {
  const [loading, setLoading] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  type DateField = 'transaction_date' | 'delivery_date';
  const [activeField, setActiveField] = useState<DateField | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const orderId = route.params?.orderId;
  const [initialValues, setInitialValues] = useState<IAddSalesOrder>(initial);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  console.log("🚀 ~ AddSaleScreen ~ selectedStoreName:", selectedStoreName)
  const [hasLockedItem, setHasLockedItem] = useState(false); // ← NEW

  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );
  const selectedStore = useAppSelector(
    state => state?.persistedReducer?.pjpSlice?.selectedStore,
  );

  const [addSalesOrder] = useAddSaleOrderMutation();
  const [updateSaleOrder] = useUpdateSaleOrderMutation();
  const [triggerStoreFetch, { data: storeData }] = useLazyGetDailyStoreQuery();
  const { data: salesDetails, isFetching } = useGetSalesOrderByIdQuery(
    orderId,
    { skip: orderId === null || orderId === undefined },
  );

  useEffect(() => {
    if (salesDetails?.message?.data) {
      setInitialValues(mapSalesDetailToForm(salesDetails.message.data));
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
    initialValues,
    validationSchema: addSalesOrderSchema,
    enableReinitialize: true,
    onSubmit: async (formValues, actions) => {
      try {
        setLoading(true);
        let res;
        if (orderId) {
          res = await updateSaleOrder({
            ...formValues,
            order_id: orderId,
          }).unwrap();
        } else {
          res = await addSalesOrder(formValues).unwrap();
        }

        if (res?.message?.success) {
          Toast.show({
            type: 'success',
            text1: `✅ ${res.message.message}`,
            position: 'top',
          });
          actions.resetForm();
          navigation.navigate('OrdersScreen', { index: 1 });
        } else {
          Toast.show({
            type: 'error',
            text1: `❌ ${res.message.message || 'Something went wrong'}`,
            position: 'top',
          });
        }
      } catch (error: any) {
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

  const warehouseList = storeData?.message?.stores?.map(store => ({
    value: store.warehouse_id,
    label: getStoreLabel(store),
  }));

  useEffect(() => {
    if (user?.email && values?.transaction_date) {
      triggerStoreFetch({ user: user.email, date: values.transaction_date });
    }
  }, [user?.email, values?.transaction_date]);

  useEffect(() => {
    if (!orderId && selectedStore && storeData?.message?.stores) {
      const store = storeData.message.stores.find(
        s => s.store === selectedStore,
      );
      console.log("🚀 ~ AddSaleScreen ~ store:", store)
      if (store) {
        setFieldValue('custom_warehouse', store.warehouse_id);
        setSelectedStoreName(store.store_name);
      } else {
        setSelectedStoreName(selectedStore);
      }
    }
  }, [selectedStore, orderId, storeData]);

  if (orderId && isFetching) {
    return (
      <SafeAreaView
        style={[
          flexCol,
          { flex: 1, justifyContent: 'center', alignItems: 'center' },
        ]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader
        title="Create Sales Order"
        navigation={() =>
          navigation.navigate('OrdersScreen', { index: 1 })
        }
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          if (activeField) {
            const formatted = moment(date).format('YYYY-MM-DD');
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
        warehouseList={warehouseList || []}
        selectedStore={selectedStoreName}
        onDateSelect={field => {
          setActiveField(field);
          setTimePickerVisible(true);
        }}
        onAnyItemLocked={setHasLockedItem} // ← NEW
      />

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
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

        {/* ── Physical Stock FAB — only when at least one item is locked ── */}
        {hasLockedItem && (
          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('StockManagementFormScreen', {
                store: selectedStore as string,
                storeName: selectedStoreName,
                items: values.items, // ← pass all current items
              })
            }>
            <History size={18} color={Colors.white} />
            <Text style={styles.fabText}>Update Physical Stock</Text>
          </TouchableOpacity>
        )}

        {/* ── Create Order button ────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.submitBtn, (loading || hasLockedItem) && { opacity: 0.7 }]}
          onPress={() => handleSubmit()}
          disabled={loading || hasLockedItem}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Create Order</Text>
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
  fab: {
    position: 'absolute',
    top: -48,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 2,
  },
  fabText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.white,
  },
});