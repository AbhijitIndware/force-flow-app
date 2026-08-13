/* eslint-disable react-native/no-inline-styles */
import {ActivityIndicator, StyleSheet, Text, View, ScrollView, FlatList} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {SafeAreaView} from 'react-native';
import {Colors} from '../../../utils/colors';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import {useGetSalesOrderDetailsQuery} from '../../../features/base/promoter-base-api';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'PromoterSaleDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const Row = ({label, value}: {label: string; value: any}) => (
  <View style={styles.row}>
    <Text style={styles.contentHeading}>{label}</Text>
    <Text style={styles.contentText}>{value}</Text>
  </View>
);

const PromoterSaleDetailScreen = ({navigation, route}: Props) => {
  const {id} = route.params;
  const {data, isFetching, refetch} = useGetSalesOrderDetailsQuery(
    {order_id: id},
    {
      skip: !id,
    },
  );

  const orderData = data?.message?.data;
  const orderDetails = orderData?.order_details;
  const items = orderData?.items || [];
  const totals = orderData?.totals;

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Sales Order Detail"
        navigation={() => navigation.goBack()}
      />
      {isFetching ? (
        <LoadingScreen />
      ) : (
        <ScrollView style={styles.container}>
          {/* Order Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Order Details</Text>
              <View style={[styles.statusBadge, {backgroundColor: orderDetails?.workflow_state === 'Approved' ? Colors.lightSuccess : Colors.lightBlue}]}>
                <Text style={{color: orderDetails?.workflow_state === 'Approved' ? Colors.sucess : Colors.blue, fontFamily: Fonts.semiBold, fontSize: Size.xs}}>
                  {orderDetails?.workflow_state}
                </Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Row label="Order ID" value={orderDetails?.order_id} />
              <Row label="Store" value={orderDetails?.store_name} />
              <Row label="Transaction Date" value={orderDetails?.transaction_date} />
              <Row label="Delivery Date" value={orderDetails?.delivery_date} />
              <Row label="Status" value={orderDetails?.status} />
              <Row label="Grand Total" value={`₹${orderDetails?.grand_total?.toLocaleString('en-IN')}`} />
            </View>
          </View>

          {/* Items */}
          <View style={styles.card}>
            <Text style={styles.title}>Items</Text>
            <FlatList
              data={items}
              scrollEnabled={false}
              keyExtractor={(item, index) => `${item.item_code}-${index}`}
              renderItem={({item}) => (
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>{item.item_name}</Text>
                  <View style={styles.cardBody}>
                    <Row label="Quantity" value={item.qty} />
                    <Row label="Rate" value={`₹${item.rate}`} />
                    <Row label="Amount" value={`₹${item.amount}`} />
                  </View>
                </View>
              )}
            />
          </View>

          {/* Totals */}
          <View style={styles.card}>
            <Text style={styles.title}>Totals</Text>
            <View style={styles.cardBody}>
              <Row label="Total" value={`₹${totals?.total?.toLocaleString('en-IN')}`} />
              <Row label="Grand Total" value={`₹${totals?.grand_total?.toLocaleString('en-IN')}`} />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PromoterSaleDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardBody: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contentHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  contentText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  itemRow: {
    marginBottom: 10,
  },
  itemTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
});
