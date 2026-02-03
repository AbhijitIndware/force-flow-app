import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../../../utils/colors';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {Upload} from 'lucide-react-native';
import {pick} from '@react-native-documents/picker';
import {launchCamera} from 'react-native-image-picker';
import {windowWidth} from '../../../utils/utils';
import RNFS from 'react-native-fs';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import {useLazyGetDailyStoreQuery} from '../../../features/dropdown/dropdown-api';
import {useAppSelector} from '../../../store/hook';
import ReusableInput from '../../ui-lib/reuseable-input';

interface Props {
  values: Record<any, any>;
  errors: Record<any, any>;
  touched: Record<any, any>;
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
}

const AddVisibilityComponent = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}: Props) => {
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const [triggerStoreFetch, {data: storeData}] = useLazyGetDailyStoreQuery();

  const pjpInitializedData = useAppSelector(
    state => state?.persistedReducer?.pjpSlice?.pjpInitializedData,
  );

  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );

  const storeDailyList = (storeData?.message?.stores ?? []).map(i => ({
    label: i.store_name,
    value: i.store,
  }));

  useEffect(() => {
    if (user?.email && pjpInitializedData?.message?.data?.date) {
      triggerStoreFetch({
        user: user.email,
        date: pjpInitializedData.message.data.date,
      });
    }
  }, [user?.email, pjpInitializedData?.message?.data?.date]);

  const convertToBase64 = async (uri: string) => {
    return RNFS.readFile(uri, 'base64');
  };

  const handlePickDocument = async () => {
    try {
      const doc = await pick({allowMultiSelection: false});
      if (!doc?.[0]) return;

      const base64 = await convertToBase64(doc[0].uri);

      setFieldValue('image', {
        mime: doc[0].type || 'application/octet-stream',
        data: base64,
      });

      setPreviewUri(doc[0].uri);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleOpenCamera = async () => {
    setShowOptions(false);

    const res = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (!res.assets?.[0]) return;

    const asset = res.assets[0];
    const base64 = await convertToBase64(asset.uri!);

    setFieldValue('image', {
      mime: asset.type || 'image/jpeg',
      data: base64,
    });

    setPreviewUri(asset.uri!);
  };

  return (
    <View style={styles.container}>
      {/* STORE */}
      <View style={styles.inputWrapper}>
        <ReusableDropdown
          label="Store"
          field="value"
          value={values.store}
          data={storeDailyList}
          onChange={(val: string) => setFieldValue('store', val)}
          error={touched.store && errors.store}
        />
      </View>

      {/* PAYMENT TYPE */}
      <View style={styles.inputWrapper}>
        <ReusableDropdown
          label="Payment Type"
          field="value"
          value={values.payment_type}
          data={[
            {label: 'Cash', value: 'Cash'},
            {label: 'Upi', value: 'Upi'},
            {label: 'Bank', value: 'Bank'},
          ]}
          onChange={(val: string) => setFieldValue('payment_type', val)}
          error={touched.payment_type && errors.payment_type}
        />
      </View>

      {/* COLLECTION */}
      <View style={styles.inputWrapper}>
        <ReusableInput
          label="Collection Amount"
          value={values.collection_amount}
          onChangeText={handleChange('collection_amount')}
          onBlur={() => handleBlur('collection_amount')}
          error={touched.collection_amount && errors.collection_amount}
        />
      </View>

      {/* PRICE DIFFERENCE */}
      <View style={styles.inputWrapper}>
        <ReusableInput
          label="Price Difference Amount"
          value={values.price_difference_amount}
          onChangeText={handleChange('price_difference_amount')}
          onBlur={() => handleBlur('price_difference_amount')}
          error={
            touched.price_difference_amount && errors.price_difference_amount
          }
        />
      </View>

      {/* DAMAGE CLAIM */}
      <View style={styles.inputWrapper}>
        <ReusableInput
          label="Damage Amount"
          value={values.damage_amount}
          onChangeText={handleChange('damage_amount')}
          onBlur={() => handleBlur('damage_amount')}
          error={touched.damage_amount && errors.damage_amount}
        />
      </View>

      {/* ATTACHMENT */}
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={() => setShowOptions(true)}>
        <Upload size={28} color={Colors.black} />
        <Text style={styles.uploadHint}>Upload Image / Document</Text>
      </TouchableOpacity>

      {/* IMAGE ERROR */}
      {touched.image?.data && errors.image?.data && (
        <Text style={styles.errorText}>{errors.image.data}</Text>
      )}

      {/* OPTIONS */}
      <Modal visible={showOptions} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        />
        <View style={styles.bottomSheet}>
          <Pressable style={styles.optionBtn} onPress={handlePickDocument}>
            <Text style={styles.optionText}>📁 Select from Drive</Text>
          </Pressable>
          <Pressable style={styles.optionBtn} onPress={handleOpenCamera}>
            <Text style={styles.optionText}>📷 Click Photo</Text>
          </Pressable>
        </View>
      </Modal>

      {/* PREVIEW */}
      {previewUri && (
        <Image
          source={{uri: previewUri}}
          style={styles.previewImage}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

export default AddVisibilityComponent;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  inputWrapper: {marginBottom: 14},
  inputLabel: {
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
    marginBottom: 6,
    color: Colors.darkButton,
  },
  readonlyInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#F7F7F7',
  },
  readonlyText: {
    fontSize: Size.sm,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  uploadBox: {
    marginTop: 20,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  uploadHint: {fontWeight: '600'},
  previewImage: {
    width: windowWidth * 0.7,
    height: 200,
    marginTop: 12,
    alignSelf: 'center',
  },
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  bottomSheet: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionBtn: {paddingVertical: 14, alignItems: 'center'},
  optionText: {fontSize: 16, fontWeight: '600'},
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 6,
  },
});
