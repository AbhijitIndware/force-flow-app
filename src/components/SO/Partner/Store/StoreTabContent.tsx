import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import moment from 'moment';
import { useGetStoreListQuery } from '../../../../features/base/base-api';
import { Store } from '../../../../types/baseType';
import { imageBaseUrl } from '../../../../features/apiBaseUrl';
import { MapPin, Building2, CalendarDays, Search, X, ChevronRight } from 'lucide-react-native';
import { windowHeight } from '../../../../utils/utils';

const { width } = Dimensions.get('window');

const AVATAR_COLORS = [
  { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
  { bg: '#FDF4FF', border: '#E9D5FF', text: '#7E22CE' },
  { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C' },
];

function getInitials(name: string = ''): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const StoreTabContent = ({ navigation, setTotalCount }: any) => {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Store[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

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
    const delayDebounceFn = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== appliedSearch) {
        setPage(1);
        setAppliedSearch(trimmed);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    if (data?.message?.data) {
      const fetchedStores = data.message.data.stores ?? [];
      const paginationData = data.message.data.pagination;

      if (page === 1) {
        setOrders(fetchedStores);
      } else if (fetchedStores.length > 0) {
        setOrders(prev => {
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

  const toggleSearch = () => {
    if (isSearchVisible) {
      setSearchInput('');
      setAppliedSearch('');
      setPage(1);
      setIsSearchVisible(false);
    } else {
      setIsSearchVisible(true);
    }
  };

  const handleSearchSubmit = () => {
    const trimmed = searchInput.trim();
    if (trimmed !== appliedSearch) {
      setPage(1);
      setAppliedSearch(trimmed);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
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

  const renderItem = ({ item, index }: { item: Store; index: number }) => {
    const palette = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const initials = getInitials(item.store_name);
    const creationDate = item.creation
      ? moment(item.creation).format('DD MMM YYYY')
      : 'N/A';
    const isActive = item.status === 'Active';
    const statusColor = isActive ? '#16A34A' : '#DC2626';
    const statusBg = isActive ? '#F0FDF4' : '#FEF2F2';

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('StoreDetailScreen', { storeId: item?.name })
        }
        activeOpacity={0.85}
        style={styles.card}>
        {/* Top row: image/avatar + name + status */}
        <View style={styles.cardTop}>
          {item.store_image ? (
            <Image
              source={{ uri: imageBaseUrl + item.store_image }}
              style={styles.storeImage}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: palette.bg, borderColor: palette.border }]}>
              <Text style={[styles.avatarText, { color: palette.text }]}>{initials}</Text>
            </View>
          )}

          <View style={styles.nameBlock}>
            <Text style={styles.storeName} numberOfLines={1}>
              {item.store_name}
            </Text>
            <Text style={styles.idText}>{item.name}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom row: city, zone, date */}
        <View style={styles.cardBottom}>
          <View style={styles.metaItem}>
            <MapPin size={12} color="#6B7280" />
            <Text style={styles.metaText} numberOfLines={1}>{item.city || 'N/A'}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Building2 size={12} color="#6B7280" />
            <Text style={styles.metaText} numberOfLines={1}>{item.zone || 'N/A'}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.metaItem}>
            <CalendarDays size={11} color="#9CA3AF" />
            <Text style={styles.dateText}>{creationDate}</Text>
          </View>
          <ChevronRight size={14} color="#D1D5DB" style={{ marginLeft: 2 }} />
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
          { paddingHorizontal: 14, paddingTop: 5, paddingBottom: 70 },
        ]}>
        <View style={styles.bodyHeader}>
          {isSearchVisible ? (
            <View style={styles.headerSearchContainer}>
              <View style={styles.searchIconWrapper}>
                <Search size={18} color="#64748B" strokeWidth={2} />
              </View>
              <TextInput
                style={styles.headerSearchInput}
                placeholder="Search by name, ID, city..."
                placeholderTextColor="#94A3B8"
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                autoFocus
              />
              {searchInput.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} style={styles.clearIconWrapper}>
                  <X size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={toggleSearch} style={styles.closeSearchBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.bodyHeaderTitle}>All Stores</Text>
              <TouchableOpacity onPress={toggleSearch} style={styles.bodyHeaderIcon}>
                <Search size={22} color="#4A4A4A" strokeWidth={1.7} />
                {appliedSearch ? <View style={styles.filterActiveDot} /> : null}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ flex: 1, backgroundColor: Colors.lightBg }}>
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              data={orders}
              renderItem={renderItem}
              keyExtractor={(item, index) => item.name || index.toString()}
              onEndReached={loadMore}
              onEndReachedThreshold={0.2}
              showsVerticalScrollIndicator={false}
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
                <View style={styles.centered}>
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
    </View>
  );
};

export default StoreTabContent;

const styles = StyleSheet.create({
  bodyContent: { flex: 1 },
  centered: {
    height: windowHeight * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
  },
  storeImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: '#0F172A',
  },
  idText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94A3B8',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#6B7280',
    maxWidth: 90,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 2,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#9CA3AF',
  },
  // Search Header
  headerSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIconWrapper: {
    marginRight: 8,
  },
  headerSearchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
    padding: 0,
  },
  clearIconWrapper: {
    padding: 4,
  },
  closeSearchBtn: {
    marginLeft: 10,
    paddingVertical: 4,
  },
  cancelText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: '#64748B',
  },
});
