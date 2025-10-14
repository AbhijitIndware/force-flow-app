/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Funnel, Search} from 'lucide-react-native';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';
import {Colors} from '../../../../utils/colors';
import {useGetSalesOrderListQuery} from '../../../../features/base/base-api';
import {useCallback, useEffect, useState} from 'react';
import {SalesOrderType} from '../../../../types/baseType';
import {FlatList} from 'react-native';
import {soStatusColors, windowHeight} from '../../../../utils/utils';
import {TouchableOpacity} from 'react-native';
import {flexRow} from '../../../../utils/styles';

const {width} = Dimensions.get('window');
const PAGE_SIZE = 10;
const SalesOrder = ({navigation}: any) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<SalesOrderType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {data, isLoading, isFetching, refetch, isUninitialized} =
    useGetSalesOrderListQuery({
      page,
      page_size: PAGE_SIZE,
    });

  // append new data when page changes
  useEffect(() => {
    if (data?.message?.data?.sales_orders) {
      setOrders(prev => {
        const map = new Map();
        [...prev, ...data.message.data.sales_orders].forEach(item => {
          map.set(item.order_id, item);
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

  const renderItem = ({item}: any) => (
    <View style={styles.atteddanceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.timeSection}>
          <Text style={styles.time}>SO ID: {item.order_id}</Text>
        </View>
        <View style={[flexRow, {gap: 0, position: 'relative',width:'50%',maxWidth:190, justifyContent:'flex-end'}]}>
          <Text
            style={[
              styles.present,
              {
                backgroundColor:
                  `${soStatusColors[item.status]}30` || Colors.lightSuccess,
                color: soStatusColors[item.status] || '#fff',
              },
            ]}>
            {item.status}
          </Text>
          {/* Three dot menu */}
          <TouchableOpacity
            onPress={() =>
              setSelectedOrderId(
                selectedOrderId === item.order_id ? null : item.order_id,
              )
            }>
            <Text style={styles.threeDot}>⋮</Text>
          </TouchableOpacity>
          {/* Modal for dropdown */}
          {selectedOrderId === item.order_id && (
            <>
              {/* Backdrop to detect outside press */}
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                activeOpacity={1}
                onPress={() => setSelectedOrderId(null)}
              />
              <View style={styles.dropdownMenu}>
                {item?.status === 'Draft' && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedOrderId(null);
                      navigation.navigate('AddSaleScreen', {
                        orderId: item?.order_id,
                      });
                    }}>
                    <Text style={styles.menuItem}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedOrderId(null);
                    navigation.navigate('SaleDetailScreen', {
                      id: item.order_id,
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
          navigation.navigate('SaleDetailScreen', {
            id: item.order_id,
          });
        }}
        style={styles.cardbody}>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>
            {new Date(item.transaction_date).getDate()}
          </Text>
          <Text style={styles.monthText}>
            {new Date(item.transaction_date).toLocaleString('default', {
              month: 'short',
            })}
          </Text>
        </View>
        <View>
          <Text style={styles.contentText}>Store: {item.store_name}</Text>
          <Text style={styles.contentText}>
            Distributor: {item.distributor}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: Size.sm,
              color: Colors.darkButton,
            }}>
            PO Amount: ₹{item.grand_total}
          </Text>
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
        marginBottom: 20,
      }}>
      <View
        style={[
          styles.bodyContent,
          {paddingHorizontal: 20, paddingTop: 10, paddingBottom: 70},
        ]}>
        <View style={styles.bodyHeader}>
          <Text style={styles.bodyHeaderTitle}>Recent Sales Order</Text>
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
              <Text style={{fontSize: 16, color: 'gray'}}>
                No Sale Order Found
              </Text>
            </View>
          ) : (
            <FlatList
              data={orders}
              nestedScrollEnabled={true}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={renderItem}
              keyExtractor={(item, index) => item.order_id + index}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetching ? <ActivityIndicator size="small" /> : null
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default SalesOrder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },

  //header-box-section css start
  headerSec: {
    backgroundColor: Colors.white,
    minHeight: 150,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    position: 'relative',
    zIndex: 1,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    paddingBottom: 20,

    // Android Shadow
    elevation: 2,
  },
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  salesHeaderData: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
  },

  welcomeText: {
    fontFamily: Fonts.light,
    color: Colors.white,
    fontSize: Size.xsmd,
    textAlign: 'center',
  },
  name: {fontFamily: Fonts.semiBold, fontSize: Size.md, color: Colors.white},
  welcomBox: {
    padding: 15,
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingVertical: 20,
    marginTop: 10,
    position: 'relative',
    bottom: -0,
    marginBottom: -30,
  },

  linkBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.Orangelight,
    borderRadius: 15,
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#9C9C9C',
  },
  linkContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    color: Colors.white,
    gap: 5,
    alignItems: 'center',
    width: width * 0.76,
  },

  paraText: {fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm},

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
    gap:10,
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width:'50%',
    maxWidth:175,
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
    fontSize: Size.xxs,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 10,
    maxWidth:130,
    textAlign:'center',
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
    fontSize: Size.xs,
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
