import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  ShoppingBag,
  Store,
  Building2,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { Colors } from '../../../../utils/colors';
import { useGetSalesOrderListQuery } from '../../../../features/base/base-api';
import { useCallback, useEffect, useState } from 'react';
import { SalesOrderType } from '../../../../types/baseType';
import { imageBaseUrl } from '../../../../features/apiBaseUrl';
import { soStatusColors, windowHeight } from '../../../../utils/utils';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 10;
const SalesOrder = ({ navigation }: any) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<SalesOrderType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { data, isLoading, isFetching, refetch, isUninitialized } =
    useGetSalesOrderListQuery({
      page,
      page_size: PAGE_SIZE,
    }, { refetchOnMountOrArgChange: true, refetchOnFocus: true });

  // append new data when page changes
  useEffect(() => {
    if (data?.message?.data?.sales_orders) {
      const newList = data.message.data.sales_orders;

      setOrders(prev => {
        // When page = 1 → replace completely
        if (page === 1) {
          const map = new Map();
          newList.forEach(item => map.set(item.order_id, item));
          return Array.from(map.values());
        }

        // When page > 1 → append & deduplicate
        const map = new Map();
        [...prev, ...newList].forEach(item => map.set(item.order_id, item));
        return Array.from(map.values());
      });
    }
  }, [page, data]);

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

  const renderItem = ({ item }: { item: SalesOrderType }) => {
    const rawColor = soStatusColors[item.status] || '#6B7280';
    const dateObj = new Date(item.transaction_date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = dateObj.getFullYear();

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate('SaleDetailScreen', {
            id: item.order_id,
          });
        }}
        style={styles.orderCard}>
        {/* Card Header: Order ID & Status Badge */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.orderIdBadge}>
            <ShoppingBag size={12} color="#C2410C" />
            <Text style={styles.orderIdText}>{item.order_id}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: `${rawColor}18`,
                borderColor: `${rawColor}40`,
              },
            ]}>
            <View style={[styles.statusDot, { backgroundColor: rawColor }]} />
            <Text style={[styles.statusText, { color: rawColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBodyRow}>
          {/* Date Badge Box */}
          <View style={styles.dateBox}>
            <View style={styles.dateHeader}>
              <Text style={styles.monthText}>{month}</Text>
            </View>
            <View style={styles.dateBody}>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          </View>

          {/* Details Column */}
          <View style={styles.detailsContent}>
            <View style={styles.infoRow}>
              <Store size={13} color="#4B5563" />
              <Text style={styles.storeNameText} numberOfLines={1} ellipsizeMode="tail">
                {item.store_name || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Building2 size={12} color="#9CA3AF" />
              <Text style={styles.distributorText} numberOfLines={1} ellipsizeMode="tail">
                {item.distributor || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Card Footer */}
        <View style={styles.cardFooterRow}>
          <View style={styles.footerDateWrap}>
            <Calendar size={11} color="#9CA3AF" />
            <Text style={styles.footerDateText}>{`${day} ${month} ${year}`}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>PO Amount: </Text>
            <Text style={styles.amountValue}>
              ₹{Number(item.grand_total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
            <ChevronRight size={14} color="#9CA3AF" style={{ marginLeft: 2 }} />
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
        marginBottom: 20,
      }}>
      <View
        style={[
          styles.bodyContent,
          { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 70 },
        ]}>
        {/* <View style={styles.bodyHeader}>
          <Text style={styles.bodyHeaderTitle}>Recent Primary Sales</Text>
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
              <Text style={{ fontSize: 16, color: 'gray' }}>
                No Primary Sale Order Found
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
    shadowOffset: { width: 0, height: 6 },
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
  name: { fontFamily: Fonts.semiBold, fontSize: Size.md, color: Colors.white },
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

  paraText: { fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm },

  //bodyContent section css
  bodyContent: { flex: 1 },
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
  // Redesigned Order Card Styles
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  orderIdText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: '#C2410C',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
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
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBox: {
    width: 42,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
  },
  dateHeader: {
    width: '100%',
    backgroundColor: Colors.Orangelight,
    paddingVertical: 1,
    alignItems: 'center',
  },
  monthText: {
    fontFamily: Fonts.bold,
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dateBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  detailsContent: {
    flex: 1,
    gap: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  storeNameText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
    flex: 1,
  },
  distributorText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#6B7280',
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  footerDateText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#9CA3AF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountLabel: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#6B7280',
  },
  amountValue: {
    fontFamily: Fonts.bold,
    fontSize: Size.xs,
    color: '#0F172A',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 25,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
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
