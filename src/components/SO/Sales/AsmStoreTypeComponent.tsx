import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ReusableDropdownV3 from '../../ui-lib/reusable-dropdown-v3';

const STORE_TYPE_OPTIONS = [
  {label: 'Super Market', value: 'super_market'},
  {label: 'Hyper Market', value: 'hyper_market'},
  {label: 'Convenience Store', value: 'convenience_store'},
  {label: 'Wholesale', value: 'wholesale'},
  {label: 'Pharmacy', value: 'pharmacy'},
  {label: 'General Trade', value: 'general_trade'},
];

const AsmStoreTypeComponent = () => {
  const [storeType, setStoreType] = useState<string>('');

  return (
    <View style={styles.container}>
      <ReusableDropdownV3
        label="Store Type"
        field="store_type"
        value={storeType}
        data={STORE_TYPE_OPTIONS}
        onChange={setStoreType}
      />
    </View>
  );
};

export default AsmStoreTypeComponent;

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 16,
    // paddingTop: 12,
  },
});
