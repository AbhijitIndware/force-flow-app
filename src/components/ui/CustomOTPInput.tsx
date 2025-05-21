/* eslint-disable react-native/no-inline-styles */
import {useState, useRef} from 'react';
import {View, TextInput, StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../../utils/colors';

const windowWidth = Dimensions.get('window').width;

const CustomOTPInput = ({length = 4, onOTPChange}: any) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef<any>([]);
  const OTP_LENGTH = length;

  const handleOTPChange = (index: number, value: number | string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < OTP_LENGTH - 1 && value !== '') {
      inputRefs.current[index + 1].focus();
    }

    onOTPChange(newOtp.join(''));
  };

  const handleBackspace = (index: number, value: string) => {
    if (index > 0 && value === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.input,
            {
              borderColor: digit !== '' ? Colors.primary : '#00000045',
            },
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={digit}
          onChangeText={value => handleOTPChange(index, value)}
          onKeyPress={({nativeEvent}) =>
            nativeEvent.key === 'Backspace' && handleBackspace(index, digit)
          }
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    width: windowWidth * 0.2,
    height: 50,
    borderWidth: 1,
    padding: 0,
    margin: 3,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    borderRadius: 15,
    color: '#000',
  },
});

export default CustomOTPInput;
