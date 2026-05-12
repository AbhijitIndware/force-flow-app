import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '../../../utils/colors';
import { Size } from '../../../utils/fontSize';
import { Fonts } from '../../../constants';
import { Upload, Calendar, CheckCircle } from 'lucide-react-native';
import { pick } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import { windowWidth } from '../../../utils/utils';
import RNFS from 'react-native-fs';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import { useLazyGetDailyStoreQuery } from '../../../features/dropdown/dropdown-api';
import { useAppSelector } from '../../../store/hook';
import ReusableInput from '../../ui-lib/reuseable-input';
import { useGetDailyPjpListQuery } from '../../../features/base/base-api';

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
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format('YYYY-MM-DD'),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [triggerStoreFetch, { data: storeData, isFetching: storesFetching }] =
    useLazyGetDailyStoreQuery();

  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );

  // Step 1: fetch PJP list for the selected date to get pjp_store_id
  const { data: pjpListData, isFetching: pjpFetching } = useGetDailyPjpListQuery(
    {
      page: 1,
      page_size: 20,
      status: 'All',
      date: selectedDate,
    },
    { skip: !selectedDate },
  );

  // Step 2: once PJP list arrives, extract the pjp_store_id and fetch stores
  useEffect(() => {
    const pjpStoreDoc = pjpListData?.message?.data?.pjp_daily_stores?.[0]?.pjp_daily_store_id; // adjust to your API shape
    if (pjpStoreDoc) {
      setFieldValue('pjp_store_id', pjpStoreDoc);
    }

    if (user?.email && selectedDate) {
      triggerStoreFetch({ user: user.email, date: selectedDate });
    }
  }, [pjpListData, selectedDate, user?.email]);

  const storeDailyList = (storeData?.message?.stores ?? []).map(i => ({
    label: i.store_name,
    value: i.store,
  }));

  const convertToBase64 = async (uri: string) => {
    return RNFS.readFile(uri, 'base64');
  };

  const handlePickDocument = async () => {
    setShowOptions(false);
    try {
      const doc = await pick({ allowMultiSelection: false });
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
    const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (!res.assets?.[0]) return;
    const asset = res.assets[0];
    const base64 = await convertToBase64(asset.uri!);
    setFieldValue('image', { mime: asset.type || 'image/jpeg', data: base64 });
    setPreviewUri(asset.uri!);
  };

  const isLoading = pjpFetching || storesFetching;
  const pjpResolved = !!values.pjp_store_id;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* ── DATE PICKER ── */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Date</Text>
        <TouchableOpacity
          style={styles.dateRow}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.75}>
          <Calendar size={14} color={Colors.darkButton} />
          <Text style={styles.dateText}>
            {moment(selectedDate).format('DD MMM YYYY')}
          </Text>
          {isLoading && (
            <ActivityIndicator size="small" color={Colors.darkButton} />
          )}
          {pjpResolved && !isLoading && (
            <CheckCircle size={14} color="#22c55e" />
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={moment(selectedDate).toDate()}
            mode="date"
            display="default"
            onChange={(_event, date) => {
              setShowDatePicker(false);
              if (date) {
                const formatted = moment(date).format('YYYY-MM-DD');
                setSelectedDate(formatted);
                setFieldValue('store', '');
                setFieldValue('pjp_store_id', '');
              }
            }}
          />
        )}
      </View>

      {/* PJP ID badge */}
      {pjpResolved && (
        <View style={styles.pjpBadge}>
          <Text style={styles.pjpBadgeText}>PJP ID: {values.pjp_store_id}</Text>
        </View>
      )}

      {/* ── STORE + PAYMENT TYPE (same row) ── */}
      <View style={styles.row}>
        <View style={styles.halfWrapper}>
          <ReusableDropdown
            label="Store"
            field="value"
            value={values.store}
            data={storeDailyList}
            onChange={(val: string) => {
              setFieldValue('store', val);
              if (!pjpResolved && storeData?.message?.pjp_daily_store_doc) {
                setFieldValue('pjp_store_id', storeData.message.pjp_daily_store_doc);
              }
            }}
            error={touched.store && errors.store}
            disabled={storesFetching || storeDailyList.length === 0}
          />
          {storesFetching && <Text style={styles.hintText}>Loading…</Text>}
          {!storesFetching && storeDailyList.length === 0 && selectedDate && (
            <Text style={styles.hintText}>No stores found.</Text>
          )}
        </View>

        <View style={styles.halfWrapper}>
          <ReusableDropdown
            label="Payment Type"
            field="value"
            value={values.payment_type}
            data={[
              { label: 'Cash', value: 'Cash' },
              { label: 'Cheque', value: 'Cheque' },
              { label: 'Online', value: 'Online' },
            ]}
            onChange={(val: string) => setFieldValue('payment_type', val)}
            error={touched.payment_type && errors.payment_type}
          />
        </View>
      </View>

      {/* ── COLLECTION + PRICE DIFFERENCE + DAMAGE (same row) ── */}
      <View style={styles.row}>
        <View style={styles.thirdWrapper}>
          <ReusableInput
            label="Collection"
            value={values.collection_amount}
            onChangeText={handleChange('collection_amount')}
            onBlur={() => handleBlur('collection_amount')}
            error={touched.collection_amount && errors.collection_amount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.thirdWrapper}>
          <ReusableInput
            label="Price Diff."
            value={values.price_difference_amount}
            onChangeText={handleChange('price_difference_amount')}
            onBlur={() => handleBlur('price_difference_amount')}
            error={touched.price_difference_amount && errors.price_difference_amount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.thirdWrapper}>
          <ReusableInput
            label="Damage"
            value={values.damage_claim}
            onChangeText={handleChange('damage_claim')}
            onBlur={() => handleBlur('damage_claim')}
            error={touched.damage_claim && errors.damage_claim}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* ── ATTACHMENT ── */}
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={() => setShowOptions(true)}>
        <Upload size={20} color={Colors.black} />
        <Text style={styles.uploadHint}>Upload Image / Document</Text>
      </TouchableOpacity>

      {touched.image?.data && errors.image?.data && (
        <Text style={styles.errorText}>{errors.image.data}</Text>
      )}

      {/* ── BOTTOM SHEET ── */}
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

      {/* ── IMAGE PREVIEW ── */}
      {previewUri && (
        <Image
          source={{ uri: previewUri }}
          style={styles.previewImage}
          resizeMode="contain"
        />
      )}
    </ScrollView>
  );
};

export default AddVisibilityComponent;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  inputWrapper: { marginBottom: 10 },

  inputLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    marginBottom: 4,
    color: Colors.darkButton,
  },

  // Two-column / three-column row
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  halfWrapper: { flex: 1 },
  thirdWrapper: { flex: 1 },

  // Compact date row
  dateRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    gap: 6,
  },
  dateText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },

  // PJP badge
  pjpBadge: {
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pjpBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#166534',
  },

  hintText: {
    fontSize: 11,
    color: Colors.darkButton,
    marginTop: 3,
    marginLeft: 2,
    opacity: 0.6,
  },

  uploadBox: {
    marginTop: 6,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fafafa',
  },
  uploadHint: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.black,
  },

  previewImage: {
    width: windowWidth * 0.65,
    height: 160,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  bottomSheet: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  optionBtn: { paddingVertical: 12, alignItems: 'center' },
  optionText: { fontSize: 14, fontWeight: '600' },
  errorText: { color: 'red', fontSize: 11, marginTop: 4 },
});