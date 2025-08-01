import React from 'react';
import {Animated, Text, TouchableOpacity, View, Image} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';

interface FormValues {
  store: string;
  image: {
    mime: string;
    data: string;
  };
  current_location: string;
}
interface Props {
  values: FormValues;
  errors: Partial<Record<keyof FormValues, any>>;
  touched: Partial<Record<keyof FormValues, any>>;
  handleBlur: any;
  handleChange: any;
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
  storeList: {label: string; value: string}[];
}

const AddCheckInForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
  storeList,
}) => {
  const onSelect = (field: string, val: string) => {
    setFieldValue(field, val);
    if (field === 'zone') {
      setFieldValue('state', '');
      setFieldValue('city', '');
    } else if (field === 'state') {
      setFieldValue('city', '');
    }
  };

  const handleOpenCamera = async () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        includeBase64: true,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.warn('Camera error: ', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const photo = response.assets[0];
          if (photo.base64 && photo.type) {
            setFieldValue('image', {
              data: photo.base64,
              mime: photo.type,
            });
          }
        }
      },
    );
  };

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{padding: 16}}>
      <ReusableDropdown
        label="Store"
        field="value"
        value={values.store}
        data={storeList}
        error={touched.store && errors.store}
        onChange={(val: string) => onSelect('store', val)}
      />

      <TouchableOpacity
        onPress={handleOpenCamera}
        style={{
          backgroundColor: '#007bff',
          padding: 12,
          marginTop: 16,
          borderRadius: 6,
        }}>
        <Text style={{color: '#fff', textAlign: 'center'}}>
          Take Live Photo
        </Text>
      </TouchableOpacity>

      {values.image?.data ? (
        <Image
          source={{
            uri: `data:${values.image.mime};base64,${values.image.data}`,
          }}
          style={{width: 150, height: 150, marginTop: 12, borderRadius: 8}}
        />
      ) : null}
    </Animated.ScrollView>
  );
};

export default AddCheckInForm;
