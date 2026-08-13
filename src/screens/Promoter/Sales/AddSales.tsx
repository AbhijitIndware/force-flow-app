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
  useCreateSalesOrderWithStockMutation,
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

  const [createSalesOrderWithStock] = useCreateSalesOrderWithStockMutation();

  const {values, errors, touched, handleBlur, handleSubmit, setFieldValue} =
    useFormik<ISalesInvoiceParams>({
      initialValues: initial,
      validationSchema: addSalesInvoiceSchema,
      onSubmit: async formValues => {
        try {
          setLoading(true);

          const payload = {
            custom_warehouse: formValues.items[0]?.warehouse || '',
            transaction_date: new Date().toISOString().split('T')[0],
            delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            submit_order: true,
            items: formValues.items.map(item => ({
              item_code: item.item_code,
              qty: item.qty,
              rate: item.rate,
            })),
          };

          const res = await createSalesOrderWithStock(payload).unwrap();

          if (res?.message?.success) {
            Toast.show({
              type: 'success',
              text1: `✅ ${res.message.message || 'Sales Order created successfully'}`,
            });

            navigation.navigate('SalesScreen');
          } else {
            Toast.show({
              type: 'error',
              text1: res?.message?.message || '❌ Something went wrong',
            });
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: error?.data?.message?.message || 'Internal Server Error',
          });
        } finally {
          setLoading(false);
        }
      },
    });

  return (
    <SafeAreaView style={[flexCol, styles.container]}>
      <PageHeader
        title="Create Sales Order"
        navigation={() => navigation.navigate('SalesScreen')}
      />

      <AddPromoterSaleForm
        values={values}
        errors={errors}
        touched={touched}
        handleBlur={handleBlur}
        setFieldValue={setFieldValue}
        scrollY={scrollY}
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
