import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DropdownComponent from '../ui/CustomDropDown';
import { Colors } from '../../utils/colors';
import {Fonts} from '../../constants';
import { Size } from '../../utils/fontSize';


interface DropdownOption {
  label: string;
  value: string;
}

interface ReusableDropdownProps {
  label: string;
  field: string;
  value: string;
  data: DropdownOption[];
  error?: string | false;
  onChange: (value: string) => void;
}

const ReusableDropdown: React.FC<ReusableDropdownProps> = ({
  label,
  field,
  value,
  data,
  error,
  onChange,
}) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <DropdownComponent
        selectText={label}
        data={data}
        selectedId={value ? String(value) : null}
        setSelectedId={onChange}
        name={field}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {marginBottom: 16},
  label: {
    fontSize:Size.xs,
    marginBottom: 4,
    color: Colors.black,
    fontFamily:Fonts.regular,
  },
  error: {fontSize:Size.xs, color: 'red', marginTop: 4},
});

export default ReusableDropdown;
