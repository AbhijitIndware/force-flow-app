/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import ReusableDatePicker from '../../../ui-lib/reusable-date-picker';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { Colors } from '../../../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../../types/Navigation';
import StoreDropdownField from './StoreDropdownField';
import { useAppSelector } from '../../../../store/hook';

interface FormValues {
  employee: string;
  date: string;
  stores: { store: string }[];
}

type NavigationProp = NativeStackNavigationProp<SoAppStackParamList, 'AddPjpScreen'>;

interface Props {
  values: FormValues;
  errors: Partial<Record<keyof FormValues, any>>;
  touched: Partial<Record<keyof FormValues, any>>;
  handleBlur: {
    (e: React.FocusEvent<any, Element>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T_1 = string | React.ChangeEvent<any>>(field: T_1): T_1 extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
  employeeList: { label: string; value: string }[];
  employeeOgData: any[];
  employeeSearch: string;
  setEmployeeSearch: (val: string) => void;
  onLoadMoreEmployees: () => void;
  loadingMoreEmployees: boolean;
  isPjpStarted: boolean;
}

const AddPjpForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  setFieldValue,
  scrollY,
  isPjpStarted,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const employeeName = employee?.full_name || '—';
  const employeeId = employee?.company_emp_id || '—';
  const totalStores = values.stores.length;

  return (
    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
      )}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 }}>

      {/* ── Employee Strip ── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.Orangelight + '10',
        borderWidth: 1,
        borderColor: Colors.Orangelight + '30',
        borderRadius: 7,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 8,
        gap: 10,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 8, color: Colors.Orangelight, fontFamily: Fonts.medium }}>
            EMPLOYEE
          </Text>
          <Text style={{ fontSize: 12, color: '#111', fontFamily: Fonts.medium, marginTop: 1 }}
            numberOfLines={1}>
            {employeeName}
          </Text>
        </View>

        <View style={{ width: 1, height: 22, backgroundColor: '#ddd' }} />

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 8, color: Colors.Orangelight, fontFamily: Fonts.medium }}>
            EMP ID
          </Text>
          <Text style={{ fontSize: 12, color: '#111', fontFamily: Fonts.medium, marginTop: 1 }}>
            {employeeId}
          </Text>
        </View>
      </View>

      {/* ── Date Picker ── */}
      <ReusableDatePicker
        label="Date"
        value={values.date}
        onChange={(val: string) => setFieldValue('date', val)}
        error={touched.date && errors.date}
        marginBottom={5}
      />

      {/* ── Stores Section Header ── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
        marginBottom: 4,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }}>
          {/* <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: '#333' }}>
            Stores
          </Text> */}
          {/* Warning message */}
          {values.stores.length < 15 && (
            <Text
              style={{
                color: '#F59E0B',
                fontSize: 12,
              }}>
              ⚠️ Minimum 15 stores required
            </Text>
          )}</View>
        <Text style={{
          fontSize: 11,
          fontFamily: Fonts.medium,
          color: totalStores >= 15 ? Colors.Orangelight : '#F59E0B',
        }}>
          {totalStores} / 15
        </Text>
      </View>

      {/* ── Warning ── */}
      {/* {totalStores < 15 && (
        <Text style={{ color: '#F59E0B', fontSize: 10, fontFamily: Fonts.medium, marginBottom: 6 }}>
          ⚠️  {15 - totalStores} more store{15 - totalStores > 1 ? 's' : ''} needed
        </Text>
      )} */}

      {/* ── Store List ── */}
      {
        values.stores.map((storeItem, index) => (
          <View key={index} style={{}}>
            <StoreDropdownField
              label={`Store ${index + 1}`}
              field={`stores[${index}].store`}
              value={storeItem.store}
              error={touched.stores?.[index]?.store && errors.stores?.[index]?.store}
              onChange={(val: string) => {
                const updatedStores = [...values.stores];
                updatedStores[index].store = val;
                setFieldValue('stores', updatedStores);
              }}
              navigation={navigation}
            />

            {values.stores.length > 1 && index !== 0 && !(isPjpStarted && storeItem.store) && (
              <TouchableOpacity
                onPress={() => {
                  const updated = [...values.stores];
                  updated.splice(index, 1);
                  setFieldValue('stores', updated);
                }}
                style={{ alignSelf: 'flex-end', marginTop: 0 }}>
                <Text style={{ color: '#DC2626', fontSize: 11, fontFamily: Fonts.medium }}>
                  Remove
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      }

      {/* ── Add Store Button ── */}
      <TouchableOpacity
        onPress={() => setFieldValue('stores', [...values.stores, { store: '' }])}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: Colors.Orangelight,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 6,
        }}>
        <Text style={{ fontFamily: Fonts.medium, fontSize: Size.xs, color: '#fff' }}>
          + Add Store
        </Text>
      </TouchableOpacity>

    </Animated.ScrollView >
  );
};

export default AddPjpForm;