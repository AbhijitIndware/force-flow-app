/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import {
  Image,
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
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import Feather from 'react-native-vector-icons/Feather';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  House,
  ShoppingCart,
  Truck,
  ClipboardList,
  UserCircle2,
} from 'lucide-react-native';
import { useAppSelector } from '../../../store/hook';
import { getInitials } from '../../../utils/utils';
// import PurchaseOrdersScreen from '../PurchaseOrders/PurchaseOrdersScreen';
// import DeliveryNotesScreen from '../DeliveryNotes/DeliveryNotesScreen';
// import DistributorProfileScreen from '../Profile/DistributorProfileScreen';
import { DistributorAppStackParamList } from '../../../types/Navigation';
import DistributorHomeScreen from './HomeScreen';
import PurchaseOrdersScreen from '../Purchase/Purchaseordersscreen';
import DeliveryNotesScreen from '../DeliveryNote/Deliverynotesscreen';
import DistributorProfileScreen from '../Profile/Distributorprofilescreen';


const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<
  DistributorAppStackParamList,
  'DistributorHomeScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });
          navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{
              flex: 1,
              height: 90,
              backgroundColor: Colors.midBlack,
              margin: 0,
              padding: 8,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              paddingBottom: 15,
            }}>
            <View style={styles.tabButton}>
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
  const distributor = useAppSelector(
    state => (state?.persistedReducer as any)?.authSlice?.distributor,
  );
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const profileImageSource = employee?.image_base64
    ? { uri: `data:image/jpeg;base64,${employee.image_base64}` }
    : null;

  return (
    <View style={styles.headerTitleContainer}>
      <View>
        <Image
          source={require('../../../assets/images/softsence-logo-dashboard.png')}
          resizeMode="contain"
          style={styles.logoImage}
        />
      </View>

      <View style={styles.alignment}>
        <TouchableOpacity style={styles.notification}>
          <View style={styles.notificationBatch}>
            <Text style={styles.notificationCount}>0</Text>
          </View>
          <Feather name="bell" size={20} color={Colors.greyDark} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => props.navigation.navigate('DistributorProfileScreen' as never)}>
          {profileImageSource ? (
            <Image
              source={profileImageSource}
              resizeMode="cover"
              style={styles.avtarImage}
            />
          ) : (
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>
                {getInitials(
                  distributor?.distributor_name || employee?.full_name,
                )}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DistributorHome = ({ navigation, route }: Props) => {
  return (
    <Tab.Navigator
      initialRouteName="DistributorHomeScreen"
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
        const index = props.state.index;
        return index === 0 ? <MyTabBar {...props} /> : null;
      }}>
      <Tab.Screen
        name="DistributorHomeScreen"
        component={DistributorHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <House strokeWidth={2} color={Colors.white} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="PurchaseOrders"
        component={PurchaseOrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <ShoppingCart strokeWidth={2} color={Colors.white} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="DeliveryNotes"
        component={DeliveryNotesScreen}
        options={{
          tabBarLabel: 'Deliveries',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Truck strokeWidth={2} color={Colors.white} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DistributorProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <UserCircle2 strokeWidth={2} color={Colors.white} size={25} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DistributorHome;

const styles = StyleSheet.create({
  headerTitleContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 5,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alignment: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  logoImage: {
    width: width * 0.2,
    height: 50,
  },
  notification: { position: 'relative', top: 6 },
  notificationBatch: {
    width: 26,
    height: 26,
    backgroundColor: Colors.orange,
    borderRadius: 50,
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
  userInfo: { overflow: 'hidden', borderRadius: 50 },
  avtarImage: {
    width: 40,
    height: 40,
  },
  tabButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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