// AddSaleForm.tsx
import React, {Dispatch} from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Alert,
} from 'react-native';
import {Size} from '../../../utils/fontSize';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {ISalesInvoiceParams} from '../../../types/baseType';
import PromoterSaleItemRow from './PromoterSaleItemRow';

interface Props {
  values: ISalesInvoiceParams;
  errors: any;
  touched: any;
  handleBlur: any;
  setFieldValue: any;
  scrollY: Animated.Value;
}

const AddPromoterSaleForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  setFieldValue,
  scrollY,
  handleBlur,
}) => {
  /* ---------------- Helpers ---------------- */

  const addNewItem = () => {
    setFieldValue('items', [
      ...values.items,
      {item_code: '', qty: 0, rate: 0, warehouse: ''},
    ]);
  };

  const removeItem = (index: number) => {
    const updated = values.items.filter((_, i) => i !== index);
    setFieldValue('items', updated);
  };
  /* ---------------- UI ---------------- */

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{padding: 16, paddingHorizontal: 21}}>
      {/* ---------------- Items ---------------- */}
      {/* {values.items.map((item, index) => {
        // Get selected warehouse object
        const selectedWh = ogWareHouseList.find(
          wh => wh.warehouse_id === item.warehouse,
        );

        return (
          <View key={index} style={styles.itemBlock}>
            {index > 0 && (
              <TouchableOpacity
                onPress={() => removeItem(index)}
                style={styles.removeButton}>
                <Ionicons name="trash-bin-outline" size={20} color="#FF0000" />
              </TouchableOpacity>
            )}

            <ReusableDropdown
              label="Item"
              field={`items[${index}].item_code`}
              value={item.item_code}
              data={itemList}
              error={
                touched.items?.[index]?.item_code &&
                errors.items?.[index]?.item_code
              }
              onChange={(val: string) => handleSelectedItem(val, index)}
              searchText={searchItem}
              setSearchText={setSearchItem}
              onLoadMore={onLoadMoreItems}
              loadingMore={loadingMoreItems}
            />
            <ReusableDropdown
              label="Warehouse"
              field={`items[${index}].warehouse`}
              value={item.warehouse}
              data={warehouseList}
              //   loading={warehouseLoading}
              error={
                touched.items?.[index]?.warehouse &&
                errors.items?.[index]?.warehouse
              }
              onChange={(val: string) => handleSelectedWarehouse(val, index)}
              // onChange={(val: string) =>
              //   setFieldValue(`items[${index}].warehouse`, val)
              // }
              disabled={item.item_code === ''}
            />
            <ReusableInput
              label={`Quantity ${
                selectedWh ? `(Available: ${selectedWh.actual_qty})` : ''
              }`}
              value={item.qty ? String(item.qty) : ''}
              keyboardType="numeric"
              onChangeText={text => {
                let qty = Number(text.replace(/[^0-9]/g, ''));

                if (selectedWh && qty > selectedWh.actual_qty) {
                  Alert.alert(
                    'Stock Limit',
                    `Quantity cannot be more than available stock (${selectedWh.actual_qty})`,
                  );
                  qty = selectedWh.actual_qty;
                }

                setFieldValue(`items[${index}].qty`, qty);
              }}
              onBlur={() => handleBlur('qty')}
              error={touched.items?.[index]?.qty && errors.items?.[index]?.qty}
              disabled={item?.warehouse === ''}
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
              onBlur={() => handleBlur('rate')}
              error={
                touched.items?.[index]?.rate && errors.items?.[index]?.rate
              }
              disabled={item?.item_code === ''}
            />
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountBox}>
                <Text style={styles.amountText}>
                  {item.qty && item.rate ? item.qty * item.rate : '—'}
                </Text>
              </View>
            </View>
          </View>
        );
      })} */}
      {values.items.map((item, index) => (
        <PromoterSaleItemRow
          key={index}
          index={index}
          item={item}
          errors={errors}
          touched={touched}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          removeItem={removeItem}
        />
      ))}

      {/* Add More */}
      <TouchableOpacity style={styles.addMoreBtn} onPress={addNewItem}>
        <Text style={styles.addMoreText}>+ Add More Item</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );
};

export default AddPromoterSaleForm;

/* ---------------- Styles ---------------- */

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
  amountBox: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ecececff',
    height: 50,
    justifyContent: 'center',
  },
  amountText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.black,
  },
  itemBlock: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ecececff',
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: 16,
  },
  addMoreBtn: {
    backgroundColor: Colors.Orangelight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 12,
    alignSelf: 'flex-start',
  },
  addMoreText: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.lightRed2,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
});
