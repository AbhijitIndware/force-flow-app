import React from 'react';
import { StyleSheet, View } from 'react-native';
import ReusableDropdownV3 from '../../ui-lib/reusable-dropdown-v3';
import { useGetAsmZonesQuery } from '../../../features/base/base-api';
import { useAppSelector } from '../../../store/hook';

interface AsmStoreTypeComponentProps {
  // Controlled: parent owns the value so it can forward it to the dashboard API
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

  // Map API response { name, store_type } → { label, value }
  const storeTypeOptions =
    data?.message?.store_types?.map(item => ({
      label: item.store_type,
      value: item.name,
    })) ?? [];

  return (
    <View style={styles.container}>
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
});