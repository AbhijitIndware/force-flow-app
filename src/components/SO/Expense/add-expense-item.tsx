// Add ExpenseItem.tsx
import React, {useEffect, useState} from 'react';
import {Animated, StyleSheet, TouchableOpacity} from 'react-native';
import ReusableInput from '../../ui-lib/reuseable-input';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import ReusableDatePicker from '../../ui-lib/reusable-date-picker';
import {View} from 'react-native';
import {Text} from 'react-native';
import {Colors} from '../../../utils/colors';
import {Upload} from 'lucide-react-native';
import {pick} from '@react-native-documents/picker';
import {useGetExpenseClaimTypeQuery} from '../../../features/tada/tadaApi';
import {FormikTouched} from 'formik';
import {Image} from 'react-native';

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

const AddExpenseItem: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
}) => {
  const [claimType, setClaimType] = useState<DropdownOption[]>([]);
  const {data} = useGetExpenseClaimTypeQuery();

  const isImage = (type?: string) => {
    return !!type && type.startsWith('image/');
  };

  const onSelect = (field: string, val: string) => {
    setFieldValue(field, val);
    if (field === 'zone') {
      setFieldValue('state', '');
      setFieldValue('city', '');
    } else if (field === 'state') {
      setFieldValue('city', '');
    }
  };

  const handlePickDocument = async () => {
    try {
      const doc = await pick({
        allowMultiSelection: false,
      });

      if (!doc || !doc[0]) return;

      const {uri, name, type} = doc[0];

      setFieldValue('attachment', {
        uri,
        name,
        type: type || 'application/octet-stream',
      });
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  useEffect(() => {
    if (data?.data) {
      setClaimType(
        data.data.map(claimType => ({
          label: claimType.name,
          value: claimType.name,
        })),
      );
    }
  }, [data]);

  return (
    <Animated.ScrollView
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}
      contentContainerStyle={{padding: 16}}>
      <ReusableDatePicker
        label="Expenses Date"
        value={values.date}
        onChange={(val: string) => setFieldValue('date', val)}
        error={touched.date && errors.date}
      />
      <ReusableDropdown
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
      {/* ----------------------- */}
      {/*  ATTACHMENT UPLOAD BTN */}
      {/* ----------------------- */}
      <View style={{marginTop: 20}}>
        <Text style={styles.label}>Attachment</Text>

        <TouchableOpacity
          onPress={handlePickDocument}
          style={{
            marginTop: 5,
            height: 100,
            backgroundColor: '#fff',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: Colors.borderLight,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}>
          <Upload size={28} color={Colors.black} />
          <Text style={{color: '#000', textAlign: 'center', fontWeight: '600'}}>
            Upload images or documennts
          </Text>
        </TouchableOpacity>

        {/* -------- PREVIEW SECTION -------- */}
        {values.attachment && (
          <View style={styles.previewContainer}>
            {isImage(values.attachment.type) ? (
              <Image
                source={{uri: values.attachment.uri}}
                style={styles.fullWidthImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.fileName}>📎 {values.attachment.name}</Text>
            )}
          </View>
        )}
      </View>
    </Animated.ScrollView>
  );
};

export default AddExpenseItem;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  uploadBtn: {
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
  },
  fileName: {
    marginTop: 8,
    fontSize: 13,
    color: '#555',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
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
    marginTop: 12,
    alignItems: 'center',
  },

  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fullWidthImage: {
    width: '100%',
    height: 200, // adjust if needed
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: '#f9f9f9',
  },
});
