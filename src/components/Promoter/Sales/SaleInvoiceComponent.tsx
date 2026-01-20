/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';

import {useSubmitSalesInvoiceMutation} from '../../../features/base/promoter-base-api';
import {soStatusColors} from '../../../utils/utils';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {Colors} from '../../../utils/colors';
import {InvoiceData} from '../../../types/baseType';

type Props = {
  detail: InvoiceData;
  navigation: any;
  refetch: () => void;
};

const formatCurrency = (currency: string, amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const SaleInvoiceComponent = ({detail, refetch}: Props) => {
  const {invoice_details, items, totals} = detail;

  const [refreshing, setRefreshing] = useState(false);
  const [submitSalesInvoice, {isLoading}] = useSubmitSalesInvoiceMutation();

  const handleSubmitInvoice = async () => {
    try {
      const res = await submitSalesInvoice({
        invoice_id: invoice_details.invoice_id,
      }).unwrap();

      if (res?.message.success) {
        Toast.show({
          type: 'success',
          text1: 'Invoice submitted successfully',
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: res?._error_message || 'Failed to submit invoice',
          position: 'top',
        });
      }

      refetch();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.data?.message || 'Failed to submit invoice',
        position: 'top',
      });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
    }, 1500);
  }, [refetch]);

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* ================= Invoice Details ================= */}
      <View style={styles.card}>
        <CardHeader title="Invoice Details" status={invoice_details.status} />

        <View style={styles.cardBody}>
          <Row label="Invoice ID" value={invoice_details.invoice_id} />
          <Row label="Company" value={invoice_details.company} />
          <Row label="Currency" value={invoice_details.currency} />
          <Row label="Posting Date" value={invoice_details.posting_date} />
          <Row label="Due Date" value={invoice_details.due_date} />
          {/* <Row
            label="Selling Price List"
            value={invoice_details.selling_price_list}
          /> */}
        </View>
      </View>

      {/* ================= Items ================= */}
      <View style={styles.card}>
        <CardHeader title="Items" />

        <FlatList
          data={items}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.item_code}-${index}`}
          renderItem={({item}) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemTitle}>{item.item_name}</Text>

              <View style={styles.cardBody}>
                <Row label="Quantity" value={item.qty} />
                <Row
                  label="Rate"
                  value={formatCurrency(invoice_details.currency, item.rate)}
                />
                <Row
                  label="Discount"
                  value={formatCurrency(
                    invoice_details.currency,
                    item.discount_amount,
                  )}
                />
                <Row
                  label="Amount"
                  value={formatCurrency(invoice_details.currency, item.amount)}
                />

                {/* <Row label="UOM" value={item.uom} /> */}
                <Row label="Warehouse" value={item.warehouse} />
              </View>
            </View>
          )}
        />
      </View>

      {/* ================= Totals ================= */}
      <View style={styles.card}>
        <CardHeader title="Totals" />

        <View style={styles.cardBody}>
          <Row label="Total Quantity" value={totals.total_qty} />
          <Row label="Total" value={totals.total} />
          <Row label="Net Total" value={totals.net_total} />
          <Row label="Taxes" value={totals.total_taxes_and_charges} />
          <Row label="Grand Total" value={totals.grand_total} />
          {/* <Row label="Rounded Total" value={totals.rounded_total} />
          <Row label="Outstanding" value={totals.outstanding_amount} /> */}
        </View>
      </View>

      {/* ================= Action ================= */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (isLoading || invoice_details.docstatus !== 0) && {
              opacity: 0.6,
            },
          ]}
          disabled={isLoading || invoice_details.docstatus !== 0}
          onPress={handleSubmitInvoice}>
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Submit Invoice</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SaleInvoiceComponent;

/* ================= Reusable Components ================= */

const CardHeader = ({title, status}: {title: string; status?: string}) => (
  <View style={styles.cardInnerHeaderRow}>
    <Text style={styles.title}>{title}</Text>

    {status && (
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: `${soStatusColors[status]}40`,
          },
        ]}>
        <Text
          style={{
            color: soStatusColors[status],
            fontFamily: Fonts.semiBold,
            fontSize: Size.xs,
          }}>
          {status}
        </Text>
      </View>
    )}
  </View>
);

const Row = ({label, value}: {label: string; value: any}) => (
  <View style={styles.row}>
    <Text style={styles.contentHeading}>{label}</Text>
    <Text style={styles.contentText}>{value}</Text>
  </View>
);

/* ================= Styles ================= */

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

  cardInnerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: 15,
    paddingBottom: 8,
    marginBottom: 8,
  },

  cardBody: {
    paddingHorizontal: 16,
  },

  title: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
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
    marginTop: 10,
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

  buttonContainer: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  submitBtn: {
    backgroundColor: Colors.green,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
  },

  submitText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.white,
  },
  cardInnerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
});
