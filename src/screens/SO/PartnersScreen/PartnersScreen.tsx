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
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PartnersScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const PartnersScreen = ({navigation, route}: Props) => {
  const {index: initialIndex} = route.params || {};

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

  useEffect(() => {
    if (initialIndex !== undefined) {
      setIndex(initialIndex);
    }
  }, [initialIndex]);

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
        <View style={{flex: 1}}>
          <View style={styles.headerSec}>
            <View style={styles.statRow}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    {backgroundColor: Colors.lightOrange},
                  ]}>
                  <UserRoundPlus
                    strokeWidth={1.4}
                    color={Colors.orange}
                    size={18}
                  />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statNum}>{totalCount}</Text>
                  <Text style={styles.statLabel}>
                    Total {index === 0 ? 'Distributors' : 'Stores'}
                  </Text>
                </View>
              </View>

              {/* <TouchableOpacity
                style={styles.actionLink}
                onPress={() =>
                  index === 0
                    ? navigation.navigate('AddDistributorScreen')
                    : navigation.navigate('AddStoreScreen')
                }>
                <CirclePlus strokeWidth={1.4} color={Colors.orange} size={15} />
                <Text style={styles.actionLinkText}>
                  Add {index === 0 ? 'Distributor' : 'Store'}
                </Text>
                <View style={styles.arrobox}>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={11}
                    color={Colors.white}
                  />
                </View>
              </TouchableOpacity> */}
            </View>
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
        </View>
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

export default PartnersScreen;

const styles = StyleSheet.create({
  //header-box-section css start
  headerSec: {
    backgroundColor: Colors.white,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    flexDirection: 'column',
    gap: 2,
  },
  statNum: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
    lineHeight: 20,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#888',
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD6A5',
    backgroundColor: '#FFF8F0',
  },
  actionLinkText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.orange,
    lineHeight: 15,
  },
  arrobox: {
    width: 18,
    height: 18,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
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
