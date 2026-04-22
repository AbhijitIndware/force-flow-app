/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {RDeliveryNoteDetails} from '../../../../types/baseType';
import {soStatusColors} from '../../../../utils/utils';
import {Colors} from '../../../../utils/colors';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';

type Props = {
  detail: RDeliveryNoteDetails['message']['data'];
  navigation: any;
  refetch: any;
};

const DeliveryNoteDetailComponent = ({detail, navigation, refetch}: Props) => {
  const {delivery_note, items, totals} = detail;
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
    }, 2000);
  }, [refetch]);

  const InfoRow = ({label, value}: {label: string; value: any}) => (
    <View style={styles.infoRow}>
      <Text style={styles.contentHeading}>{label}:</Text>
      <Text style={styles.contenttext}>{value ?? 'N/A'}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Delivery Note Details */}
      <View style={styles.card}>
        <View style={styles.cardInnerHeader}>
          <Text style={styles.title}>Delivery Note Details</Text>
        </View>
        <View style={{paddingHorizontal: 16}}>
          <InfoRow label="DDN ID" value={delivery_note.delivery_note_id} />
          <InfoRow label="Distributor" value={delivery_note.distributor_name} />
          <InfoRow label="Store" value={delivery_note.store_name} />
          <InfoRow label="Posting Date" value={delivery_note.posting_date} />
          <InfoRow label="Invoice No" value={delivery_note.invoice_no} />
          <InfoRow label="Warehouse" value={delivery_note.store_warehouse} />
          <InfoRow label="Purchase Order" value={delivery_note.purchase_order} />

          <View
            style={{
              backgroundColor: `${soStatusColors[delivery_note.status]}40` || '#E5E7EB40',
              padding: 8,
              borderRadius: 6,
              alignItems: 'center',
              marginVertical: 12,
            }}>
            <Text
              style={{
                color: soStatusColors[delivery_note.status] || '#6B7280',
                fontSize: 16,
                fontFamily: Fonts.semiBold,
              }}>
              {delivery_note.status} ({delivery_note.workflow_state})
            </Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 1}}><InfoRow label="Ordered Qty" value={delivery_note.ordered_qty} /></View>
            <View style={{flex: 1}}><InfoRow label="Delivered Qty" value={delivery_note.delivered_qty} /></View>
          </View>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.card}>
        <View style={styles.cardInnerHeader}>
          <Text style={styles.title}>Items ({delivery_note.item_count})</Text>
        </View>
        <FlatList
          data={items}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.item_code}-${index}`}
          renderItem={({item}) => (
            <View style={styles.itemRow}>
              <Text style={[styles.contentHeading, {fontSize: Size.xsmd, paddingHorizontal: 16, color: Colors.primary}]}>
                {item.item_name}
              </Text>
              <View style={{paddingHorizontal: 16, marginTop: 4}}>
                <InfoRow label="Item Code" value={item.item_code} />
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flex: 1}}><InfoRow label="Qty" value={item.qty} /></View>
                    <View style={{flex: 1}}><InfoRow label="Rate" value={item.rate} /></View>
                </View>
                <InfoRow label="Amount" value={item.amount} />
                <InfoRow label="Warehouse" value={item.warehouse} />
              </View>
              <View style={styles.divider} />
            </View>
          )}
        />
      </View>

      {/* Totals */}
      <View style={[styles.card, {marginBottom: 40}]}>
        <View style={styles.cardInnerHeader}>
          <Text style={styles.title}>Totals</Text>
        </View>
        <View style={{paddingHorizontal: 16}}>
          <InfoRow label="Total" value={totals?.total} />
          <InfoRow label="Taxes" value={totals?.taxes_and_charges} />
          <InfoRow label="Grand Total" value={totals?.grand_total} />
        </View>
      </View>
    </ScrollView>
  );
};

export default DeliveryNoteDetailComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  card: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    marginBottom: 12,
    borderRadius: 16,
  },
  cardInnerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: 15,
    paddingBottom: 8,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  contentHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  contenttext: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  itemRow: {
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: 10,
    marginHorizontal: 16,
  },
});
