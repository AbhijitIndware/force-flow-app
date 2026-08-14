/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  AlarmClockMinus,
  CirclePlus,
  Funnel,
  PackageOpen,
  Search,
  ShoppingCart,
} from 'lucide-react-native';
import FilterModal from '../../../components/ui/filterModal';
import {
  useGetSalesOrdersListQuery,
  useGetOrdersCountQuery,
} from '../../../features/base/promoter-base-api';
import PageHeader from '../../../components/ui/PageHeader';
import SalesItemCard from '../../../components/Promoter/Sales/SalesItemCard';
import {SalesOrderType} from '../../../types/baseType';
import SearchModal from '../../../components/ui/SearchModal';
import {windowHeight} from '../../../utils/utils';

const {width} = Dimensions.get('window');
const PAGE_SIZE = 10;

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'SalesScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const getDateParts = (dateStr: string) => {
  const date = new Date(dateStr);

  return {
    date: date.getDate().toString(),
    month: date.toLocaleString('default', {month: 'short'}),
  };
};

const SalesScreen = ({navigation}: Props) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<SalesOrderType[]>([]);

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<
    'All' | 'Draft' | 'Pending' | 'Delivered' | 'Cancelled'
  >('All');

  const {data, isFetching, isLoading, refetch, isUninitialized} =
    useGetSalesOrdersListQuery({
      status: selectedStatus === 'All' ? undefined : selectedStatus,
      search: searchText || undefined,
      page,
      page_size: PAGE_SIZE,
    });

  const {data: countData} = useGetOrdersCountQuery({});

  const salesCounts = countData?.message?.data?.sales_orders;

  useEffect(() => {
    if (data?.message?.data?.sales_orders) {
      const newList: SalesOrderType[] = data.message.data.sales_orders;

      setOrders(prev => {
        if (page === 1) {
          const map = new Map();
          newList.forEach(item => map.set(item.order_id, item));
          return Array.from(map.values());
        }

        const map = new Map();
        [...prev, ...newList].forEach(item => map.set(item.order_id, item));
        return Array.from(map.values());
      });
    }
  }, [page, data]);

  useEffect(() => {
    setOrders([]);
    setPage(1);
  }, [selectedStatus, searchText]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (!isUninitialized) refetch();
    }, 2000);
  }, [isUninitialized, refetch]);

  const loadMore = () => {
    if (
      !isFetching &&
      data?.message?.data?.pagination &&
      data?.message?.data?.pagination?.page <
        data?.message?.data?.pagination?.total_pages
    ) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      <PageHeader title="Sales" navigation={() => navigation.goBack()} />

      <View style={styles.headerSec}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View
              style={[styles.statIcon, {backgroundColor: Colors.lightBlue}]}>
              <ShoppingCart
                strokeWidth={1.4}
                color={Colors.blue}
                size={18}
              />
            </View>
            <View style={styles.statText}>
              <Text style={styles.statNum}>{salesCounts?.total || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIcon, {backgroundColor: Colors.lightSuccess}]}>
              <PackageOpen
                strokeWidth={1.4}
                color={Colors.sucess}
                size={18}
              />
            </View>
            <View style={styles.statText}>
              <Text style={styles.statNum}>
                {salesCounts?.submitted || 0}
              </Text>
              <Text style={styles.statLabel}>Delivered</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, {backgroundColor: Colors.holdLight}]}>
              <AlarmClockMinus
                strokeWidth={1.4}
                color={Colors.orange}
                size={18}
              />
            </View>
            <View style={styles.statText}>
              <Text style={styles.statNum}>{salesCounts?.draft || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.bodyContent,
          {paddingHorizontal: 20, paddingBottom: 5},
        ]}>
        <View style={styles.bodyHeader}>
          <Text style={styles.bodyHeaderTitle}>Recent Sales Orders</Text>
          <View style={styles.bodyHeaderIcon}>
            <SearchModal
              visible={isSearchVisible}
              onClose={() => setSearchVisible(false)}
              onSearch={text => {
                setSearchText(text);
              }}
            />

            <FilterModal
              visible={isFilterVisible}
              onClose={() => setFilterVisible(false)}
              onApply={() => setFilterVisible(false)}>
              {['All', 'Draft', 'Pending', 'Delivered', 'Cancelled'].map(
                status => (
                  <Text
                    key={status}
                    onPress={() => {
                      setSelectedStatus(status as any);
                      setFilterVisible(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      fontFamily: Fonts.medium,
                      color:
                        selectedStatus === status
                          ? Colors.darkButton
                          : Colors.gray,
                    }}>
                    {status}
                  </Text>
                ),
              )}
            </FilterModal>
            <TouchableOpacity onPress={() => setSearchVisible(true)}>
              <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFilterVisible(true)}>
              <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{flex: 1, paddingHorizontal: 20}}>
        {isLoading && page === 1 ? (
          <View
            style={{
              height: windowHeight * 0.4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size="large" />
          </View>
        ) : orders.length === 0 ? (
          <View
            style={{
              height: windowHeight * 0.4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 16, color: Colors.gray}}>
              No Sales Order Found
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({item, index}) => {
              const {date, month} = getDateParts(item.transaction_date);

              return (
                <SalesItemCard
                  key={item.order_id || index}
                  time={item.transaction_date}
                  date={date}
                  month={month}
                  orderNo={item.order_id}
                  amount={item.grand_total}
                  status={item.status || item.workflow_state}
                  storeName={item.store_name}
                  distributor={item.distributor}
                  storeImage={item.store_image}
                  navigation={navigation}
                />
              );
            }}
            keyExtractor={(item, index) => item.order_id + index}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetching ? (
                <View style={{paddingVertical: 15}}>
                  <ActivityIndicator size="small" />
                </View>
              ) : null
            }
            contentContainerStyle={{paddingBottom: 110}}
          />
        )}
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 15,
          width: '100%',
          paddingHorizontal: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={styles.checkinButton}
          onPress={() => navigation.navigate('AddSalesScreen')}>
          <CirclePlus strokeWidth={1.4} color={Colors.white} />
          <Text style={styles.checkinButtonText}>Create Sales Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SalesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },

  headerSec: {
    backgroundColor: Colors.white,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 1,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statNum: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  statText: {
    flexDirection: 'column',
    gap: 0,
  },

  bodyContent: {
    width: '100%',
    backgroundColor: Colors.lightBg,
  },
  bodyHeader: {
    display: 'flex',
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },

  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    gap: 5,
    width: width * 0.9,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
