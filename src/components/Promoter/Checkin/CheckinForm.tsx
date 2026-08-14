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
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
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
  shift?: {
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
    shiftType?: string;
  };
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
  shift,
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
      {/* 📌 STORE DROPDOWN */}
      <ReusableDropdown
        label="Store"
        field="store"
        value={values.store}
        data={storeList}
        error={touched.store && errors.store}
        onChange={(val: string) => setFieldValue('store', val)}
      />

      {/* 📌 SHIFT INFO (small card) */}
      {shift ? (
        <View style={styles.shiftCard}>
          <View style={styles.shiftHeaderRow}>
            <Text style={styles.shiftTitle}>Shift Details</Text>
            <View style={styles.shiftTypeBadge}>
              <Text style={styles.shiftTypeText}>
                {shift.shiftType || 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.shiftBodyRow}>
            <View style={styles.shiftCol}>
              <Text style={styles.shiftLabel}>Start</Text>
              <Text style={styles.shiftValue}>{shift.startTime}</Text>
              <Text style={styles.shiftDate}>{shift.startDate}</Text>
            </View>
            <View style={styles.shiftDivider} />
            <View style={styles.shiftCol}>
              <Text style={styles.shiftLabel}>End</Text>
              <Text style={styles.shiftValue}>{shift.endTime}</Text>
              <Text style={styles.shiftDate}>{shift.endDate}</Text>
            </View>
          </View>
        </View>
      ) : null}

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

          <View style={styles.uploadTextWrap}>
            <Text style={styles.uploadTitle}>Upload image</Text>
            <Text style={styles.uploadSubtitle}>For face recognition</Text>
          </View>

          {/* 📌 SHOW PHOTO PREVIEW + REVIEW */}
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

export default AddCheckInForm;

const styles = StyleSheet.create({
  shiftCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 2,
    marginBottom: 10,
  },
  shiftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shiftTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  shiftTypeBadge: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  shiftTypeText: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: Colors.blue,
  },
  shiftBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  shiftCol: {
    flex: 1,
    alignItems: 'center',
  },
  shiftDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#ECEFF3',
  },
  shiftLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: Colors.gray,
  },
  shiftValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.darkButton,
    marginTop: 1,
  },
  shiftDate: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: Colors.gray,
    marginTop: 1,
  },
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
    width: 38,
    height: 38,
    backgroundColor: '#C8DAFF',
    borderRadius: 10,
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
