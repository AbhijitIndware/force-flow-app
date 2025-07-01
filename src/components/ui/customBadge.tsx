import {StyleSheet, Text, View} from 'react-native';
import {Fonts} from '../../constants';
import {Colors} from '../../utils/colors';

type Props = {
  content: number;
};

const CustomBadge = ({content}: Props) => {
  return (
    <View style={styles.badgeCon}>
      <Text style={styles.badgeText}>{content}</Text>
    </View>
  );
};

export default CustomBadge;

const styles = StyleSheet.create({
  badgeCon: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: Colors.Orangelight,

    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: 22,
    height: 22,
    borderRadius: 50,
    zIndex: 10,
  },
  badgeText: {
    textAlign: 'center',
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
});
