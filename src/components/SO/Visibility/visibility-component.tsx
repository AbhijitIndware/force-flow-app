import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {useGetVisibiltyClaimListQuery} from '../../../features/base/base-api';

const {width} = Dimensions.get('window');

const VisibilityComponent = ({navigation}: any) => {
  const {data, isLoading, isFetching} = useGetVisibiltyClaimListQuery();

  const claimList = data?.message?.data?.visibility_claims || [];

  const renderItem = ({item}: any) => {
    return (
      <TouchableOpacity
        style={styles.dataBox}
        onPress={() =>
          navigation.navigate('VisibilityClaimDetails', {
            claimId: item.claim_id,
          })
        }>
        <View style={{flex: 1}}>
          <Text style={styles.quantityCount}>Store : {item.store}</Text>

          <Text style={styles.quantitytime}>
            Date : {moment(item.date).format('DD MMM YYYY')}
          </Text>

          <Text style={styles.quantitytime}>Payment : {item.payment_type}</Text>

          <Text style={styles.quantitytime}>
            Status :{' '}
            {item.docstatus === 0
              ? 'Draft'
              : item.docstatus === 1
              ? 'Submitted'
              : 'Cancelled'}
          </Text>
        </View>

        <View style={styles.positionValue}>
          <Text style={styles.incressValu}>₹ {item.collection_amount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CTA BUTTON */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddVisibilityScreen')}
        style={styles.claimButton}>
        <View style={styles.iconCircle}>
          <Ionicons name="add" size={22} color={Colors.darkButton} />
        </View>

        <Text style={styles.claimButtonText}>Claim a Visibility</Text>

        {/* <Ionicons name="chevron-forward" size={22} color={Colors.white} /> */}
      </TouchableOpacity>

      {/* LOADER */}
      {isLoading || isFetching ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={Colors.darkButton} />
        </View>
      ) : (
        <FlatList
          data={claimList || []}
          keyExtractor={item => item.claim_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.dataBoxSection}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No visibility claims found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default VisibilityComponent;

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

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },

  checkinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    gap: 6,
    marginVertical: 15,
  },

  checkinButtonText: {
    fontFamily: Fonts.regular,
    fontSize: Size.md,
    color: Colors.white,
  },

  dataBoxSection: {
    paddingBottom: 20,
  },

  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  quantityCount: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },

  quantitytime: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
    lineHeight: 18,
  },

  positionValue: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  incressValu: {
    color: Colors.sucess,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 10,
    marginVertical: 16,
    elevation: 4, // Android
    shadowColor: '#000', // iOS
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },

  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  claimButtonText: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
});
