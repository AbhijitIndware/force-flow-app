// components/RangeSlider.tsx
import React from 'react';
import {View, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  color?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  color = '#007bff', // default to primary blue
}) => {
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#ddd"
        thumbTintColor={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default RangeSlider;
