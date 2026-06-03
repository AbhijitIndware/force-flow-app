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
  Plus,
} from 'lucide-react-native';
import {pick} from '@react-native-documents/picker';
import {launchCamera} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import {useLazyGetDailyStoreQuery} from '../../../features/dropdown/dropdown-api';
import {useAppSelector} from '../../../store/hook';
import {useGetDailyPjpListQuery} from '../../../features/base/base-api';
import {useLazyGetVCDistributorDetailsQuery} from '../../../features/tada/tadaApiv2';

const MAX_IMAGES = 3;

interface ImageItem {
  mime: string;
  data: string;
}

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
  setFieldValue,
}: Props) => {
  // ── multi-image state ──────────────────────────────────────────────
  const [previewUris, setPreviewUris] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false); // Add to state at the top of the component:
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // ──────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format('YYYY-MM-DD'),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );

  const [triggerStoreFetch, {data: storeData, isFetching: storesFetching}] =
    useLazyGetDailyStoreQuery();
  const [
    triggerStoreDetails,
    {data: storeDetails, isFetching: storeDetailsFetching},
  ] = useLazyGetVCDistributorDetailsQuery(); // ← your actual hook

  const {data: pjpListData, isFetching: pjpFetching} = useGetDailyPjpListQuery(
    {page: 1, page_size: 20, status: 'All', date: selectedDate},
    {skip: !selectedDate},
  );

  useEffect(() => {
    const pjpStoreDoc =
      pjpListData?.message?.data?.pjp_daily_stores?.[0]?.pjp_daily_store_id;
    if (pjpStoreDoc) {
      setFieldValue('pjp_store_id', pjpStoreDoc);
    } else {
      setFieldValue('pjp_store_id', '');
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
  const pjpNotFound = !pjpFetching && !pjpResolved && !!selectedDate;

  const convertToBase64 = async (uri: string) => RNFS.readFile(uri, 'base64');

  // ── helpers that write to `images` array ──────────────────────────
  const appendImage = (uri: string, item: ImageItem) => {
    const newUris = [...previewUris, uri];
    const newImages: ImageItem[] = [...(values.images ?? []), item];
    setPreviewUris(newUris);
    setFieldValue('images', newImages);
  };

  const removeImage = (index: number) => {
    const newUris = previewUris.filter((_, i) => i !== index);
    const newImages = (values.images ?? []).filter(
      (_: ImageItem, i: number) => i !== index,
    );
    setPreviewUris(newUris);
    setFieldValue('images', newImages);
  };
  // ──────────────────────────────────────────────────────────────────

  const canAddMore = previewUris.length < MAX_IMAGES;

  const handlePickDocument = async () => {
    setShowOptions(false);
    if (!canAddMore) return;
    try {
      const docs = await pick({allowMultiSelection: true});
      if (!docs?.length) return;

      // Only take as many as we still have slots for
      const remaining = MAX_IMAGES - previewUris.length;
      const selected = docs.slice(0, remaining);

      const newUris: string[] = [];
      const newImages: ImageItem[] = [];

      for (const doc of selected) {
        const base64 = await convertToBase64(doc.uri);
        newUris.push(doc.uri);
        newImages.push({
          mime: doc.type || 'application/octet-stream',
          data: base64,
        });
      }

      const updatedUris = [...previewUris, ...newUris];
      const updatedImages: ImageItem[] = [
        ...(values.images ?? []),
        ...newImages,
      ];
      setPreviewUris(updatedUris);
      setFieldValue('images', updatedImages);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleOpenCamera = async () => {
    setShowOptions(false);
    if (!canAddMore) return;
    const res = await launchCamera({mediaType: 'photo', quality: 0.8});
    if (!res.assets?.[0]) return;
    const asset = res.assets[0];
    const base64 = await convertToBase64(asset.uri!);
    appendImage(asset.uri!, {mime: asset.type || 'image/jpeg', data: base64});
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {/* ── DATE + STORE ── */}
      <View style={styles.inputWrapper}>
        <View style={styles.row}>
          <View style={styles.halfWrapper}>
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
          </View>

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
                triggerStoreDetails({store: val});
              }}
              error={touched.store && errors.store}
              disabled={storesFetching || storeDailyList.length === 0}
              marginBottom={0}
              height={38}
              textSize={12}
            />
            {storesFetching && <Text style={styles.hintText}>Loading…</Text>}
            {!storesFetching && storeDailyList.length === 0 && selectedDate && (
              <Text style={styles.hintText}>No stores found.</Text>
            )}
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={moment(selectedDate).toDate()}
            mode="date"
            display="default"
            onChange={(_event, date) => {
              setFieldValue('store', '');
              setFieldValue('pjp_store_id', '');
              setShowDatePicker(false);
              if (date) {
                const formatted = moment(date).format('YYYY-MM-DD');
                setSelectedDate(formatted);
                setFieldValue('date', formatted);
              }
            }}
          />
        )}

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

        {pjpResolved && (
          <View style={styles.pjpBadge}>
            <View style={styles.pjpDot} />
            <Text style={styles.pjpBadgeText}>
              PJP ID: {values.pjp_store_id}
            </Text>
          </View>
        )}
      </View>

      {/* ── DISTRIBUTOR + COLLECTION (auto-filled) ── */}
      <View style={[styles.row, {marginTop: 0}]}>
        <View style={styles.halfWrapper}>
          <Text style={styles.inputLabel}>Distributor</Text>
          <View style={styles.readOnlyField}>
            {storeDetailsFetching ? (
              <ActivityIndicator size="small" color={Colors.darkButton} />
            ) : (
              <Text style={styles.readOnlyText} numberOfLines={1}>
                {storeDetails?.message?.data?.distributor_name ?? '—'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.halfWrapper}>
          <Text style={styles.inputLabel}>Collection Amount</Text>
          <View style={styles.readOnlyField}>
            {storeDetailsFetching ? (
              <ActivityIndicator size="small" color={Colors.darkButton} />
            ) : (
              <Text style={styles.readOnlyText}>
                {storeDetails?.message?.data?.collection_amount ?? '—'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ── IMAGE SECTION ── */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>
          Images{' '}
          <Text style={styles.imageLimitHint}>
            ({previewUris.length}/{MAX_IMAGES})
          </Text>
        </Text>

        <View style={styles.imageGrid}>
          {/* Filled thumbnails */}
          {previewUris.map((uri, index) => (
            <TouchableOpacity
              key={index}
              style={styles.thumbCard}
              onPress={() => setPreviewIndex(index)}
              activeOpacity={0.85}>
              <Image
                source={{uri}}
                style={styles.thumbImage}
                resizeMode="cover"
              />
              {/* Remove button */}
              <TouchableOpacity
                style={styles.thumbRemoveBtn}
                onPress={() => removeImage(index)}
                activeOpacity={0.8}>
                <X size={11} color="#fff" />
              </TouchableOpacity>
              {/* Index badge */}
              <View style={styles.thumbBadge}>
                <Text style={styles.thumbBadgeText}>{index + 1}</Text>
              </View>
              {/* View full overlay */}
              <View style={styles.thumbViewHint}>
                <Text style={styles.thumbViewHintText}>View</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* "Add" tile */}
          {canAddMore && (
            <TouchableOpacity
              style={styles.addTile}
              onPress={() => setShowOptions(true)}
              activeOpacity={0.75}>
              <View style={styles.addIconCircle}>
                <Plus size={18} color={Colors.darkButton} />
              </View>
              <Text style={styles.addTileHint}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {previewUris.length === 0 && (
          <Text style={styles.uploadSub}>
            Tap "Add" to upload from drive or camera
          </Text>
        )}
      </View>

      {touched.images && errors.images && (
        <Text style={styles.errorText}>
          {typeof errors.images === 'string' ? errors.images : 'Image required'}
        </Text>
      )}

      {/* ── IMAGE PREVIEW MODAL ── */}
      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewIndex(null)}>
        <View style={styles.fullScreenOverlay}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.previewCloseBtn}
            onPress={() => setPreviewIndex(null)}>
            <X size={18} color="#fff" />
          </TouchableOpacity>

          {/* Counter badge — "1 / 3" */}
          {previewIndex !== null && (
            <View style={styles.previewCounter}>
              <Text style={styles.previewCounterText}>
                {previewIndex + 1} / {previewUris.length}
              </Text>
            </View>
          )}

          {/* Full image */}
          {previewIndex !== null && (
            <Image
              source={{uri: previewUris[previewIndex]}}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}

          {/* Prev / Next arrows */}
          <View style={styles.previewNavRow}>
            <TouchableOpacity
              style={[
                styles.previewNavBtn,
                previewIndex === 0 && styles.previewNavBtnDisabled,
              ]}
              disabled={previewIndex === 0}
              onPress={() =>
                setPreviewIndex(prev => (prev !== null ? prev - 1 : 0))
              }>
              <Text style={styles.previewNavText}>‹</Text>
            </TouchableOpacity>

            {/* Dot indicators */}
            <View style={styles.previewDots}>
              {previewUris.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.previewDot,
                    i === previewIndex && styles.previewDotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.previewNavBtn,
                previewIndex === previewUris.length - 1 &&
                  styles.previewNavBtnDisabled,
              ]}
              disabled={previewIndex === previewUris.length - 1}
              onPress={() =>
                setPreviewIndex(prev => (prev !== null ? prev + 1 : 0))
              }>
              <Text style={styles.previewNavText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── BOTTOM SHEET ── */}
      <Modal visible={showOptions} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
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

const THUMB_SIZE = 90;

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
  imageLimitHint: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
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

  // ── Image grid ──────────────────────────────────────────────────
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },

  // Thumbnail card
  thumbCard: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  thumbBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: Fonts.medium,
  },

  // "Add more" tile
  addTile: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fafafa',
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTileHint: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
  },

  uploadSub: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    marginTop: 6,
  },
  // ────────────────────────────────────────────────────────────────

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

  thumbViewHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  thumbViewHintText: {
    fontSize: 9,
    color: '#fff',
    fontFamily: Fonts.medium,
  },

  // Full-screen overlay
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '75%',
  },

  // Close button
  previewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // "1 / 3" counter
  previewCounter: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  previewCounterText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.medium,
  },

  // Prev / Next nav row
  previewNavRow: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  previewNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewNavBtnDisabled: {
    opacity: 0.3,
  },
  previewNavText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
  },

  // Dot indicators
  previewDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  previewDotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readOnlyField: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.borderLight,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
});
