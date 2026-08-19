import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BookOpen, ChevronRight} from 'lucide-react-native';
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';
import {Colors} from '../../utils/colors';

type Props = {
  onPress: () => void;
  accent?: string;
  accentBg?: string;
  title?: string;
  subtitle?: string;
};

const UserManualCard = ({
  onPress,
  accent = Colors.orange,
  accentBg = Colors.lightOrange,
  title = 'User Manual',
  subtitle = 'Check guides, videos & FAQ',
}: Props) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}>
      <View style={[styles.iconBox, {backgroundColor: accentBg}]}>
        <BookOpen size={22} color={accent} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.chevronBox, {backgroundColor: accentBg}]}>
        <ChevronRight size={16} color={accent} />
      </View>
    </TouchableOpacity>
  );
};

export default UserManualCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {flex: 1, marginRight: 10},
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.gray,
    lineHeight: 16,
    marginTop: 1,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
