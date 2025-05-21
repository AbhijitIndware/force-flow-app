/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BottomTabHeaderProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useAppSelector} from '../../store/hook';
import {flexCol} from '../../utils/styles';
import {AppStackParamList} from '../../types/Navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'Home'>;

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
              height: 80,
              backgroundColor: Colors.white,
              margin: 0,
              padding: 8,
              borderTopWidth: 2,
              borderTopColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}>
            <View style={[styles.tabButton]}>
              {options.tabBarIcon &&
                options.tabBarIcon({
                  color: isFocused ? Colors.primary : Colors.black,
                  size: 28,
                  focused: isFocused,
                })}
            </View>
            <Text
              style={{
                color: isFocused ? Colors.primary : Colors.black,
                fontSize: 12,
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
  const userData = useAppSelector(
    state => state?.persistedReducer?.registerSlice?.data,
  );
  const userRole = userData?.role?.name ?? 'User';
  return (
    <View style={styles.headerTitleContainer}>
      {/* <View style={styles.BackIconContainer}>
        <MaterialCommunityIcons
          name="arrow-left-thin"
          size={20}
          color={Colors.black}
        />
      </View> */}
      <View style={[flexCol, {alignItems: 'flex-start', gap: 2}]}>
        <Text style={[styles.headerTitle, {fontFamily: Fonts.light}]}>
          ForceFlow
        </Text>
      </View>
      <TouchableOpacity style={styles.profileIconContainer}>
        <FontAwesome name="user-circle" size={24} color={Colors.black} />
      </TouchableOpacity>
    </View>
  );
};

const Home = ({navigation, route}: Props) => {
  return (
    <Tab.Navigator
      initialRouteName={route?.params ? route?.params?.routeName : 'HomeScreen'}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: true,
        header: props => <CustomHeader {...props} />,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: '100%',
          backgroundColor: '#fff',
        },
      }}
      tabBar={props => <MyTabBar {...props} />}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size, focused}) => {
            return (
              <MaterialCommunityIcons
                name="home"
                color={focused ? Colors.primary : Colors.menuColor}
                size={28}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Sales"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Sales',
          tabBarIcon: ({color, size, focused}) => {
            return (
              <MaterialIcons
                name="bar-chart"
                color={focused ? Colors.primary : Colors.menuColor}
                size={28}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Incentives"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Incentives',
          tabBarIcon: ({color, size, focused}) => {
            return (
              <MaterialIcons
                name="savings"
                color={focused ? Colors.primary : Colors.menuColor}
                size={25}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Stock"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Stock',
          tabBarIcon: ({color, size, focused}) => {
            return (
              <Ionicons
                name="settings-sharp"
                color={focused ? Colors.primary : Colors.menuColor}
                size={28}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="More"
        component={HomeScreen}
        options={{
          // headerShown: false,
          tabBarLabel: 'More',
          tabBarIcon: ({color, size, focused}) => {
            return (
              <Ionicons
                name="menu-sharp"
                color={focused ? Colors.primary : Colors.menuColor}
                size={28}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default Home;

const styles = StyleSheet.create({
  headerTitleContainer: {
    height: 55,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,

    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: Colors.lightGray,
    borderBottomWidth: 1,
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
