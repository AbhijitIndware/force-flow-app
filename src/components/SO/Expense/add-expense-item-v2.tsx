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
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import ReusableDatePicker from '../../ui-lib/reusable-date-picker';
import { useGetExpenseClaimTypeQuery } from '../../../features/tada/tadaApi';
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

const AddExpenseItemV2: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
}) => {
  const [claimType, setClaimType] = useState<DropdownOption[]>([]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const { data } = useGetExpenseClaimTypeQuery();
  console.log("🚀 ~ AddExpenseItemV2 ~ data:", data)

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

  useEffect(() => {
    const requiredTypes = ['DA', 'TA', 'Lodging', 'Telecom', 'Incidental'];
    if (data?.data) {
      const filtered = data.data
        .filter(item => requiredTypes.includes(item.name))
        .map(item => ({
          label: item.name,
          value: item.name,
        }));
      
      // If some required types are missing from API, we can still add them or rely on API
      setClaimType(filtered.length > 0 ? filtered : requiredTypes.map(t => ({ label: t, value: t })));
    } else {
      setClaimType(requiredTypes.map(t => ({ label: t, value: t })));
    }
  }, [data]);

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{ padding: 16 }}>
      <ReusableDatePicker
        label="Expenses Date"
        value={values.date}
        onChange={(val: string) => setFieldValue('date', val)}
        error={touched.date && errors.date}
      />
      <ReusableDropdownv2
        label="Expense Claim Type"
        field="claim_type"
        value={values.claim_type}
        data={claimType}
        error={touched.claim_type && errors.claim_type}
        onChange={(val: string) => onSelect('claim_type', val)}
      />
      <ReusableInput
        label="Description"
        value={values.description}
        onChangeText={handleChange('description')}
        onBlur={() => handleBlur('description')}
        error={touched.description && errors.description}
      />
      <ReusableInput
        label="Amount"
        value={values.amount}
        onChangeText={handleChange('amount')}
        onBlur={() => handleBlur('amount')}
        error={touched.amount && errors.amount}
        keyboardType="numeric"
      />

      {/* TA SPECIFIC FIELDS */}
      {values.claim_type === 'TA' && (
        <>
          <ReusableDropdownv2
            label="Travel Mode"
            field="ta_mode"
            value={values.ta_mode}
            data={[
              { label: 'Bus', value: 'Bus' },
              { label: 'Train', value: 'Train' },
              { label: 'Auto', value: 'Auto' },
              { label: 'Bike', value: 'Bike' },
              { label: 'Flight', value: 'Flight' },
            ]}
            error={touched.ta_mode && errors.ta_mode}
            onChange={(val: string) => setFieldValue('ta_mode', val)}
          />

          {values.ta_mode === 'Train' && (
            <ReusableDropdownv2
              label="Rail Class"
              field="ta_rail_class"
              value={values.ta_rail_class}
              data={[
                { label: 'AC 3 Tier', value: 'AC 3 Tier' },
                { label: 'Sleeper', value: 'Sleeper' },
                { label: 'AC Chair Car', value: 'AC Chair Car' },
                { label: 'Non-AC Chair Car', value: 'Non-AC Chair Car' },
              ]}
              error={touched.ta_rail_class && errors.ta_rail_class}
              onChange={(val: string) => setFieldValue('ta_rail_class', val)}
            />
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 15,
              paddingHorizontal: 5,
            }}>
            <Text style={styles.label}>Is Local Travel?</Text>
            <Switch
              value={values.is_local === 1}
              onValueChange={val => setFieldValue('is_local', val ? 1 : 0)}
            />
          </View>
        </>
      )}

      {/* TELECOM SPECIFIC FIELDS */}
      {values.claim_type === 'Telecom' && (
        <>
          <ReusableInput
            label="Mobile Number"
            value={values.mobile_number}
            onChangeText={handleChange('mobile_number')}
            onBlur={() => handleBlur('mobile_number')}
            error={touched.mobile_number && errors.mobile_number}
            keyboardType="phone-pad"
          />
          <ReusableDropdownv2
            label="Bill Month"
            field="telecom_bill_month"
            value={values.telecom_bill_month}
            data={[
              { label: 'January', value: 'January' },
              { label: 'February', value: 'February' },
              { label: 'March', value: 'March' },
              { label: 'April', value: 'April' },
              { label: 'May', value: 'May' },
              { label: 'June', value: 'June' },
              { label: 'July', value: 'July' },
              { label: 'August', value: 'August' },
              { label: 'September', value: 'September' },
              { label: 'October', value: 'October' },
              { label: 'November', value: 'November' },
              { label: 'December', value: 'December' },
            ]}
            error={touched.telecom_bill_month && errors.telecom_bill_month}
            onChange={(val: string) => setFieldValue('telecom_bill_month', val)}
          />
        </>
      )}

      {/* ----------------------- */}
      {/*  ATTACHMENT UPLOAD BTN */}
      {/* ----------------------- */}
      <View style={{ marginTop: 20 }}>
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
            <Pressable
              style={styles.optionBtn}
              onPress={() => {
                setShowAttachmentOptions(false);
                handlePickDocument();
              }}>
              <Text style={styles.optionText}>📁 Select from Drive</Text>
            </Pressable>

            <Pressable style={styles.optionBtn} onPress={handleOpenCamera}>
              <Text style={styles.optionText}>📷 Click Photo</Text>
            </Pressable>

            <Pressable
              style={[styles.optionBtn, { borderTopWidth: 1 }]}
              onPress={() => setShowAttachmentOptions(false)}>
              <Text style={[styles.optionText, { color: 'red' }]}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>

        {values.attachment && (
          <View style={[flexCol, { gap: 10, marginTop: 15 }]}>
            <View style={styles.previewContainer}>
              {isImage(values.attachment.type) ? (
                <Image
                  source={{ uri: values.attachment.uri }}
                  style={styles.fullWidthImage}
                  resizeMode="contain"
                />
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
            </View>
            <TouchableOpacity onPress={() => setFieldValue('attachment', null)}>
              <Text style={{ color: 'red', fontSize: 15, fontWeight: '700' }}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.ScrollView>
  );
};

export default AddExpenseItemV2;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  uploadBox: {
    marginTop: 5,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  uploadHint: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
  },
  fullWidthImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: '#f9f9f9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
    width: '100%',
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 22,
    color: '#fff',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  fileType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
