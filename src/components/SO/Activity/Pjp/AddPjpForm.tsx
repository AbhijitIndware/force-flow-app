// AddDistributorForm.tsx
import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import ReusableInput from '../../../ui-lib/reuseable-input';
import ReusableDatePicker from '../../../ui-lib/reusable-date-picker';

interface FormValues {
  employee: string;
  date: string;
  stores: { store: string }[];
}

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
    <T_1 = string | React.ChangeEvent<any>>(field: T_1): T_1 extends React.ChangeEvent<any> ? void : (e: string | React.ChangeEvent<any>) => void;
  };
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
  employeeList: { label: string; value: string }[];
  storeList: { label: string; value: string }[];
}

const AddPjpForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
  employeeList,
  storeList,
}) => {
  const onSelect = (field: string, val: string) => {
    setFieldValue(field, val);
    if (field === 'zone') {
      setFieldValue('state', '');
      setFieldValue('city', '');
    } else if (field === 'state') {
      setFieldValue('city', '');
    }
  };

  return (

    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      contentContainerStyle={{ padding: 16 }}
    >
      <ReusableDatePicker
        label="Date"
        value={values.date}
        onChange={(val: string) => setFieldValue('date', val)}
        error={touched.date && errors.date}
      />
      <ReusableDropdown label="Employee Name" field="employee" value={values.employee} data={employeeList} error={touched.employee && errors.employee} onChange={(val: string) => onSelect('employee', val)} />

      <ReusableInput label="Employee" value={values.employee} onChangeText={() => { }} onBlur={() => handleBlur('pan_no')} disabled={true} />
      {values.stores.map((storeItem, index) => (
        <View key={index} style={{ marginBottom: 12, position: 'relative' }}>
          <ReusableDropdown
            label={`Store ${index + 1}`}
            field={`stores[${index}].store`}
            value={storeItem.store}
            data={storeList}
            error={touched.stores?.[index]?.store && errors.stores?.[index]?.store}
            onChange={(val: string) => {
              const updatedStores = [...values.stores];
              updatedStores[index].store = val;
              setFieldValue("stores", updatedStores);
            }}
          />

          {values.stores.length > 1 && index !== 0 && (
            <TouchableOpacity
              onPress={() => {
                const updated = [...values.stores];
                updated.splice(index, 1);
                setFieldValue("stores", updated);
              }}
              style={{ position: 'absolute', right: 0, top: 65 }}
            >
              <Text style={{ color: 'red' }}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {/* ➕ Add Store Button */}
      <TouchableOpacity
        onPress={() => setFieldValue("stores", [...values.stores, { store: "" }])}
        style={{ marginBottom: 16, alignSelf: 'flex-start' }}
      >
        <Text style={{ color: 'blue' }}>+ Add Store</Text>
      </TouchableOpacity>
    </Animated.ScrollView>


  );
};

export default AddPjpForm;
