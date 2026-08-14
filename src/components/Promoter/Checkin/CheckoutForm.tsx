import React, {useState} from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {Upload} from 'lucide-react-native';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import MapReusableLocationInput from './MapReusableLocationInput';
import {ICheckOutRequest} from '../../../types/baseType';

interface Props {
  values: ICheckOutRequest;
  errors: Partial<Record<keyof ICheckOutRequest, any>>;
  touched: Partial<Record<keyof ICheckOutRequest, any>>;
  setFieldValue: (field: string, value: any) => void;
}

const AddCheckOutForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  setFieldValue,
}) => {
  const [reviewVisible, setReviewVisible] = useState(false);

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
      <MapReusableLocationInput
        latitude={values.latitude}
        longitude={values.longitude}
        address={values.address}
        setFieldValue={setFieldValue}
        error={touched.address && errors.address}
        hideLabel
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

          <View style={styles.uploadTextWrap}>
            <Text style={styles.uploadTitle}>Upload image</Text>
            <Text style={styles.uploadSubtitle}>
              For face recognition
            </Text>
          </View>

          {/* 📌 SHOW PHOTO PREVIEW */}
          {values.image?.data ? (
            <TouchableOpacity
              onPress={() => setReviewVisible(true)}
              activeOpacity={0.7}>
              <Image
                source={{
                  uri: `data:${values.image.mime};base64,${values.image.data}`,
                }}
                style={styles.preview}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* 📌 IMAGE REVIEW MODAL */}
      <Modal
        visible={reviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewVisible(false)}>
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>Image Review</Text>
            <TouchableOpacity onPress={() => setReviewVisible(false)} hitSlop={10}>
              <Text style={styles.reviewClose}>✕</Text>
            </TouchableOpacity>
          </View>
          {values.image?.data ? (
            <Image
              source={{
                uri: `data:${values.image.mime};base64,${values.image.data}`,
              }}
              style={styles.reviewImage}
              resizeMode="contain"
            />
          ) : null}
          <TouchableOpacity
            style={styles.reviewRetakeBtn}
            onPress={() => {
              setReviewVisible(false);
              handleOpenCamera();
            }}>
            <Text style={styles.reviewRetakeText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AddCheckOutForm;

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
    padding: 12,
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
  uploadTextWrap: {flex: 1},
  uploadTitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.blue,
    lineHeight: 16,
  },

  uploadSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.darkButton,
    paddingTop: 3,
    lineHeight: 14,
  },
  preview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  reviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  reviewTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  reviewClose: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.white,
  },
  reviewImage: {
    width: '100%',
    height: '75%',
    borderRadius: 12,
  },
  reviewRetakeBtn: {
    marginTop: 20,
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  reviewRetakeText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
});
