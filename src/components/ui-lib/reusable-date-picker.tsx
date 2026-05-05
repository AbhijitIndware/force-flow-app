/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../utils/colors';
import { Size } from '../../utils/fontSize';
import { Fonts } from '../../constants';

interface Props {
  label: string;
  value: string;
  onChange: (dateStr: string) => void;
  error?: string | false;
  marginBottom?: any;
  labelStyle?: any;        // add
  inputStyle?: any;
  disabled?: boolean        // add
}

const ReusableDatePicker: React.FC<Props> = ({
  label, value, onChange, error, marginBottom, labelStyle, inputStyle, disabled
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <View style={{ marginBottom: marginBottom ?? 16 }}>
      <Text style={[{ marginBottom: 4, fontSize: 14 }, labelStyle]}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[{
          borderColor: error ? 'red' : '#ecececff',
          borderWidth: 1,
          padding: 12,
          borderRadius: 10,
          backgroundColor: Colors.white,
          height: 50,
          justifyContent: 'center',
        }, inputStyle]}
        disabled={disabled}
      >
        <Text style={[{ fontSize: Size.sm, fontFamily: Fonts.regular }, inputStyle]}>
          {value || 'Select date'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={{ color: 'red', marginTop: 4 }}>{error}</Text>}
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

export default ReusableDatePicker;
