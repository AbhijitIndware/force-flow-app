/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import {
  BottomTabHeaderProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {House} from 'lucide-react-native';
import SalesScreen from '../Sales/Sales';
import StockScreen from '../Stock/Stock';
import IncentiveScreen from '../Incentive/Incentive';
import {useState} from 'react';
import MoreOptionsModal from '../../../components/home/MoreOption';
import {useAppSelector} from '../../../store/hook';

const {width} = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'Home'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const Tab = createBottomTabNavigator();

function MyTabBar({state, descriptors, navigation}: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
      }}>
      {state.routes.map((route: any, index: any) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const openMap = () => {
          const scheme = Platform.select({
            ios: 'maps://0,0?q=',
            android: 'geo:0,0?q=',
          });
          const latLng = `${38.7875851},${-9.3906089}`;
          const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
          });

          Linking.openURL(url as string);
        };

        const onPress = () => {
          if (label === 'Navigation') {
            openMap();
          } else {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{
              flex: 1,
              height: 90,
              backgroundColor: Colors.midBlack,
              margin: 0,
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              paddingBottom: 15,
            }}>
            <View style={[styles.tabButton]}>
              {options.tabBarIcon &&
                options.tabBarIcon({
                  color: isFocused ? Colors.orange : Colors.white,
                  size: 28,
                  focused: isFocused,
                })}
            </View>
            <Text
              style={{
                color: isFocused ? Colors.orange : Colors.white,
                fontSize: 12,
                fontFamily: Fonts.regular,
              }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const CustomHeader = (props: BottomTabHeaderProps) => {
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const profileImageSource = employee?.image_base64
    ? {uri: `data:image/jpeg;base64,${employee.image_base64}`}
    : require('../../../assets/images/user.jpg');

  return (
    <View style={styles.headerTitleContainer}>
      <View>
        <Image
          source={require('../../../assets/images/softsence-logo-dashboard.png')}
          resizeMode="cover"
          style={styles.logoImage}
        />
      </View>
      <View style={styles.alignment}>
        <TouchableOpacity style={styles.notification}>
          <View style={styles.notificationBatch}>
            <Text style={styles.notificationCount}>5</Text>
          </View>
          <Feather name="bell" size={24} color={Colors.greyDark} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => props.navigation.navigate('ProfileScreen')}>
          <Image
            source={profileImageSource}
            resizeMode="cover"
            style={styles.avtarImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Home = ({navigation, route}: Props) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleMorePress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const menuItems = [
    {
      id: '1',
      title: 'Product feedback',
      onPress: () => navigation.navigate('ProductFeedbackScreen'),
    },
    {
      id: '2',
      title: 'Downloads',
      onPress: () => navigation.navigate('DownloadScreen'),
    },
    {id: '3', title: 'Schemes', onPress: () => console.log('Logout')},
    {
      id: '4',
      title: 'Profile',
      onPress: () => navigation.navigate('ProfileScreen'),
    },
  ];
  return (
    <>
      <Tab.Navigator
        initialRouteName={
          route?.params ? route?.params?.routeName : 'HomeScreen'
        }
        screenOptions={{
          tabBarHideOnKeyboard: true,
          headerShown: true,
          header: props => <CustomHeader {...props} />,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            height: '100%',
            backgroundColor: Colors.lightBg,
          },
        }}
        tabBar={props => {
          let index = props.state.index;
          return index === 0 ? <MyTabBar {...props} /> : null;
        }}>
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({color, size, focused}) => {
              return (
                <House
                  strokeWidth={2}
                  color={focused ? Colors.white : Colors.white}
                  size={25}
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="Sales"
          component={SalesScreen}
          options={{
            tabBarLabel: 'Sales',
            headerShown: false,
            tabBarIcon: ({color, size, focused}) => {
              return (
                <Ionicons
                  name="stats-chart-outline"
                  color={focused ? Colors.white : Colors.white}
                  size={28}
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="Incentives"
          component={IncentiveScreen}
          options={{
            tabBarLabel: 'Incentives',
            headerShown: false,
            tabBarIcon: ({color, size, focused}) => {
              return (
                <Ionicons
                  name="server-outline"
                  color={focused ? Colors.white : Colors.white}
                  size={25}
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="Stock"
          component={StockScreen}
          options={{
            tabBarLabel: 'Stock',
            headerShown: false,
            tabBarIcon: ({color, size, focused}) => {
              return (
                <Feather
                  name="box"
                  color={focused ? Colors.white : Colors.white}
                  size={28}
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="More"
          component={HomeScreen}
          listeners={{
            tabPress: e => {
              // e.preventDefault(); // Prevent default navigation
              handleMorePress(); // Open modal
            },
          }}
          options={{
            tabBarLabel: 'More',
            headerShown: false,
            tabBarIcon: ({focused}) => (
              <MaterialCommunityIcons
                name="text"
                color={focused ? Colors.white : Colors.white}
                size={28}
              />
            ),
          }}
        />
      </Tab.Navigator>
      <MoreOptionsModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        menuItems={menuItems}
      />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  headerTitleContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alignment: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },

  logoImage: {
    width: width * 0.2,
    height: 50,
  },

  notification: {position: 'relative', top: 6},
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
  notificationCount: {color: Colors.white},

  userInfo: {overflow: 'hidden', borderRadius: 15},
  avtarImage: {
    width: width * 0.12,
    height: 50,
  },

  tabButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.black,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 15,
  },
  BackIconContainer: {
    width: 23,
    height: 23,
  },
  profileIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
