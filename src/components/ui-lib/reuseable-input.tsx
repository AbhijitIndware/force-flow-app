import React from 'react';
import { Text, TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../utils/colors';

interface DistributorInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string | false;
  keyboardType?: TextInputProps['keyboardType'];
  disabled?: boolean;
}

const ReusableInput: React.FC<DistributorInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType = 'default',
  disabled = false,
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={`Enter ${label}`}
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
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: Colors.black },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    color: Colors.black,
  },
  error: { fontSize: 12, color: 'red', marginTop: 4 },
});

export default ReusableInput;
