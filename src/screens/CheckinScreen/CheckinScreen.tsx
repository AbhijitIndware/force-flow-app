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
import {flexCol} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../components/ui/LoadingScreen';
import React, {useCallback, useState} from 'react';
import {AppStackParamList} from '../../types/Navigation';
import PageHeader from '../../components/ui/PageHeader';
import { Size } from '../../utils/fontSize';
import { Fonts } from '../../constants';

import {CalendarCheck, Clock2, Upload } from 'lucide-react-native';


const { width } = Dimensions.get('window');
//const { height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'CheckinScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};



const AttendanceScreen = ({navigation}: Props) => {
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
          backgroundColor: Colors.lightBg,
        },
      ]}>
      <PageHeader title="Check-in" navigation={() => navigation.goBack()} />
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          style={styles.container}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
          <View style={styles.EmpInfoSection}>
            <View style={styles.EmpInfoView}>
              <Text style={styles.lableText}>Employee Id</Text>
              <View style={styles.ViewInputBox}>
                <Text style={styles.InputText}>SS/1245/7854</Text>
              </View>
            </View>
            <View style={styles.EmpInfoView}>
              <Text style={styles.lableText}>Employee name</Text>
              <View style={styles.ViewInputBox}>
                <Text style={styles.InputText}>Santanu Das</Text>
              </View>
            </View>
          </View>

          <View style={styles.ShiftSection}>
            <Text style={styles.HeadingText}>Shift Details</Text>
            <View style={[styles.ShiftDetailsBox,{marginTop:10, paddingVertical:20}]}>
              <View style={styles.TimeBoxSection}>
                <View style={styles.timeSection}>
                  <Clock2 size={16} color="#4A4A4A" strokeWidth={2}/>
                  <Text style={styles.time}> In  Time: 11:03:45 AM</Text>
                </View>
                <View style={styles.timeSection}>
                  <Clock2 size={16} color="#4A4A4A" strokeWidth={2}/>
                  <Text style={styles.time}> In  Time: 11:03:45 AM</Text>
                </View>
              </View>
              <Text style={{fontFamily:Fonts.regular, fontSize:Size.sm, color:'#B9BFCB',paddingTop:10, lineHeight:16}}>Store name</Text>
              <Text style={{fontFamily:Fonts.medium, fontSize:Size.sm, color:Colors.darkButton,paddingTop:5, lineHeight:16}}>Accestisa new mart</Text>
            </View>
          </View>

          <View style={styles.UploadSection}>
              <View style={styles.UploadSectionInner}>
                  <View style={styles.UploadIcon}>
                    <Upload strokeWidth={1.4} color={Colors.blue} />
                  </View>
                  <View>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.sm, color:Colors.blue,lineHeight:20}}>Upload image</Text>
                    <Text style={{fontFamily:Fonts.medium, fontSize:Size.xs, color:Colors.darkButton,paddingTop:5, lineHeight:16}}>Upload image for face recognition</Text>
                  </View>
              </View>
          </View>

          <View style={styles.CheckinOutSection}>
                <View style={styles.intime}>
                  <Text style={{fontFamily:Fonts.medium, fontSize:Size.sm, color:Colors.darkButton,lineHeight:20}}>Check-in time</Text>
                  <Text style={{fontFamily:Fonts.semiBold, fontSize:Size.md, color:Colors.darkButton,lineHeight:24}}>9:55 AM</Text>
                </View>
                <View style={styles.intime}>
                  <Text style={{fontFamily:Fonts.medium, fontSize:Size.sm, color:Colors.darkButton,lineHeight:20}}>Check-out time</Text>
                  <Text style={{fontFamily:Fonts.semiBold, fontSize:Size.md, color:Colors.darkButton,lineHeight:24}}>6:15 PM</Text>
                </View>
          </View>

          <TouchableOpacity style={styles.checkinButton} onPress={() => navigation.navigate('AttendanceScreen')}>
            <CalendarCheck strokeWidth={1.4} color={Colors.white} />
            <Text style={styles.checkinButtonText}>Check-in</Text>
          </TouchableOpacity>

        </ScrollView>

      )}
    </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
  },
//atteddanceCard section css
timeSection:{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'},
time:{color:Colors.darkButton, fontFamily:Fonts.medium, fontSize:Size.xs, lineHeight:18, display:'flex', alignItems:'center',flexDirection:'row'},

checkinButton:{ display:'flex', alignItems:'center', flexDirection:'row', justifyContent:'center',
backgroundColor:Colors.darkButton, borderRadius:15,paddingHorizontal:15, paddingVertical:18,gap:5, zIndex:1,width: width * 0.90, marginTop:20},
checkinButtonText:{fontFamily:Fonts.medium,fontSize:Size.sm,color:Colors.white, lineHeight:22 },


EmpInfoSection:{ backgroundColor:Colors.white, padding:15,borderRadius:15, marginTop:20, width:'100%',
  display:'flex', flexDirection:'column',gap:15,
},
EmpInfoView:{display:'flex', flexDirection:'column', gap:6},
lableText:{fontFamily:Fonts.medium,color:Colors.darkButton,fontSize:Size.sm},
ViewInputBox:{backgroundColor:Colors.lightBg, borderRadius:10, display:'flex', flexDirection:'column', justifyContent:'center',
  minHeight:45, paddingHorizontal:15,
},
InputText:{fontFamily:Fonts.medium,color:'#B4BBC9',fontSize:Size.sm},

ShiftSection:{ marginTop:20},
HeadingText:{fontFamily:Fonts.semiBold,color:Colors.darkButton,fontSize:Size.md},
ShiftDetailsBox:{
  backgroundColor:Colors.white, padding:15,borderRadius:15, marginTop:20, width:'100%',
  display:'flex', flexDirection:'column',
},
TimeBoxSection:{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'},

UploadSection:{backgroundColor:Colors.lightBg, borderRadius:10, marginTop:20, borderWidth:1,
  borderStyle:'dashed',borderColor:'#B9BFCB', padding:5},
UploadSectionInner:{display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center', gap:15,
  backgroundColor:Colors.lightBlue,borderRadius:10, padding:15,
},
UploadIcon:{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', width:40, height:40, backgroundColor:'#C8DAFF', borderRadius:100},

CheckinOutSection:{ backgroundColor:Colors.white, marginTop:20, borderRadius:15,position:'relative',
display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center',
},
intime:{width:'50%',display:'flex', flexDirection:'column', justifyContent:'space-between', alignItems:'center',padding:20, borderRightWidth:1,
  borderRightColor:'#F0F2F6', position:'relative',
},
graphicsSection:{position:'relative', justifyContent:'space-between', flexDirection:'column'},

});
