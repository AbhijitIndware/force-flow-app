import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import { SoAppStackParamList } from '../../../types/Navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import PageHeader from '../../../components/ui/PageHeader';
import { User, Store, ShoppingCart, IndianRupee, Activity, Truck, CalendarClock } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'DetailByUserScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// Colors palette matching the app
const C = {
  surface: '#FFFFFF',
  text: Colors.darkButton || '#1A1A1A',
  textSub: '#4F4F4F',
  textMuted: '#828282',
  border: '#E0E0E0',
  accent: Colors.orange || '#FF7B00',
  accentSoft: '#FFE9D4',
  green: Colors.sucess || '#0AB72A',
  greenSoft: '#E7F8EA',
  purple: Colors.blue || '#367CFF',
  purpleSoft: '#E3ECFF',
  amber: '#FFB302',
};

const DetailRow = ({ icon: Icon, label, value, valueColor, bgColor, iconColor }: any) => (
  <View style={styles.row}>
    <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
      <Icon size={20} color={iconColor} strokeWidth={2} />
    </View>
    <View style={styles.rowRight}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor || C.text }]}>{value}</Text>
    </View>
  </View>
);

const DetailByUserScreen = ({ navigation, route }: Props) => {
  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg || '#F0F2F6',
        },
      ]}>
      <PageHeader title={'Detail By User'} navigation={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          <DetailRow 
            icon={User} 
            label="User Name" 
            value="Avi Sharma" 
            iconColor={C.purple}
            bgColor={C.purpleSoft}
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon={Store} 
            label="Store Name" 
            value="Adyant Ayurveda Outlet" 
            iconColor={C.accent}
            bgColor={C.accentSoft}
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon={ShoppingCart} 
            label="Sales Order" 
            value="SO-2026-0034" 
            iconColor={C.amber}
            bgColor={'#FFF8E1'}
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon={IndianRupee} 
            label="Sales Order Amount" 
            value="₹ 15,400.00" 
            iconColor={C.green}
            bgColor={C.greenSoft}
            valueColor={C.green}
          />
          <View style={styles.divider} />
          
          {/* Order Status conditionally styled */}
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: C.purpleSoft }]}>
              <Activity size={20} color={C.purple} strokeWidth={2} />
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.label}>Order Status</Text>
              <View style={[styles.pill, { backgroundColor: C.greenSoft, borderColor: `${C.green}40` }]}>
                <Text style={[styles.pillText, { color: C.green }]}>Approved</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Delivery section */}
          <DetailRow 
            icon={Truck} 
            label="To Deliver" 
            value="Yes - 2 Items" 
            iconColor={C.accent}
            bgColor={C.accentSoft}
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon={CalendarClock} 
            label="Will Deliver By" 
            value="Tomorrow, 2:00 PM" 
            iconColor={C.purple}
            bgColor={C.purpleSoft}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailByUserScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F6',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowRight: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: Size.xs || 13,
    color: '#828282',
    fontFamily: Fonts.medium,
    marginBottom: 4,
  },
  value: {
    fontSize: Size.sm || 15,
    fontFamily: Fonts.semiBold,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  pillText: {
    fontSize: Size.xs || 11,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
