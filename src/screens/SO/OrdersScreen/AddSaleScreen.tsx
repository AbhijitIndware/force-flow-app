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
import { IAddSalesOrderV2, RSoDetailData } from '../../../types/baseType';
import {
  useCreateSalesOrderWithStockMutation,
  useGetSalesOrderByIdQuery,
  useGetStoreStockStatusQuery,
  useUpdateSaleOrderMutation,
} from '../../../features/base/base-api';
import { useLazyGetDailyStoreQuery } from '../../../features/dropdown/dropdown-api';
import { useAppSelector } from '../../../store/hook';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { getStoreLabel } from '../../../utils/utils';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<SoAppStackParamList, 'AddSaleScreen'>;
type Props = { navigation: NavigationProp; route: any };

const mapSalesDetailToForm = (detail: RSoDetailData): IAddSalesOrderV2 => ({
  transaction_date: detail.order_details.transaction_date,
  delivery_date: detail.order_details.delivery_date,
  custom_warehouse: detail.order_details.custom_warehouse || '',
  items: detail.items.map(it => ({
    item_code: it.item_code,
    qty: it.qty,
    rate: it.rate,
    delivery_date: it.delivery_date,
    physical_qty: it.physical_qty,
  })),
  terms: detail.order_details.terms,
  submit_order: false,
});

const EMPTY_ITEM = {
  item_code: '',
  qty: 0,
  rate: 0,
  physical_qty: 0,
  delivery_date: moment().add(7, 'days').format('YYYY-MM-DD'),
};

