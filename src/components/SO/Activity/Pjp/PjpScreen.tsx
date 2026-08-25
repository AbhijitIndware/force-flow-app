/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { CalendarDays, X } from 'lucide-react-native';
import { useGetDailyPjpListQuery } from '../../../../features/base/base-api';
import { useCallback, useEffect, useState } from 'react';
import { PjpDailyStore } from '../../../../types/baseType';
import { FlatList } from 'react-native';
import { RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { windowHeight } from '../../../../utils/utils';
import moment from 'moment';
import AssignEmployeeModal from './AssignEmployeeModal';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 10;

const PJPScreen = ({ navigation }: any) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<PjpDailyStore[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);

  // Date filter state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data, isLoading, isFetching, refetch, isUninitialized } =
    useGetDailyPjpListQuery({
      page,
      page_size: PAGE_SIZE,
      status: '',
      ...(selectedDate ? { date: selectedDate } : {}),
    });

  // Reset to page 1 when date filter changes
  useEffect(() => {
    setPage(1);
    setOrders([]);
  }, [selectedDate]);

  // Append new data when page changes
  useEffect(() => {
    const newData = data?.message?.data?.pjp_daily_stores;
    const pagination = data?.message?.data?.pagination;

    if (!newData) return;

    setOrders(prev => {
      if (pagination?.page === 1) {
        return newData;
      }
      const map = new Map();
      [...prev, ...newData].forEach(item => {
        map.set(item.pjp_daily_store_id, item);
      });
      return Array.from(map.values());
    });
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

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(moment(date).format('YYYY-MM-DD'));
    }
  };

  const clearDateFilter = () => {
    setSelectedDate('');
  };

  const renderItem = ({ item }: { item: PjpDailyStore }) => (
    <View style={styles.atteddanceCard}>
      <TouchableOpacity
        onPress={() => {
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
        <View style={{ flex: 1.5, paddingLeft: 10 }}>
          <Text style={styles.contentText}>Emp name</Text>
          <Text
            style={[
              styles.contentText,
              {
                fontFamily: Fonts.semiBold,
                fontSize: Size.sm,
                color: Colors.darkButton,
              },
            ]}>
            {item?.employee_name}
          </Text>
        </View>
        {/* Assign Button */}
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => setAssignModalVisible(true)}>
          <Text style={styles.assignButtonText}>Assign</Text>
        </TouchableOpacity>

        {/* Assign Modal */}
        <AssignEmployeeModal
          visible={assignModalVisible}
          onClose={() => setAssignModalVisible(false)}
          sourcePjp={item?.pjp_daily_store_id}
          date={item?.date}
        />
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
          { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 70 },
        ]}>

        {/* ── Date Filter Bar ── */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[
              styles.dateChip,
              selectedDate ? styles.dateChipActive : undefined,
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}>
            <CalendarDays
              size={14}
              color={selectedDate ? Colors.darkButton : '#6B7280'}
            />
            <Text
              style={[
                styles.dateChipText,
                selectedDate ? styles.dateChipTextActive : undefined,
              ]}>
              {selectedDate
                ? moment(selectedDate).format('DD MMM YYYY')
                : 'Filter by date'}
            </Text>
          </TouchableOpacity>

          {selectedDate ? (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={clearDateFilter}
              activeOpacity={0.7}>
              <X size={13} color="#6B7280" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Native Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate ? new Date(selectedDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={{ flex: 1, backgroundColor: Colors.lightBg }}>
          {isLoading && page === 1 ? (
            <View
              style={{
                height: windowHeight * 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" />
            </View>
          ) : orders.length === 0 ? (
            <View
              style={{
                height: windowHeight * 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 16, color: 'gray' }}>
                {selectedDate
                  ? `No PJP found for ${moment(selectedDate).format('DD MMM YYYY')}`
                  : 'No PJP Found'}
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
      </View>
    </View>
  );
};

export default PJPScreen;

const styles = StyleSheet.create({
  bodyContent: { flex: 1 },

  // ── Date filter bar
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  dateChipActive: {
    borderColor: Colors.darkButton,
    backgroundColor: '#F8FAFC',
  },
  dateChipText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#6B7280',
  },
  dateChipTextActive: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  clearBtnText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#6B7280',
  },

  // ── Card
  atteddanceCard: {
    flexDirection: 'column',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardbody: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },
  dateBox: {
    width: 44,
    height: 44,
    borderColor: Colors.darkButton,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.transparent,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
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
  assignButton: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  assignButtonText: {
    color: Colors.black,
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
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
});
