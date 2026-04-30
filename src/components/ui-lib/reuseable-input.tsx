import React from 'react';
import { Text, TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../utils/colors';
import { Fonts } from '../../constants';
import { Size } from '../../utils/fontSize';

interface DistributorInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string | false;
  keyboardType?: TextInputProps['keyboardType'];
  disabled?: boolean;
  placeholder?: string;
  marginBottom?: number;
}

const ReusableInput: React.FC<DistributorInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType = 'default',
  disabled = false,
  placeholder,
  marginBottom = 16,
}) => (
  <View style={[styles.inputWrapper, { marginBottom }]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder ? placeholder : `Enter ${label}`}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholderTextColor="#999"
      keyboardType={keyboardType}

      editable={!disabled}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: Size.xs, marginBottom: 4, color: Colors.black, fontFamily: Fonts.regular },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ecececff',
    color: Colors.black,
    fontFamily: Fonts.regular,
    height: 45,
    fontSize: Size.xs,
  },
  error: { fontSize: Size.xs, color: 'red', marginTop: 4 },
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  lockText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#b45309',
    lineHeight: 16,
  },
});

export default ReusableInput;
