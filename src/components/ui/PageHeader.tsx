import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../utils/colors';
import { Fonts } from '../../constants';
import { boxShadow } from '../../utils/styles';
import Feather from 'react-native-vector-icons/Feather';
import { Size } from '../../utils/fontSize';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hook';
import { getInitials } from '../../utils/utils';
const { width } = Dimensions.get('window');
type Props = {
  title: string;
  navigation: () => void;
  type?: string;
};

const PageHeader = ({ title, navigation, type = 'so' }: Props) => {
  const navigations = useNavigation<any>();
  const handleClick = () => {
    if (type === 'so') {
      navigations.navigate('ProfileScreen');
    } else if (type = 'distributor') {
      navigations.navigate('DistributorProfileScreen');

    }
  };
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const profileImageSource = employee?.image_base64
    ? { uri: `data:image/jpeg;base64,${employee.image_base64}` }
    : null;

  return (
    <View style={[styles.headerTitleContainer, boxShadow]}>
      <View style={styles.backButtonSection}>
        {/* Back Button */}
        <TouchableOpacity onPress={navigation}>
          <Feather name="arrow-left" size={24} color={Colors.greyDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.alignment}>
        {/* Home Icon */}
        <TouchableOpacity
          style={[, { marginTop: 5 }]}
          onPress={() => navigations.navigate('Home')}>
          <Feather name="home" size={24} color={Colors.greyDark} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.notification}>
          <View style={styles.notificationBatch}>
            <Text style={styles.notificationCount}>0</Text>
          </View>
          <Feather name="bell" size={20} color={Colors.greyDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.userInfo} onPress={() => handleClick()}>
          {profileImageSource ? (
            <Image
              source={profileImageSource}
              resizeMode="cover"
              style={styles.avtarImage}
            />
          ) : (
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>
                {getInitials(employee?.full_name)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create({
  headerTitleContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '60%',
  },
  headerTitle: {
    color: Colors.darkButton,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    marginTop: 5,
    // width: '60%',
  },
  BackIconContainer: {
    width: 23,
    height: 23,
    borderRadius: 100,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignment: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },

  logoImage: {
    width: width * 0.4,
    height: 36,
  },

  notification: { position: 'relative', top: 6 },
  notificationBatch: {
    width: 26,
    height: 26,
    backgroundColor: Colors.orange,
    borderRadius: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
    right: -13,
    top: -14,
    borderColor: Colors.white,
    borderWidth: 3,
  },
  notificationCount: { color: Colors.white },

  userInfo: { overflow: 'hidden', borderRadius: '50%' },
  avtarImage: {
    width: 40,
    height: 40,
    objectFit: 'cover',
  },
  initialsCircle: {
    height: 35,
    width: 35,
    borderRadius: 20,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: Fonts.medium,
    fontSize: 18,
    color: Colors.white,
    lineHeight: 12,
  },
});
