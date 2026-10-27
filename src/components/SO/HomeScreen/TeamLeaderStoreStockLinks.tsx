import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Divider } from '@rneui/themed';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import {
  STOCK_SCREENS,
  StockScreenKey,
} from '../../Promoter/Stock/stockScreens';

// The promoter stock screens a Team Leader gets inside a store visit.
// Count Stock is the SO's Stock Management screen.
const LINKS: { screen: string; key: StockScreenKey }[] = [
  { screen: 'StockReceivedScreen', key: 'receive' },
  { screen: 'DistributorReturnScreen', key: 'distributorReturn' },
  { screen: 'CustomerReturnScreen', key: 'customerReturn' },
];

interface TeamLeaderStoreStockLinksProps {
  navigation: any;
  store: string;
  storeName?: string;
}

export const TeamLeaderStoreStockLinks: React.FC<
  TeamLeaderStoreStockLinksProps
> = ({ navigation, store, storeName }) => {
  return (
    <View style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
      <Text
        style={[
          styles.SectionHeading,
          { marginBottom: 10, paddingHorizontal: 20 },
        ]}>
        Store Stock{storeName ? ` · ${storeName}` : ''}
      </Text>
      {LINKS.map(({ screen, key }) => {
        const { title, color, Icon } = STOCK_SCREENS[key];
        return (
          <React.Fragment key={screen}>
            <TouchableOpacity
              onPress={() => navigation.navigate(screen, { store, storeName })}
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: color,
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
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />
          </React.Fragment>
        );
      })}
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
