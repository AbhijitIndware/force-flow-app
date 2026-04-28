/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../../utils/colors';
import React, { useCallback, useEffect, useState } from 'react';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { Clock2, Funnel, MapPin, Search, X } from 'lucide-react-native';
import { useGetDistributorListQuery } from '../../../../features/base/base-api';
import { Distributor } from '../../../../types/baseType';
import { ActivityIndicator } from 'react-native';
import { windowHeight } from '../../../../utils/utils';
import moment from 'moment';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 10;

const DistributorTabcontent = ({ navigation, setTotalCount }: any) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<Distributor[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { data, isLoading, isFetching, refetch, isUninitialized, error } =
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
            map.set(item.name, item); // Assuming 'name' is the unique ID
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

  const renderItem = ({ item }: { item: Distributor }) => {
    const creationDate = item.creation
      ? moment(item.creation).format('DD MMM YYYY')
      : 'N/A';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.card}>
        {/* Header: Name */}
        <View style={styles.cardHeader}>
          <Text style={styles.distributorName} numberOfLines={1}>
            {item.distributor_name}
          </Text>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>#{item.name}</Text>
          </View>
        </View>

        {/* Content: Employee & Location */}
        <View style={styles.cardContent}>
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
        {/* <View style={styles.bodyHeader}>
          <Text style={styles.bodyHeaderTitle}>All Distributor</Text>
          <View style={styles.bodyHeaderIcon}>
            <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
            <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
          </View>
        </View> */}

        <View
          style={{
            flex: 1,
            backgroundColor: Colors.lightBg,
          }}>
          {isLoading || isFetching ? (
            <View
              style={{
                height: windowHeight * 0.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>
              {(data?.message?.data?.distributors?.length || 0) === 0 ? (
                <View
                  style={{
                    height: windowHeight * 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{ fontSize: 16, color: 'gray' }}>
                    No Distributor Found
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={orders}
                  nestedScrollEnabled={true}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  renderItem={renderItem}
                  keyExtractor={(item, index) => index?.toString()}
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
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
  distributorName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  idBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  idBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
  cardContent: {
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    gap: 20,
  },
});
