import {StyleSheet, SafeAreaView, TouchableOpacity, Text} from 'react-native';
import React, {useRef} from 'react';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {useFormik} from 'formik';
import {Animated} from 'react-native';
import Toast from 'react-native-toast-message';
import {IVisivilityClaim} from '../../../types/baseType';
import {ActivityIndicator} from 'react-native';
import {useCreateVisibilityClaimMutation} from '../../../features/base/base-api';
import AddVisibilityComponent from '../../../components/SO/Visibility/add-visibility-component';
import {visibilityClaimSchema} from '../../../types/schema';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddVisibilityScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const initialValues: IVisivilityClaim = {
  store: '',
  collection_amount: 0,
  payment_type: 'Cash',
  price_difference_amount: 0,
  damage_claim: 0,
  image: {
    mime: '',
    data: '',
  },
  do_submit: true,
};

const AddVisibilityScreen = ({navigation}: Props) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [createVisibilityClaim, {isLoading}] =
    useCreateVisibilityClaimMutation();

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
        const res = await createVisibilityClaim(formValues).unwrap();

        Toast.show({
          type: 'success',
          text1: 'Visibility claim created successfully',
          position: 'top',
        });
        console.log('🚀 ~ AddVisibilityScreen ~ res:', res);

        resetForm();
        navigation.goBack();
      } catch (error: any) {
        console.log('🚀 ~ AddVisibilityScreen ~ error:', error);
        Toast.show({
          type: 'error',
          text1:
            error?.data?.message?.message ||
            'Failed to create visibility claim',
          text2: 'Please try again',
          position: 'top',
        });
      }
    },
  });

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
        style={[styles.submitBtn, isLoading && {opacity: 0.7}]}
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
