import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {CalendarPlus} from 'lucide-react-native';

import PageHeader from '../../../components/ui/PageHeader';
import ReusableDropdownv2 from '../../../components/ui-lib/resusable-dropdown-v2';
import ReusableDatePicker from '../../../components/ui-lib/reusable-date-picker';
import {flexCol, boxShadow} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {SoAppStackParamList} from '../../../types/Navigation';
import {ICreateShiftAssignment} from '../../../types/baseType';
import {
  useCreateShiftAssignmentMutation,
  useGetAssignmentOptionsQuery,
  useGetMyPromotersQuery,
} from '../../../features/base/promoter-base-api';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'CreatePromoterShiftScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

interface FloaterStore {
  id: string;
  name: string;
}

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PAGE_SIZE = 20;

const CreatePromoterShiftScreen = ({navigation}: Props) => {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [employee, setEmployee] = useState('');
  const [store, setStore] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSecondary, setIsSecondary] = useState(false);
  const [floater, setFloater] = useState(false);
  const [floaterStores, setFloaterStores] = useState<FloaterStore[]>([]);

  const [createShiftAssignment, {isLoading: isSubmitting}] =
    useCreateShiftAssignmentMutation();

  // ── Promoters (supervisor's team) ──────────────────────────────────────────
  const {data: promotersData, isLoading: promotersLoading} =
    useGetMyPromotersQuery();

  const promoterOptions = useMemo(() => {
    return (promotersData?.message?.data?.promoters ?? []).map(p => ({
      label: `${p.employee_name} (${p.employee})`,
      value: p.employee,
    }));
  }, [promotersData]);

  // ── Store & shift type options (server-side search, no preload) ─────────────
  const [storeSearch, setStoreSearch] = useState('');
  const [storePage, setStorePage] = useState(1);
  const debouncedStoreSearch = useDebounce(storeSearch, 300);

  const {data: optionsData, isFetching: optionsFetching} =
    useGetAssignmentOptionsQuery({
      search: debouncedStoreSearch || undefined,
      page: storePage,
      page_size: PAGE_SIZE,
    });

  const [storeList, setStoreList] = useState<{label: string; value: string}[]>(
    [],
  );

  useEffect(() => {
    const stores = optionsData?.message?.data?.stores ?? [];
    const newOptions = stores.map(s => ({
      label: `${s.store_name} (${s.store_id})`,
      value: s.store_id,
    }));
    setStoreList(prev => {
      if (storePage === 1) {
        return newOptions;
      }
      const merged = [...prev, ...newOptions];
      const seen = new Set<string>();
      return merged.filter(o => {
        if (seen.has(o.value)) {
          return false;
        }
        seen.add(o.value);
        return true;
      });
    });
  }, [optionsData, storePage]);

  const shiftTypeOptions = useMemo(() => {
    return (optionsData?.message?.data?.shift_types ?? []).map(t => ({
      label: t.name,
      value: t.name,
    }));
  }, [optionsData]);

  const handleStoreSearch = useCallback((text: string) => {
    setStoreSearch(text);
    setStorePage(1);
  }, []);

  const handleLoadMoreStores = useCallback(() => {
    const pagination = optionsData?.message?.data?.pagination;
    if (!pagination || optionsFetching) {
      return;
    }
    if (storePage >= pagination.total_pages) {
      return;
    }
    setStorePage(p => p + 1);
  }, [optionsData, optionsFetching, storePage]);

  // ── Floater stores (server-side searchable multi select) ───────────────────
  const [floaterModalVisible, setFloaterModalVisible] = useState(false);
  const [floaterSearch, setFloaterSearch] = useState('');
  const [floaterPage, setFloaterPage] = useState(1);
  const debouncedFloaterSearch = useDebounce(floaterSearch, 300);

  const {data: floaterOptionsData, isFetching: floaterOptionsFetching} =
    useGetAssignmentOptionsQuery(
      {
        search: debouncedFloaterSearch || undefined,
        page: floaterPage,
        page_size: PAGE_SIZE,
      },
      {skip: !floater},
    );

  const [floaterList, setFloaterList] = useState<
    {label: string; value: string}[]
  >([]);

  useEffect(() => {
    const stores = floaterOptionsData?.message?.data?.stores ?? [];
    const newOptions = stores.map(s => ({
      label: `${s.store_name} (${s.store_id})`,
      value: s.store_id,
    }));
    setFloaterList(prev => {
      if (floaterPage === 1) {
        return newOptions;
      }
      const merged = [...prev, ...newOptions];
      const seen = new Set<string>();
      return merged.filter(o => {
        if (seen.has(o.value)) {
          return false;
        }
        seen.add(o.value);
        return true;
      });
    });
  }, [floaterOptionsData, floaterPage]);

  const handleFloaterSearch = useCallback((text: string) => {
    setFloaterSearch(text);
    setFloaterPage(1);
  }, []);

  const handleLoadMoreFloaterStores = useCallback(() => {
    const pagination = floaterOptionsData?.message?.data?.pagination;
    if (!pagination || floaterOptionsFetching) {
      return;
    }
    if (floaterPage >= pagination.total_pages) {
      return;
    }
    setFloaterPage(p => p + 1);
  }, [floaterOptionsData, floaterOptionsFetching, floaterPage]);

  const toggleFloaterStore = (id: string, name: string) => {
    setFloaterStores(prev => {
      const exists = prev.find(s => s.id === id);
      if (exists) {
        return prev.filter(s => s.id !== id);
      }
      return [...prev, {id, name}];
    });
  };

  const openFloaterModal = () => {
    setFloaterModalVisible(true);
  };

  const closeFloaterModal = () => {
    setFloaterModalVisible(false);
    setFloaterSearch('');
    setFloaterPage(1);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!employee) {
      Toast.show({type: 'error', text1: 'Select a promoter'});
      return;
    }
    if (!store) {
      Toast.show({type: 'error', text1: 'Select a store'});
      return;
    }
    if (!startDate || !endDate) {
      Toast.show({type: 'error', text1: 'Select start and end dates'});
      return;
    }
    if (startDate > endDate) {
      Toast.show({
        type: 'error',
        text1: 'End date cannot be before start date',
      });
      return;
    }

    const payload: ICreateShiftAssignment = {
      employee,
      store,
      ...(shiftType ? {shift_type: shiftType} : {}),
      start_date: startDate,
      end_date: endDate,
      is_secondary: isSecondary ? 1 : 0,
      floater: floater ? 1 : 0,
      ...(floater && floaterStores.length
        ? {floater_stores: floaterStores.map(s => s.id)}
        : {}),
    };

    try {
      const res = await createShiftAssignment(payload).unwrap();
      console.log('🚀 ~ handleSubmit ~ res:', res);
      if (res?.message?.success) {
        const created = res.message.data;
        Toast.show({
          type: 'success',
          text1: `Shift created: ${created.shift_assignment}`,
          text2: `${created.store_name} · ${created.start_time} - ${created.end_time}`,
          position: 'top',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Could not create shift',
          text2: (res?.message as any)?.message || 'Please try again',
          position: 'top',
        });
      }
    } catch (error: any) {
      const serverMessage =
        error?.data?.message?.message ||
        error?.data?._server_messages ||
        error?.data?.message ||
        'Failed to create shift assignment';
      let messageText = serverMessage;
      if (typeof serverMessage === 'string' && serverMessage.startsWith('[')) {
        try {
          const parsed = JSON.parse(serverMessage);
          messageText = parsed?.[0]?.message ?? serverMessage;
        } catch {
          messageText = serverMessage;
        }
      }
      Toast.show({
        type: 'error',
        text1: 'Could not create shift',
        text2: String(messageText),
        position: 'top',
      });
    }
  };

  const renderToggleRow = (
    label: string,
    description: string,
    value: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{false: '#D1D5DB', true: Colors.orange}}
        thumbColor={Colors.white}
      />
    </View>
  );

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Create Promoter Shift"
        navigation={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          {/* ── Compact single form card ── */}
          <View style={[styles.card, boxShadow]}>
            <View style={styles.headerRow}>
              <View style={styles.headerIconBox}>
                <CalendarPlus size={16} color={Colors.orange} strokeWidth={2} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Shift Details</Text>
                <Text style={styles.headerSubtitle}>
                  Assign a promoter to a store
                </Text>
              </View>
            </View>

            {promotersLoading ? (
              <ActivityIndicator
                size="small"
                color={Colors.orange}
                style={styles.loader}
              />
            ) : (
              <ReusableDropdownv2
                label="Promoter *"
                field="employee"
                value={employee}
                data={promoterOptions}
                onChange={setEmployee}
                height={38}
                textSize={Size.xxs}
                labelStyle={styles.compactLabel}
                marginBottom={0}
              />
            )}

            <View style={styles.fieldDivider} />

            <View style={styles.fieldRow}>
              <View style={styles.fieldCol}>
                <ReusableDropdownv2
                  label="Store *"
                  field="store"
                  value={store}
                  data={storeList}
                  onChange={setStore}
                  searchText={storeSearch}
                  setSearchText={handleStoreSearch}
                  onLoadMore={handleLoadMoreStores}
                  loadingMore={optionsFetching}
                  height={38}
                  textSize={Size.xxs}
                  labelStyle={styles.compactLabel}
                  marginBottom={0}
                />
              </View>
              <View style={styles.fieldCol}>
                <ReusableDropdownv2
                  label="Shift Type"
                  field="shift_type"
                  value={shiftType}
                  data={shiftTypeOptions}
                  onChange={setShiftType}
                  height={38}
                  textSize={Size.xxs}
                  labelStyle={styles.compactLabel}
                  marginBottom={0}
                />
              </View>
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.fieldRow}>
              <View style={styles.fieldCol}>
                <ReusableDatePicker
                  label="Start Date *"
                  value={startDate}
                  onChange={setStartDate}
                  height={38}
                  textSize={Size.xxs}
                  labelStyle={styles.compactLabel}
                  marginBottom={0}
                />
              </View>
              <View style={styles.fieldCol}>
                <ReusableDatePicker
                  label="End Date *"
                  value={endDate}
                  onChange={setEndDate}
                  height={38}
                  textSize={Size.xxs}
                  labelStyle={styles.compactLabel}
                  marginBottom={0}
                />
              </View>
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.toggleCard}>
              {renderToggleRow(
                'Secondary shift',
                'Afternoon half of a split day',
                isSecondary,
                setIsSecondary,
              )}
              <View style={styles.toggleDivider} />
              {renderToggleRow(
                'Floater',
                'Covers extra stores',
                floater,
                value => {
                  setFloater(value);
                  if (!value) {
                    setFloaterStores([]);
                    closeFloaterModal();
                  }
                },
              )}
            </View>

            {floater && (
              <View style={styles.floaterSection}>
                <View style={styles.floaterHeader}>
                  <Text style={styles.floaterTitle}>Floater stores</Text>
                  <TouchableOpacity
                    style={styles.addStoreBtn}
                    onPress={openFloaterModal}
                    activeOpacity={0.8}>
                    <Ionicons name="add" size={15} color={Colors.white} />
                    <Text style={styles.addStoreBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {floaterStores.length === 0 ? (
                  <Text style={styles.noStoresText}>
                    No floater stores selected yet
                  </Text>
                ) : (
                  <View style={styles.chipsWrap}>
                    {floaterStores.map(storeItem => (
                      <View key={storeItem.id} style={styles.chip}>
                        <Text style={styles.chipText} numberOfLines={1}>
                          {storeItem.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            toggleFloaterStore(storeItem.id, storeItem.name)
                          }
                          hitSlop={{
                            top: 6,
                            bottom: 6,
                            left: 6,
                            right: 6,
                          }}>
                          <Ionicons
                            name="close"
                            size={14}
                            color={Colors.white}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && {opacity: 0.7}]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <CalendarPlus size={18} color={Colors.white} strokeWidth={2} />
          )}
          <Text style={styles.submitText}>
            {isSubmitting ? 'Creating...' : 'Create Shift'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floater store search modal */}
      <Modal
        visible={floaterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeFloaterModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select floater stores</Text>
              <TouchableOpacity onPress={closeFloaterModal}>
                <Ionicons name="close-circle" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color={Colors.gray} />
              <TextInput
                value={floaterSearch}
                onChangeText={handleFloaterSearch}
                placeholder="Search stores..."
                placeholderTextColor={Colors.gray}
                style={styles.searchInput}
              />
              {floaterSearch.length > 0 && (
                <TouchableOpacity onPress={() => handleFloaterSearch('')}>
                  <Ionicons name="close" size={15} color={Colors.gray} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={floaterList}
              keyExtractor={item => item.value}
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
              onEndReached={handleLoadMoreFloaterStores}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                floaterOptionsFetching ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.orange}
                    style={{marginVertical: 12}}
                  />
                ) : null
              }
              renderItem={({item}) => {
                const selected = floaterStores.some(s => s.id === item.value);
                return (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => toggleFloaterStore(item.value, item.label)}>
                    <View
                      style={[styles.checkbox, selected && styles.checkboxOn]}>
                      {selected && (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.modalItemText,
                        selected && {color: Colors.darkButton},
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {floaterOptionsFetching ? 'Loading...' : 'No stores found'}
                </Text>
              }
            />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={closeFloaterModal}>
              <Text style={styles.doneButtonText}>
                Done ({floaterStores.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreatePromoterShiftScreen;

const styles = StyleSheet.create({
  content: {padding: 12, paddingBottom: 90},
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF1E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {flex: 1},
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  headerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    marginTop: 1,
  },
  loader: {marginVertical: 12},
  compactLabel: {fontSize: 11, marginBottom: 3},
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldCol: {flex: 1},
  fieldDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  toggleCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  toggleTextWrap: {flex: 1},
  toggleLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  toggleDescription: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    marginTop: 2,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  floaterSection: {marginTop: 12},
  floaterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  floaterTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  addStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addStoreBtnText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.white,
  },
  noStoresText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    paddingVertical: 10,
    textAlign: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.darkButton,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.white,
    maxWidth: 220,
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.darkButton,
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: Size.sm,
    fontFamily: Fonts.semiBold,
    color: '#1A1A1A',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#1A1A1A',
    padding: 0,
  },
  modalList: {maxHeight: 420},
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxOn: {
    backgroundColor: Colors.darkButton,
    borderColor: Colors.darkButton,
  },
  modalItemText: {
    fontSize: Size.xs,
    fontFamily: Fonts.regular,
    color: '#374151',
    flex: 1,
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
  },
});
