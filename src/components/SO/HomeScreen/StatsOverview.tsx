import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ClipboardPenLine, MapPinCheck, ShoppingCart } from 'lucide-react-native';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { RProdCount } from '../../../types/baseType';

interface StatsOverviewProps {
  prodData: RProdCount | undefined;
}

/**
 * Today's call counts from get_prod_counts:
 *  - Total Calls: stores in today's PJP plus any visited outside it
 *  - Visited Calls: stores checked in today
 *  - Productive Calls: checked-in stores with an order booked today
 * status_counts.Visited is left on the server for older APKs; don't read it.
 */
export const StatsOverview: React.FC<StatsOverviewProps> = ({ prodData }) => {
  const counts = prodData?.message?.counts;
  const cards = [
    {
      key: 'total',
      label: 'Total Calls',
      value: counts?.total_stores ?? 0,
      icon: <ClipboardPenLine size={18} strokeWidth={1.4} color={Colors.orange} />,
      iconBg: Colors.holdLight,
    },
    {
      key: 'visited',
      label: 'Visited Calls',
      value: counts?.visited_calls ?? 0,
      icon: <MapPinCheck size={18} strokeWidth={1.4} color={Colors.success} />,
      iconBg: Colors.lightSuccess,
    },
    {
      key: 'productive',
      label: 'Productive Calls',
      value: counts?.productive_calls ?? 0,
      icon: <ShoppingCart size={18} strokeWidth={1.4} color={Colors.success} />,
      iconBg: Colors.lightSuccess,
    },
  ];

  return (
    <View style={styles.countBoxSection}>
      {cards.map(card => (
        <View key={card.key} style={styles.countBox}>
          <View style={styles.topRow}>
            <Text style={styles.countBoxDay}>{card.value}</Text>
            <View style={[styles.countBoxIcon, { backgroundColor: card.iconBg }]}>
              {card.icon}
            </View>
          </View>
          <Text style={styles.countBoxTitle} numberOfLines={1} adjustsFontSizeToFit>
            {card.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  countBoxSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    height: 80,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  countBoxIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 8,
  },
  countBoxTitle: {
    fontFamily: Fonts.regular,
    color: Colors.black,
    fontSize: 12,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 20,
  },
});
