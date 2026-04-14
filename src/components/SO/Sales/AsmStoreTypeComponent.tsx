import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import ReusableDropdownV3 from '../../ui-lib/reusable-dropdown-v3';
import { useGetAsmZonesQuery } from '../../../features/base/base-api';
import { useAppSelector } from '../../../store/hook';

interface AsmStoreTypeComponentProps {
  value: string;
  onChange: (val: string) => void;
}

const AsmStoreTypeComponent = ({ value, onChange }: AsmStoreTypeComponentProps) => {
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const { data } = useGetAsmZonesQuery(
    { employee: employee?.id as string },
    { skip: !employee?.id },
  );

  const storeTypeOptions =
    data?.message?.store_types?.map(item => ({
      label: item.store_type,
      value: item.name,
    })) ?? [];

  // ✅ Clear selected store type
  const handleClear = () => {
    onChange('');
  };

  return (
    <View style={styles.container}>
      {/* ✅ Show button only when value is selected */}
      {value ? (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>Remove Selection</Text>
        </TouchableOpacity>
      ) : null}
      <ReusableDropdownV3
        label="Store Type"
        field="store_type"
        value={value}
        data={storeTypeOptions}
        onChange={onChange}
      />

    </View>
  );
};

export default AsmStoreTypeComponent;

const styles = StyleSheet.create({
  container: {},

  clearBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },

  clearText: {
    color: '#FF4D4F',
    fontSize: 14,
    fontWeight: '800',
  },
});