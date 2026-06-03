import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Boxes, MapPin } from 'lucide-react-native';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';

interface StockAndActivityLinksProps {
  navigation: any;
}

export const StockAndActivityLinks: React.FC<StockAndActivityLinksProps> = ({
  navigation,
}) => {
  return (
    <>
      <View
        style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
        <Text
          style={[
            styles.SectionHeading,
            { marginBottom: 10, paddingHorizontal: 20 },
          ]}>
          Stock
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('StockManagementScreen')}
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
            <Boxes strokeWidth={2} color={Colors.white} size={20} />
          </View>
          <Text style={styles.linkTitle}>Stock Management</Text>
          <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
            <Ionicons
              name="chevron-forward-outline"
              size={12}
              color={Colors.darkButton}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
        <Text
          style={[
            styles.SectionHeading,
            { marginBottom: 10, paddingHorizontal: 20 },
          ]}>
          Activity
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ActivityLocationScreen')}
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
            <MapPin strokeWidth={2} color={Colors.white} size={20} />
          </View>
          <Text style={styles.linkTitle}>Activity Location</Text>
          <View style={[styles.arrobox, { marginLeft: 'auto' }]}>
            <Ionicons
              name="chevron-forward-outline"
              size={12}
              color={Colors.darkButton}
            />
          </View>
        </TouchableOpacity>
      </View>
    </>
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
