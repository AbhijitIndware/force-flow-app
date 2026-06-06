import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {flexRow, itemsCenter} from '../../../utils/styles';
import {PjpWorkflowState} from '../../../types/baseType';

interface ActivityCheckInBlockProps {
  // isPjpActive: boolean;
  pjpState: PjpWorkflowState | undefined;
  navigation: any;
}

export const ActivityCheckInBlock: React.FC<ActivityCheckInBlockProps> = ({
  // isPjpActive,
  pjpState,
  navigation,
}) => {
  const isDisabled =
    // isPjpActive ||
    pjpState === 'WEEKLY_OFF' || pjpState === 'STORE_CHECKED_IN';

  const disabledReason =
    pjpState === 'WEEKLY_OFF'
      ? '⚠️ Activity Check-In is disabled on Weekly Off'
      : pjpState === 'STORE_CHECKED_IN'
      ? '⚠️ Activity Check-In is disabled while inside a store'
      : // : isPjpActive
        // ? '⚠️ Activity Check-In is disabled while PJP is active'
        null;

  return (
    <View style={[styles.LinkSection, {paddingVertical: 15, marginTop: 10}]}>
      <Text
        style={[
          styles.SectionHeading,
          {marginBottom: 10, paddingHorizontal: 20},
        ]}>
        Activity Check-In
      </Text>
      <View style={{paddingHorizontal: 20}}>
        <TouchableOpacity
          style={[
            styles.checkinButton,
            {backgroundColor: Colors.darkButton, marginTop: 5},
            isDisabled && styles.checkinButtonDisabled,
          ]}
          disabled={isDisabled}
          onPress={() => navigation.navigate('ActivityCheckInScreen')}>
          <View style={[flexRow, itemsCenter]}>
            <Text
              style={[
                styles.checkinButtonText,
                isDisabled && styles.checkinButtonTextDisabled,
              ]}>
              Activity Check-In
            </Text>
            <Ionicons
              name="chevron-forward-circle-sharp"
              size={20}
              color={isDisabled ? Colors.gray : Colors.white}
              style={{marginLeft: 8}}
            />
          </View>
        </TouchableOpacity>
        {isDisabled && disabledReason && (
          <Text
            style={{
              fontSize: 11,
              color: Colors.gray,
              textAlign: 'center',
              marginTop: 6,
              fontFamily: Fonts.regular,
            }}>
            {disabledReason}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  LinkSection: {backgroundColor: Colors.white},
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'relative',
    gap: 5,
    marginTop: 15,
  },
  checkinButtonDisabled: {
    backgroundColor: Colors.black,
    opacity: 0.8,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
  checkinButtonTextDisabled: {
    color: Colors.gray,
  },
});
