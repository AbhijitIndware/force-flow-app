/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, TextInput} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {launchCamera} from 'react-native-image-picker';
import {
  useCreateProductFeedbackMutation,
  useGetEmployeeAssignedStoresQuery,
} from '../../../features/base/promoter-base-api';
import {Camera, Trash2, Upload} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import {getUserFacingError, getSafeServerMessage} from '../../../utils/errorMessage';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'AddProductFeedbackScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

interface PickedImage {
  mime: string;
  data: string;
}

const FEEDBACK_TYPES = ['Own', 'Competitor'];

const AddProductFeedbackScreen = ({navigation}: Props) => {
  const [type, setType] = useState('');
  const [store, setStore] = useState('');
  const [remarks, setRemarks] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [errors, setErrors] = useState<{
    type?: string;
    content?: string;
  }>({});

  const [createProductFeedback, {isLoading}] =
    useCreateProductFeedbackMutation();
  const {data: assignedStoresData} = useGetEmployeeAssignedStoresQuery();

  const typeOptions = FEEDBACK_TYPES.map(t => ({label: t, value: t}));

  const stores =
    assignedStoresData?.message?.data?.stores?.map(s => ({
      label: s.store_name,
      value: s.store_id,
    })) ?? [];

  useEffect(() => {
    if (stores.length === 1) {
      setStore(stores[0].value);
    }
  }, [assignedStoresData]);

  const handleCapture = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.7,
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
            setImage({
              data: photo.base64 as string,
              mime: photo.type as string,
            });
          }
        }
      },
    );
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!type) newErrors.type = 'Please select feedback type';
    if (!remarks.trim() && !image)
      newErrors.content = 'Add a remark or a photo';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await createProductFeedback({
        type,
        ...(store ? {store} : {}),
        ...(remarks.trim() ? {remarks: remarks.trim()} : {}),
        ...(image ? {image} : {}),
      }).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Feedback submitted',
        text2: 'Thank you for your feedback',
      });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Submission failed',
        text2: getUserFacingError(err, 'Something went wrong'),
      });
    }
  };

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Add Feedback"
        navigation={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{paddingBottom: 40}}>
          <View style={styles.card}>
            <ReusableDropdown
              label="Feedback Type"
              field="type"
              value={type}
              data={typeOptions}
              error={errors.type}
              onChange={setType}
              placeholder="Select type"
            />

            {stores.length > 1 ? (
              <ReusableDropdown
                label="Store"
                field="store"
                value={store}
                data={stores}
                onChange={setStore}
                placeholder="Select store"
                marginBottom={16}
              />
            ) : null}

            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe the issue or feedback…"
              placeholderTextColor={Colors.gray}
              value={remarks}
              onChangeText={setRemarks}
              multiline
            />

            <Text style={styles.label}>Photo (optional)</Text>
            <TouchableOpacity
              onPress={handleCapture}
              style={styles.UploadSection}
              activeOpacity={0.8}>
              <View style={styles.UploadSectionInner}>
                <View style={styles.UploadIcon}>
                  <Camera strokeWidth={1.6} color={Colors.orange} size={20} />
                </View>
                <View style={styles.uploadTextWrap}>
                  <Text style={styles.uploadTitle}>Capture photo</Text>
                  <Text style={styles.uploadSubtitle}>
                    Add a photo of the product
                  </Text>
                </View>
                <Upload strokeWidth={1.4} color={Colors.orange} size={18} />
              </View>
            </TouchableOpacity>

            {image ? (
              <View style={styles.previewRow}>
                <TouchableOpacity
                  onPress={() => setReviewVisible(true)}
                  activeOpacity={0.8}>
                  <Image
                    source={{uri: `data:${image.mime};base64,${image.data}`}}
                    style={styles.preview}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => setImage(null)}>
                  <Trash2 size={16} color={Colors.denger} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ) : null}

            {errors.content ? (
              <Text style={styles.errorText}>{errors.content}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            activeOpacity={0.8}
            disabled={isLoading}
            onPress={handleSubmit}>
            <Text style={styles.submitText}>
              {isLoading ? 'Submitting…' : 'Submit Feedback'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={reviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewVisible(false)}>
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>Photo Review</Text>
            <TouchableOpacity
              onPress={() => setReviewVisible(false)}
              hitSlop={10}>
              <Text style={styles.reviewClose}>✕</Text>
            </TouchableOpacity>
          </View>
          {image ? (
            <Image
              source={{uri: `data:${image.mime};base64,${image.data}`}}
              style={styles.reviewImage}
              resizeMode="contain"
            />
          ) : null}
          <TouchableOpacity
            style={styles.reviewRetakeBtn}
            onPress={() => {
              setReviewVisible(false);
              handleCapture();
            }}>
            <Text style={styles.reviewRetakeText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddProductFeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: Size.xs,
    color: Colors.black,
    fontFamily: Fonts.regular,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.lightBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  UploadSection: {
    backgroundColor: Colors.lightBg,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B9BFCB',
    padding: 5,
    marginBottom: 12,
  },
  UploadSectionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: Colors.lightOrange,
    borderRadius: 10,
    padding: 12,
  },
  UploadIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 38,
    height: 38,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  uploadTextWrap: {flex: 1},
  uploadTitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
    lineHeight: 16,
  },
  uploadSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.darkButton,
    paddingTop: 3,
    lineHeight: 14,
    opacity: 0.6,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  preview: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: Size.xs,
    color: Colors.denger,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
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
    height: '70%',
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