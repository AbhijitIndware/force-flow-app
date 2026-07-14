/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import PageHeader from '../components/ui/PageHeader';
import {Colors} from '../utils/colors';
import {Fonts} from '../constants';
import {Size} from '../utils/fontSize';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'PJP Reminder',
    body: 'You have a planned journey plan for today. Please check your schedule.',
    time: '2 min ago',
    read: false,
    icon: 'calendar',
  },
  {
    id: '2',
    title: 'Activity Check-In',
    body: 'Your check-in at Delhi HQ was successful.',
    time: '1 hour ago',
    read: false,
    icon: 'map-pin',
  },
  {
    id: '3',
    title: 'Store Visit Completed',
    body: 'You have completed 5 store visits today.',
    time: '3 hours ago',
    read: true,
    icon: 'check-circle',
  },
];

const NotificationListScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Future: fetch from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? {...n, read: true} : n)),
    );
  };

  const renderItem = ({item}: {item: NotificationItem}) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unread]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: item.read ? '#F3F4F6' : '#EFF6FF'},
        ]}>
        <Feather
          name={item.icon}
          size={20}
          color={item.read ? Colors.gray : '#3B82F6'}
        />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationTitle,
              !item.read && styles.unreadTitle,
            ]}
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={48} color={Colors.gray} />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Notifications"
        navigation={() => navigation.goBack()}
      />
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : styles.listContent
        }
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
});
