import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol} from '../../../utils/styles';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  User,
  CalendarDays,
  Store,
  Clock,
  MapPin,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'TeamDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// Placeholder Data based on User Request
const teamDetail = {
  name: 'Avi Sharma',
  date: '12-02-2026',
  total_store: 5,
  pending_store: 2,
};

const stores = [
  {id: 1, name: 'Store name 1', status: 'Visited'},
  {id: 2, name: 'Store name 2', status: 'Visited'},
  {id: 3, name: 'Store name 3', status: 'Visited'},
  {id: 4, name: 'Store name 4', status: 'Pending'},
  {id: 5, name: 'Store name 5', status: 'Pending'},
  {id: 6, name: 'Store name 6', status: 'Pending'},
  {id: 7, name: 'Store name 7', status: 'Pending'},
];

const TeamDetailScreen = ({navigation, route}: Props) => {
  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: '#F0F2F6',
        },
      ]}>
      <PageHeader
        title={'Team Detail'}
        navigation={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('DetailByUserScreen')}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AS</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{teamDetail.name}</Text>
              <View style={styles.dateRow}>
                <CalendarDays size={14} color="#828282" />
                <Text style={styles.dateText}>
                  Store visited: {teamDetail.date}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Metrics Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, {backgroundColor: '#E3ECFF'}]}>
              <Store size={22} color="#367CFF" strokeWidth={2} />
            </View>
            <Text style={[styles.metricValue, {color: '#367CFF'}]}>
              {teamDetail.total_store}
            </Text>
            <Text style={styles.metricLabel}>Total Store</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, {backgroundColor: '#FFE9D4'}]}>
              <Clock size={22} color="#FF7B00" strokeWidth={2} />
            </View>
            <Text style={[styles.metricValue, {color: '#FF7B00'}]}>
              {teamDetail.pending_store}
            </Text>
            <Text style={styles.metricLabel}>Pending Store</Text>
          </View>
        </View>

        {/* Store List */}
        <View style={styles.listHeaderRow}>
          <View style={styles.listIconBox}>
            <ListOrdered size={16} color="#FFB302" strokeWidth={2.5} />
          </View>
          <Text style={styles.listTitle}>Store List</Text>
        </View>

        {stores.map((store, index) => (
          <TouchableOpacity
            key={store.id}
            style={styles.storeCard}
            onPress={() => navigation.navigate('DetailByStoreScreen')}>
            <View style={styles.storeIconWrap}>
              <MapPin size={18} color="#FFB302" strokeWidth={2.5} />
            </View>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeSub}>ID: #{1000 + store.id}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                store.status === 'Visited'
                  ? {backgroundColor: '#E7F8EA', borderColor: '#0AB72A40'}
                  : {backgroundColor: '#FFE9D4', borderColor: '#FF7B0040'},
              ]}>
              {store.status === 'Visited' ? (
                <CheckCircle2
                  size={12}
                  color="#0AB72A"
                  style={{marginRight: 4}}
                />
              ) : (
                <Clock size={12} color="#FF7B00" style={{marginRight: 4}} />
              )}
              <Text
                style={[
                  styles.statusText,
                  store.status === 'Visited'
                    ? {color: '#0AB72A'}
                    : {color: '#FF7B00'},
                ]}>
                {store.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeamDetailScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFB302',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FF7B00',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Fonts.semiBold,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '700',
    fontFamily: Fonts.semiBold,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#4F4F4F',
    fontWeight: '500',
    fontFamily: Fonts.medium,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  metricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#828282',
    fontWeight: '600',
    fontFamily: Fonts.medium,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listIconBox: {
    backgroundColor: '#FFF8E1',
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  listTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
    fontFamily: Fonts.semiBold,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  storeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    marginBottom: 2,
  },
  storeSub: {
    fontSize: 11,
    color: '#828282',
    fontFamily: Fonts.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Fonts.semiBold,
  },
});
