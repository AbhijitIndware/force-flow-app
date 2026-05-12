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
import React, {useEffect, useState} from 'react';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react-native';
import {pick} from '@react-native-documents/picker';
import {launchCamera} from 'react-native-image-picker';
import {windowWidth} from '../../../utils/utils';
import RNFS from 'react-native-fs';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import {useLazyGetDailyStoreQuery} from '../../../features/dropdown/dropdown-api';
import {useAppSelector} from '../../../store/hook';
import ReusableInput from '../../ui-lib/reuseable-input';
import {useGetDailyPjpListQuery} from '../../../features/base/base-api';

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

  const [triggerStoreFetch, {data: storeData, isFetching: storesFetching}] =
    useLazyGetDailyStoreQuery();

  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );

  const {data: pjpListData, isFetching: pjpFetching} = useGetDailyPjpListQuery(
    {page: 1, page_size: 20, status: 'All', date: selectedDate},
    {skip: !selectedDate},
  );

  useEffect(() => {
    const pjpStoreDoc =
      pjpListData?.message?.data?.pjp_daily_stores?.[0]?.pjp_daily_store_id;
    if (pjpStoreDoc) {
      setFieldValue('pjp_store_id', pjpStoreDoc);
    }
    if (user?.email && selectedDate) {
      triggerStoreFetch({user: user.email, date: selectedDate});
    }
  }, [pjpListData, selectedDate, user?.email]);

  const storeDailyList = (storeData?.message?.stores ?? []).map(i => ({
    label: i.store_name,
    value: i.store,
  }));

  const isLoading = pjpFetching || storesFetching;
  const pjpResolved = !!values.pjp_store_id;
  // Show warning only after fetch is done and nothing resolved
  const pjpNotFound = !pjpFetching && !pjpResolved && !!selectedDate;

  const convertToBase64 = async (uri: string) => RNFS.readFile(uri, 'base64');

  const handlePickDocument = async () => {
    setShowOptions(false);
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
    const res = await launchCamera({mediaType: 'photo', quality: 0.8});
    if (!res.assets?.[0]) return;
    const asset = res.assets[0];
    const base64 = await convertToBase64(asset.uri!);
    setFieldValue('image', {mime: asset.type || 'image/jpeg', data: base64});
    setPreviewUri(asset.uri!);
  };

  const handleRemoveImage = () => {
    setPreviewUri(null);
    setFieldValue('image', undefined);
  };

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
                setFieldValue('date', formatted);
                setFieldValue('store', '');
                setFieldValue('pjp_store_id', '');
              }
            }}
          />
        )}

        {/* ── No PJP warning ── */}
        {pjpNotFound && (
          <View style={styles.noPjpBanner}>
            <AlertCircle size={13} color="#d97706" />
            <Text style={styles.noPjpText}>
              No PJP found for{' '}
              <Text style={styles.noPjpDateBold}>
                {moment(selectedDate).format('DD MMM YYYY')}
              </Text>
              . Select a different date.
            </Text>
          </View>
        )}

        {/* ── PJP resolved badge ── */}
        {pjpResolved && (
          <View style={styles.pjpBadge}>
            <View style={styles.pjpDot} />
            <Text style={styles.pjpBadgeText}>
              PJP ID: {values.pjp_store_id}
            </Text>
          </View>
        )}
      </View>

      {/* ── STORE + PAYMENT TYPE ── */}
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
                setFieldValue(
                  'pjp_store_id',
                  storeData.message.pjp_daily_store_doc,
                );
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
              {label: 'Cash', value: 'Cash'},
              {label: 'Cheque', value: 'Cheque'},
              {label: 'Online', value: 'Online'},
            ]}
            onChange={(val: string) => setFieldValue('payment_type', val)}
            error={touched.payment_type && errors.payment_type}
          />
        </View>
      </View>

      {/* ── COLLECTION + PRICE DIFF + DAMAGE ── */}
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
            error={
              touched.price_difference_amount && errors.price_difference_amount
            }
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

      {previewUri ? (
        /* ── Image preview card ── */
        <View style={styles.previewCard}>
          <Image
            source={{uri: previewUri}}
            style={styles.previewImage}
            resizeMode="cover"
          />
          {/* Re-upload overlay button */}
          <TouchableOpacity
            style={styles.reUploadBtn}
            onPress={() => setShowOptions(true)}
            activeOpacity={0.8}>
            <Upload size={13} color="#fff" />
            <Text style={styles.reUploadText}>Change</Text>
          </TouchableOpacity>
          {/* Remove button */}
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={handleRemoveImage}
            activeOpacity={0.8}>
            <X size={13} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Empty upload box ── */
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => setShowOptions(true)}
          activeOpacity={0.75}>
          <View style={styles.uploadIconCircle}>
            <Upload size={18} color={Colors.darkButton} />
          </View>
          <Text style={styles.uploadHint}>Upload Image / Document</Text>
          <Text style={styles.uploadSub}>
            Tap to select from drive or camera
          </Text>
        </TouchableOpacity>
      )}

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
    </ScrollView>
  );
};

export default AddVisibilityComponent;

const styles = StyleSheet.create({
  scroll: {flex: 1},
  container: {padding: 16, paddingBottom: 40},
  inputWrapper: {marginBottom: 10},

  inputLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    marginBottom: 4,
    color: Colors.darkButton,
  },

  row: {flexDirection: 'row', gap: 8, marginBottom: 10},
  halfWrapper: {flex: 1},
  thirdWrapper: {flex: 1},

  // Date row
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

  // No PJP warning
  noPjpBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 6,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  noPjpText: {
    flex: 1,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#92400e',
    lineHeight: 16,
  },
  noPjpDateBold: {
    fontFamily: Fonts.semiBold,
    color: '#92400e',
  },

  // PJP badge
  pjpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pjpDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
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

  // Empty upload box
  uploadBox: {
    marginTop: 4,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fafafa',
  },
  uploadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  uploadHint: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
  },
  uploadSub: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
  },

  // Image preview card
  previewCard: {
    marginTop: 4,
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    height: 180,
    backgroundColor: '#f1f5f9',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  // "Change" button — bottom-left overlay
  reUploadBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reUploadText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#fff',
  },
  // "X" remove button — top-right
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  bottomSheet: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  optionBtn: {width: '100%', paddingVertical: 14, alignItems: 'center'},
  optionText: {fontSize: 14, fontWeight: '600'},
  errorText: {color: 'red', fontSize: 11, marginTop: 4},
});
