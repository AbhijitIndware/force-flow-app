/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Funnel, Search } from 'lucide-react-native';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { Colors } from '../../../../utils/colors';
import { useGetDeliveryNotesListQuery } from '../../../../features/base/base-api';
import { useCallback, useEffect, useState } from 'react';
import { IDistributorDeliveryNote } from '../../../../types/baseType';
import { FlatList } from 'react-native';
import { soStatusColors, windowHeight } from '../../../../utils/utils';
import { TouchableOpacity } from 'react-native';
import { flexRow } from '../../../../utils/styles';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 10;

const DeliveryNoteComponent = ({ navigation }: any) => {
  const [page, setPage] = useState<number>(1);
  const [deliveryNotes, setDeliveryNotes] = useState<IDistributorDeliveryNote[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { data, isLoading, isFetching, refetch, isUninitialized } =
    useGetDeliveryNotesListQuery({
      page,
      page_size: PAGE_SIZE,
    });

  useEffect(() => {
    if (data?.message?.data?.delivery_notes) {
      const newList = data.message.data.delivery_notes;

      setDeliveryNotes(prev => {
        if (page === 1) {
          const map = new Map();
          newList.forEach(item => map.set(item.delivery_note_id, item));
          return Array.from(map.values());
        }

        const map = new Map();
        [...prev, ...newList].forEach(item => map.set(item.delivery_note_id, item));
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

  const renderItem = ({ item }: { item: IDistributorDeliveryNote }) => (
    <View style={styles.atteddanceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.timeSection}>
          <Text style={styles.time} numberOfLines={1}>DDN ID: {item.delivery_note_id}</Text>
        </View>
        <View
          style={[
            flexRow,
            {
              gap: 0,
              position: 'relative',
              width: '50%',
              maxWidth: 190,
              justifyContent: 'flex-end',
            },
          ]}>
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
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('DeliveryNoteDetailScreen', {
            id: item.delivery_note_id,
          });
        }}
        style={styles.cardbody}>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>
            {new Date(item.posting_date).getDate()}
          </Text>
          <Text style={styles.monthText}>
            {new Date(item.posting_date).toLocaleString('default', {
              month: 'short',
            })}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contentText} numberOfLines={1}>Store: {item.store_name}</Text>
          <Text style={styles.contentText} numberOfLines={1}>Distributor: {item.distributor_name}</Text>
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: Size.xs,
              color: Colors.darkButton,
              marginTop: 4
            }}>
            Amount: ₹{item.grand_total} | Qty: {item.delivered_qty}
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
          { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 70 },
        ]}>
        {/* <View style={styles.bodyHeader}>
          <Text style={styles.bodyHeaderTitle}>Recent Delivery Notes</Text>
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
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : deliveryNotes.length === 0 ? (
            <View style={styles.centered}>
              <Text style={{ fontSize: 16, color: 'gray' }}>
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
    gap: 10,
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '50%',
    maxWidth: 175,
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
    maxWidth: 130,
    textAlign: 'center',
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
  centered: {
    height: windowHeight * 0.5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
