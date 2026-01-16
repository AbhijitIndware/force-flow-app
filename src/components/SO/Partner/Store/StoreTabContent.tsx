import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {Colors} from '../../../../utils/colors';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';
import moment from 'moment';
import {useGetStoreListQuery} from '../../../../features/base/base-api';
import {Store} from '../../../../types/baseType';
import {Clock2} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const StoreTabContent = ({navigation, setTotalCount}: any) => {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Store[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  const {data, isFetching, refetch} = useGetStoreListQuery({
    page: String(page),
    page_size: '20',
    include_subordinates: '1',
    include_direct_subordinates: '1',
  });

  const stores = data?.message?.data?.stores ?? [];
  const pagination = data?.message?.data?.pagination;
  const hasNextPage =
    pagination &&
    pagination?.page < pagination?.total_pages &&
    stores.length > 0;

  // update list on data change
  useEffect(() => {
    if (stores.length > 0) {
      setOrders(prev => (page === 1 ? stores : [...prev, ...stores]));
    }

    if (pagination) {
      setTotalCount(pagination.total_count);
    }
  }, [data]);

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
    <View style={{flex: 1, backgroundColor: Colors.lightBg}}>
      <FlashList
        data={orders}
        renderItem={renderItem}
        // estimatedItemSize={140}
        keyExtractor={(item, index) => index.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
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
              <Text style={{color: 'gray', fontSize: 16}}>No Store Found</Text>
            )}
          </View>
        }
      />
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
});
