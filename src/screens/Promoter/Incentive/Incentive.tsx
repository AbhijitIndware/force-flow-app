/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React, {useCallback, useState} from 'react';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {Tab, TabView} from '@rneui/themed';
import RangeSlider from '../../../components/ui/rangeSlider';
import IncentiveGraph from '../../../components/incentive/incentive-graph';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'IncentiveScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const IncentiveScreen = ({navigation, route}: Props) => {
  console.log(navigation, route);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [index, setIndex] = React.useState(0);
  const [value, setValue] = useState(50);

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
        },
      ]}>
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <>
          <View style={styles.headerSec}>
            <View style={styles.salesHeaderData}>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: Size.sm,
                  color: Colors.white,
                  textAlign: 'center',
                  lineHeight: 18,
                  marginBottom: 10,
                }}>
                Total Earned till date
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: Size.md,
                  color: Colors.white,
                  lineHeight: 16,
                }}>
                ₹22545
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: Colors.darkButton,
              paddingTop: 110,
              paddingBottom: 10,
              paddingHorizontal: 20,
              position: 'relative',
              marginTop: -50,
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
                title="Daily Incentives"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 6,
                }}
                containerStyle={active => ({
                  backgroundColor: active ? '#575757' : undefined,
                  borderRadius: active ? 10 : undefined,
                  borderColor: active ? '#9D9D9D' : undefined,
                  borderTopWidth: active ? 1 : undefined,
                  borderLeftWidth: active ? 1 : undefined,
                  borderRightWidth: active ? 1 : undefined,
                })}
                buttonStyle={{paddingHorizontal: 0}}
              />
              <Tab.Item
                title="Monthly Incentives"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 6,
                }}
                containerStyle={active => ({
                  backgroundColor: active ? '#575757' : undefined,
                  borderRadius: active ? 10 : undefined,
                  borderColor: active ? '#9D9D9D' : undefined,
                  borderTopWidth: active ? 1 : undefined,
                  borderLeftWidth: active ? 1 : undefined,
                  borderRightWidth: active ? 1 : undefined,
                })}
                buttonStyle={{paddingHorizontal: 0}}
              />
            </Tab>
          </View>
          <TabView value={index} onChange={setIndex} animationType="spring">
            <TabView.Item
              style={{
                width: '100%',
                flex: 1,
                backgroundColor: Colors.lightBg,
                position: 'relative',
              }}>
              <ScrollView
                nestedScrollEnabled={true}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }>
                <View style={styles.insantiveCounter}>
                  <View style={styles.insantiveCounterBox}>
                    <Image
                      source={require('../../../assets/images/target.png')}
                      resizeMode="cover"
                      style={styles.Icon}
                    />
                    <Text
                      style={{
                        fontSize: Size.xs,
                        fontFamily: Fonts.semiBold,
                        color: Colors.darkButton,
                        lineHeight: 19,
                      }}>
                      Target
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.md,
                        fontFamily: Fonts.regular,
                        color: Colors.darkButton,
                        lineHeight: 28,
                      }}>
                      ₹1255
                    </Text>
                  </View>
                  <View style={styles.insantiveCounterBox}>
                    <Image
                      source={require('../../../assets/images/trophy.png')}
                      resizeMode="cover"
                      style={styles.Icon}
                    />
                    <Text
                      style={{
                        fontSize: Size.xs,
                        fontFamily: Fonts.semiBold,
                        color: Colors.darkButton,
                        lineHeight: 19,
                      }}>
                      Achievement
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.md,
                        fontFamily: Fonts.regular,
                        color: Colors.darkButton,
                        lineHeight: 28,
                      }}>
                      ₹654
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.xxs,
                        fontFamily: Fonts.medium,
                        color: Colors.denger,
                        lineHeight: 14,
                        backgroundColor: '#FBDADA',
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                        borderRadius: 20,
                        marginTop: 3,
                      }}>
                      less 30%
                    </Text>
                  </View>
                  <View style={styles.insantiveCounterBox}>
                    <Image
                      source={require('../../../assets/images/money.png')}
                      resizeMode="cover"
                      style={styles.Icon}
                    />
                    <Text
                      style={{
                        fontSize: Size.xs,
                        fontFamily: Fonts.semiBold,
                        color: Colors.darkButton,
                        lineHeight: 19,
                      }}>
                      Incentive
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.md,
                        fontFamily: Fonts.regular,
                        color: Colors.darkButton,
                        lineHeight: 28,
                      }}>
                      ₹315
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.xxs,
                        fontFamily: Fonts.medium,
                        color: Colors.darkButton,
                        lineHeight: 14,
                        backgroundColor: Colors.white,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 20,
                        marginTop: 3,
                      }}>
                      Earn upto 750
                    </Text>
                  </View>
                </View>
                <RangeSlider
                  min={0}
                  max={100}
                  value={value}
                  onChange={setValue}
                  color={Colors.primary}
                />
                <View style={styles.container}>
                  <View style={styles.earningRange}>
                    <Text style={styles.earningRangeText}>
                      Earning Tips: Clear Aging stock worth ₹4590
                    </Text>
                  </View>
                  <View
                    style={[styles.earningRange, {alignItems: 'flex-start'}]}>
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                      }}>
                      Monitor your run rate
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: Size.sm,
                        color: Colors.darkButton,
                      }}>
                      Earn maximum incentives & achieve your target
                    </Text>
                  </View>
                  <View style={styles.graphSection}>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.md,
                        color: Colors.darkButton,
                      }}>
                      Earning trend
                    </Text>
                    <View
                      style={[
                        styles.earningRange,
                        {alignItems: 'flex-start', padding: 20},
                      ]}>
                      {/* <Image
                        source={require('../../assets/images/graph.jpg')}
                        resizeMode="cover"
                        style={{width: '100%', height: 127}}
                      /> */}

                      <IncentiveGraph />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </TabView.Item>

            <TabView.Item
              style={{
                width: '100%',
                flex: 1,
                backgroundColor: Colors.lightBg,
                position: 'relative',
              }}>
              <ScrollView
                nestedScrollEnabled={true}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }>
                <View style={styles.insantiveCounter}>
                  <View style={styles.insantiveCounterBox}>
                    <Image
                      source={require('../../../assets/images/target.png')}
                      resizeMode="cover"
                      style={styles.Icon}
                    />
                    <Text
                      style={{
                        fontSize: Size.xs,
                        fontFamily: Fonts.semiBold,
                        color: Colors.darkButton,
                        lineHeight: 19,
                      }}>
                      Target
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.md,
                        fontFamily: Fonts.regular,
                        color: Colors.darkButton,
                        lineHeight: 28,
                      }}>
                      ₹1255
                    </Text>
                  </View>
                  <View style={styles.insantiveCounterBox}>
                    <Image
                      source={require('../../../assets/images/trophy.png')}
                      resizeMode="cover"
                      style={styles.Icon}
                    />
                    <Text
                      style={{
                        fontSize: Size.xs,
                        fontFamily: Fonts.semiBold,
                        color: Colors.darkButton,
                        lineHeight: 19,
                      }}>
                      Achievement
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.md,
                        fontFamily: Fonts.regular,
                        color: Colors.darkButton,
                        lineHeight: 28,
                      }}>
                      ₹654
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.xxs,
                        fontFamily: Fonts.medium,
                        color: Colors.denger,
                        lineHeight: 14,
                        backgroundColor: '#FBDADA',
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                        borderRadius: 20,
                        marginTop: 3,
                      }}>
                      less 30%
                    </Text>
                  </View>
                  <View style={styles.insantiveCounterBox}>
                    <Image
                      source={require('../../../assets/images/money.png')}
                      resizeMode="cover"
                      style={styles.Icon}
                    />
                    <Text
                      style={{
                        fontSize: Size.xs,
                        fontFamily: Fonts.semiBold,
                        color: Colors.darkButton,
                        lineHeight: 19,
                      }}>
                      Incentive
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.md,
                        fontFamily: Fonts.regular,
                        color: Colors.darkButton,
                        lineHeight: 28,
                      }}>
                      ₹315
                    </Text>
                    <Text
                      style={{
                        fontSize: Size.xxs,
                        fontFamily: Fonts.medium,
                        color: Colors.darkButton,
                        lineHeight: 14,
                        backgroundColor: Colors.white,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 20,
                        marginTop: 3,
                      }}>
                      Earn upto 750
                    </Text>
                  </View>
                </View>
                <View style={styles.container}>
                  <View style={[styles.earningRange, {paddingHorizontal: 15}]}>
                    <Text
                      style={[
                        styles.earningRangeText,
                        {paddingHorizontal: 15},
                      ]}>
                      Earning Tips: Generate Material requisition worth ₹11409
                    </Text>
                  </View>
                  <View
                    style={[styles.earningRange, {alignItems: 'flex-start'}]}>
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                      }}>
                      Monitor your run rate
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: Size.sm,
                        color: Colors.darkButton,
                      }}>
                      Earn maximum incentives & achieve your target
                    </Text>
                  </View>
                  <View style={styles.graphSection}>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.md,
                        color: Colors.darkButton,
                      }}>
                      Earning trend
                    </Text>
                    <View
                      style={[
                        styles.earningRange,
                        {alignItems: 'flex-start', padding: 20},
                      ]}>
                      {/* <Image
                        source={require('../../assets/images/graph.jpg')}
                        resizeMode="cover"
                        style={{width: '100%', height: 127}}
                      /> */}
                      <IncentiveGraph />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </TabView.Item>
          </TabView>
        </>
      )}
    </SafeAreaView>
  );
};

export default IncentiveScreen;

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
    minHeight: 50,
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

    // Android Shadow
    elevation: 2,
  },

  salesHeaderData: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.orange,
    margin: 'auto',
    padding: 15,
    width: width * 0.32,
    textAlign: 'center',
    height: 100,
    borderRadius: 15,
    position: 'relative',
    marginBottom: -45,
  },

  insantiveCounter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  insantiveCounterBox: {
    backgroundColor: Colors.holdLight,
    margin: 'auto',
    width: width * 0.29,
    padding: 8,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.orange,
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 145,
  },
  Icon: {width: width * 0.11, height: 45, marginBottom: 8},

  earningRange: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  earningRangeText: {
    backgroundColor: Colors.holdLight,
    borderWidth: 0.8,
    borderStyle: 'dashed',
    borderColor: Colors.orange,
    color: Colors.orange,
    fontFamily: Fonts.regular,
    width: '100%',
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    lineHeight: 15,
    paddingVertical: 5,
  },
  graphSection: {marginTop: 10},
});
