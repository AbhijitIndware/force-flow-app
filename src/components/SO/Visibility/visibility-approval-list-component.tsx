import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { useGetMyVisibilityClaimsQuery } from '../../../features/tada/tadaApiv2';

const { width } = Dimensions.get('window');

const VisibilityApprovalListComponent = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, isFetching, refetch } = useGetMyVisibilityClaimsQuery({
    view: 'manager',
  });
  console.log("🚀 ~ VisibilityApprovalListComponent ~ data:", data)

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const claimList = data?.message?.data?.visibility_claims || [];
  const pendingClaims = claimList.filter(
    (item: any) => item.docstatus === 1 && item.approval_status === 'Submitted',
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return '#F59E0B';
      case 'Approved':
        return '#10B981';
      case 'Rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={styles.dataBox}
        onPress={() =>
          navigation.navigate('VisibilityApprovalDetailScreen', {
            claimId: item.claim_id,
          })
        }>
        <View style={{ flex: 1 }}>
          <Text style={styles.quantityCount}>Store : {item.store}</Text>

          <Text style={styles.quantitytime}>
            Employee : {item.employee_name}
          </Text>

          <Text style={styles.quantitytime}>
            Date : {moment(item.date).format('DD MMM YYYY')}
          </Text>

          <Text style={styles.quantitytime}>Payment : {item.payment_type}</Text>

          <View style={styles.statusBadge}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.approval_status) },
              ]}>
              {item.approval_status}
            </Text>
          </View>
        </View>

        <View style={styles.positionValue}>
          <Text style={styles.incressValu}>₹ {item.collection_amount}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.darkButton}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* LOADER */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={Colors.darkButton} />
        </View>
      ) : (
        <FlatList
          data={pendingClaims || []}
          keyExtractor={item => item.claim_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.dataBoxSection}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={60}
                color="#94A3B8"
              />
              <Text style={styles.emptyStateTitle}>No Pending Claims</Text>
              <Text style={styles.emptyStateSub}>
                All visibility claims have been reviewed. Check back later for
                new claims to approve.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default VisibilityApprovalListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    paddingHorizontal: 15,
  },

  loaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dataBoxSection: {
    paddingVertical: 10,
  },

  dataBox: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  quantityCount: {
    fontFamily: Fonts.bold,
    fontSize: Size.xs,
    color: Colors.darkButton,
    marginBottom: 6,
  },

  quantitytime: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#64748B',
    marginBottom: 4,
    lineHeight: 18,
  },

  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
  },

  positionValue: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  incressValu: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    marginBottom: 4,
  },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyStateTitle: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateSub: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
