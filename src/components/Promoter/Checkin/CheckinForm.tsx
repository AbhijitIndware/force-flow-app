import React from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import {getCurrentLatLongWithAddress, windowWidth} from '../../../utils/utils';
import MapReusableInput from '../../ui-lib/map-input';
import {Upload} from 'lucide-react-native';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import MapReusableLocationInput from './MapReusableLocationInput';

interface ICheckInRequest {
  store: string;
  image: {
    mime: string;
    data: string;
  };
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface Props {
  values: ICheckInRequest;
  errors: Partial<Record<keyof ICheckInRequest, any>>;
  touched: Partial<Record<keyof ICheckInRequest, any>>;
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
  // 📌 CAMERA HANDLER
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
    <View>
      {/* 📌 STORE DROPDOWN */}
      <ReusableDropdown
        label="Store"
        field="store"
        value={values.store}
        data={storeList}
        error={touched.store && errors.store}
        onChange={(val: string) => setFieldValue('store', val)}
      />

      <MapReusableLocationInput
        latitude={values.latitude}
        longitude={values.longitude}
        address={values.address}
        setFieldValue={setFieldValue}
        error={touched.address && errors.address}
      />

      {/* 📌 CAMERA BUTTON */}
      <TouchableOpacity
        onPress={handleOpenCamera}
        style={styles.UploadSection}
        activeOpacity={0.8}>
        <View style={styles.UploadSectionInner}>
          <View style={styles.UploadIcon}>
            <Upload strokeWidth={1.4} color={Colors.blue} />
          </View>

          <View>
            <Text style={styles.uploadTitle}>Upload image</Text>
            <Text style={styles.uploadSubtitle}>
              Upload image for face recognition
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 📌 SHOW PHOTO PREVIEW */}
      {values.image?.data ? (
        <Image
          source={{
            uri: `data:${values.image.mime};base64,${values.image.data}`,
          }}
          style={{
            width: 150,
            height: 150,
            marginTop: 12,
            borderRadius: 8,
          }}
        />
      ) : null}
    </View>
  );
};

export default AddCheckInForm;

const styles = StyleSheet.create({
  UploadSection: {
    backgroundColor: Colors.lightBg,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B9BFCB',
    padding: 5,
  },
  UploadSectionInner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 15,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    padding: 15,
  },
  UploadIcon: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#C8DAFF',
    borderRadius: 100,
  },

  uploadTitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.blue,
    lineHeight: 20,
  },

  uploadSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
    paddingTop: 5,
    lineHeight: 16,
  },
});
