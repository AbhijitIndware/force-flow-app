import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import { FlashList } from '@shopify/flash-list';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import moment from 'moment';
import { useGetStoreListQuery } from '../../../../features/base/base-api';
import { Store } from '../../../../types/baseType';
import { Clock2, Funnel, MapPin, Search, X } from 'lucide-react-native';
import { windowHeight } from '../../../../utils/utils';

const { width } = Dimensions.get('window');

const StoreTabContent = ({ navigation, setTotalCount }: any) => {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Store[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filter / search state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const slideAnim = useRef(new Animated.Value(300)).current;

  const { data, isFetching, isLoading, refetch } = useGetStoreListQuery({
    page: String(page),
    page_size: '20',
    include_subordinates: '1',
    include_direct_subordinates: '1',
    ...(appliedSearch ? { search: appliedSearch } : {}),
  });

  const stores = data?.message?.data?.stores ?? [];
  const pagination = data?.message?.data?.pagination;
  const hasNextPage =
    pagination &&
    pagination?.page < pagination?.total_pages &&
    stores.length > 0;

  useEffect(() => {
    if (data?.message?.data) {
      const fetchedStores = data.message.data.stores ?? [];
      const paginationData = data.message.data.pagination;

      if (page === 1) {
        setOrders(fetchedStores);
      } else if (fetchedStores.length > 0) {
        setOrders(prev => {
          // Prevent duplicates if RTK Query returns cached data
          const existingIds = new Set(prev.map(s => s.name));
          const uniqueNew = fetchedStores.filter(s => !existingIds.has(s.name));
          return [...prev, ...uniqueNew];
        });
      }

      if (paginationData) {
        setTotalCount(paginationData.total_count);
      }
    }
  }, [data, page]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
    // Note: Do not manually clear orders here to avoid race conditions with RTK Query cache.
    // The data effect above handles the page 1 reset correctly.
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

  const renderItem = ({ item }: { item: Store }) => {
    const creationDate = item.creation
      ? moment(item.creation).format('DD MMM YYYY')
      : 'N/A';
    const statusColor = item.status === 'Active' ? '#22C55E' : '#EF4444';
    const statusBg = item.status === 'Active' ? '#F0FDF4' : '#FEF2F2';

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('StoreDetailScreen', { storeId: item?.name })
        }
        activeOpacity={0.7}
        style={styles.card}>
        {/* Header: Name & Status */}
        <View style={styles.cardHeader}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.store_name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Content: ID & Location */}
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.idLabel}>ID: </Text>
            <Text style={styles.idValue}>{item.name}</Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <View style={styles.iconCircle}>
                <MapPin size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.city || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.iconCircle}>
                <Funnel size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.zone || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer: Date & Time */}
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{creationDate}</Text>
          <View style={styles.footerDivider} />
          <View style={styles.timeSection}>
            <Clock2 size={12} color="#94A3B8" />
            <Text style={styles.timeText}>
              {item.creation ? moment(item.creation).format('hh:mm A') : '--:--'}
            </Text>
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
          { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 70 },
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

        <View style={{ flex: 1, backgroundColor: Colors.lightBg }}>
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
              contentContainerStyle={{ paddingVertical: 5 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListFooterComponent={
                isFetching ? (
                  <View style={{ paddingVertical: 20 }}>
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
                    <Text style={{ color: 'gray', fontSize: 16 }}>
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
            style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
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
    borderRadius: 16,
    padding: 12,
    paddingVertical: 5,
    marginVertical: 5,
    width: '95%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    textTransform: 'capitalize',
  },
  cardContent: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  idLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#64748B',
  },
  idValue: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#475569',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  dateText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#94A3B8',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#94A3B8',
  },
  bodyContent: { flex: 1 },
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
  // Modal styles 
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
    shadowOffset: { width: 0, height: -4 },
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
