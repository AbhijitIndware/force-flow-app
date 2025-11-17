/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors} from '../../../../utils/colors';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';
import {Clock2, Funnel, Search} from 'lucide-react-native';
import {useGetStoreListQuery} from '../../../../features/base/base-api';
import {useCallback, useEffect, useState} from 'react';
import {Store} from '../../../../types/baseType';
import {windowHeight} from '../../../../utils/utils';
import {FlatList} from 'react-native';
import {RefreshControl} from 'react-native';
import moment from 'moment';

const {width} = Dimensions.get('window');

const StoreTabContent = ({navigation, setTotalCount}: any) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<Store[]>([]);
  console.log('🚀 ~ StoreTabContent ~ orders:', orders);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {data, isLoading, isFetching, refetch, isUninitialized, error} =
    useGetStoreListQuery({
      page: String(page),
      page_size: '20',

      // search: storeSearch,
      include_subordinates: '1',
      include_direct_subordinates: '1',
    });
  console.log('🚀 ~ StoreTabContent ~ data:', data);

  // append new data when page changes
  useEffect(() => {
    if (data?.message?.data?.stores) {
      setOrders(prev => {
        const map = new Map();
        [...prev, ...data.message.data.stores].forEach(item => {
          map.set(item, item);
        });
        return Array.from(map.values());
      });
    }

    if (data?.message?.data?.pagination) {
      setTotalCount(data.message.data.pagination.total_count);
    }
  }, [data]);

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

  const renderItem = ({item}: {item: Store}) => {
    const date = moment(item.creation, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
    const day = date.format('DD'); // "19"
    const month = date.format('MMM');

    return (
      <View style={styles.atteddanceCard}>
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
            <View
              style={{
                marginBottom: 0,
              }}>
              <Text style={styles.contentText}>ID: {item?.name}</Text>
              <Text style={styles.contentText}>Name: {item?.store_name}</Text>
              <Text style={styles.contentText}>Zone: {item?.zone}</Text>
            </View>
            {/* <Text style={styles.contentText}>Store name</Text> */}
            <Text style={styles.contentText}>City: {item?.city}</Text>
          </View>
        </View>
      </View>
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
            <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
            <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
          </View>
        </View>
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
              {(data?.message?.data?.stores || 0) === 0 ? (
                <View
                  style={{
                    height: windowHeight * 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{fontSize: 16, color: 'gray'}}>
                    No Store Found
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
                  keyExtractor={(item, index) => index.toString()}
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

export default StoreTabContent;

const styles = StyleSheet.create({
  bodyContent: {flex: 1},
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

  //atteddanceCard section css
  atteddanceCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  time: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    lineHeight: 18,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
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

  lateEntry: {
    backgroundColor: Colors.holdLight,
    color: Colors.orange,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },

  leave: {
    backgroundColor: Colors.lightBlue,
    color: Colors.blue,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },
  absent: {
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },

  cardbody: {
    display: 'flex',
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
    display: 'flex',
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

  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'absolute',
    bottom: -65,
    gap: 5,
    zIndex: 1,
    width: width * 0.9,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
  countBoxSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 17,
    flexDirection: 'row',
  },
  countBox: {
    backgroundColor: Colors.white,
    width: '33.33%',
    borderRadius: 15,
    padding: 10,
    minHeight: 135,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 15,
  },
  countBoxIcon: {
    width: 45,
    height: 45,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    marginBottom: 10,
    marginLeft: 'auto',
  },
  countBoxTitle: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.xs,
    lineHeight: 18,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: Size.xslg,
    lineHeight: 20,
    position: 'relative',
  },
  //countBox-section css end
});
