/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
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
  useGetActivityCategoriesQuery,
  useUploadStoreActivityMutation,
  useGetEmployeeAssignedStoresQuery,
} from '../../../features/base/promoter-base-api';
import {Camera, Trash2, Upload, X} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'AddStoreActivityScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

interface PickedImage {
  mime: string;
  data: string;
}

const AddStoreActivityScreen = ({navigation}: Props) => {
  const [activityType, setActivityType] = useState('');
  const [category, setCategory] = useState('');
  const [store, setStore] = useState('');
  const [remark, setRemark] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    activityType?: string;
    category?: string;
    images?: string;
  }>({});

  const {data: categoriesData} = useGetActivityCategoriesQuery();
  const {data: assignedStoresData} = useGetEmployeeAssignedStoresQuery();
  const [uploadStoreActivity, {isLoading}] = useUploadStoreActivityMutation();

  const activityTypes =
    categoriesData?.message?.data?.activity_types?.map(t => ({
      label: t,
      value: t,
    })) ?? [];

  const categories =
    categoriesData?.message?.data?.categories?.map(c => ({
      label: c.category_name,
      value: c.category_name,
    })) ?? [];

  const stores =
    assignedStoresData?.message?.data?.stores?.map(s => ({
      label: s.store_name,
      value: s.store_id,
    })) ?? [];

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
            setImages(prev => [
              ...prev,
              {data: photo.base64 as string, mime: photo.type as string},
            ]);
          }
        }
      },
    );
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setReviewIndex(null);
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!activityType) newErrors.activityType = 'Please select activity type';
    if (!category) newErrors.category = 'Please select a category';
    if (images.length === 0)
      newErrors.images = 'Please capture at least one photo';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await uploadStoreActivity({
        activity_type: activityType,
        activities_category: category,
        ...(store ? {store} : {}),
        ...(remark.trim() ? {remark: remark.trim()} : {}),
        images,
      }).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Activity uploaded',
        text2: res.message?.data?.store_name ?? 'Store activity recorded',
      });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: err?.message ?? 'Something went wrong',
      });
    }
  };

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Add Store Activity"
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
              label="Activity Type"
              field="activityType"
              value={activityType}
              data={activityTypes}
              error={errors.activityType}
              onChange={setActivityType}
              placeholder="Select type"
            />

            <ReusableDropdown
              label="Category"
              field="category"
              value={category}
              data={categories}
              error={errors.category}
              onChange={setCategory}
              placeholder="Select category"
            />

            {stores.length > 0 ? (
              <ReusableDropdown
                label="Store (optional)"
                field="store"
                value={store}
                data={stores}
                onChange={setStore}
                placeholder="Defaults to today's shift store"
                marginBottom={16}
              />
            ) : null}

            <Text style={styles.label}>Remark</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a remark (optional)"
              placeholderTextColor={Colors.gray}
              value={remark}
              onChangeText={setRemark}
              multiline
            />

            <Text style={styles.label}>Photos</Text>
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
                    One or more photos required
                  </Text>
                </View>
                <Upload strokeWidth={1.4} color={Colors.orange} size={18} />
              </View>
            </TouchableOpacity>
            {errors.images ? (
              <Text style={styles.errorText}>{errors.images}</Text>
            ) : null}

            {images.length > 0 ? (
              <View style={styles.imageRow}>
                {images.map((img, idx) => (
                  <View key={idx} style={styles.thumbWrap}>
                    <TouchableOpacity
                      onPress={() => setReviewIndex(idx)}
                      activeOpacity={0.8}>
                      <Image
                        source={{
                          uri: `data:${img.mime};base64,${img.data}`,
                        }}
                        style={styles.thumb}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeImage(idx)}>
                      <X size={12} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addMoreBtn}
                  onPress={handleCapture}>
                  <Camera size={20} color={Colors.gray} strokeWidth={1.6} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            activeOpacity={0.8}
            disabled={isLoading}
            onPress={handleSubmit}>
            <Text style={styles.submitText}>
              {isLoading ? 'Uploading…' : 'Submit Activity'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image review modal */}
      <Modal
        visible={reviewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewIndex(null)}>
        <View style={styles.reviewOverlay}>
          {reviewIndex !== null && images[reviewIndex] ? (
            <>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewTitle}>Photo Review</Text>
                <TouchableOpacity
                  onPress={() => setReviewIndex(null)}
                  hitSlop={10}>
                  <Text style={styles.reviewClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={{
                  uri: `data:${images[reviewIndex].mime};base64,${images[reviewIndex].data}`,
                }}
                style={styles.reviewImage}
                resizeMode="contain"
              />
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeImage(reviewIndex)}>
                  <Trash2 size={16} color={Colors.denger} strokeWidth={2} />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reviewCloseBtn}
                  onPress={() => setReviewIndex(null)}>
                  <Text style={styles.reviewCloseBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddStoreActivityScreen;

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
  errorText: {
    fontSize: Size.xs,
    color: Colors.denger,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.denger,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  addMoreBtn: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B9BFCB',
    alignItems: 'center',
    justifyContent: 'center',
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
  reviewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  deleteBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.denger,
  },
  reviewCloseBtn: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  reviewCloseBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
});
