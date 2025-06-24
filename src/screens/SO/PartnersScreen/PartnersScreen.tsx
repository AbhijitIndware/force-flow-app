/* eslint-disable react-native/no-inline-styles */
import {
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
import React, {useCallback, useState} from 'react';
import { SoAppStackParamList} from '../../../types/Navigation';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  CirclePlus,
  Clock2,
  Funnel,
  Search,
  UserRoundPlus,
} from 'lucide-react-native';
import {Tab, TabView} from '@rneui/themed';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PartnersScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const OrdersScreen = ({navigation, route}: Props) => {
  console.log(navigation, route);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [index, setIndex] = React.useState(0);

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
            <View style={{ width:40, height:40,alignItems:'center', justifyContent:'center', backgroundColor:Colors.lightOrange,
              borderRadius:15,
            }}>
              <UserRoundPlus size={20} color={Colors.orange} strokeWidth={1.7}/>
            </View>
            <Text style={{fontFamily:Fonts.regular, fontSize:Size.sm, color:Colors.darkButton, marginTop:5}}>Total Customers</Text>
            <Text style={{fontFamily:Fonts.semiBold, fontSize:Size.md, color:Colors.darkButton}}>400</Text>
          </View>
          <View
            style={{
              backgroundColor: Colors.orange,
              paddingTop: 60,
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
                title="Distributor"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 6,
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
                  lineHeight: 6,
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
          <TabView value={index} onChange={setIndex} animationType="spring">
            <TabView.Item
              style={{
                width: '100%',
                flex: 1,
                backgroundColor: Colors.lightBg,
                position: 'relative',
              }}>
              <View
                style={[
                  styles.bodyContent,
                  {paddingHorizontal: 20, paddingTop: 10, paddingBottom:70},
                ]}>
                <View style={styles.bodyHeader}>
                  <Text style={styles.bodyHeaderTitle}>
                    All Distributor
                  </Text>
                  <View style={styles.bodyHeaderIcon}>
                    <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
                    <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
                  </View>
                </View>
                <ScrollView
                  nestedScrollEnabled={true}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }>
                  {/* card section start here */}
                  <View style={styles.atteddanceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.timeSection}>
                        <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                        <Text style={styles.time}> 11:03:45 AM</Text>
                      </View>
                      <Text style={[styles.present, {marginLeft: 'auto'}]}>
                        Approved
                      </Text>
                    </View>
                    <View style={styles.cardbody}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>19</Text>
                        <Text style={styles.monthText}>Jan</Text>
                      </View>
                      <View style={ {width:'80%'}}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                          <Text style={styles.contentText}>ID: dist-00123</Text>
                          <Text style={styles.contentText}>Zone: North</Text>
                        </View>
                        <Text style={styles.contentText}>Distributor name</Text>
                        <Text style={[styles.contentText,{fontFamily:Fonts.medium}]}>
                          Accestisa new mart
                        </Text>
                        <Text style={styles.contentText}>
                          City: New Delhi
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.atteddanceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.timeSection}>
                        <Text style={styles.time}> PO ID: PO-1001</Text>
                      </View>
                      <Text style={[styles.leave, {marginLeft: 'auto'}]}>
                        Submitted
                      </Text>
                    </View>
                    <View style={styles.cardbody}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>19</Text>
                        <Text style={styles.monthText}>Jan</Text>
                      </View>
                      <View style={ {width:'80%'}}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                          <Text style={styles.contentText}>ID: dist-00123</Text>
                          <Text style={styles.contentText}>Zone: South</Text>
                        </View>
                        <Text style={styles.contentText}>Distributor name</Text>
                        <Text style={[styles.contentText,{fontFamily:Fonts.medium}]}>
                          Accestisa new mart
                        </Text>
                        <Text style={styles.contentText}>
                          City: New Delhi
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.atteddanceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.timeSection}>
                        <Text style={styles.time}> PO ID: PO-1001</Text>
                      </View>
                      <Text style={[styles.leave, {marginLeft: 'auto'}]}>
                        Submitted
                      </Text>
                    </View>
                    <View style={styles.cardbody}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>19</Text>
                        <Text style={styles.monthText}>Jan</Text>
                      </View>
                      <View style={ {width:'80%'}}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                          <Text style={styles.contentText}>ID: dist-00123</Text>
                          <Text style={styles.contentText}>Zone: East</Text>
                        </View>
                        <Text style={styles.contentText}>Distributor name</Text>
                        <Text style={[styles.contentText,{fontFamily:Fonts.medium}]}>
                          Accestisa new mart
                        </Text>
                        <Text style={styles.contentText}>
                          City: New Delhi
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.atteddanceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.timeSection}>
                        <Text style={styles.time}> PO ID: PO-1001</Text>
                      </View>
                      <Text style={[styles.present, {marginLeft: 'auto'}]}>
                        Approved
                      </Text>
                    </View>
                    <View style={styles.cardbody}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>19</Text>
                        <Text style={styles.monthText}>Jan</Text>
                      </View>
                      <View style={ {width:'80%'}}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                          <Text style={styles.contentText}>ID: dist-00123</Text>
                          <Text style={styles.contentText}>Zone: West</Text>
                        </View>
                        <Text style={styles.contentText}>Distributor name</Text>
                        <Text style={[styles.contentText,{fontFamily:Fonts.medium}]}>
                          Accestisa new mart
                        </Text>
                        <Text style={styles.contentText}>
                          City: New Delhi
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
                <View
                  style={{
                    paddingHorizontal: 20,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={() => navigation.navigate('AddDistributorScreen')}>
                    <CirclePlus  strokeWidth={1.4} color={Colors.white} />
                    <Text style={styles.checkinButtonText}>
                      Add Distributor
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TabView.Item>
            <TabView.Item
              style={{
                width: '100%',
                flex: 1,
                backgroundColor: Colors.lightBg,
                position: 'relative',
              }}>
              <View
                style={[
                  styles.bodyContent,
                  {paddingHorizontal: 20, paddingTop: 10, paddingBottom:70},
                ]}>
                <View style={styles.bodyHeader}>
                  <Text style={styles.bodyHeaderTitle}>
                    All Store
                  </Text>
                  <View style={styles.bodyHeaderIcon}>
                    <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
                    <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
                  </View>
                </View>
                <ScrollView
                  nestedScrollEnabled={true}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }>
                  {/* card section start here */}
                  <View style={styles.atteddanceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.timeSection}>
                        <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                        <Text style={styles.time}> 11:03:45 AM</Text>
                      </View>
                      <Text style={[styles.present, {marginLeft: 'auto'}]}>
                        Approved
                      </Text>
                    </View>
                    <View style={styles.cardbody}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>19</Text>
                        <Text style={styles.monthText}>Jan</Text>
                      </View>
                      <View style={ {width:'80%'}}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                          <Text style={styles.contentText}>ID: dist-00123</Text>
                          <Text style={styles.contentText}>Zone: North</Text>
                        </View>
                        <Text style={styles.contentText}>Distributor name</Text>
                        <Text style={[styles.contentText,{fontFamily:Fonts.medium}]}>
                          Accestisa new mart
                        </Text>
                        <Text style={styles.contentText}>
                          City: New Delhi
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.atteddanceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.timeSection}>
                        <Text style={styles.time}> PO ID: PO-1001</Text>
                      </View>
                      <Text style={[styles.leave, {marginLeft: 'auto'}]}>
                        Submitted
                      </Text>
                    </View>
                    <View style={styles.cardbody}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>19</Text>
                        <Text style={styles.monthText}>Jan</Text>
                      </View>
                      <View style={ {width:'80%'}}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                          <Text style={styles.contentText}>ID: dist-00123</Text>
                          <Text style={styles.contentText}>Zone: South</Text>
                        </View>
                        <Text style={styles.contentText}>Distributor name</Text>
                        <Text style={[styles.contentText,{fontFamily:Fonts.medium}]}>
                          Accestisa new mart
                        </Text>
                        <Text style={styles.contentText}>
                          City: New Delhi
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.atteddanceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.timeSection}>
                        <Text style={styles.time}> PO ID: PO-1001</Text>
                      </View>
                      <Text style={[styles.leave, {marginLeft: 'auto'}]}>
                        Submitted
                      </Text>
                    </View>
                    <View style={styles.cardbody}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>19</Text>
                        <Text style={styles.monthText}>Jan</Text>
                      </View>
                      <View style={ {width:'80%'}}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                          <Text style={styles.contentText}>ID: dist-00123</Text>
                          <Text style={styles.contentText}>Zone: East</Text>
                        </View>
                        <Text style={styles.contentText}>Distributor name</Text>
                        <Text style={[styles.contentText,{fontFamily:Fonts.medium}]}>
                          Accestisa new mart
                        </Text>
                        <Text style={styles.contentText}>
                          City: New Delhi
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.atteddanceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.timeSection}>
                        <Text style={styles.time}> PO ID: PO-1001</Text>
                      </View>
                      <Text style={[styles.present, {marginLeft: 'auto'}]}>
                        Approved
                      </Text>
                    </View>
                    <View style={styles.cardbody}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateText}>19</Text>
                        <Text style={styles.monthText}>Jan</Text>
                      </View>
                      <View style={ {width:'80%'}}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                          <Text style={styles.contentText}>ID: dist-00123</Text>
                          <Text style={styles.contentText}>Zone: West</Text>
                        </View>
                        <Text style={styles.contentText}>Distributor name</Text>
                        <Text style={[styles.contentText,{fontFamily:Fonts.medium}]}>
                          Accestisa new mart
                        </Text>
                        <Text style={styles.contentText}>
                          City: New Delhi
                        </Text>
                      </View>
                    </View>
                  </View>

                </ScrollView>
                <View
                  style={{
                    paddingHorizontal: 20,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={() => navigation.navigate('AddStoreScreen')}>
                    <CirclePlus  strokeWidth={1.4} color={Colors.white} />
                    <Text style={styles.checkinButtonText}>
                      Add Store
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TabView.Item>
          </TabView>
        </>
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
    paddingBottom:10,
    textAlign:'center',
    justifyContent:'center',
    alignItems:'center',

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
    bottom:-65,
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
    paddingVertical:10,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 17,
    flexDirection: 'row',
  },
  countBox: {
    backgroundColor: Colors.white,
    width:'33.33%',
    borderRadius: 15,
    padding:10,
    minHeight: 135,
    shadowColor: '#9F9D9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
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
    borderRadius:15,
    marginBottom: 10,
    marginLeft:'auto',
  },
  countBoxTitle: {
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    fontSize: Size.xs,
    lineHeight:18,
  },
  countBoxDay: {
    fontFamily: Fonts.semiBold,
    color: Colors.darkButton,
    fontSize: Size.xslg,
    lineHeight: 20,
    position:'relative',
  },
  //countBox-section css end
});
