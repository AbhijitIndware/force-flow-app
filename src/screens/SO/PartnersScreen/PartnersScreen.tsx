/* eslint-disable react-native/no-inline-styles */
import {
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SoAppStackParamList} from '../../../types/Navigation';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {CirclePlus, UserRoundPlus} from 'lucide-react-native';
import {Tab} from '@rneui/themed';
import DistributorTabcontent from '../../../components/SO/Partner/Distributor/DistributorTabcontent';
import StoreTabContent from '../../../components/SO/Partner/Store/StoreTabContent';
import PageHeader from '../../../components/ui/PageHeader';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PartnersScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const OrdersScreen = ({navigation}: Props) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [index, setIndex] = React.useState(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
          position: 'relative',
        },
      ]}>
      <PageHeader title="Partners" navigation={() => navigation.goBack()} />
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <Animated.ScrollView
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
          stickyHeaderIndices={[1]} // Index of the Tab header
          scrollEventThrottle={16}
          contentContainerStyle={{position: 'relative'}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.headerSec}>
            <View
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.lightOrange,
                borderRadius: 15,
              }}>
              <UserRoundPlus
                size={20}
                color={Colors.orange}
                strokeWidth={1.7}
              />
            </View>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: Size.sm,
                color: Colors.darkButton,
                marginTop: 5,
              }}>
              Total {index === 0 ? 'Distributors' : 'Stores'}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: Size.md,
                color: Colors.darkButton,
              }}>
              {totalCount}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: Colors.orange,
              paddingVertical: 5,
              paddingHorizontal: 20,
              position: 'relative',
              marginTop: 0,
            }}>
            <Tab
              value={index}
              onChange={e => setIndex(e)}
              indicatorStyle={{
                height: 0,
              }}
              variant="primary"
              style={{
                backgroundColor: Colors.transparent,
                padding: 0,
                margin: 0,
                gap: 0,
              }}>
              <Tab.Item
                title="Distributor"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 9,
                }}
                containerStyle={active => ({
                  backgroundColor: active ? Colors.Orangelight : undefined,
                  borderRadius: active ? 10 : undefined,
                  borderColor: active ? '#FFBF83' : undefined,
                  borderTopWidth: active ? 1 : undefined,
                  borderLeftWidth: active ? 1 : undefined,
                  borderRightWidth: active ? 1 : undefined,
                })}
                buttonStyle={{paddingHorizontal: 0}}
              />
              <Tab.Item
                title="Store"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 9,
                }}
                containerStyle={active => ({
                  backgroundColor: active ? Colors.Orangelight : undefined,
                  borderRadius: active ? 10 : undefined,
                  borderColor: active ? '#FFBF83' : undefined,
                  borderTopWidth: active ? 1 : undefined,
                  borderLeftWidth: active ? 1 : undefined,
                  borderRightWidth: active ? 1 : undefined,
                })}
                buttonStyle={{paddingHorizontal: 0}}
              />
            </Tab>
          </View>
          {/* Conditionally rendered tab content */}
          {index === 0 ? (
            <DistributorTabcontent
              navigation={navigation}
              setTotalCount={setTotalCount}
            />
          ) : (
            <StoreTabContent
              navigation={navigation}
              setTotalCount={setTotalCount}
            />
          )}
        </Animated.ScrollView>
      )}

      <View
        style={{
          position: 'absolute',
          bottom: 3,
          width: '100%',
          paddingHorizontal: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={styles.checkinButton}
          onPress={() =>
            index === 0
              ? navigation.navigate('AddDistributorScreen')
              : navigation.navigate('AddStoreScreen')
          }>
          <CirclePlus strokeWidth={1.4} color={Colors.white} />
          <Text style={styles.checkinButtonText}>
            {`Add ${index === 0 ? 'Distributor' : 'Store'}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  //header-box-section css start
  headerSec: {
    backgroundColor: Colors.white,
    minHeight: 100,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    position: 'relative',
    zIndex: 1,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    paddingBottom: 10,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    // Android Shadow
    elevation: 2,
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
    position: 'absolute',
    bottom: 0,
    gap: 5,
    zIndex: 1,
    width: width * 0.9,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
