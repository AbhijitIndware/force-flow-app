
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {ChevronRight} from 'lucide-react-native';
import {RosterDay} from '../../../types/baseType';
import {Fonts} from '../../../constants';
import {
  formatDayDate,
  formatShiftTime,
  getDayStatus,
  rosterColors,
} from './rosterTheme';

interface SplitShiftCardProps {
  day: RosterDay;
  onPress?: () => void;
}

const SplitShiftCard = ({day, onPress}: SplitShiftCardProps) => {
  const status = getDayStatus(day);
  const cancelled = status === 'cancelled';
  const completed = status === 'completed';

  const titleColor = cancelled ? rosterColors.cancelledText : rosterColors.titleText;
  const mutedColor = cancelled ? rosterColors.cancelledText : rosterColors.secondaryText;
  const accentColor = cancelled ? rosterColors.cancelledText : rosterColors.splitAccent;

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
        {(day.slots ?? []).map((slot, idx) => (
          <Text
            key={idx}
            style={[styles.slotLine, {color: mutedColor}]}
            numberOfLines={1}>
            {slot.store_name} — {formatShiftTime(slot.start_time)} to{' '}
            {formatShiftTime(slot.end_time)}
          </Text>
        ))}
      </View>
      <Text style={[styles.label, {color: cancelled ? rosterColors.cancelledText : rosterColors.primary}]}>
        Split
      </Text>
      <ChevronRight
        size={16}
        color={cancelled ? rosterColors.cancelledText : '#CBD5E1'}
      />
    </TouchableOpacity>
  );
};

export default SplitShiftCard;

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
    gap: 3,
    paddingLeft: 8,
  },
  date: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  slotLine: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    fontWeight: '600',
  },
});
