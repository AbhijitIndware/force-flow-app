import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {Colors} from '../../../../utils/colors';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';
import moment from 'moment';
import {useGetStoreListQuery} from '../../../../features/base/base-api';
import {Store} from '../../../../types/baseType';
import {Clock2, Funnel, Search, X} from 'lucide-react-native';
import {windowHeight} from '../../../../utils/utils';

const {width} = Dimensions.get('window');

const StoreTabContent = ({navigation, setTotalCount}: any) => {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Store[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filter / search state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const slideAnim = useRef(new Animated.Value(300)).current;

  const {data, isFetching, isLoading, refetch} = useGetStoreListQuery({
    page: String(page),
    page_size: '20',
    include_subordinates: '1',
    include_direct_subordinates: '1',
    ...(appliedSearch ? {search: appliedSearch} : {}),
  });

  const stores = data?.message?.data?.stores ?? [];
  const pagination = data?.message?.data?.pagination;
  const hasNextPage =
    pagination &&
    pagination?.page < pagination?.total_pages &&
    stores.length > 0;

  useEffect(() => {
    if (stores.length > 0) {
      setOrders(prev => (page === 1 ? stores : [...prev, ...stores]));
    }
    if (pagination) {
      setTotalCount(pagination.total_count);
    }
  }, [data]);

  // Reset list when search changes
  useEffect(() => {
    setPage(1);
    setOrders([]);
  }, [appliedSearch]);

  const openModal = () => {
    setFilterModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setFilterModalVisible(false));
  };

  const handleApplyFilter = () => {
    setAppliedSearch(searchInput.trim());
    closeModal();
  };

  const handleClearFilter = () => {
    setSearchInput('');
    setAppliedSearch('');
    closeModal();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setOrders([]);
    setTimeout(() => {
      refetch();
      setRefreshing(false);
    }, 300);
  }, []);

  const loadMore = () => {
    if (!isFetching && hasNextPage) {
      setPage(prev => prev + 1);
    }
  };

  const renderItem = ({item}: {item: Store}) => {
    const date = moment(item.creation, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
    const day = date.format('DD');
    const month = date.format('MMM');

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('StoreDetailScreen', {storeId: item?.name})
        }
        style={styles.atteddanceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.timeSection}>
            <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
            <Text style={styles.time}>
              {' '}
              {item?.creation
                ? moment(item?.creation, 'YYYY-MM-DD HH:mm:ss.SSSSSS').format(
                    'hh:mm:ss A',
                  )
                : 'N/A'}
            </Text>
          </View>
          <Text style={[styles.present, {marginLeft: 'auto'}]}>
            {item?.status}
          </Text>
        </View>
        <View style={styles.cardbody}>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{item.creation ? day : 'N/A'}</Text>
            <Text style={styles.monthText}>
              {item.creation ? month : 'N/A'}
            </Text>
          </View>
          <View style={{width: '80%'}}>
            <View style={{marginBottom: 0}}>
              <Text style={styles.contentText}>ID: {item?.name}</Text>
              <Text style={styles.contentText}>Name: {item?.store_name}</Text>
              <Text style={styles.contentText}>Zone: {item?.zone}</Text>
            </View>
            <Text style={styles.contentText}>City: {item?.city}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        width: '100%',
        flex: 1,
        backgroundColor: Colors.lightBg,
        position: 'relative',
      }}>
      <View
        style={[
          styles.bodyContent,
          {paddingHorizontal: 20, paddingTop: 10, paddingBottom: 70},
        ]}>
        <View style={styles.bodyHeader}>
          <Text style={styles.bodyHeaderTitle}>All Store</Text>
          <View style={styles.bodyHeaderIcon}>
            {/* <Search size={20} color="#4A4A4A" strokeWidth={1.7} /> */}
            <TouchableOpacity onPress={openModal}>
              <View>
                <Funnel size={22} color="#4A4A4A" strokeWidth={1.7} />
                {/* Active filter indicator dot */}
                {appliedSearch ? <View style={styles.filterActiveDot} /> : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active search chip */}
        {appliedSearch ? (
          <View style={styles.activeFilterChip}>
            <Text style={styles.activeFilterChipText}>
              Search: "{appliedSearch}"
            </Text>
            <TouchableOpacity onPress={handleClearFilter}>
              <X size={16} color={Colors.darkButton} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{flex: 1, backgroundColor: Colors.lightBg}}>
          {isLoading ? (
            <View
              style={{
                height: windowHeight * 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlashList
              data={orders}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={loadMore}
              onEndReachedThreshold={0.2}
              contentContainerStyle={{padding: 12}}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListFooterComponent={
                isFetching ? (
                  <View style={{paddingVertical: 20}}>
                    <ActivityIndicator size="small" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View
                  style={{
                    paddingTop: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {!isFetching && (
                    <Text style={{color: 'gray', fontSize: 16}}>
                      No Store Found
                    </Text>
                  )}
                </View>
              }
            />
          )}
        </View>
      </View>

      {/* ── Filter Modal ── */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalWrapper}
          pointerEvents="box-none">
          <Animated.View
            style={[styles.modalSheet, {transform: [{translateY: slideAnim}]}]}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Stores</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <X size={20} color="#4A4A4A" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <Text style={styles.inputLabel}>Search</Text>
            <View style={styles.searchInputWrapper}>
              <Search size={16} color="#9CA3AF" strokeWidth={1.8} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, ID, city, zone..."
                placeholderTextColor="#9CA3AF"
                value={searchInput}
                onChangeText={setSearchInput}
                returnKeyType="search"
                onSubmitEditing={handleApplyFilter}
                autoFocus
              />
              {searchInput.length > 0 && (
                <TouchableOpacity onPress={() => setSearchInput('')}>
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilter}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilter}>
                <Text style={styles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default StoreTabContent;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 12,
  },
  status: {
    fontFamily: Fonts.regular,
    color: Colors.sucess,
    backgroundColor: Colors.lightSuccess,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bodyContent: {flex: 1},
  bodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4E9',
  },
  bodyHeaderTitle: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    lineHeight: 20,
  },
  bodyHeaderIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  filterActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sucess ?? '#22C55E',
    position: 'absolute',
    top: -2,
    right: -2,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
  },
  activeFilterChipText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  atteddanceCard: {
    flexDirection: 'column',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  time: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    lineHeight: 18,
  },
  present: {
    backgroundColor: Colors.lightSuccess,
    color: Colors.sucess,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },
  cardbody: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 0,
  },
  dateBox: {
    width: 50,
    height: 50,
    borderColor: Colors.darkButton,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.transparent,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  dateText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  monthText: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.xs,
  },
  contentText: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.sm,
    lineHeight: 20,
  },

  // ── Modal styles ──
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E4E9',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    marginBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E4E9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.lightBg,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
    padding: 0,
    margin: 0,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E4E9',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  applyButton: {
    flex: 2,
    backgroundColor: Colors.darkButton,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
});
