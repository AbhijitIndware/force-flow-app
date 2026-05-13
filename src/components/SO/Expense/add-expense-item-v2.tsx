// Add ExpenseItem.tsx
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native';
import ReusableInput from '../../ui-lib/reuseable-input';
import { FormikTouched } from 'formik';
import ReusableDropdownv2 from '../../ui-lib/resusable-dropdown-v2';
import { Upload } from 'lucide-react-native';
import { pick } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import { Colors } from '../../../utils/colors';
import moment from 'moment';
import { Size } from '../../../utils/fontSize';
import { Fonts } from '../../../constants';
import { flexCol } from '../../../utils/styles';
import { Switch } from 'react-native';
import ReusableDatePicker from '../../ui-lib/reusable-date-picker';

interface Props {
  values: Record<string, string | any>;
  errors: Record<string, string | any>;
  touched: Record<
    string,
    boolean | FormikTouched<any> | FormikTouched<any>[] | undefined
  >;
  handleBlur: {
    (e: React.FocusEvent<any, Element>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T_1 = string | React.ChangeEvent<any>>(
      field: T_1,
    ): T_1 extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  setFieldValue: (field: string, value: any) => void;
  scrollY: Animated.Value;
}
interface DropdownOption {
  label: string;
  value: string;
}
export const EXPENSE_TYPES: DropdownOption[] = [
  { label: 'Daily Allowance', value: 'Daily Allowance' },
  { label: 'TA - Auto', value: 'TA - Auto' },
  { label: 'TA - Cab', value: 'TA - Cab' },
  { label: 'TA - Bus', value: 'TA - Bus' },
  { label: 'TA - Rail', value: 'TA - Rail' },
  { label: 'TA - Bike (Petrol)', value: 'TA - Bike (Petrol)' },
  { label: 'TA - Local Travel', value: 'TA - Local Travel' },
  { label: 'Lodging / Boarding / Hotel', value: 'Lodging / Boarding / Hotel' },
  { label: 'Food / Meals', value: 'Food / Meals' },
  { label: 'Mobile Bill', value: 'Mobile Bill' },
  { label: 'Courier', value: 'Courier' },
  { label: 'Xerox', value: 'Xerox' },
  { label: 'TA – Share Taxi', value: 'TA – Share Taxi' }
];
const AddExpenseItemV2: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
}) => {
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const isImage = (type?: string) => {
    return !!type && type.startsWith('image/');
  };

  const onSelect = (field: string, val: string) => {
    setFieldValue(field, val);
  };

  const handlePickDocument = async () => {
    try {
      const doc = await pick({
        allowMultiSelection: false,
      });

      if (!doc || !doc[0]) {
        return;
      }

      const { uri, name, type } = doc[0];

      setFieldValue('attachment', {
        uri,
        name,
        type: type || 'application/octet-stream',
      });
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  const handleOpenCamera = async () => {
    setShowAttachmentOptions(false);

    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
    });

    if (result.didCancel || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];

    setFieldValue('attachment', {
      uri: asset.uri,
      name: `photo_${moment().format('YYYY-MM-DD')}.jpg`,
      type: asset.type || 'image/jpeg',
    });
  };

  const TA_TYPES = [
    'TA - Auto',
    'TA - Cab',
    'TA - Bus',
    'TA - Rail',
    'TA - Bike (Petrol)',
    'TA - Local Travel',
  ];

  const isTA = TA_TYPES.includes(values.claim_type);
  const isRail = values.claim_type === 'TA - Rail';
  const isMobileBill = values.claim_type === 'Mobile Bill';
  const isIncidental = values.claim_type === 'Courier' || values.claim_type === 'Xerox';

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{ padding: 16 }}>

      <View style={styles.card}>
        <ReusableDropdownv2
          label="Expense Claim Type"
          field="claim_type"
          value={values.claim_type}
          data={EXPENSE_TYPES}
          error={touched.claim_type && errors.claim_type}
          onChange={(val: string) => onSelect('claim_type', val)}
          height={40}

        />

        {/* TA SPECIFIC FIELDS */}
        {isTA && (
          <View style={{ marginTop: 10 }}>
            <ReusableInput
              label="Distance (KM)"
              placeholder="0.00"
              value={values.ta_km}
              onChangeText={handleChange('ta_km')}
              onBlur={() => handleBlur('ta_km')}
              error={touched.ta_km && errors.ta_km}
              keyboardType="numeric"
            />
            {isRail && (
              <ReusableDropdownv2
                label="Rail Class"
                field="ta_rail_class"
                value={values.ta_rail_class}
                data={[
                  { label: 'Sleeper', value: 'Sleeper' },
                  { label: 'Non-AC Chair Car', value: 'Non-AC Chair Car' },
                  { label: 'III-AC', value: 'III-AC' },
                  { label: 'AC Chair Car', value: 'AC Chair Car' },
                ]}
                error={touched.ta_rail_class && errors.ta_rail_class}
                onChange={(val: string) => setFieldValue('ta_rail_class', val)}
                height={40}
              />
            )}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 15,
                paddingHorizontal: 5,
                backgroundColor: '#f9f9f9',
                padding: 10,
                borderRadius: 8,
              }}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Is Local Travel?</Text>
              <Switch
                value={values.is_local === 1}
                trackColor={{ false: '#767577', true: Colors.primary + '80' }}
                thumbColor={values.is_local === 1 ? Colors.primary : '#f4f3f4'}
                onValueChange={val => setFieldValue('is_local', val ? 1 : 0)}
              />
            </View>
          </View>
        )}

        {/* MOBILE BILL SPECIFIC FIELDS */}
        {isMobileBill && (
          <View style={{ marginTop: 10 }}>
            <ReusableInput
              label="Mobile Number"
              value={values.mobile_number}
              onChangeText={handleChange('mobile_number')}
              onBlur={() => handleBlur('mobile_number')}
              error={touched.mobile_number && errors.mobile_number}
              keyboardType="phone-pad"
            />
            <ReusableDatePicker
              label="Bill Month"
              value={values.telecom_bill_month}
              onChange={(val: string) => {
                const firstDay = moment(val).startOf('month').format('YYYY-MM-DD');
                setFieldValue('telecom_bill_month', firstDay);
              }}
              error={touched.telecom_bill_month && errors.telecom_bill_month}
            />
          </View>
        )}

        {/* INCIDENTAL (Courier / Xerox) SPECIFIC FIELDS */}
        {isIncidental && (
          <View style={{ marginTop: 10 }}>
            <ReusableDatePicker
              label="Bill Month"
              value={values.incidental_bill_month}
              onChange={(val: string) => {
                const firstDay = moment(val).startOf('month').format('YYYY-MM-DD');
                setFieldValue('incidental_bill_month', firstDay);
              }}
              error={touched.incidental_bill_month && errors.incidental_bill_month}
            />
          </View>
        )}
        <ReusableInput
          label="Description"
          placeholder="Enter description"
          value={values.description}
          onChangeText={handleChange('description')}
          onBlur={() => handleBlur('description')}
          error={touched.description && errors.description}
        />
        <ReusableInput
          label="Amount"
          placeholder="0.00"
          value={values.amount}
          onChangeText={handleChange('amount')}
          onBlur={() => handleBlur('amount')}
          error={touched.amount && errors.amount}
          keyboardType="numeric"
        />

      </View>

      {/* ----------------------- */}
      {/*  ATTACHMENT UPLOAD BTN */}
      {/* ----------------------- */}
      <View style={{ marginTop: 5 }}>
        <Text style={styles.label}>Attachment</Text>

        <TouchableOpacity
          onPress={() => setShowAttachmentOptions(true)}
          style={styles.uploadBox}>
          <Upload size={28} color={Colors.black} />
          <Text style={styles.uploadHint}>Upload images or documennts</Text>
        </TouchableOpacity>

        <Modal
          visible={showAttachmentOptions}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAttachmentOptions(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowAttachmentOptions(false)}
          />

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Upload Attachment</Text>
              <TouchableOpacity onPress={() => setShowAttachmentOptions(false)}>
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>Done</Text>
              </TouchableOpacity>
            </View>
            <Pressable
              style={styles.optionBtn}
              onPress={() => {
                setShowAttachmentOptions(false);
                handlePickDocument();
              }}>
              <View style={styles.optionIcon}>
                <Text style={{ fontSize: 20 }}>📁</Text>
              </View>
              <Text style={styles.optionText}>Select from Drive</Text>
            </Pressable>

            <Pressable style={styles.optionBtn} onPress={handleOpenCamera}>
              <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Text style={{ fontSize: 20 }}>📷</Text>
              </View>
              <Text style={styles.optionText}>Click Photo</Text>
            </Pressable>

            <Pressable
              style={[styles.optionBtn, { marginTop: 10 }]}
              onPress={() => setShowAttachmentOptions(false)}>
              <Text style={[styles.optionText, { color: 'red', marginLeft: 0, width: '100%', textAlign: 'center' }]}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>

        {/* IMAGE PREVIEW MODAL */}
        <Modal
          visible={showImagePreview}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImagePreview(false)}>
          <View style={styles.fullScreenOverlay}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowImagePreview(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            {values.attachment && isImage(values.attachment.type) && (
              <Image
                source={{ uri: values.attachment.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>

        {values.attachment && (
          <View style={[flexCol, { gap: 10, marginTop: 15 }]}>
            <Pressable
              style={styles.previewContainer}
              onPress={() => isImage(values.attachment.type) && setShowImagePreview(true)}
            >
              {isImage(values.attachment.type) ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: values.attachment.uri }}
                    style={styles.fullWidthImage}
                    resizeMode="cover"
                  />
                  <View style={styles.zoomIcon}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>View Full</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.fileCard}>
                  <View style={styles.fileIconContainer}>
                    <Text style={styles.fileIcon}>📄</Text>
                  </View>

                  <View style={styles.fileInfo}>
                    <Text numberOfLines={1} style={styles.fileName}>
                      {values.attachment.name}
                    </Text>
                    <Text style={styles.fileType}>Document</Text>
                  </View>
                </View>
              )}
            </Pressable>
            <TouchableOpacity
              onPress={() => setFieldValue('attachment', null)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeBtnText}>Remove Attachment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.ScrollView>
  );
};

export default AddExpenseItemV2;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
    fontFamily: Fonts.medium,
  },
  uploadBox: {
    marginTop: 5,
    height: 60,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadHint: {
    color: '#475569',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
  previewContainer: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  fullWidthImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f9f9f9',
  },
  zoomIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 15,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    width: '100%',
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 20,
    color: '#fff',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  fileType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  removeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  removeBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
