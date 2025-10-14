/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../../../../utils/colors';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';
import {Clock2, EllipsisVertical, Funnel, Search} from 'lucide-react-native';
import {useGetDailyPjpListQuery} from '../../../../features/base/base-api';
import {useCallback, useEffect, useState} from 'react';
import {PjpDailyStore} from '../../../../types/baseType';
import {flexRow} from '../../../../utils/styles';
import {FlatList} from 'react-native';
import {RefreshControl} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {windowHeight} from '../../../../utils/utils';
import moment from 'moment';

const {width} = Dimensions.get('window');
const PAGE_SIZE = 10;

const PJPScreen = ({navigation}: any) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<PjpDailyStore[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {data, isLoading, isFetching, refetch, isUninitialized} =
    useGetDailyPjpListQuery({
      page,
      page_size: PAGE_SIZE,
      status: '',
    });

  // append new data when page changes
  useEffect(() => {
    if (data?.message?.data?.pjp_daily_stores) {
      setOrders(prev => {
        const map = new Map();
        [...prev, ...data.message.data.pjp_daily_stores].forEach(item => {
          map.set(item.pjp_daily_store_id, item);
        });
        return Array.from(map.values());
      });
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

  const renderItem = ({item}: {item: PjpDailyStore}) => (
    <View style={styles.atteddanceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.timeSection}>
          {/* <Clock2 size={16} color="#4A4A4A" strokeWidth={2} /> */}
          <Text style={styles.time}></Text>
        </View>
        <View style={[flexRow, {gap: 0, position: 'relative'}]}>
          <Text style={[styles.leave, {marginLeft: 'auto'}]}>
            {moment(item?.date).format('MMMM')}
          </Text>
          {/* Three dot menu */}
          <TouchableOpacity
            onPress={() =>
              setSelectedOrderId(
                selectedOrderId === item.pjp_daily_store_id
                  ? null
                  : item.pjp_daily_store_id,
              )
            }>
            <Text style={styles.threeDot}>⋮</Text>
          </TouchableOpacity>
          {/* Modal for dropdown */}
          {selectedOrderId === item.pjp_daily_store_id && (
            <>
              {/* Backdrop to detect outside press */}
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                activeOpacity={1}
                onPress={() => setSelectedOrderId(null)}
              />
              <View style={styles.dropdownMenu}>
                {!(item?.date
                  ? moment(item.date, 'YYYY-MM-DD').isBefore(moment(), 'day')
                  : false) && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedOrderId(null);
                      navigation.navigate('AddPjpScreen', {
                        id: item?.pjp_daily_store_id,
                      });
                    }}>
                    <Text style={styles.menuItem}>Edit</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => {
                    setSelectedOrderId(null);
                    navigation.navigate('PjpDetailScreen', {
                      details: item,
                    });
                  }}>
                  <Text style={styles.menuItem}>View</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          // setModalVisible(false);
          navigation.navigate('PjpDetailScreen', {
            details: item,
          });
        }}
        style={styles.cardbody}>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{new Date(item.date).getDate()}</Text>
          <Text style={styles.monthText}>
            {new Date(item.date).toLocaleString('default', {
              month: 'short',
            })}
          </Text>
        </View>
        <View>
          {/* <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: Size.sm,
              color: Colors.darkButton,
            }}>
            PJP of {moment(item?.date).format('MMMM')}
          </Text> */}
          <Text style={styles.contentText}>
            Emp name
          </Text>
          <Text style={[styles.contentText,{fontFamily: Fonts.semiBold,
              fontSize: Size.sm,
              color: Colors.darkButton}]}>
            {item?.employee_name}
          </Text>
          {/* <Text style={styles.contentText}>Accestisa new mart</Text> */}
        </View>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.bodyHeaderTitle}>Recent PJP</Text>
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
          {isLoading && page === 1 ? (
            <View
              style={{
                height: windowHeight * 0.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" />
            </View>
          ) : orders.length === 0 ? (
            <View
              style={{
                height: windowHeight * 0.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 16, color: 'gray'}}>No Pjp Found</Text>
            </View>
          ) : (
            <FlatList
              data={orders}
              nestedScrollEnabled={true}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={renderItem}
              keyExtractor={(item, index) => item.pjp_daily_store_id + index}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetching ? <ActivityIndicator size="small" /> : null
              }
            />
          )}
        </View>
        {/* <View>
          <View style={styles.atteddanceCard}>
            <View style={styles.cardHeader}>
              <View style={styles.timeSection}>
                <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                <Text style={styles.time}> 11:03:45 AM</Text>
              </View>
              <Text style={[styles.leave, {marginLeft: 'auto'}]}>January</Text>
              <EllipsisVertical size={20} color={Colors.darkButton} />
            </View>
            <View style={styles.cardbody}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>19</Text>
                <Text style={styles.monthText}>Jan</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: Colors.darkButton,
                  }}>
                  PJP of January
                </Text>
                <Text style={styles.contentText}>Store name</Text>
                <Text style={styles.contentText}>Accestisa new mart</Text>
              </View>
            </View>
          </View>
        </View> */}
      </View>
    </View>
  );
};

export default PJPScreen;

const styles = StyleSheet.create({
  //bodyContent section css
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
  leave: {
    backgroundColor: Colors.lightBlue,
    color: Colors.blue,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },
  cardbody: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
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

  //countBox-section css end
  dropdownMenu: {
    position: 'absolute',
    top: 25, // adjust based on where you want it
    right: 0, // aligns to right of parent
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  threeDot: {
    fontSize: 20,
    paddingHorizontal: 10,
    color: '#374151',
  },
});
