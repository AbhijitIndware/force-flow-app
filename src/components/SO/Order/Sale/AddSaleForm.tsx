import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import moment from 'moment';
import { Colors } from '../../../../utils/colors';
import { IAddSalesOrder } from '../../../../types/baseType';
import { Size } from '../../../../utils/fontSize';
import { Fonts } from '../../../../constants';
import SaleItemField from './SaleItemField';

interface Props {
  values: IAddSalesOrder;
  errors: any;
  touched: any;
  handleBlur: {
    (e: React.FocusEvent<any, Element>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T_1 = string | React.ChangeEvent<any>>(
      field: T_1,
    ): T_1 extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
  warehouseList: { label: string; value: string }[];
  onDateSelect: (field: 'transaction_date' | 'delivery_date') => void;
  selectedStore: string;
  onAnyItemLocked: (locked: boolean) => void; // ← NEW
}

const AddSaleForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
  warehouseList,
  onDateSelect,
  selectedStore,
  onAnyItemLocked, // ← NEW
}) => {
  const [itemLockMap, setItemLockMap] = useState<Record<number, boolean>>({});

  // ── Notify parent whenever any item's lock state changes ──────────────────
  const handleLockChange = (index: number, isLocked: boolean) => {
    setItemLockMap(prev => {
      const next = { ...prev, [index]: isLocked };
      // Notify parent with the updated map synchronously
      onAnyItemLocked(Object.values(next).some(Boolean));
      return next;
    });
  };
  // ──────────────────────────────────────────────────────────────────────────

  const addNewItem = () => {
    const newItem = {
      item_code: '',
      qty: 0,
      rate: 0,
      delivery_date: values.delivery_date,
    };
    setFieldValue('items', [...values.items, newItem]);
  };

  const removeItem = (index: number) => {
    const updatedItems = values.items.filter((_, i) => i !== index);
    setFieldValue('items', updatedItems);

    // Rebuild lock map: remove the deleted index and shift higher keys down
    setItemLockMap(prev => {
      const next: Record<number, boolean> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const k = Number(key);
        if (k < index) next[k] = val;
        else if (k > index) next[k - 1] = val;
        // k === index → deleted, drop it
      });
      onAnyItemLocked(Object.values(next).some(Boolean));
      return next;
    });
  };

  return (
    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
      )}
      scrollEventThrottle={16}
      contentContainerStyle={{ padding: 16, paddingHorizontal: 21 }}>
      {/* ── Date row ──────────────────────────────────────────────────────── */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Transaction Date</Text>
          <View style={[styles.timeInput, styles.disabledInput]}>
            <Text style={styles.disabledText}>
              {values.transaction_date
                ? moment(values.transaction_date).format('YYYY-MM-DD')
                : 'Select Date'}
            </Text>
          </View>
        </View>

        <View style={styles.flex1}>
          <Text style={styles.label}>Delivery Date</Text>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => onDateSelect('delivery_date')}>
            <Text style={styles.timeText}>
              {values.delivery_date
                ? moment(values.delivery_date).format('YYYY-MM-DD')
                : 'Select Date'}
            </Text>
          </TouchableOpacity>
          {touched.delivery_date && errors.delivery_date && (
            <Text style={styles.error}>{errors.delivery_date}</Text>
          )}
        </View>
      </View>

      {/* ── Warehouse ─────────────────────────────────────────────────────── */}
      <ReusableDropdown
        label="Store"
        field="custom_warehouse"
        value={values.custom_warehouse}
        data={warehouseList}
        error={touched.custom_warehouse && errors.custom_warehouse}
        onChange={(val: string) => setFieldValue('custom_warehouse', val)}
      />

      {/* ── Items ─────────────────────────────────────────────────────────── */}
      {values.items.map((item, index) => (
        <SaleItemField
          key={index}
          index={index}
          item={item}
          store={selectedStore}
          setFieldValue={setFieldValue}
          removeItem={removeItem}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          onLockChange={handleLockChange} // ← NEW
        />
      ))}

      {/* ── Add More ──────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.addMoreBtn} onPress={addNewItem}>
        <Text style={styles.addMoreText}>+ Add More Item</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );
};

export default AddSaleForm;

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: Size.xs,
    marginBottom: 4,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
  timeInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ecececff',
    height: 45,
  },
  timeText: {
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
  },
  disabledInput: {
    backgroundColor: '#f8f8f8',
    borderColor: '#e8e8e8',
  },
  disabledText: {
    color: '#999',
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
  },
  itemBlock: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ecececff',
    backgroundColor: '#ffffffff',
    width: '100%',
  },
  addMoreBtn: {
    backgroundColor: Colors.Orangelight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 12,
    width: 'auto',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  addMoreText: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
  },
  removeButton: {
    marginTop: 0,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.lightRed2,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: { fontSize: 12, color: 'red', marginTop: 4 },
});