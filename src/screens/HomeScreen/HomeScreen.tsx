/* eslint-disable react-native/no-inline-styles */
import {Dimensions, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {flexCol} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../components/ui/LoadingScreen';
import React, {useCallback, useState} from 'react';
import {AppStackParamList} from '../../types/Navigation';
import { Fonts } from '../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Size } from '../../utils/fontSize';


const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'HomeScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const HomeScreen = ({navigation, route}: Props) => {
  console.log(navigation, route);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
            backgroundColor:Colors.lightBg,
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
                <View style={styles.welcomBox}>
                    <Text style={styles.welcomeText}>Hello <Text style={styles.name}>Santanu</Text></Text>
                    <View style={styles.linkBox}>
                        <View style={styles.dateBox}>
                          <Text style={styles.dateText}>21</Text>
                          <Text style={styles.monthText}>APR</Text>
                        </View>
                        <View style={styles.linkContent}>
                          <Text style={styles.paraText}>Last check-in at 11:05 pm.</Text>
                          <Ionicons name="chevron-forward-circle-sharp" size={24} color={Colors.white} />
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.checkinButton} onPress={() => navigation.navigate('AttendanceScreen')}>
                    <MaterialCommunityIcons name="calendar-check-outline" size={26} color={Colors.white} />
                    <Text style={styles.checkinButtonText}>Check-in</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.countBoxSection}>
                  <View style={styles.countBox}>
                    <View style={styles.countBoxIcon}>
                      <Image source={require('../../assets/images/calendar-check-2.png')} resizeMode="contain" style={{width:width * 0.4, height:23}} />
                    </View>
                    <Text style={styles.countBoxTitle}>Attendance</Text>
                    <Text style={styles.countBoxDay}>24 Days</Text>
                  </View>
                  <View style={styles.countBox}>
                    <View style={styles.countBoxIcon}>
                      <Image source={require('../../assets/images/network.png')} resizeMode="contain" style={{width:width * 0.4, height:25}} />
                    </View>
                    <Text style={styles.countBoxTitle}>AON</Text>
                    <Text style={styles.countBoxDay}>1244 Days</Text>
                  </View>
              </View>

              <View style={[styles.container,{backgroundColor:Colors.transparent, paddingTop:10}]}>
                <TouchableOpacity style={[styles.linkBox,{backgroundColor:Colors.orange,padding:7, borderRadius:18}]}>
                    <View style={[styles.dateBox,{backgroundColor:Colors.Orangelight,borderTopWidth:1, borderLeftWidth:1,borderRightWidth:1,borderColor:'#FFBF83',
                      borderBottomWidth:0, width:60, height:60,borderRadius:18}]}>
                       <Ionicons name="cube-outline" size={28} color={Colors.white} />
                    </View>
                    <View style={styles.linkContent}>
                      <View>
                        <Text style={styles.paraText}>Stock Valuation</Text>
                        <Text style={[styles.paraText,{fontFamily:Fonts.semiBold, fontSize:Size.md, lineHeight:20}]}><Text style={{fontFamily:Fonts.customefont}}>₹</Text>2115</Text>
                      </View>
                      <Ionicons name="chevron-forward-circle-sharp" size={24} color={Colors.white} />
                    </View>
                </TouchableOpacity>
              </View>
              <View style={[styles.container,{paddingTop:20}]}>
                  <Text style={styles.SectionHeading}>Target vs Achievement <Text style={{fontFamily:Fonts.regular}}>(Qty)</Text></Text>
                  <View style={styles.dataBoxSection}>
                      <View style={styles.dataBox}>
                        <View>
                          <Text style={styles.quantityCount}>25 / 11</Text>
                          <Text style={styles.quantitytime}>Daily quantity</Text>
                        </View>
                        <View style={styles.positionValue}>
                          <Image source={require('../../assets/images/move-up.png')} resizeMode="contain" style={{width:width * 0.07, height:23}} />
                          <Text style={styles.incressValu}>+3%</Text>
                        </View>
                      </View>
                      <View style={styles.dataBox}>
                        <View>
                          <Text style={styles.quantityCount}>375 / 221</Text>
                          <Text style={styles.quantitytime}>Monthly quantity</Text>
                        </View>
                        <View style={styles.positionValue}>
                          <Image source={require('../../assets/images/move-down.png')} resizeMode="contain" style={{width:width * 0.07, height:23}} />
                          <Text style={styles.decriseValu}>-2%</Text>
                        </View>
                      </View>
                      <View style={styles.dataBox}>
                        <View>
                          <Text style={styles.quantityCount}>2230 / 1224</Text>
                          <Text style={styles.quantitytime}>Quartely quantity</Text>
                        </View>
                        <View style={styles.positionValue}>
                          <Image source={require('../../assets/images/move-down.png')} resizeMode="contain" style={{width:width * 0.07, height:23}} />
                          <Text style={styles.decriseValu}>-2%</Text>
                        </View>
                      </View>
                  </View>
              </View>
              <View style={[styles.container,{paddingTop:20}]}>
                <Text style={styles.SectionHeading}>Incentive Status</Text>
                <View style={[styles.dataBox, {flexDirection:'column', alignItems:'flex-start', marginTop:10}]}>
                  <View style={styles.incentiveContent}>
                    <View style={styles.iconbox}>
                        <Image source={require('../../assets/images/banknote.png')} resizeMode="contain" style={{width:width * 0.80, height:30}} />
                    </View>
                    <View>
                      <Text style={styles.quantityCount}>₹2115</Text>
                      <Text style={styles.quantitytime}>Earned this month</Text>
                    </View>
                  </View>
                  <View style={[styles.positionValue,{flexDirection:'column',  justifyContent:'center', alignItems:'center', marginTop:20}]}>
                    <Text style={[styles.incressValu,{width:width * 0.82, height:40, textAlign:'center', lineHeight:34, borderStyle:'dashed', borderWidth:1, borderColor:Colors.sucess}]}>See how you can earn upto ₹15999</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.container,{paddingTop:20}]}>
                <Text style={styles.SectionHeading}>Are you in a new store?</Text>
                <View style={[styles.dataBox, {flexDirection:'column', alignItems:'flex-start', marginTop:10, paddingHorizontal:0, paddingVertical:10}]}>
                  <TouchableOpacity style={styles.listLink}>
                    <Text style={styles.listLinkText}>Set up the opening stock of your store</Text>
                    <View style={styles.arrobox}>
                      <Ionicons name="chevron-forward-outline" size={12} color={Colors.darkButton} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.listLink}>
                    <Text style={styles.listLinkText}>Check the user manual </Text>
                    <View style={styles.arrobox}>
                      <Ionicons name="chevron-forward-outline" size={12} color={Colors.darkButton} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.LinkSection,{paddingVertical:15}]}>
                <View style={styles.container}>
                  <Text style={[styles.SectionHeading,{marginBottom:10}]}>Quick links</Text>
                  <View style={styles.IconlinkBox}>
                      <View style={[styles.iconbox,{width:35, height:35, borderRadius:10}]}>
                        {/* <Image source={require('../../assets/images/banknote.png')} resizeMode="contain" style={{width:width * 0.50, height:20}} /> */}
                         <Ionicons name="person-add-outline" size={18} color={Colors.white} />
                      </View>
                      <Text style={styles.linkTitle}>Register Sales</Text>
                  </View>
                  <View style={styles.IconlinkBox}>
                      <View style={[styles.iconbox,{width:35, height:35, borderRadius:10}]}>
                        {/* <Image source={require('../../assets/images/banknote.png')} resizeMode="contain" style={{width:width * 0.50, height:20}} /> */}
                         <Ionicons name="cube-outline" size={18} color={Colors.white} />
                      </View>
                      <Text style={styles.linkTitle}>New Stock Entry</Text>
                  </View>
                  <View style={styles.IconlinkBox}>
                      <View style={[styles.iconbox,{width:35, height:35, borderRadius:10}]}>
                        <Image source={require('../../assets/images/file-pen-line.png')} resizeMode="contain" style={{width:width * 0.50, height:18}} />
                      </View>
                      <Text style={styles.linkTitle}>Stock Requisition</Text>
                  </View>
                  <View style={styles.IconlinkBox}>
                      <View style={[styles.iconbox,{width:35, height:35, borderRadius:10}]}>
                        <Image source={require('../../assets/images/chart-candlestick.png')} resizeMode="contain" style={{width:width * 0.50, height:18}} />
                      </View>
                      <Text style={styles.linkTitle}>Stock Taking</Text>
                  </View>
                  <View style={styles.IconlinkBox}>
                      <View style={[styles.iconbox,{width:35, height:35, borderRadius:10}]}>
                        <Image source={require('../../assets/images/message-square-quote.png')} resizeMode="contain" style={{width:width * 0.50, height:18}} />
                      </View>
                      <Text style={styles.linkTitle}>Feedback</Text>
                  </View>
                </View>
              </View>
          </ScrollView>
        )}
      </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({

 container: {
    flex:1,
    backgroundColor:Colors.transparent,
    position:'relative',
    paddingHorizontal:20,
  },

 //header-box-section css start
headerSec:{
 backgroundColor:Colors.white, minHeight:200, width:'100%',paddingHorizontal:20,
 borderBottomRightRadius:40, borderBottomLeftRadius:40,
 // iOS Shadow
    shadowColor: '#979797',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius:6,

    // Android Shadow
    elevation: 2,

},
welcomeText:{fontFamily:Fonts.light, color:Colors.white,fontSize:Size.sm},
name:{fontFamily:Fonts.medium,fontSize:Size.sm,color:Colors.white},
welcomBox:{ padding:15,backgroundColor:Colors.orange,borderRadius:15, paddingVertical:20,marginTop:10},

linkBox:{ display:'flex', flexDirection:'row', justifyContent:'flex-start',alignItems:'center',
  backgroundColor:Colors.Orangelight,borderRadius:15,padding:12, marginTop:8, gap:10,
  borderTopWidth:1, borderLeftWidth:1,borderRightWidth:1,borderColor:'#FFBF83',
},

dateBox:{width:50, height:50,borderColor:Colors.white, borderWidth:1,borderRadius:10,backgroundColor:Colors.transparent,
  display:'flex',flexDirection:'column', justifyContent:'center',alignItems:'center',paddingTop:5},

dateText:{fontFamily:Fonts.semiBold,fontSize:Size.sm,color:Colors.white,padding:0,margin:0,lineHeight:18},
monthText:{fontFamily:Fonts.regular, color:Colors.white,fontSize:Size.xs},

linkContent:{display:'flex', flexDirection:'row', justifyContent:'space-between',
  color:Colors.white,gap:5,alignItems:'center', width:'80%'},

  paraText:{fontFamily:Fonts.light, color:Colors.white,fontSize:Size.sm},
checkinButton:{display:'flex', alignItems:'center', flexDirection:'row', justifyContent:'center',
backgroundColor:Colors.darkButton, borderRadius:15,paddingHorizontal:15, paddingVertical:18,position:'relative',bottom:-15,gap:5},
checkinButtonText:{fontFamily:Fonts.medium,fontSize:Size.sm,color:Colors.white, lineHeight:22},

 //header-box-section css end
 //countBox-section css start
countBoxSection:{paddingHorizontal:20,paddingTop:35, display:'flex', justifyContent:'flex-start',alignItems:'center',gap:17, flexDirection:'row'},
countBox:{ backgroundColor:Colors.white, width:width * 0.43, borderRadius:15, padding:15, minHeight:107},
countBoxIcon:{width:45,height:45,display:'flex', alignItems:'center', flexDirection:'row', justifyContent:'center',backgroundColor:Colors.darkButton,borderRadius:100, marginBottom:10},
countBoxTitle:{fontFamily:Fonts.regular, color:Colors.darkButton,fontSize:Size.sm},
countBoxDay:{fontFamily:Fonts.semiBold, color:Colors.darkButton,fontSize:Size.xsmd, lineHeight:18},
//countBox-section css end

//target&achivement section css start
SectionHeading:{fontFamily:Fonts.semiBold, fontSize:Size.md, color:Colors.darkButton},
dataBoxSection:{paddingTop:15},
dataBox:{backgroundColor:Colors.white, borderRadius:18, marginBottom:15, paddingHorizontal:15, paddingVertical:20,
  display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center',
},
positionValue:{display:'flex', flexDirection:'row', alignItems:'center'},
incressValu:{display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center',
  backgroundColor:Colors.lightSuccess,color:Colors.sucess, paddingHorizontal:15,paddingVertical:4,
  fontFamily:Fonts.medium, fontSize:Size.sm, borderRadius:8},
quantityCount:{fontFamily:Fonts.bold, fontSize:Size.md, color:Colors.darkButton, lineHeight:22},
quantitytime:{fontFamily:Fonts.regular, fontSize:Size.sm, color:Colors.darkButton, lineHeight:20},

decriseValu:{display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center',
  backgroundColor:Colors.lightDenger,color:Colors.denger, paddingHorizontal:15,paddingVertical:4,
  fontFamily:Fonts.medium, fontSize:Size.sm, borderRadius:8},

//incentive section css start
incentiveContent:{display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center', gap:10},
iconbox:{width:60, height:60, backgroundColor:Colors.darkButton, borderRadius:18,display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center'},

listLink:{paddingHorizontal:15, paddingVertical:15, display:'flex', flexDirection:'row',
  alignItems:'center', justifyContent:'space-between', width:width * 0.90,
},
listLinkText:{color:Colors.darkButton,fontSize:Size.sm, fontFamily:Fonts.regular},
arrobox:{width:20, height:20, backgroundColor:'#F0F2F6',display:'flex', flexDirection:'row',
  alignItems:'center',justifyContent:'center', borderRadius:100},

//incentive section css start
LinkSection:{backgroundColor:Colors.white},

IconlinkBox:{display:'flex', flexDirection:'row',alignItems:'center', gap:10, marginBottom:10},
linkTitle:{color:Colors.darkButton,fontSize:Size.sm, fontFamily:Fonts.medium},

});
