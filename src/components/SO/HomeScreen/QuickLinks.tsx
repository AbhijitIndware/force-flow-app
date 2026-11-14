import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BaggageClaim,
  Boxes,
  FilePlus2,
  Hotel,
  LucideIcon,
  MapPin,
  Package,
} from 'lucide-react-native';
import { Divider } from '@rneui/themed';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';

interface QuickLinksProps {
  navigation: any;
}

type QuickLink = {
  title: string;
  icon: LucideIcon;
  screen: string;
  params?: Record<string, unknown>;
};

// In the order the work is done: each step needs the one before it.
// A store needs its distributor; a PJP needs stores and activity locations;
// orders come from store visits.
const LINKS: QuickLink[] = [
  { title: 'Add Distributor', icon: Package, screen: 'AddDistributorScreen' },
  { title: 'Add Store', icon: Hotel, screen: 'AddStoreScreen' },
  // Opens the list, which has the "Create New Location" button.
  { title: 'Add Activity Location', icon: MapPin, screen: 'ActivityLocationScreen' },
  { title: 'Add PJP', icon: FilePlus2, screen: 'AddPjpScreen' },
  { title: 'Add Order', icon: BaggageClaim, screen: 'OrdersScreen', params: { index: 0 } },
  { title: 'Update Stock', icon: Boxes, screen: 'StockManagementScreen' },
];

export const QuickLinks: React.FC<QuickLinksProps> = ({ navigation }) => {
  return (
    <View style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
      <Text
        style={[
          styles.SectionHeading,
          { marginBottom: 10, paddingHorizontal: 20 },
        ]}>
        Quick links
      </Text>
      {LINKS.map(({ title, icon: Icon, screen, params }, i) => (
        <React.Fragment key={screen}>
          <TouchableOpacity
            style={styles.IconlinkBox}
            onPress={() => navigation.navigate(screen, params)}>
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
              <Icon strokeWidth={2} color={Colors.white} size={20} />
            </View>
            <Text style={styles.linkTitle}>{title}</Text>
            <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
              <Ionicons
                name="chevron-forward-outline"
                size={12}
                color={Colors.darkButton}
              />
            </View>
          </TouchableOpacity>
          {i < LINKS.length - 1 && (
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />
          )}
        </React.Fragment>
      ))}
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
