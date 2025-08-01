/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import React, {useCallback, useEffect, useState} from 'react';
import {SoAppStackParamList} from '../../../types/Navigation';
import {Fonts} from '../../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Size} from '../../../utils/fontSize';
import {Divider} from '@rneui/themed';
import {
  ArrowRight,
  BaggageClaim,
  ClipboardPenLine,
  FilePlus2,
  Hotel,
  MapPinCheck,
  MoveDown,
  MoveUp,
  Package,
  ShoppingCart,
  UsersRound,
} from 'lucide-react-native';
import {useAppSelector} from '../../../store/hook';
import {
  useCheckOutMutation,
  usePjpInitializeMutation,
} from '../../../features/base/base-api';
import Toast from 'react-native-toast-message';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'HomeScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const HomeScreen = ({navigation}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );

  const [pjpInitialize, {data, error}] = usePjpInitializeMutation();
  const [checkOut, {isLoading}] = useCheckOutMutation();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      pjpInitialize();
    }, 2000);
  }, []);

  const handleCheckOut = async () => {
    try {
      const res = await checkOut({
        store: '',
        activity_type: [{activity_type: ''}],
      }).unwrap();

      if (res?.message?.status === 'success') {
        Toast.show({
          type: 'success',
          text1: `✅ ${res.message.message || 'Checked out successfully'}`,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: `❌ ${res.message?.message || 'Check-out failed'}`,
          position: 'top',
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      Toast.show({
        type: 'error',
        text1: `❌ ${error?.data?.message?.message || 'Internal Server Error'}`,
        text2: 'Please try again later.',
        position: 'top',
      });
    }
  };

  useEffect(() => {
    pjpInitialize();
  }, [user]);

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
        <ScrollView
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.headerSec}>
            <View style={{position: 'relative', marginBottom: -100}}>
              <View style={styles.welcomBox}>
                <Text style={styles.welcomeText}>
                  Hello <Text style={styles.name}>{user?.full_name}</Text>
                </Text>
                <View style={styles.linkBox}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateText}>21</Text>
                    <Text style={styles.monthText}>APR</Text>
                  </View>
                  <View style={styles.linkContent}>
                    <Text style={styles.paraText}>
                      Last check-in at 11:05 pm.
                    </Text>
                    <Text style={styles.paraText}>Store- New mart</Text>
                  </View>
                </View>
                {data?.message?.data?.store_category_validation?.valid ? (
                  <View>
                    <TouchableOpacity
                      style={styles.checkinButton}
                      onPress={handleCheckOut}
                      disabled={isLoading}>
                      <Text style={styles.checkinButtonText}>
                        {/* Check Out from New mart */} Check Out
                      </Text>

                      {isLoading ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <Ionicons
                          name="chevron-forward-circle-sharp"
                          size={24}
                          color={Colors.white}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.checkinButton}
                      onPress={() => navigation.navigate('MarkActivityScreen')}>
                      <Text style={styles.checkinButtonText}>
                        {/* Check Out from New mart */} Mark Activity
                      </Text>
                      <Ionicons
                        name="chevron-forward-circle-sharp"
                        size={24}
                        color={Colors.white}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={() => navigation.navigate('CheckInForm')}>
                    <Text style={styles.checkinButtonText}>
                      {/* Check Out from New mart */} Check In
                    </Text>
                    <Ionicons
                      name="chevron-forward-circle-sharp"
                      size={24}
                      color={Colors.white}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.planLink}>
                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  onPress={() => navigation.navigate('AttendanceScreen')}>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: Size.sm,
                      color: Colors.darkButton,
                    }}>
                    See todays beat plan
                  </Text>
                  <ArrowRight
                    strokeWidth={2}
                    color={Colors.darkButton}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.countBoxSection}>
            <View style={styles.countBox}>
              <View
                style={[
                  styles.countBoxIcon,
                  {backgroundColor: Colors.holdLight},
                ]}>
                <ClipboardPenLine strokeWidth={1.4} color={Colors.orange} />
              </View>
              <Text style={styles.countBoxDay}>50</Text>
              <Text style={styles.countBoxTitle}>Total call</Text>
            </View>
            <View style={styles.countBox}>
              <View
                style={[
                  styles.countBoxIcon,
                  {backgroundColor: Colors.lightSuccess},
                ]}>
                <MapPinCheck strokeWidth={1.4} color={Colors.success} />
              </View>
              <Text style={styles.countBoxDay}>12</Text>
              <Text style={styles.countBoxTitle}>Productive Call</Text>
            </View>
          </View>
          <View style={[styles.container, {paddingTop: 35}]}>
            <Text style={styles.SectionHeading}>
              Target vs Achievement{' '}
              <Text style={{fontFamily: Fonts.regular}}>(Qty)</Text>
            </Text>
            <View style={styles.dataBoxSection}>
              <View style={styles.dataBox}>
                <View>
                  <Text style={styles.quantityCount}>25 / 11</Text>
                  <Text style={styles.quantitytime}>Daily quantity</Text>
                </View>
                <View style={styles.positionValue}>
                  <MoveUp strokeWidth={2} color={Colors.darkButton} />
                  <Text style={styles.incressValu}>+3%</Text>
                </View>
              </View>
              <View style={styles.dataBox}>
                <View>
                  <Text style={styles.quantityCount}>375 / 221</Text>
                  <Text style={styles.quantitytime}>Monthly quantity</Text>
                </View>
                <View style={styles.positionValue}>
                  <MoveDown strokeWidth={2} color={Colors.darkButton} />
                  <Text style={styles.decriseValu}>-2%</Text>
                </View>
              </View>
              <View style={styles.dataBox}>
                <View>
                  <Text style={styles.quantityCount}>2230 / 1224</Text>
                  <Text style={styles.quantitytime}>Quartely quantity</Text>
                </View>
                <View style={styles.positionValue}>
                  <MoveDown strokeWidth={2} color={Colors.darkButton} />
                  <Text style={styles.decriseValu}>-2%</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.container, {paddingTop: 20}]}>
            <Text style={styles.SectionHeading}>Team Performance</Text>
            <View
              style={[
                styles.dataBox,
                {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginTop: 10,
                },
              ]}>
              <View style={styles.incentiveContent}>
                <View style={styles.iconbox}>
                  <UsersRound strokeWidth={2} color={Colors.white} size={30} />
                </View>
                <View>
                  <Text style={styles.quantityCount}>₹2115</Text>
                  <Text style={styles.quantitytime}>Sales this month</Text>
                </View>
              </View>
              <View
                style={[
                  styles.positionValue,
                  {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                    height: 40,
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    borderColor: Colors.sucess,
                    backgroundColor: '#C8F8D1',
                    borderRadius: 8,
                    width: '100%',
                  },
                ]}>
                <Text style={[styles.incressValu]}>
                  See how your team is doing
                </Text>
                <Ionicons
                  name="chevron-forward-circle-sharp"
                  size={24}
                  color={Colors.sucess}
                />
              </View>
            </View>
          </View>

          <View
            style={[styles.LinkSection, {paddingVertical: 15, marginTop: 20}]}>
            <Text
              style={[
                styles.SectionHeading,
                {marginBottom: 10, paddingHorizontal: 20},
              ]}>
              Quick links
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddStoreScreen')}
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <Hotel strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Add Store</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{marginBottom: 10, borderStyle: 'dashed'}}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('AddDistributorScreen')}
              style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <Package strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Add Distributor</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{marginBottom: 10, borderStyle: 'dashed'}}
            />
            <TouchableOpacity style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <BaggageClaim strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Sales Order</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{marginBottom: 10, borderStyle: 'dashed'}}
            />
            <TouchableOpacity style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <ShoppingCart strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Purchase Order</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{marginBottom: 10, borderStyle: 'dashed'}}
            />
            <TouchableOpacity style={styles.IconlinkBox}>
              <View
                style={[
                  styles.iconbox,
                  {
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: Colors.darkButton,
                  },
                ]}>
                <FilePlus2 strokeWidth={2} color={Colors.white} size={20} />
              </View>
              <Text style={styles.linkTitle}>Add PJP</Text>
              <View style={[styles.arrobox, {marginLeft: 'auto'}]}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={12}
                  color={Colors.darkButton}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

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
    minHeight: 200,
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android Shadow
    elevation: 2,
  },
  welcomeText: {
    fontFamily: Fonts.light,
    color: Colors.white,
    fontSize: Size.sm,
  },
  name: {fontFamily: Fonts.medium, fontSize: Size.sm, color: Colors.white},
  welcomBox: {
    padding: 15,
    backgroundColor: Colors.orange,
    borderRadius: 15,
    paddingVertical: 20,
    marginTop: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    position: 'relative',
  },

  linkBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 15,
    marginTop: 8,
    gap: 10,
  },

  dateBox: {
    width: 50,
    height: 50,
    borderColor: Colors.white,
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
    color: Colors.white,
    padding: 0,
    margin: 0,
    lineHeight: 18,
  },
  monthText: {
    fontFamily: Fonts.regular,
    color: Colors.white,
    fontSize: Size.xs,
  },

  linkContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: Colors.white,
    gap: 1,
    alignItems: 'flex-start',
    width: '80%',
  },

  planLink: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  paraText: {fontFamily: Fonts.light, color: Colors.white, fontSize: Size.sm},
  checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 18,
    position: 'relative',
    gap: 5,
    marginTop: 15,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },

  //header-box-section css end
  //countBox-section css start
  countBoxSection: {
    paddingHorizontal: 20,
    paddingTop: 100,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 17,
    flexDirection: 'row',
  },
  countBox: {
    backgroundColor: Colors.white,
    width: width * 0.43,
    borderRadius: 15,
    padding: 15,
    minHeight: 107,
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
    fontSize: Size.sm,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: Size.xslg,
    lineHeight: 20,
    position: 'relative',
    marginTop: -25,
  },
  //countBox-section css end

  //target&achivement section css start
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  dataBoxSection: {paddingTop: 15},
  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionValue: {display: 'flex', flexDirection: 'row', alignItems: 'center'},
  incressValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: Colors.sucess,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },
  quantityCount: {
    fontFamily: Fonts.bold,
    fontSize: Size.md,
    color: Colors.darkButton,
    lineHeight: 22,
  },
  quantitytime: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
    lineHeight: 20,
  },

  decriseValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },

  //incentive section css start
  incentiveContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  iconbox: {
    width: 60,
    height: 60,
    backgroundColor: Colors.sucess,
    borderRadius: 18,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listLink: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
  },
  listLinkText: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.regular,
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

  //incentive section css start
  LinkSection: {backgroundColor: Colors.white},

  IconlinkBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  linkTitle: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
  },
});
