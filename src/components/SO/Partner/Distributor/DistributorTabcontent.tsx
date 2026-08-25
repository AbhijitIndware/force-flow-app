/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../../../utils/colors';
import React, { useCallback, useEffect, useState } from 'react';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { Building2, MapPin, Tag, CalendarDays, ChevronRight } from 'lucide-react-native';
import { useGetDistributorListQuery } from '../../../../features/base/base-api';
import { Distributor } from '../../../../types/baseType';
import { windowHeight } from '../../../../utils/utils';
import moment from 'moment';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 10;

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

const DistributorTabcontent = ({ navigation, setTotalCount }: any) => {
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<Distributor[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { data, isLoading, isFetching, refetch, isUninitialized } =
    useGetDistributorListQuery({
      page,
      page_size: PAGE_SIZE,
      status: '',
    });

  useEffect(() => {
    if (data?.message?.data) {
      const fetchedDistributors = data.message.data.distributors ?? [];
      const paginationData = data.message.data.pagination;

      if (page === 1) {
        setOrders(fetchedDistributors);
      } else if (fetchedDistributors.length > 0) {
        setOrders(prev => {
          const map = new Map();
          [...prev, ...fetchedDistributors].forEach(item => {
            map.set(item.name, item);
          });
          return Array.from(map.values());
        });
      }

      if (paginationData) {
        setTotalCount(paginationData.total_count);
      }
    }
  }, [data, page]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (!isUninitialized) refetch();
    }, 2000);
  }, []);

  const loadMore = () => {
    if (
      !isFetching &&
      data?.message?.data &&
      data?.message?.data?.pagination?.page <
      data?.message?.data?.pagination?.total_pages
    ) {
      setPage(prev => prev + 1);
    }
  };

  const renderItem = ({ item, index }: { item: Distributor; index: number }) => {
    const palette = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const initials = getInitials(item.distributor_name);
    const creationDate = item.creation
      ? moment(item.creation).format('DD MMM YYYY')
      : 'N/A';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}>
        {/* Top row: avatar + name + ID badge */}
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: palette.bg, borderColor: palette.border }]}>
            <Text style={[styles.avatarText, { color: palette.text }]}>{initials}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.distributorName} numberOfLines={1}>
              {item.distributor_name}
            </Text>
            <View style={styles.idRow}>
              <Tag size={10} color="#94A3B8" />
              <Text style={styles.idText}>{item.name}</Text>
            </View>
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
          { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 70 },
        ]}>
        <View style={{ flex: 1, backgroundColor: Colors.lightBg }}>
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>
              {(data?.message?.data?.distributors?.length || 0) === 0 ? (
                <View style={styles.centered}>
                  <Text style={{ fontSize: 16, color: 'gray' }}>
                    No Distributor Found
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={orders}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  renderItem={renderItem}
                  keyExtractor={(item, index) => item.name || index?.toString()}
                  showsVerticalScrollIndicator={false}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    isFetching ? <ActivityIndicator size="small" /> : null
                  }
                />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default DistributorTabcontent;

const styles = StyleSheet.create({
  bodyContent: { flex: 1 },
  centered: {
    height: windowHeight * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  distributorName: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: '#0F172A',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  idText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94A3B8',
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
});
