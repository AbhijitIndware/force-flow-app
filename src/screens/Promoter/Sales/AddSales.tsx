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
  Modal,
} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {useFormik} from 'formik';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import Toast from 'react-native-toast-message';
import AddPromoterSaleForm from '../../../components/Promoter/Sales/AddSalesForm';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {addSalesOrderSchema} from '../../../types/schema';
import {IAddSalesOrderV2} from '../../../types/baseType';
import {
  useCreateSalesOrderWithStockMutation,
  useGetStoreStockStatusQuery,
  usePromoterStatusQuery,
} from '../../../features/base/promoter-base-api';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getUserFacingError, getSafeServerMessage} from '../../../utils/errorMessage';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'AddSalesScreen'
>;
type Props = {navigation: NavigationProp; route: any};

const EMPTY_ITEM = {
  item_code: '',
  qty: '',
  rate: 0,
  physical_qty: '',
  delivery_date: moment().add(7, 'days').format('YYYY-MM-DD'),
};

const initial: IAddSalesOrderV2 = {
  transaction_date: moment().format('YYYY-MM-DD'),
  delivery_date: moment().add(7, 'days').format('YYYY-MM-DD'),
  custom_warehouse: '',
  items: [{...EMPTY_ITEM}],
  terms: null,
  submit_order: false,
};

const AddSalesScreen = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  type DateField = 'transaction_date' | 'delivery_date';
  const [activeField, setActiveField] = useState<DateField | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [hasLockedItem, setHasLockedItem] = useState(false);
  const [seededCount, setSeededCount] = useState(0);
  const seededWarehouseRef = useRef<string | null>(null);

  const [createSalesOrderWithStock] = useCreateSalesOrderWithStockMutation();

  const {data: attendanceData} = usePromoterStatusQuery();
  const storesToday = attendanceData?.message?.data?.stores_today ?? [];

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormik<IAddSalesOrderV2>({
    initialValues: initial,
    validationSchema: addSalesOrderSchema,
    onSubmit: async formValues => {
      try {
        setLoading(true);
        const payload = {
          ...formValues,
          items: formValues.items.map(it => ({
            ...it,
            qty: it.qty === 0 ? 0 : it.qty,
            physical_qty: it.physical_qty === 0 ? 0 : it.physical_qty,
          })),
        };

        const res = await createSalesOrderWithStock(payload).unwrap();

        if (res?.message?.success) {
          Toast.show({
            type: 'success',
            text1:
              getSafeServerMessage(res.message.message) ?? 'Sales order created successfully',
            position: 'top',
          });
          navigation.navigate('SalesScreen');
        } else {
          Toast.show({
            type: 'error',
            text1: getSafeServerMessage(res.message.message) ?? 'Something went wrong',
            position: 'top',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1:
            getUserFacingError(error, 'Internal Server Error'),
          text2: 'Please try again later.',
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const {data: stockData, isFetching: isStockFetching} =
    useGetStoreStockStatusQuery(
      {store: selectedStoreId},
      {skip: !selectedStoreId},
    );

  const allItems = stockData?.message?.all_items ?? [];
  const stockWarning = stockData?.message?.warning;

  // ── Manual warehouse change ───────────────────────────────────────────────
  useEffect(() => {
    if (values.custom_warehouse && storesToday.length) {
      const store = storesToday.find(s => s.store === values.custom_warehouse);
      if (store && store.store !== selectedStoreId) {
        setSelectedStoreId(store.store);
        seededWarehouseRef.current = null;
        setSeededCount(0);
      }
    }
  }, [values.custom_warehouse, storesToday, selectedStoreId]);

  // ── Seed previous_items when stock loads ──────────────────────────────────
  useEffect(() => {
    if (!values.custom_warehouse) return;
    if (seededWarehouseRef.current === values.custom_warehouse) return;
    if (isStockFetching || !stockData) return;

    const previousItems = stockData?.message?.previous_items ?? [];
    const defaultDate = moment().add(7, 'days').format('YYYY-MM-DD');

    if (previousItems.length > 0) {
      const seededItems = previousItems.map(i => ({
        item_code: i.item_code,
        qty: '',
        rate: i.item_rate ?? 0,
        physical_qty: '',
        delivery_date: defaultDate,
      }));
      setFieldValue('items', [...seededItems]);
      setSeededCount(seededItems.length);
    } else {
      setFieldValue('items', [{...EMPTY_ITEM}]);
      setSeededCount(0);
    }

    seededWarehouseRef.current = values.custom_warehouse;
  }, [stockData, isStockFetching, values.custom_warehouse]);

  const warehouseList = storesToday.map(store => ({
    value: store.store,
    label: store.store_name,
  }));

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Create Sales Order"
        navigation={() => navigation.navigate('SalesScreen')}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          if (activeField) {
            const formatted = moment(date).format('YYYY-MM-DD');
            setFieldValue(
              'items',
              values.items.map(it => ({...it, delivery_date: formatted})),
            );
            setFieldValue(activeField, formatted);
          }
          setTimePickerVisible(false);
        }}
        onCancel={() => setTimePickerVisible(false)}
      />

      {isStockFetching && selectedStoreId && (
        <View style={styles.seedingBanner}>
          <ActivityIndicator size="small" color={Colors.darkButton} />
          <Text style={styles.seedingText}>Loading store items…</Text>
        </View>
      )}

      {/* Stock Rules Modal */}
      <Modal
        transparent
        visible={showRulesModal}
        animationType="fade"
        onRequestClose={() => setShowRulesModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.rulesModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📌 Stock Update Rules</Text>
              <TouchableOpacity onPress={() => setShowRulesModal(false)}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>
                  For any Existing/Previous item, you must audit the physical
                  stock before ordering.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>
                  If the item has stock: Enter the exact quantity.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>
                  If the item is completely out of stock: Enter 0.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>
                  Do not leave the stock box blank for existing items.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowRulesModal(false)}>
              <Text style={styles.modalCloseBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AddPromoterSaleForm
        values={values}
        errors={errors}
        touched={touched}
        handleChange={handleChange}
        handleBlur={handleBlur}
        setFieldValue={setFieldValue}
        scrollY={scrollY}
        warehouseList={warehouseList}
        onDateSelect={field => {
          setActiveField(field);
          setTimePickerVisible(true);
        }}
        onAnyItemLocked={setHasLockedItem}
        seededCount={seededCount}
        allItems={allItems}
        isStockFetching={isStockFetching}
        stockWarning={stockWarning}
        onShowRules={() => setShowRulesModal(true)}
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
          style={[
            styles.submitBtn,
            (loading || hasLockedItem) && {opacity: 0.7},
          ]}
          onPress={() => handleSubmit()}
          disabled={loading}>
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

export default AddSalesScreen;

const styles = StyleSheet.create({
  submitBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    gap: 5,
    width: width * 0.9,
  },
  submitText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
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
  seedingText: {fontFamily: Fonts.regular, fontSize: Size.xs, color: '#1D4ED8'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesModal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    maxHeight: '80%',
    minHeight: '50%',
    width: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.black,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  ruleNumber: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.orange,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: '#4B5563',
    lineHeight: 20,
  },
  modalCloseBtn: {
    backgroundColor: Colors.orange,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCloseBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
});