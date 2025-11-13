// AddSaleForm.tsx
import React, {Dispatch, useState} from 'react';
import {Animated, StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import ReusableInput from '../../../ui-lib/reuseable-input';
import moment from 'moment';
import {Colors} from '../../../../utils/colors';
import {IAddSalesOrder} from '../../../../types/baseType';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {SoItem} from '../../../../types/dropdownType';
import {Size} from '../../../../utils/fontSize';
import {Fonts} from '../../../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  warehouseList: {label: string; value: string}[];
  itemList: {label: string; value: string}[];
  originalItemList: SoItem[];
  onDateSelect: (field: 'transaction_date' | 'delivery_date') => void;

  setSearchItem: Dispatch<React.SetStateAction<string>>;
  searchItem: string;
  onLoadMoreItems?: () => void;
  loadingMoreItems?: boolean;
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
  itemList,
  originalItemList,
  onDateSelect,

  setSearchItem,
  searchItem,
  loadingMoreItems,
  onLoadMoreItems,
}) => {
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
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
  };

  const handleSelectedItemValues = (itemCode: string, index: number) => {
    const selectedItem = originalItemList.find(
      item => item.item_code === itemCode,
    );
    if (selectedItem) {
      setFieldValue(`items[${index}].rate`, selectedItem.selling_rate);
    }
  };

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{padding: 16, paddingHorizontal: 21}}>
      {/* Transaction Date */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Transaction Date</Text>
        <TouchableOpacity
          style={styles.timeInput}
          // onPress={() => onDateSelect('transaction_date')}
        >
          <Text style={styles.timeText}>
            {values.transaction_date
              ? moment(values.transaction_date).format('YYYY-MM-DD')
              : 'Select Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delivery Date */}
      <View style={styles.inputWrapper}>
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

      {/* Warehouse */}
      <ReusableDropdown
        label="Store"
        field="custom_warehouse"
        value={values.custom_warehouse}
        data={warehouseList}
        error={touched.custom_warehouse && errors.custom_warehouse}
        onChange={(val: string) => setFieldValue('custom_warehouse', val)}
      />

      {/* Items */}
      {values.items.map((item, index) => (
        <View key={index} style={styles.itemBlock}>
          {/* Remove button (only if index > 0) */}
          {index > 0 && (
            <TouchableOpacity
              onPress={() => removeItem(index)}
              style={styles.removeButton}>
              {/* <Text style={styles.removeButtonText}>Remove</Text> */}
              <Ionicons name="trash-bin-outline" size={20} color={'#FF0000'} />
            </TouchableOpacity>
          )}
          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="date"
            onConfirm={(date: Date) => {
              const formatted = moment(date).format('YYYY-MM-DD');
              setFieldValue(`items[${index}].delivery_date`, formatted);

              setTimePickerVisible(false);
            }}
            onCancel={() => setTimePickerVisible(false)}
          />
          <ReusableDropdown
            label="Item"
            field={`items[${index}].item_code`}
            value={item.item_code}
            data={itemList}
            // error={
            //   touched[`items.${index}.item_code`] &&
            //   errors[`items.${index}.item_code`]
            // }
            error={
              touched.items?.[index]?.item_code &&
              errors.items?.[index]?.item_code
            }
            onChange={(val: string) => {
              setFieldValue(`items[${index}].item_code`, val);
              handleSelectedItemValues(val, index);
            }}
            searchText={searchItem}
            setSearchText={setSearchItem}
            onLoadMore={onLoadMoreItems}
            loadingMore={loadingMoreItems}
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

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Amount</Text>
            <TouchableOpacity
              style={styles.timeInput}
              // onPress={() => onDateSelect('transaction_date')}
            >
              <Text style={styles.timeText}>
                {item.qty > 0 ? item.qty * item.rate : 'Total Amount'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Item Delivery Date</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setTimePickerVisible(true)}>
              <Text style={styles.timeText}>
                {item.delivery_date
                  ? moment(item.delivery_date).format('YYYY-MM-DD')
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>

            {touched.items?.[index]?.delivery_date &&
              errors.items?.[index]?.delivery_date && (
                <Text style={styles.error}>
                  {errors.items?.[index]?.delivery_date}
                </Text>
              )}
          </View>
        </View>
      ))}
      {/* ➕ Add More Button */}
      <TouchableOpacity style={styles.addMoreBtn} onPress={addNewItem}>
        <Text style={styles.addMoreText}>+ Add More Item</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );
};

export default AddSaleForm;

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 16,
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
    height: 50,
  },
  timeText: {
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
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
    fontSize: Size.sm,
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
  error: {fontSize: 12, color: 'red', marginTop: 4},
});
