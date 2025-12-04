// Add ExpenseItem.tsx
import React from 'react';
import {Animated, StyleSheet, TouchableOpacity} from 'react-native';
import ReusableInput from '../../ui-lib/reuseable-input';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import ReusableDatePicker from '../../ui-lib/reusable-date-picker';
import {View} from 'react-native';
import {Text} from 'react-native';
import {Colors} from '../../../utils/colors';
import {Upload} from 'lucide-react-native';
import {pick} from '@react-native-documents/picker';

interface Props {
  values: Record<string, string | any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
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

const AddExpenseItem: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  scrollY,
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
  // const handlePickAttachment = () => {
  //   Alert.alert(
  //     'Select Attachment',
  //     'Choose a file type',
  //     [
  //       {text: 'Camera', onPress: handleOpenCamera},
  //       {text: 'Gallery', onPress: handleOpenGallery},
  //       {text: 'Document', onPress: handlePickDocument},
  //       {text: 'Cancel', style: 'cancel'},
  //     ],
  //     {cancelable: true},
  //   );
  // };

  // const handleOpenCamera = async () => {
  //   launchCamera(
  //     {
  //       mediaType: 'photo',
  //       cameraType: 'back',
  //       quality: 0.8,
  //       includeBase64: true,
  //     },
  //     response => {
  //       if (response.didCancel) return;
  //       if (response.errorCode) {
  //         console.warn('Camera error:', response.errorMessage);
  //         return;
  //       }

  //       if (response.assets && response.assets.length > 0) {
  //         const img = response.assets[0];
  //         if (img.base64 && img.type) {
  //           setFieldValue('attachment', {
  //             data: img.base64,
  //             mime: img.type,
  //             name: img.fileName || 'image.jpg',
  //           });
  //         }
  //       }
  //     },
  //   );
  // };

  // const handleOpenGallery = async () => {
  //   launchImageLibrary(
  //     {
  //       mediaType: 'photo',
  //       includeBase64: true,
  //       quality: 0.8,
  //     },
  //     response => {
  //       if (response.didCancel) return;
  //       if (response.errorCode) {
  //         console.warn('Gallery error:', response.errorMessage);
  //         return;
  //       }

  //       if (response.assets && response.assets.length > 0) {
  //         const img = response.assets[0];
  //         if (img.base64 && img.type) {
  //           setFieldValue('attachment', {
  //             data: img.base64,
  //             mime: img.type,
  //             name: img.fileName,
  //           });
  //         }
  //       }
  //     },
  //   );
  // };

  const handlePickDocument = async () => {
    try {
      const doc = await pick({
        allowMultiSelection: false,
      });

      if (!doc || !doc[0]) return;

      const {uri, name, type} = doc[0];

      // Convert to base64
      const response = await fetch(uri);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1];

        setFieldValue('attachment', {
          data: base64,
          mime: type || 'application/octet-stream',
          name,
          uri,
        });
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

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
        field="distributor_group"
        value={values.distributor_group}
        data={[]}
        error={touched.distributor_group && errors.distributor_group}
        onChange={(val: string) => onSelect('distributor_group', val)}
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
      <ReusableInput
        label="Sanctioned Amount"
        value={values.amount}
        onChangeText={handleChange('sanc_amount')}
        onBlur={() => handleBlur('sanc_amount')}
        error={touched.sanc_amount && errors.sanc_amount}
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
});
