import { StyleSheet, SafeAreaView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import React, { useRef } from 'react';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useFormik } from 'formik';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  useCreateVisibilityClaimMutation,
  useSubmitVisibilityClaimMutation,
} from '../../../features/tada/tadaApiv2';
import AddVisibilityComponent from '../../../components/SO/Visibility/add-visibility-component';
import { visibilityClaimSchema } from '../../../types/schema';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddVisibilityScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const initialValues = {
  store: '',
  pjp_store_id: '',
  collection_amount: 0,
  payment_type: 'Cash' as const,
  price_difference_amount: 0,
  damage_claim: 0,
  image: {
    mime: '',
    data: '',
  },
  date: new Date().toISOString().split('T')[0],
};

const AddVisibilityScreen = ({ navigation }: Props) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [createVisibilityClaim, { isLoading: isCreating }] =
    useCreateVisibilityClaimMutation();
  const [submitVisibilityClaim, { isLoading: isSubmitting }] =
    useSubmitVisibilityClaimMutation();

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    errors,
    touched,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: visibilityClaimSchema,
    onSubmit: async formValues => {
      try {
        let res = await createVisibilityClaim({
          ...formValues,
          do_submit: true,
        }).unwrap();

        console.log("🚀 ~ AddVisibilityScreen ~ res:", res)
        if (res?.message.success) {

          Toast.show({
            type: 'success',
            text1: 'Visibility claim submitted successfully',
            position: 'top',
          });

          resetForm();
          navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed to submit visibility claim',
            text2: res.message?.message as string,
            position: 'top',
          });
        }
      } catch (error: any) {
        console.error('Visibility Submission Error:', error);
        Toast.show({
          type: 'error',
          text1:
            error?.data?.message?.message ||
            'Failed to submit visibility claim',
          text2: 'Please try again',
          position: 'top',
        });
      }
    },
  });

  const isLoading = isCreating || isSubmitting;

  return (
    <SafeAreaView style={[flexCol, styles.container]}>
      <PageHeader
        title="Add Visibility Claim"
        navigation={() => navigation.goBack()}
      />

      {/* FORM COMPONENT */}
      <AddVisibilityComponent
        values={values}
        errors={errors}
        touched={touched}
        handleChange={handleChange}
        handleBlur={handleBlur}
        setFieldValue={setFieldValue}
      />

      {/* SUBMIT BUTTON */}
      <TouchableOpacity
        style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
        onPress={() => handleSubmit()}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>Submit Claim</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddVisibilityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  submitBtn: {
    backgroundColor: Colors.darkButton,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
