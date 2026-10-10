import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import moment from 'moment';

import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {
  useCancelStockReceivedMutation,
  useCancelStockReturnMutation,
  useGetStockReceivedQuery,
  useGetStockReturnsQuery,
} from '../../../features/base/promoter-base-api';
import {
  getSafeServerMessage,
  getUserFacingError,
} from '../../../utils/errorMessage';

export type MovementType = 'receipt' | 'return';
type Filter = 'all' | MovementType;

const FILTERS: {value: Filter; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'receipt', label: 'Deliveries'},
  {value: 'return', label: 'Returns'},
];

type Props = {
  store?: string;
  defaultFilter?: Filter;
};

// Deliveries and returns in one list. Each row keeps its `type`, so the
// filter can show them merged or one kind at a time.
const StockMovementHistory = ({store, defaultFilter = 'all'}: Props) => {
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [refreshing, setRefreshing] = useState(false);

  const params = {store: store || undefined};
  const receivedQuery = useGetStockReceivedQuery(params);
  const returnsQuery = useGetStockReturnsQuery(params);
  const [cancelReceived, {isLoading: cancellingReceived}] =
    useCancelStockReceivedMutation();
  const [cancelReturn, {isLoading: cancellingReturn}] =
    useCancelStockReturnMutation();
  const cancelling = cancellingReceived || cancellingReturn;

  const entries = useMemo(() => {
    const tag = (list: any[] | undefined, type: MovementType) =>
      (list ?? []).map(entry => ({...entry, type: entry.type ?? type}));
    return [
      ...tag(receivedQuery.data?.message?.data?.entries, 'receipt'),
      ...tag(returnsQuery.data?.message?.data?.entries, 'return'),
    ].sort((a, b) =>
      `${b.posting_date} ${b.posting_time ?? ''}`.localeCompare(
        `${a.posting_date} ${a.posting_time ?? ''}`,
      ),
    );
  }, [receivedQuery.data, returnsQuery.data]);

  const visible =
    filter === 'all' ? entries : entries.filter(e => e.type === filter);

  const businessError = [receivedQuery.data, returnsQuery.data]
    .filter(res => res?.message?.success === false)
    .map(res => getSafeServerMessage(res?.message?.message))
    .filter(Boolean)
    .join('\n');

  const loading = receivedQuery.isFetching || returnsQuery.isFetching;

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([receivedQuery.refetch(), returnsQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  const doCancel = async (name: string, type: MovementType) => {
    const label = type === 'return' ? 'return' : 'delivery';
    try {
      const response =
        type === 'return'
          ? await cancelReturn({name}).unwrap()
          : await cancelReceived({name}).unwrap();
      if (!response?.message?.success) {
        Toast.show({
          type: 'error',
          text1:
            getSafeServerMessage(response?.message?.message) ??
            `Could not cancel ${label}`,
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: response.message.message || `Cancelled ${label}`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: getUserFacingError(error, `Could not cancel ${label}`),
      });
    }
  };

  const confirmCancel = (name: string, type: MovementType) =>
    type === 'return'
      ? Alert.alert(
          'Cancel return?',
          'The returned stock will be added back to the store. To correct a quantity, cancel and record it again.',
          [
            {text: 'Keep', style: 'cancel'},
            {
              text: 'Cancel return',
              style: 'destructive',
              onPress: () => doCancel(name, type),
            },
          ],
        )
      : Alert.alert(
          'Cancel delivery?',
          'The received stock will be removed. To correct a quantity, cancel and record it again.',
          [
            {text: 'Keep', style: 'cancel'},
            {
              text: 'Cancel delivery',
              style: 'destructive',
              onPress: () => doCancel(name, type),
            },
          ],
        );

  const emptyText =
    filter === 'receipt'
      ? 'No deliveries recorded for this store.'
      : filter === 'return'
      ? 'No returns recorded for this store.'
      : 'No deliveries or returns recorded for this store.';

  return (
    <View style={{flex: 1}}>
      <View style={styles.filterRow}>
        {FILTERS.map(({value, label}) => {
          const active = filter === value;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.filterChip, active && styles.filterActive]}
              onPress={() => setFilter(value)}>
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FlatList
        data={visible}
        keyExtractor={entry => `${entry.type}-${entry.name}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          businessError ? (
            <Text style={styles.errorText}>{businessError}</Text>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={Colors.orange} />
          ) : (
            <Text style={styles.empty}>{emptyText}</Text>
          )
        }
        renderItem={({item: entry}) => {
          const isReturn = entry.type === 'return';
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.titleRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        isReturn ? styles.returnBadge : styles.receiptBadge,
                      ]}>
                      <Text
                        style={[
                          styles.typeBadgeText,
                          isReturn
                            ? styles.returnBadgeText
                            : styles.receiptBadgeText,
                        ]}>
                        {isReturn ? 'Return' : 'Delivery'}
                      </Text>
                    </View>
                    <Text style={styles.storeName} numberOfLines={1}>
                      {entry.store_name || entry.store}
                    </Text>
                  </View>
                  <Text style={styles.meta}>
                    {moment(entry.posting_date).format('DD MMM YYYY')} ·{' '}
                    {entry.posting_time}
                    {isReturn && entry.reason ? ` · ${entry.reason}` : ''}
                  </Text>
                </View>
                {entry.can_cancel ? (
                  <TouchableOpacity
                    disabled={cancelling}
                    onPress={() => confirmCancel(entry.name, entry.type)}
                    style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {entry.items?.map((item: any) => (
                <View key={item.item_code} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.item_name || item.item_code}
                  </Text>
                  <Text style={isReturn ? styles.returnQty : styles.receiptQty}>
                    {isReturn ? '−' : '+'}
                    {item.qty}
                  </Text>
                </View>
              ))}
              <Text style={styles.reference}>
                {entry.name} · {entry.recorded_by}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.white,
  },
  filterActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  filterText: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: 11,
  },
  filterTextActive: {color: Colors.white},
  listContent: {padding: 12, paddingBottom: 40},
  loader: {marginTop: 40},
  empty: {
    textAlign: 'center',
    color: Colors.gray,
    fontFamily: Fonts.regular,
    marginTop: 40,
  },
  errorText: {
    marginBottom: 12,
    color: '#B91C1C',
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  headerLeft: {flex: 1},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  typeBadge: {borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2},
  receiptBadge: {backgroundColor: '#DCFCE7'},
  returnBadge: {backgroundColor: '#F1F3F5'},
  typeBadgeText: {fontFamily: Fonts.semiBold, fontSize: 10},
  receiptBadgeText: {color: '#15803D'},
  returnBadgeText: {color: '#4B5563'},
  storeName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 13,
  },
  meta: {
    fontFamily: Fonts.medium,
    color: '#111827',
    fontSize: 12,
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: '#FBE8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cancelText: {fontFamily: Fonts.semiBold, color: '#B91C1C', fontSize: 11},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  itemName: {
    flex: 1,
    color: Colors.darkButton,
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  receiptQty: {color: '#15803D', fontFamily: Fonts.semiBold},
  returnQty: {color: Colors.gray, fontFamily: Fonts.semiBold},
  reference: {
    color: Colors.gray,
    fontFamily: Fonts.regular,
    fontSize: 9,
    marginTop: 8,
  },
});

export default StockMovementHistory;
