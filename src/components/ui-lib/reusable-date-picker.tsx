/* eslint-disable react-native/no-inline-styles */
import moment from 'moment';
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Colors} from '../../utils/colors';
import {Size} from '../../utils/fontSize';
import {Fonts} from '../../constants';

interface Props {
  label: string;
  value: string;
  onChange: (dateStr: string) => void;
  error?: string | false;
  marginBottom?: any;
  labelStyle?: any; // add
  inputStyle?: any;
  disabled?: boolean; // add
  height?: number;
  textSize?: any; // add
}

const ReusableDatePicker: React.FC<Props> = ({
  label,
  value,
  onChange,
  error,
  marginBottom,
  labelStyle,
  inputStyle,
  disabled,
  height = 50,
  textSize = Size.sm,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // inputStyle styles the box. Only its text properties go on the date text:
  // the box's padding, border and height applied a second time inside it
  // squeezed the date until it wrapped and was clipped.
  const {color, fontSize, fontFamily, fontWeight, textAlign} =
    StyleSheet.flatten(inputStyle) ?? {};
  const textStyle = Object.fromEntries(
    Object.entries({color, fontSize, fontFamily, fontWeight, textAlign}).filter(
      ([, v]) => v !== undefined,
    ),
  );

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      // Local date: toISOString() is UTC, a day early before 5:30 AM IST.
      onChange(moment(selectedDate).format('YYYY-MM-DD'));
    }
  };

  return (
    <View style={{marginBottom: marginBottom ?? 16}}>
      <Text style={[{marginBottom: 4, fontSize: 14}, labelStyle]}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[
          {
            borderColor: error ? 'red' : '#ecececff',
            borderWidth: 1,
            padding: 5,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: Colors.white,
            height: height,
            justifyContent: 'center',
            // padding: 0,
          },
          inputStyle,
        ]}
        disabled={disabled}>
        <Text
          style={[{fontSize: textSize, fontFamily: Fonts.regular}, textStyle]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}>
          {value || 'Select date'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={{color: 'red', marginTop: 4}}>{error}</Text>}
      {showPicker && (
        <DateTimePicker
          value={value ? moment(value, 'YYYY-MM-DD').toDate() : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

export default ReusableDatePicker;
