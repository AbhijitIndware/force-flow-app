import React from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { Camera } from 'lucide-react-native';

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
  storeList: { label: string; value: string }[];
}

const AddCheckInForm: React.FC<Props> = ({
  values,
  errors,
  touched,
  setFieldValue,
  scrollY,
}) => {
  const handleOpenCamera = async () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front', // Switching to front camera for selfie consistency
        quality: 0.8,
        includeBase64: true,
        saveToPhotos: false,
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
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={styles.scrollContent}>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Selfie</Text>
        <Text style={styles.sectionSubtitle}>Please take a photo at the store location</Text>
        
        <TouchableOpacity style={styles.cameraBtn} onPress={handleOpenCamera}>
          {values.image?.data ? (
            <Image
              source={{
                uri: `data:${values.image.mime};base64,${values.image.data}`,
              }}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Camera size={40} color={Colors.gray} />
              <Text style={styles.cameraText}>Tap to open camera</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {touched?.image && errors?.image && (
          <Text style={styles.errorText}>{errors.image as string}</Text>
        )}
      </View>
    </Animated.ScrollView>
  );
};

export default AddCheckInForm;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the absolute positioned submit button
  },
  section: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  sectionSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.gray,
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  cameraBtn: {
    width: 250,
    height: 250,
    borderRadius: 20,
    backgroundColor: '#F8F9FB',
    borderWidth: 2,
    borderColor: '#E2E4E9',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    gap: 12,
  },
  cameraText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.gray,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 8,
    fontFamily: Fonts.regular,
  },
});
