/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  Platform,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Eye, EyeOff, Lock, LogIn, UserRound, BookOpen} from 'lucide-react-native';
import {useLoginMutation} from '../../features/auth/auth';
import {saveSecureSession} from '../../utils/secureStorage';
import {useRegisterFcmTokenMutation} from '../../features/fcm/fccm-api';
import {getFcmToken} from '../../utils/fcm';
import Toast from 'react-native-toast-message';
import {useFormik} from 'formik';
import {loginSchema} from '../../types/schema';
import {APP_VERSION} from '../../utils/utils';
import {getUserFacingError, getSafeServerMessage} from '../../utils/errorMessage';
import {MainNavigationStackParamList} from '../../types/Navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
const {width} = Dimensions.get('window');

let initial = {usr: '', pwd: ''};

type NavigationProp = NativeStackNavigationProp<
  MainNavigationStackParamList,
  'LoginScreen'
>;

const LoginScreen = ({navigation}: {navigation: NavigationProp}) => {
  const [login, {isLoading}] = useLoginMutation();
  const [registerFcmToken] = useRegisterFcmTokenMutation();
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
            app_version: APP_VERSION,
          };
          let res = await login({data: payload}).unwrap();
          if (res?.message?.success) {
            const m = res.message;
            // Persist only session credentials to the secure Keychain. Full
            // profile PII stays in memory (Redux) and is never written to
            // AsyncStorage.
            await saveSecureSession({
              sid: m.user?.sid ?? '',
              emp_id: m.employee?.id,
              api_key: m.api_credentials?.api_key,
              api_secret: m.api_credentials?.api_secret,
              zone: m.employee?.zone,
              designation: m.employee?.designation,
              user: m.user ?? null,
            });
            Toast.show({
              type: 'success',
              text1: getSafeServerMessage(res?.message?.message) ?? 'Success',
              position: 'top',
            });
            action.resetForm();

            const fcmToken = await getFcmToken();
            if (fcmToken) {
              const deviceOs = Platform.OS === 'ios' ? 'iOS' : 'Android';
              registerFcmToken({fcm_token: fcmToken, device_os: deviceOs});
            }
          } else {
            Toast.show({
              type: 'error',
              text1: getSafeServerMessage(res?.message?.message) ?? 'Error',
              position: 'top',
              visibilityTime: 6000,
            });
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1:
              getUserFacingError(error, 'Internal Server Error'),
            text2: 'Please try again later.',
            position: 'top',
            visibilityTime: 6000,
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
      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/softsence-logo-login.png')}
            resizeMode="contain"
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
              inputStyle={{paddingTop: 15}}
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
              leftIcon={<UserRound color={Colors.white} size={18} />}
            />
            <Input
              secureTextEntry={secureText}
              style={styles.inputBox}
              inputStyle={{paddingTop: 15}}
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
              leftIcon={<Lock color={Colors.white} size={18} />}
              rightIcon={
                <TouchableOpacity onPress={() => setSecureText(prev => !prev)}>
                  {secureText ? (
                    <EyeOff color={Colors.white} size={18} />
                  ) : (
                    <Eye color={Colors.white} size={18} />
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
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.manualLink}
            onPress={() => navigation.navigate('UserManualScreen')}>
            <BookOpen strokeWidth={1.8} color={Colors.orange} size={16} />
            <Text style={styles.manualLinkText}>Check the user manual</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={Colors.orange}
            />
          </TouchableOpacity>
          <Image
            source={require('../../assets/images/brand.png')}
            resizeMode="contain"
            style={styles.footerLogoImage}
          />
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: Size.sm,
              color: Colors.darkGray,
              textAlign: 'center',
              marginTop: 20,
            }}>
            App Version:{' '}
            <Text style={{fontFamily: Fonts.bold, color: Colors.darkGray}}>
              {APP_VERSION}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    minHeight: 270,
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
    width: width * 0.8,
    height: 150,
    marginBottom: 10,
  },
  footer: {
    minHeight: 150,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  footerLogoImage: {
    width: width * 0.3,
    height: 40,
  },
  manualLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FFE3C7',
  },
  manualLinkText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
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
    // flex: 1,
  },
  inputBox: {
    color: Colors.white,
    fontFamily: Fonts.light,
    fontSize: Size.sm,
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
