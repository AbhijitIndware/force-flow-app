import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import PageHeader from '../../../components/ui/PageHeader';
import { Store, ShoppingCart, Activity, IndianRupee, Clock, CheckCircle } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'DetailByStoreScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const DURATION_OPTIONS = [
  { label: 'Last week', value: 'A' },
  { label: 'Last month', value: 'B' },
  { label: 'Last six months', value: 'C' },
];

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
  amberSoft: '#FFF8E1',
  red: Colors.denger || '#D31010',
  redSoft: Colors.lightDenger || '#FBE8E8',
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

const DetailByStoreScreen = ({ navigation, route }: Props) => {
  const [selectedDuration, setSelectedDuration] = useState('B'); // Default to "Last month"

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg || '#F0F2F6',
        },
      ]}>
      <PageHeader title={'Detail By Store'} navigation={() => navigation.goBack()} />
      
      {/* Horizontal filter list */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}>
          {DURATION_OPTIONS.map(opt => {
            const isSelected = selectedDuration === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSelectedDuration(opt.value)}
                style={[
                  styles.filterButton,
                  isSelected
                    ? { backgroundColor: C.accent, borderColor: C.accent }
                    : { backgroundColor: C.surface, borderColor: C.border },
                ]}>
                <Text style={{
                  color: isSelected ? C.surface : C.text,
                  fontSize: 14,
                  fontWeight: isSelected ? '600' : '400',
                  fontFamily: isSelected ? Fonts.semiBold : Fonts.medium,
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          <DetailRow 
            icon={Store} 
            label="Store Name" 
            value="Adyant Ayurveda Outlet" 
            iconColor={C.purple}
            bgColor={C.purpleSoft}
          />
          <View style={styles.divider} />

          <DetailRow 
            icon={ShoppingCart} 
            label="Total Sales" 
            value="145 Orders" 
            iconColor={C.green}
            bgColor={C.greenSoft}
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon={Clock} 
            label="Pending Sales" 
            value="32 Orders" 
            iconColor={C.amber}
            bgColor={C.amberSoft}
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon={IndianRupee} 
            label="Total Amount" 
            value="₹ 54,000.00" 
            iconColor={'#1A1A1A'}
            bgColor={'#F2F2F2'}
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon={CheckCircle} 
            label="Total Paid Amount" 
            value="₹ 40,000.00" 
            iconColor={C.green}
            bgColor={C.greenSoft}
            valueColor={C.green}
          />
          <View style={styles.divider} />
          
          <DetailRow 
            icon={Activity} 
            label="Pending Amount" 
            value="₹ 14,000.00" 
            iconColor={C.red}
            bgColor={C.redSoft}
            valueColor={C.red}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailByStoreScreen;

const styles = StyleSheet.create({
  filterSection: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: C.surface,
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
});
