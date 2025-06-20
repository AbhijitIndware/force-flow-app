/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import {flexCol, flexRow} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';
import Input from '@rneui/themed/dist/Input';
import {Eye, EyeOff, Lock, LogIn, UserRound} from 'lucide-react-native';
import {useLoginMutation} from '../../features/auth/auth';
import Toast from 'react-native-toast-message';
import {useFormik} from 'formik';
import {loginSchema} from '../../types/schema';
const {width} = Dimensions.get('window');

let initial = {usr: '', pwd: ''};

const LoginScreen = () => {
  const [login, {isLoading}] = useLoginMutation();
  const [secureText, setSecureText] = useState(true);

  // Form handling & validation using formik & yup schemas
  const {values, errors, touched, handleChange, handleBlur, handleSubmit} =
    useFormik({
      initialValues: initial,
      validationSchema: loginSchema,
      validateOnChange: true,
      validateOnBlur: false,
      onSubmit: async (value, action) => {
        try {
          const payload = {
            usr: value.usr,
            pwd: value.pwd,
          };
          let res = await login({data: payload}).unwrap();
          if (res?.message?.success) {
            Toast.show({
              type: 'success',
              text1: `✅ ${res?.message?.message}`,
              position: 'top',
            });
            action.resetForm();
          } else {
            Toast.show({
              type: 'error',
              text1: `❌ ${res?.message?.message}` || 'Error',
              position: 'top',
            });
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1:
              `❌ ${error?.data?.message?.message}` || 'Internal Server Error',
            text2: 'Please try again later.',
            position: 'top',
          });
        }
      },
    });

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/brand.png')}
            resizeMode="cover"
            style={styles.logoImage}
          />
        </View>
        <View style={styles.LoginBody}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: Size.lg,
              width: '100%',
              textAlign: 'center',
              color: Colors.white,
              padding: 0,
              margin: 0,
              lineHeight: 35,
            }}>
            Welcome
          </Text>
          <Text
            style={{
              fontFamily: Fonts.light,
              fontSize: Size.md,
              width: '100%',
              textAlign: 'center',
              color: Colors.white,
            }}>
            Enter credentials to Login
          </Text>
          <View style={{paddingTop: 20}}>
            <Input
              style={styles.inputBox}
              inputStyle={{paddingTop: 18}}
              labelStyle={{color: Colors.white}}
              placeholderTextColor="#FFC691"
              keyboardType="email-address"
              inputContainerStyle={{
                borderBottomWidth: 0,
                backgroundColor: Colors.Orangelight,
                paddingHorizontal: 10,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
              }}
              value={values.usr}
              onChangeText={handleChange('usr')}
              onBlur={handleBlur('usr')}
              errorStyle={{
                color: Colors.white,
                marginBottom: 10,
              }}
              errorMessage={touched.usr && errors.usr ? errors.usr : ''}
              placeholder="Enter User ID"
              leftIcon={<UserRound color={Colors.white} />}
            />
            <Input
              secureTextEntry={secureText}
              style={styles.inputBox}
              inputStyle={{paddingTop: 18}}
              labelStyle={{color: Colors.white}}
              placeholderTextColor="#FFC691"
              inputContainerStyle={{
                borderBottomWidth: 0,
                backgroundColor: Colors.Orangelight,
                paddingHorizontal: 10,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              value={values.pwd}
              onChangeText={handleChange('pwd')}
              onBlur={handleBlur('pwd')}
              errorMessage={touched.pwd && errors.pwd ? errors.pwd : ''}
              errorStyle={{
                color: Colors.white,
                marginBottom: 10,
              }}
              placeholder="Enter Password"
              leftIcon={<Lock color={Colors.white} />}
              rightIcon={
                <TouchableOpacity onPress={() => setSecureText(prev => !prev)}>
                  {secureText ? (
                    <EyeOff color={Colors.white} />
                  ) : (
                    <Eye color={Colors.white} />
                  )}
                </TouchableOpacity>
              }
            />
            <TouchableOpacity
              style={[styles.checkinButton, isLoading && {opacity: 0.7}]}
              onPress={() => handleSubmit()}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <View style={[flexRow, {gap: 10}]}>
                  <LogIn strokeWidth={1.4} color={Colors.white} />
                  <Text style={styles.checkinButtonText}>Login</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    minHeight: 300,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    position: 'relative',
    zIndex: 1,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android Shadow
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: width * 0.6,
    height: 50,
  },
  LoginBody: {
    backgroundColor: Colors.orange,
    margin: 'auto',
    width: '90%',
    position: 'relative',
    marginTop: -80,
    zIndex: 1,
    minHeight: 400,
    borderRadius: 30,
    padding: 20,
    justifyContent: 'center',
  },
  inputBox: {
    color: Colors.white,
    fontFamily: Fonts.light,
    fontSize: Size.xsmd,
    borderBottomWidth: 0,
    margin: 0,
  },
  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 18,
    gap: 5,
    zIndex: 1,
    width: '93%',
    margin: 'auto',
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
