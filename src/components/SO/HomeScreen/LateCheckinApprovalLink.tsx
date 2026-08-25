import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';

interface Props {
  navigation: any;
}

const LateCheckinApprovalLink: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={() => navigation.navigate('LateCheckinApprovalScreen')}
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
        <Text style={styles.linkTitle}>Late Check-In Approval</Text>
        <View style={[styles.arrobox]}>
          <Ionicons
            name="chevron-forward-outline"
            size={12}
            color={Colors.darkButton}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LateCheckinApprovalLink;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    paddingVertical: 15,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  IconlinkBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // marginBottom: 10,
  },
  iconbox: {

    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.Orangelight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: {
    // flex: 1,
    color: Colors.darkButton,
    fontSize: Size.xs,
    fontFamily: Fonts.medium,
    lineHeight: 18,
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