const initial: IAddSalesOrderV2 = {
  transaction_date: moment().format('YYYY-MM-DD'),
  delivery_date: moment().add(7, 'days').format('YYYY-MM-DD'),
  custom_warehouse: '',
  items: [{ ...EMPTY_ITEM }],
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
  const [initialValues, setInitialValues] = useState<IAddSalesOrderV2>(initial);
  const [selectedStoreName, setSelectedStoreName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [hasLockedItem, setHasLockedItem] = useState(false);
  const [seededCount, setSeededCount] = useState(0);
  const seededWarehouseRef = useRef<string | null>(null);

  const user = useAppSelector(state => state?.persistedReducer?.authSlice?.user);
  const selectedStore = useAppSelector(state => state?.persistedReducer?.pjpSlice?.selectedStore);

  const [addSalesOrder] = useCreateSalesOrderWithStockMutation();
  const [updateSaleOrder] = useUpdateSaleOrderMutation();
  const [triggerStoreFetch, { data: storeData }] = useLazyGetDailyStoreQuery();
  const { data: salesDetails, isFetching } = useGetSalesOrderByIdQuery(orderId, {
    skip: orderId === null || orderId === undefined,
  });

  // ── Single stock fetch — results flow down as plain props ─────────────────
  const { data: stockData, isFetching: isStockFetching } = useGetStoreStockStatusQuery(
    { store: selectedStoreId },
    { skip: !selectedStoreId },
  );

  // Derived values passed to AddSaleForm → SaleItemField
  const allItems = stockData?.message?.all_items ?? [];
  const stockWarning = stockData?.message?.warning;

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue } =
    useFormik<IAddSalesOrderV2>({
      initialValues,
      validationSchema: addSalesOrderSchema,
      enableReinitialize: true,
      onSubmit: async (formValues, actions) => {
        try {
          setLoading(true);
          const res = orderId
            ? await updateSaleOrder({ ...formValues, order_id: orderId }).unwrap()
            : await addSalesOrder(formValues).unwrap();

          if (res?.message?.success) {
            Toast.show({ type: 'success', text1: `✅ ${res.message.message}`, position: 'top' });
            actions.resetForm();
            seededWarehouseRef.current = null;
            setSeededCount(0);
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
            text1: `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
            text2: 'Please try again later.',
            position: 'top',
          });
        } finally {
          setLoading(false);
        }
      },
    });

  // ── Seed previous_items when stock loads ──────────────────────────────────
  useEffect(() => {
    if (orderId || isStockFetching || !values.custom_warehouse) return;
    if (seededWarehouseRef.current === values.custom_warehouse) return;

    const previousItems = stockData?.message?.previous_items ?? [];
    const defaultDate = moment().add(7, 'days').format('YYYY-MM-DD');

    if (previousItems.length > 0) {
      const seededItems = previousItems.map(i => ({
        item_code: i.item_code,
        qty: 0,
        rate: i.item_rate ?? 0,
        physical_qty: i.physical_count ?? 0,
        delivery_date: defaultDate,
      }));
      setFieldValue('items', [...seededItems]);
      setSeededCount(seededItems.length);
    } else {
      setFieldValue('items', [{ ...EMPTY_ITEM }]);
      setSeededCount(0);
    }

    seededWarehouseRef.current = values.custom_warehouse;
  }, [stockData, isStockFetching, values.custom_warehouse, orderId]);

  // ── Existing order → populate form ────────────────────────────────────────
  useEffect(() => {
    if (salesDetails?.message?.data) {
      setInitialValues(mapSalesDetailToForm(salesDetails.message.data));
      setSeededCount(0);
    }
  }, [salesDetails, orderId]);

  // ── Fetch store list ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.email && values?.transaction_date) {
      triggerStoreFetch({ user: user.email, date: values.transaction_date });
    }
  }, [user?.email, values?.transaction_date]);

  // ── Auto-select store from PJP ────────────────────────────────────────────
  useEffect(() => {
    if (!orderId && selectedStore && storeData?.message?.stores) {
      const store = storeData.message.stores.find(s => s.store === selectedStore);
      if (store) {
        setFieldValue('custom_warehouse', store.warehouse_id);
        setSelectedStoreName(store.store_name);
        setSelectedStoreId(store.store);
      } else {
        setSelectedStoreName(selectedStore);
        setSelectedStoreId(selectedStore);
      }
      seededWarehouseRef.current = null;
      setSeededCount(0);
    }
  }, [selectedStore, orderId, storeData]);

  // ── Manual warehouse change ───────────────────────────────────────────────
  useEffect(() => {
    if (!orderId && values.custom_warehouse && storeData?.message?.stores) {
      const store = storeData.message.stores.find(
        s => s.warehouse_id === values.custom_warehouse,
      );
      if (store) {
        setSelectedStoreName(store.store_name);
        if (store.store !== selectedStoreId) {
          setSelectedStoreId(store.store);
          seededWarehouseRef.current = null;
          setSeededCount(0);
        }
      }
    }
  }, [values.custom_warehouse]);

  const warehouseList = storeData?.message?.stores?.map(store => ({
    value: store.warehouse_id,
    label: getStoreLabel(store),
  }));

  if (orderId && isFetching) {
    return (
      <SafeAreaView style={[flexCol, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader
        title="Create Order"
        navigation={() => navigation.navigate('OrdersScreen', { index: 1 })}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          if (activeField) {
            const formatted = moment(date).format('YYYY-MM-DD');
            setFieldValue('items', values.items.map(it => ({ ...it, delivery_date: formatted })));
            setFieldValue(activeField, formatted);
          }
          setTimePickerVisible(false);
        }}
        onCancel={() => setTimePickerVisible(false)}
      />

      {isStockFetching && selectedStoreId && !orderId && (
        <View style={styles.seedingBanner}>
          <ActivityIndicator size="small" color={Colors.darkButton} />
          <Text style={styles.seedingText}>Loading store items…</Text>
        </View>
      )}

      <AddSaleForm
        values={values}
        errors={errors}
        touched={touched}
        handleChange={handleChange}
        handleBlur={handleBlur}
        setFieldValue={setFieldValue}
        scrollY={scrollY}
        warehouseList={warehouseList || []}
        onDateSelect={field => {
          setActiveField(field);
          setTimePickerVisible(true);
        }}
        onAnyItemLocked={setHasLockedItem}
        seededCount={seededCount}
        allItems={allItems}
        isStockFetching={isStockFetching}
        stockWarning={stockWarning}
      />

      <View
        style={{
          paddingHorizontal: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.bgColor,
          width: '100%',
          height: 80,
        }}>
        <TouchableOpacity
          style={[styles.submitBtn, (loading || hasLockedItem) && { opacity: 0.7 }]}
          onPress={() => handleSubmit()}
          disabled={loading || hasLockedItem}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>
              {isStockFetching && !orderId ? 'Loading items…' : 'Create Order'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddSaleScreen;

const styles = StyleSheet.create({
  submitBtn: {
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
  submitText: { fontFamily: Fonts.medium, fontSize: Size.sm, color: Colors.white, lineHeight: 22 },
  seedingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  seedingText: { fontFamily: Fonts.regular, fontSize: Size.xs, color: '#1D4ED8' },
});