import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { ClipboardPenLine, MapPinCheck } from 'lucide-react-native';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { flexCol } from '../../../utils/styles';

const { width } = Dimensions.get('window');

interface StatsOverviewProps {
  prodData: any;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ prodData }) => {
  return (
    <View style={styles.countBoxSection}>
      <View style={styles.countBox}>
        <View style={[flexCol]}>
          <Text style={styles.countBoxDay}>
            {prodData?.message?.counts?.total_stores ?? 0}
          </Text>
          <Text style={styles.countBoxTitle}>Total call</Text>
        </View>
        <View
          style={[
            styles.countBoxIcon,
            { backgroundColor: Colors.holdLight },
          ]}>
          <ClipboardPenLine strokeWidth={1.4} color={Colors.orange} />
        </View>
      </View>
      <View style={styles.countBox}>
        <View style={[flexCol]}>
          <Text style={styles.countBoxDay}>
            {prodData?.message?.counts?.status_counts?.Visited ?? 0}
          </Text>
          <Text style={styles.countBoxTitle}>Productive Call</Text>
        </View>
        <View
          style={[
            styles.countBoxIcon,
            { backgroundColor: Colors.lightSuccess },
          ]}>
          <MapPinCheck strokeWidth={1.4} color={Colors.success} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  countBoxSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBox: {
    backgroundColor: Colors.white,
    width: width * 0.44,
    borderRadius: 12,
    padding: 12,
    height: 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  countBoxIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
  },
  countBoxTitle: {
    fontFamily: Fonts.regular,
    color: Colors.black,
    fontSize: 14,
    marginTop: 2,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: 20,
  },
});
