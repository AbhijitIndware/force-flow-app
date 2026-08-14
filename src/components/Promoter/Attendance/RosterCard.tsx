
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {ChevronRight} from 'lucide-react-native';
import {RosterDay} from '../../../types/baseType';
import {Fonts} from '../../../constants';
import {
  formatDayDate,
  formatShiftTime,
  getDayStatus,
  getRightLabel,
  rosterColors,
} from './rosterTheme';

interface RosterCardProps {
  day: RosterDay;
  onPress?: () => void;
}

const RosterCard = ({day, onPress}: RosterCardProps) => {
  const status = getDayStatus(day);
  const cancelled = status === 'cancelled';
  const completed = status === 'completed';

  const slot = day.slots?.[0];
  const storeName = slot?.store_name || '—';
  const time = `${formatShiftTime(slot?.start_time ?? '')} to ${formatShiftTime(
    slot?.end_time ?? '',
  )}`;

  const titleColor = cancelled ? rosterColors.cancelledText : rosterColors.titleText;
  const mutedColor = cancelled ? rosterColors.cancelledText : rosterColors.secondaryText;
  const accentColor = cancelled ? rosterColors.cancelledText : rosterColors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        cancelled && styles.cardCancelled,
        completed && styles.cardCompleted,
      ]}>
      <View style={[styles.accent, {backgroundColor: accentColor}]} />
      <View style={styles.left}>
        <Text style={[styles.date, {color: titleColor}]}>
          {formatDayDate(day.date)}
        </Text>
        <Text style={[styles.store, {color: mutedColor}]} numberOfLines={1}>
          {storeName}
        </Text>
        <Text style={[styles.time, {color: mutedColor}]}>{time}</Text>
      </View>
      <Text style={[styles.label, {color: cancelled ? rosterColors.cancelledText : rosterColors.primary}]}>
        {getRightLabel(day)}
      </Text>
      <ChevronRight
        size={16}
        color={cancelled ? rosterColors.cancelledText : '#CBD5E1'}
      />
    </TouchableOpacity>
  );
};

export default RosterCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: rosterColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: rosterColors.border,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    overflow: 'hidden',
  },
  cardCancelled: {
    backgroundColor: rosterColors.cancelledBg,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  left: {
    flex: 1,
    gap: 2,
    paddingLeft: 8,
  },
  date: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  store: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  time: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    fontWeight: '600',
  },
});
