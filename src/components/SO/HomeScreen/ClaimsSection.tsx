import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BanknoteArrowDown, CheckCircle2, Eye } from 'lucide-react-native';
import { Divider } from '@rneui/themed';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';

interface ClaimsSectionProps {
  navigation: any;
}

export const ClaimsSection: React.FC<ClaimsSectionProps> = ({ navigation }) => {
  return (
    <View style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
      <Text
        style={[
          styles.SectionHeading,
          { marginBottom: 10, paddingHorizontal: 20 },
        ]}>
        Claims
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('ExpenseScreen', { index: 0 })}
        style={styles.IconlinkBox}>
        <View
          style={[
            styles.iconbox,
            {
              width: 35,
              height: 35,
              borderRadius: 10,
              backgroundColor: Colors.darkButton,
            },
          ]}>
          <BanknoteArrowDown
            strokeWidth={2}
            color={Colors.white}
            size={20}
          />
        </View>
        <Text style={styles.linkTitle}>Expense Claim</Text>
        <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
          <Ionicons
            name="chevron-forward-outline"
            size={12}
            color={Colors.darkButton}
          />
        </View>
      </TouchableOpacity>
      <Divider
        width={1}
        color={Colors.lightGray}
        style={{ marginBottom: 10, borderStyle: 'dashed' }}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('ExpenseScreen', { index: 1 })}
        style={styles.IconlinkBox}>
        <View
          style={[
            styles.iconbox,
            {
              width: 35,
              height: 35,
              borderRadius: 10,
              backgroundColor: Colors.darkButton,
            },
          ]}>
          <Eye strokeWidth={2} color={Colors.white} size={20} />
        </View>
        <Text style={styles.linkTitle}>Visibility Claim</Text>
        <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
          <Ionicons
            name="chevron-forward-outline"
            size={12}
            color={Colors.darkButton}
          />
        </View>
      </TouchableOpacity>
      <Divider
        width={1}
        color={Colors.lightGray}
        style={{ marginBottom: 10, borderStyle: 'dashed' }}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('ExpenseApprovalScreen', { index: 0 })}
        style={styles.IconlinkBox}>
        <View
          style={[
            styles.iconbox,
            {
              width: 35,
              height: 35,
              borderRadius: 10,
              backgroundColor: '#F59E0B',
            },
          ]}>
          <CheckCircle2 strokeWidth={2} color={Colors.white} size={20} />
        </View>
        <Text style={styles.linkTitle}>Expense - Approval</Text>
        <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
          <Ionicons
            name="chevron-forward-outline"
            size={12}
            color={Colors.darkButton}
          />
        </View>
      </TouchableOpacity>
      {/* <Divider
        width={1}
        color={Colors.lightGray}
        style={{ marginBottom: 10, borderStyle: 'dashed' }}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('ExpenseApprovalScreen', { index: 1 })}
        style={styles.IconlinkBox}>
        <View
          style={[
            styles.iconbox,
            {
              width: 35,
              height: 35,
              borderRadius: 10,
              backgroundColor: '#F59E0B',
            },
          ]}>
          <CheckCircle2 strokeWidth={2} color={Colors.white} size={20} />
        </View>
        <Text style={styles.linkTitle}>Visibility - Approval</Text>
        <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
          <Ionicons
            name="chevron-forward-outline"
            size={12}
            color={Colors.darkButton}
          />
        </View>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  LinkSection: { backgroundColor: Colors.white },
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  IconlinkBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  iconbox: {
    width: 60,
    height: 60,
    backgroundColor: Colors.sucess,
    borderRadius: 18,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTitle: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
  },
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
});
