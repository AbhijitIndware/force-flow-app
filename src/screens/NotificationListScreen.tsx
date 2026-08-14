/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import PageHeader from '../components/ui/PageHeader';
import {Colors} from '../utils/colors';
import {Fonts} from '../constants';
import {Size} from '../utils/fontSize';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {
  useGetNotificationListQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  NotificationItem as ApiNotificationItem,
} from '../features/fcm/fccm-api';
import {navigate} from '../utils/navigationRef';

function getRelativeTime(creation: string): string {
  const created = new Date(creation.replace(' ', 'T'));
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return creation.split(' ')[0];
}

function getIconForType(type: string): string {
  switch (type) {
    case 'late_checkin':
    case 'late_checkin_status':
      return 'clock';
    case 'expense_claim':
    case 'expense_claim_status':
      return 'dollar-sign';
    case 'leave_application':
    case 'leave_application_status':
      return 'calendar';
    default:
      return 'bell';
  }
}

function handleNotificationTap(item: ApiNotificationItem) {
  const {type, claim_id, request_id} = item.payload;
  switch (type) {
    case 'late_checkin':
      navigate('LateCheckinApprovalScreen');
      break;
    case 'late_checkin_status':
      navigate('NotificationListScreen');
      break;
    case 'expense_claim':
      navigate('ExpenseApprovalScreen');
      break;
    case 'expense_claim_status':
      navigate(claim_id ? 'ExpenseApprovalDetailScreen' : 'ExpenseScreen', claim_id ? {claimId: claim_id} : undefined);
      break;
    case 'leave_application':
    case 'leave_application_status':
      navigate('NotificationListScreen');
      break;
    default:
      navigate('NotificationListScreen');
  }
}

const PAGE_SIZE = 20;

const NotificationListScreen = () => {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<ApiNotificationItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {data, isFetching, refetch} = useGetNotificationListQuery({
    page,
    page_size: PAGE_SIZE,
  });

  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, {isLoading: isMarkingAll}] =
    useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (data?.message?.data) {
      if (page === 1) {
        setAllNotifications(data.message.data);
      } else {
        setAllNotifications(prev => [...prev, ...data.message.data]);
      }
      setHasMore(data.message.pagination?.has_more ?? false);
    }
  }, [data, page]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    const result = await refetch();
    if (result.data?.message?.data) {
      setAllNotifications(result.data.message.data);
      setHasMore(result.data.message.pagination?.has_more ?? false);
    }
    setRefreshing(false);
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, hasMore]);

  const onMarkAsRead = async (item: ApiNotificationItem) => {
    if (item.is_read === 1) {
      handleNotificationTap(item);
      return;
    }
    try {
      await markNotificationRead({notification_id: item.name}).unwrap();
      setAllNotifications(prev =>
        prev.map(n =>
          n.name === item.name ? {...n, is_read: 1} : n,
        ),
      );
    } catch {
      // silently fail
    }
    handleNotificationTap(item);
  };

  const onMarkAllAsRead = async () => {
    if (isMarkingAll) return;
    try {
      await markAllNotificationsRead().unwrap();
      setAllNotifications(prev =>
        prev.map(n => (n.is_read === 0 ? {...n, is_read: 1} : n)),
      );
    } catch {
      // silently fail
    }
  };

  const renderItem = ({item}: {item: ApiNotificationItem}) => {
    const isUnread = item.is_read === 0;
    const icon = getIconForType(item.payload?.type || '');
    const time = getRelativeTime(item.creation);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unread]}
        onPress={() => onMarkAsRead(item)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: isUnread ? '#EFF6FF' : '#F3F4F6'},
          ]}>
          <Feather
            name={icon}
            size={20}
            color={isUnread ? '#3B82F6' : Colors.gray}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                isUnread && styles.unreadTitle,
              ]}
              numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>{time}</Text>
          </View>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isFetching) return null;
    return (
      <View style={styles.emptyContainer}>
        <Feather name="bell-off" size={48} color={Colors.gray} />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptySubtitle}>
          You're all caught up! New notifications will appear here.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetching || allNotifications.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.Orangelight} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Notifications"
        navigation={() => navigation.goBack()}
      />
      {allNotifications.some(n => n.is_read === 0) ? (
        <View style={styles.markAllBar}>
          <Text style={styles.markAllInfo}>
            {allNotifications.filter(n => n.is_read === 0).length} unread
          </Text>
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={onMarkAllAsRead}
            activeOpacity={0.7}>
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Feather name="check-circle" size={16} color={Colors.white} />
            )}
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={allNotifications}
        keyExtractor={item => item.name}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          allNotifications.length === 0 ? styles.emptyList : styles.listContent
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.Orangelight]}
          />
        }
      />
    </SafeAreaView>
  );
};

export default NotificationListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  markAllBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  markAllInfo: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: '#6B7280',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.Orangelight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  markAllText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.white,
  },
  listContent: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unread: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: '#374151',
    flex: 1,
  },
  unreadTitle: {
    fontFamily: Fonts.semiBold,
    color: '#111827',
  },
  notificationTime: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  notificationBody: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: '#374151',
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
