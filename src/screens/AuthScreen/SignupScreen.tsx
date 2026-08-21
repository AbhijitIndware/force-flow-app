/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {flexCol} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';
import Input from '@rneui/themed/dist/Input';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
  UserRoundPen,
} from 'lucide-react-native';
const {width} = Dimensions.get('window');

type Props = {
  navigation: any;
  route: any;
};

const SignupScreen = ({navigation, route}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // NOTE: this screen has no signup API call wired up anywhere in the
  // codebase (unlike LoginScreen, which calls useLoginMutation). The fields
  // below are now controlled and validated locally so the UI isn't
  // silently discarding what the user types, but submission still just
  // navigates to HomeScreen. Wire this to a real signup mutation before
  // treating this screen as production-ready.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const nextErrors: {name?: string; email?: string; password?: string} = {};
    if (!name.trim()) {
      nextErrors.name = 'Name is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      nextErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = () => {
    if (!validate()) {
      return;
    }
    // TODO: replace with a real signup mutation once the backend endpoint
    // is available. Currently just proceeds to HomeScreen like before.
    navigation.navigate('HomeScreen');
  };

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
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
            Sign Up
          </Text>
          <Text
            style={{
              fontFamily: Fonts.light,
              fontSize: Size.md,
              width: '100%',
              textAlign: 'center',
              color: Colors.white,
            }}>
            Enter credentials to Sign up
          </Text>
          <View style={{paddingTop: 20}}>
            <Input
              style={styles.inputBox}
              inputStyle={{paddingTop: 18}}
              labelStyle={{color: Colors.white}}
              placeholderTextColor="#FFC691"
              autoComplete="name"
              textContentType="name"
              inputContainerStyle={{
                borderBottomWidth: 0,
                backgroundColor: Colors.Orangelight,
                paddingHorizontal: 10,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
              }}
              value={name}
              onChangeText={setName}
              errorMessage={errors.name}
              errorStyle={{color: '#FFEFE0', marginBottom: 10}}
              placeholder="Name"
              leftIcon={<UserRound color={Colors.white} />}
            />
            <Input
              style={styles.inputBox}
              inputStyle={{paddingTop: 18}}
              labelStyle={{color: Colors.white}}
              placeholderTextColor="#FFC691"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              inputContainerStyle={{
                borderBottomWidth: 0,
                backgroundColor: Colors.Orangelight,
                paddingHorizontal: 10,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
              }}
              value={email}
              onChangeText={setEmail}
              errorMessage={errors.email}
              errorStyle={{color: '#FFEFE0', marginBottom: 10}}
              placeholder=" E-mail ID"
              leftIcon={<Mail color={Colors.white} />}
            />
            <Input
              secureTextEntry={secureText}
              contextMenuHidden={true}
              style={styles.inputBox}
              inputStyle={{paddingTop: 15}}
              labelStyle={{color: Colors.white}}
              placeholderTextColor="#FFC691"
              autoComplete="password-new"
              textContentType="newPassword"
              inputContainerStyle={{
                borderBottomWidth: 0,
                backgroundColor: Colors.Orangelight,
                paddingHorizontal: 10,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              value={password}
              onChangeText={setPassword}
              errorMessage={errors.password}
              errorStyle={{color: '#FFEFE0', marginBottom: 10}}
              placeholder="Password"
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
              style={styles.checkinButton}
              onPress={handleSignup}>
              <UserRoundPen strokeWidth={1.4} color={Colors.white} />
              <Text style={styles.checkinButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: Size.sm,
            width: '100%',
            textAlign: 'center',
            color: Colors.darkButton,
            marginTop: 20,
          }}>
          You have an account?
          <Text
            style={{fontFamily: Fonts.semiBold}}
            onPress={() => navigation.navigate('LoginScreen')}>
            {' '}
            Login
          </Text>{' '}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;

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
