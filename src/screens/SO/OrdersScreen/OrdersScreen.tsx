/* eslint-disable react-native/no-inline-styles */
import {
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
import {
  AlarmClockMinus,
  CirclePlus,
  PackageOpen,
  ShoppingCart,
} from 'lucide-react-native';
import {Tab} from '@rneui/themed';
import {Animated} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import PurchaseOrder from '../../../components/SO/Order/Purchase/PurchaseOrder';
import SalesOrder from '../../../components/SO/Order/Sale/SalesOrder';
import {useGetSalesPurchaseCountQuery} from '../../../features/base/base-api';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'OrdersScreen'
>;

type Props = {
  navigation: any;
  route: any;
};

const OrdersScreen = ({navigation, route}: Props) => {
  const {index: initialIndex} = route.params || {};
  const scrollY = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = React.useState(0);

  const {data: countData} = useGetSalesPurchaseCountQuery();

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
        },
      ]}>
      <PageHeader
        title="Orders"
        navigation={() => {
          navigation.navigate('Home', {
            screen: 'HomeScreen', // Use 'screen' to specify the nested tab
          });
        }}
      />
      <Animated.ScrollView
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        stickyHeaderIndices={[1]} // Index of the Tab header
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        contentContainerStyle={{position: 'relative'}}>
        <View style={styles.headerSec}>
          {index === 0 ? (
            <View style={styles.salesHeaderData}>
              <View style={styles.countBoxSection}>
                <View style={styles.countBox}>
                  <View
                    style={[
                      styles.countBoxIcon,
                      {backgroundColor: Colors.lightBlue},
                    ]}>
                    <ShoppingCart strokeWidth={1.4} color={Colors.blue} />
                  </View>
                  <Text style={styles.countBoxDay}>
                    {countData?.message?.data?.purchase_orders?.total}
                  </Text>
                  <Text style={styles.countBoxTitle}>Total Order</Text>
                </View>
                <View style={styles.countBox}>
                  <View
                    style={[
                      styles.countBoxIcon,
                      {backgroundColor: Colors.lightSuccess},
                    ]}>
                    <PackageOpen strokeWidth={1.4} color={Colors.success} />
                  </View>
                  <Text style={styles.countBoxDay}>
                    {countData?.message?.data?.purchase_orders?.submitted}
                  </Text>
                  <Text style={styles.countBoxTitle}>Delivered Order</Text>
                </View>
                <View style={styles.countBox}>
                  <View
                    style={[
                      styles.countBoxIcon,
                      {backgroundColor: Colors.holdLight},
                    ]}>
                    <AlarmClockMinus strokeWidth={1.4} color={Colors.orange} />
                  </View>
                  <Text style={styles.countBoxDay}>
                    {countData?.message?.data?.purchase_orders?.draft}
                  </Text>
                  <Text style={styles.countBoxTitle}>Pending Order</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.salesHeaderData}>
              <View style={styles.countBoxSection}>
                <View style={styles.countBox}>
                  <View
                    style={[
                      styles.countBoxIcon,
                      {backgroundColor: Colors.lightBlue},
                    ]}>
                    <ShoppingCart strokeWidth={1.4} color={Colors.blue} />
                  </View>
                  <Text style={styles.countBoxDay}>
                    {countData?.message?.data?.sales_orders?.total}
                  </Text>
                  <Text style={styles.countBoxTitle}>Total Order</Text>
                </View>
                <View style={styles.countBox}>
                  <View
                    style={[
                      styles.countBoxIcon,
                      {backgroundColor: Colors.lightSuccess},
                    ]}>
                    <PackageOpen strokeWidth={1.4} color={Colors.success} />
                  </View>
                  <Text style={styles.countBoxDay}>
                    {countData?.message?.data?.sales_orders?.submitted}
                  </Text>
                  <Text style={styles.countBoxTitle}>Delivered Order</Text>
                </View>
                <View style={styles.countBox}>
                  <View
                    style={[
                      styles.countBoxIcon,
                      {backgroundColor: Colors.holdLight},
                    ]}>
                    <AlarmClockMinus strokeWidth={1.4} color={Colors.orange} />
                  </View>
                  <Text style={styles.countBoxDay}>
                    {countData?.message?.data?.sales_orders?.draft}
                  </Text>
                  <Text style={styles.countBoxTitle}>Pending Order</Text>
                </View>
              </View>
            </View>
          )}
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
              title="Purchase Orders"
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
              title="Sales Orders"
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
          <PurchaseOrder navigation={navigation} />
        ) : (
          <SalesOrder navigation={navigation} />
        )}
      </Animated.ScrollView>

      {index !== 0 && (
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
                ? navigation.navigate('AddPurchaseScreen')
                : navigation.navigate('AddSaleScreen', {
                    orderId: undefined,
                  })
            }>
            <CirclePlus strokeWidth={1.4} color={Colors.white} />
            <Text style={styles.checkinButtonText}>
              {`Add ${index === 0 ? 'Purchase' : 'Sales'} Orders`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },

  //header-box-section css start
  headerSec: {
    backgroundColor: Colors.white,
    minHeight: 150,
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

    // Android Shadow
    elevation: 2,
  },
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  salesHeaderData: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
  },

  welcomeText: {
    fontFamily: Fonts.light,
    color: Colors.white,
    fontSize: Size.xsmd,
    textAlign: 'center',
  },
  name: {fontFamily: Fonts.semiBold, fontSize: Size.md, color: Colors.white},
  welcomBox: {
    padding: 15,
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingVertical: 20,
    marginTop: 10,
    position: 'relative',
    bottom: -0,
    marginBottom: -30,
  },

  linkBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.Orangelight,
    borderRadius: 15,
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#9C9C9C',
  },
  linkContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    color: Colors.white,
    gap: 5,
    alignItems: 'center',
    width: width * 0.76,
  },

  paraText: {fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm},

  //bodyContent section css
  bodyContent: {flex: 1},
  bodyHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4E9',
  },
  bodyHeaderTitle: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    lineHeight: 20,
  },
  bodyHeaderIcon: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },

  //atteddanceCard section css
  atteddanceCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  time: {
    color: Colors.darkButton,
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    lineHeight: 18,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },

  present: {
    backgroundColor: Colors.lightSuccess,
    color: Colors.sucess,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },

  lateEntry: {
    backgroundColor: Colors.holdLight,
    color: Colors.orange,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },

  leave: {
    backgroundColor: Colors.lightBlue,
    color: Colors.blue,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },
  absent: {
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    lineHeight: 18,
    padding: 8,
    borderRadius: 50,
    paddingHorizontal: 15,
  },

  cardbody: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 0,
  },
  dateBox: {
    width: 50,
    height: 50,
    borderColor: Colors.darkButton,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.transparent,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  dateText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  monthText: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.xs,
  },
  contentText: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.sm,
    lineHeight: 20,
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
  countBoxSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 17,
    flexDirection: 'row',
  },
  countBox: {
    backgroundColor: Colors.white,
    width: '33.33%',
    borderRadius: 15,
    padding: 10,
    minHeight: 135,
    shadowColor: '#9F9D9D',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 15,
  },
  countBoxIcon: {
    width: 45,
    height: 45,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    marginBottom: 10,
    marginLeft: 'auto',
  },
  countBoxTitle: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.xs,
    lineHeight: 18,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: Size.xslg,
    lineHeight: 20,
    position: 'relative',
  },
  //countBox-section css end
});
