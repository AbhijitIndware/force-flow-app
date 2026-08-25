/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { PurchaseOrder } from '../../../../types/baseType';
import { Fonts } from '../../../../constants';
import { Colors } from '../../../../utils/colors';
import { Size } from '../../../../utils/fontSize';
import { soStatusColors } from '../../../../utils/utils';
import {
  FileCheck,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
} from 'lucide-react-native';

const PurchaseComponent = ({
  item,
  navigation,
  selectedOrderId,
  setSelectedOrderId,
}: {
  item: PurchaseOrder;
  navigation: any;
  selectedOrderId: string | null;
  setSelectedOrderId: any;
}) => {
  const rawColor = soStatusColors[item.status] || '#4B5563';
  const dateObj = new Date(item.transaction_date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
  const year = dateObj.getFullYear();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        setSelectedOrderId(null);
        navigation.navigate('PurchaseDetailScreen', {
          id: item.order_id,
        });
      }}
      style={styles.orderCard}>
      {/* Card Header: PO ID & Status Pill */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.orderIdBadge}>
          <FileCheck size={12} color="#1D4ED8" />
          <Text style={styles.orderIdText}>{item.order_id}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: `${rawColor}18`,
              borderColor: `${rawColor}40`,
            },
          ]}>
          <View style={[styles.statusDot, { backgroundColor: rawColor }]} />
          <Text style={[styles.statusText, { color: rawColor }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBodyRow}>
        {/* Date Box */}
        <View style={styles.dateBox}>
          <View style={styles.dateHeader}>
            <Text style={styles.monthText}>{month}</Text>
          </View>
          <View style={styles.dateBody}>
            <Text style={styles.dayText}>{day}</Text>
          </View>
        </View>

        {/* Details Column */}
        <View style={styles.detailsContent}>
          <View style={styles.infoRow}>
            <Building2 size={13} color="#4B5563" />
            <Text style={styles.distributorNameText} numberOfLines={1} ellipsizeMode="tail">
              {item.distributor_name || 'N/A'}
            </Text>
          </View>

          {!!item.schedule_date && (
            <View style={styles.infoRow}>
              <Clock size={11} color="#9CA3AF" />
              <Text style={styles.scheduleText} numberOfLines={1}>
                Schedule: {item.schedule_date}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Card Footer */}
      <View style={styles.cardFooterRow}>
        <View style={styles.footerDateWrap}>
          <Calendar size={11} color="#9CA3AF" />
          <Text style={styles.footerDateText}>{`${day} ${month} ${year}`}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>PO Amount: </Text>
          <Text style={styles.amountValue}>
            ₹{Number(item.grand_total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </Text>
          <ChevronRight size={14} color="#9CA3AF" style={{ marginLeft: 2 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PurchaseComponent;

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  orderIdText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xxs,
    color: '#1E40AF',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBox: {
    width: 42,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
  },
  dateHeader: {
    width: '100%',
    backgroundColor: Colors.darkButton,
    paddingVertical: 1,
    alignItems: 'center',
  },
  monthText: {
    fontFamily: Fonts.bold,
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dateBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontFamily: Fonts.bold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  detailsContent: {
    flex: 1,
    gap: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  distributorNameText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
    flex: 1,
  },
  scheduleText: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#6B7280',
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  footerDateText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#9CA3AF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountLabel: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#6B7280',
  },
  amountValue: {
    fontFamily: Fonts.bold,
    fontSize: Size.xs,
    color: '#0F172A',
  },
});
