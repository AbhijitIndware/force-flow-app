/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Truck,
  Store,
  Building2,
  Calendar,
  ChevronRight,
  Package,
} from 'lucide-react-native';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';
import {Colors} from '../../../../utils/colors';
import {useGetDeliveryNotesListQuery} from '../../../../features/base/base-api';
import {useCallback, useEffect, useState} from 'react';
import {IDistributorDeliveryNote} from '../../../../types/baseType';
import {windowHeight} from '../../../../utils/utils';

const {width} = Dimensions.get('window');
const PAGE_SIZE = 10;

const DeliveryNoteComponent = ({navigation}: any) => {
  const [page, setPage] = useState<number>(1);
  const [deliveryNotes, setDeliveryNotes] = useState<
    IDistributorDeliveryNote[]
  >([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {data, isLoading, isFetching, refetch, isUninitialized} =
    useGetDeliveryNotesListQuery({
      page,
      page_size: PAGE_SIZE,
    });

  useEffect(() => {
    if (data?.message?.data?.delivery_notes) {
      const newList = data.message.data.delivery_notes;

      setDeliveryNotes(prev => {
        const sourceData = page === 1 ? newList : [...prev, ...newList];
        const map = new Map();
        sourceData.forEach(item => map.set(item.delivery_note_id, item));
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
  }, [isUninitialized, refetch]);

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

  const renderItem = ({item}: {item: IDistributorDeliveryNote}) => {
    const rawColor =
      item.workflow_state === 'Approved' || item.workflow_state === 'Submitted'
        ? '#16A34A'
        : item.workflow_state === 'Cancelled'
        ? '#DC2626'
        : '#D97706';

    const dateObj = new Date(item.posting_date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', {month: 'short'}).toUpperCase();
    const year = dateObj.getFullYear();

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate('DeliveryNoteDetailScreen', {
            id: item.delivery_note_id,
          });
        }}
        style={styles.orderCard}>
        {/* Card Header: Delivery Note ID & Status Pill */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.orderIdBadge}>
            <Truck size={12} color="#059669" />
            <Text style={styles.orderIdText}>{item.delivery_note_id}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: `${rawColor}18`,
                borderColor: `${rawColor}40`,
              },
            ]}>
            <View style={[styles.statusDot, {backgroundColor: rawColor}]} />
            <Text style={[styles.statusText, {color: rawColor}]}>
              {item.workflow_state}
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBodyRow}>
          {/* Date Box */}
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
                {item.distributor_name || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Card Footer */}
        <View style={styles.cardFooterRow}>
          <View style={styles.footerQtyWrap}>
            <Package size={11} color="#6B7280" />
            <Text style={styles.footerQtyText}>Qty: {item.delivered_qty ?? 0}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount: </Text>
            <Text style={styles.amountValue}>
              ₹{Number(item.grand_total || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}
            </Text>
            <ChevronRight size={14} color="#9CA3AF" style={{marginLeft: 2}} />
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
          {paddingHorizontal: 20, paddingTop: 10, paddingBottom: 70},
        ]}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.lightBg,
          }}>
          {isLoading && page === 1 ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : deliveryNotes.length === 0 ? (
            <View style={styles.centered}>
              <Text style={{fontSize: 16, color: 'gray'}}>
                No Delivery Note Found
              </Text>
            </View>
          ) : (
            <FlatList
              data={deliveryNotes}
              nestedScrollEnabled={true}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={renderItem}
              keyExtractor={(item, index) => item.delivery_note_id + index}
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

export default DeliveryNoteComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },
  bodyContent: {flex: 1},
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#1F2937',
    shadowOffset: {width: 0, height: 2},
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
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  orderIdText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: '#047857',
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
    backgroundColor: '#059669',
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
  footerQtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  footerQtyText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: '#4B5563',
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
  centered: {
    height: windowHeight * 0.5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
