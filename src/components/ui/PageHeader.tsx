import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {boxShadow} from '../../utils/styles';

type Props = {
  title: string;
  navigation: () => void;
};

const PageHeader = ({title, navigation}: Props) => {
  return (
    <View style={[styles.headerTitleContainer, boxShadow]}>
      <TouchableOpacity onPress={navigation} style={styles.BackIconContainer}>
        <MaterialIcons
          name="keyboard-arrow-left"
          size={20}
          color={Colors.black}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title as string}</Text>
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create({
  headerTitleContainer: {
    height: 50,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,

    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: Colors.black,
    fontFamily: Fonts.medium,
    fontSize: 14,
    textAlign: 'center',
  },
  BackIconContainer: {
    width: 23,
    height: 23,
    borderRadius: 100,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
