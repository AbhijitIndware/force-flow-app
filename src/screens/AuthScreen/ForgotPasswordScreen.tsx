/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import Input from '@rneui/themed/dist/Input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../utils/colors';
import { Fonts } from '../../constants';
import { Size } from '../../utils/fontSize';
import {
  useSendOtpMutation,
  useVerifyOtpAndDeleteMutation,
  useResetPasswordMutation,
} from '../../features/auth/auth';
import {
  getResetToken,
  isExpiredTokenError,
  isLockedOutPayload,
  getRetryAfterSeconds,
} from '../../utils/security';
import { getUserFacingError } from '../../utils/errorMessage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationStackParamList } from '../../types/Navigation';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  MainNavigationStackParamList,
  'LoginScreen'
>;

interface Props {
  navigation: NavigationProp;
}

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetTokenState] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] =
    useVerifyOtpAndDeleteMutation();
  const [resetPassword, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();

  // Lockout countdown timer effect
  useEffect(() => {
    if (!lockoutSeconds || lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds(prev => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your registered email address.',
      });
      return;
    }

    try {
      await sendOtp({ email: email.trim() }).unwrap();
      // Requirement 2: Show the exact same generic message regardless of whether email exists
      Toast.show({
        type: 'success',
        text1: 'Verification Code Sent',
        text2: 'If an account exists for this email, an OTP has been sent.',
        visibilityTime: 5000,
      });
      setStep(2);
    } catch (error: any) {
      if (isLockedOutPayload(error?.data)) {
        const secs = getRetryAfterSeconds(error) ?? 300;
        setLockoutSeconds(secs);
        Toast.show({
          type: 'error',
          text1: 'Account Locked',
          text2: `Too many failed attempts. Please wait ${secs} seconds.`,
          visibilityTime: 6000,
        });
      } else {
        // Requirement 2: Do not reveal whether email exists; proceed or show generic message
        Toast.show({
          type: 'info',
          text1: 'Verification Code Sent',
          text2: 'If an account exists for this email, an OTP has been sent.',
          visibilityTime: 5000,
        });
        setStep(2);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Toast.show({
        type: 'error',
        text1: 'OTP Required',
        text2: 'Please enter the verification code sent to your email.',
      });
      return;
    }

    try {
      const res = await verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      }).unwrap();
      const token = getResetToken(res);

      if (token) {
        setResetTokenState(token);
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: 'Please enter your new password.',
        });
        setStep(3);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'Invalid verification code. Please try again.',
        });
      }
    } catch (error: any) {
      if (isLockedOutPayload(error?.data)) {
        const secs = getRetryAfterSeconds(error) ?? 300;
        setLockoutSeconds(secs);
        Toast.show({
          type: 'error',
          text1: 'Account Locked Out',
          text2: `Too many failed OTP attempts. Locked for ${secs} seconds.`,
          visibilityTime: 6000,
        });
      } else if (isExpiredTokenError(error)) {
        Toast.show({
          type: 'error',
          text1: 'Code Expired',
          text2: 'The verification code has expired. Please request a new code.',
        });
        setStep(1);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Error',
          text2: getUserFacingError(error, 'Invalid verification code.'),
        });
      }
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Required',
        text2: 'Please enter a new password.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords Do Not Match',
        text2: 'Please ensure both password fields match.',
      });
      return;
    }

    try {
      const res = await resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
      }).unwrap();

      if (res?.message?.success) {
        Toast.show({
          type: 'success',
          text1: 'Password Reset Successful',
          text2: 'Your password has been updated. Please log in.',
          visibilityTime: 4000,
        });
        navigation.navigate('LoginScreen');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: res?.message?.message || 'Failed to reset password.',
        });
      }
    } catch (error: any) {
      if (isExpiredTokenError(error)) {
        Toast.show({
          type: 'error',
          text1: 'Token Expired',
          text2: 'Reset token has expired. Please restart the process.',
        });
        setStep(1);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: getUserFacingError(error, 'Failed to reset password.'),
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step > 1) setStep((step - 1) as any);
            else navigation.goBack();
          }}>
          <ArrowLeft color={Colors.white} size={20} />
          <Text style={styles.backBtnText}>
            {step === 1 ? 'Back to Login' : 'Back'}
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Set New Password'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 && 'Enter your email address to receive an OTP code.'}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && 'Create a strong new password for your account.'}
          </Text>

          {lockoutSeconds ? (
            <View style={styles.lockoutBanner}>
              <Ionicons name="lock-closed" size={18} color="#dc2626" />
              <Text style={styles.lockoutText}>
                Account Locked. Try again in {lockoutSeconds}s
              </Text>
            </View>
          ) : null}

          {step === 1 && (
            <View style={styles.formGroup}>
              <Input
                placeholder="Enter Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail color={Colors.white} size={18} />}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                placeholderTextColor="#FFC691"
              />
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (isSendingOtp || !!lockoutSeconds) && { opacity: 0.7 },
                ]}
                onPress={handleSendOtp}
                disabled={isSendingOtp || !!lockoutSeconds}>
                {isSendingOtp ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.formGroup}>
              <Input
                placeholder="Enter 6-Digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                leftIcon={<KeyRound color={Colors.white} size={18} />}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                placeholderTextColor="#FFC691"
              />
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (isVerifyingOtp || !!lockoutSeconds) && { opacity: 0.7 },
                ]}
                onPress={handleVerifyOtp}
                disabled={isVerifyingOtp || !!lockoutSeconds}>
                {isVerifyingOtp ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleSendOtp}
                disabled={isSendingOtp || !!lockoutSeconds}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.formGroup}>
              <Input
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                leftIcon={<Lock color={Colors.white} size={18} />}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                placeholderTextColor="#FFC691"
              />
              <Input
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon={<Lock color={Colors.white} size={18} />}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                placeholderTextColor="#FFC691"
              />
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  isResettingPassword && { opacity: 0.7 },
                ]}
                onPress={handleResetPassword}
                disabled={isResettingPassword}>
                {isResettingPassword ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.lightBg },
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.orange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  backBtnText: { color: Colors.white, fontFamily: Fonts.medium, fontSize: Size.sm },
  card: {
    backgroundColor: Colors.orange,
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  title: {
    fontSize: Size.lg,
    fontFamily: Fonts.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Size.xs,
    fontFamily: Fonts.regular,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  lockoutBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  lockoutText: {
    color: '#dc2626',
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
  },
  formGroup: { gap: 10 },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: Colors.Orangelight,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  inputText: { color: Colors.white, fontFamily: Fonts.regular, fontSize: Size.sm },
  submitBtn: {
    backgroundColor: Colors.darkButton,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
  },
  resendBtn: { alignItems: 'center', marginTop: 10 },
  resendText: { color: Colors.white, fontFamily: Fonts.regular, textDecorationLine: 'underline' },
});
