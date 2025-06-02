/* eslint-disable react-native/no-inline-styles */
import {Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet,Dimensions, View, Text, TouchableOpacity} from 'react-native';
import React, { useCallback, useState } from 'react';
import { flexCol } from '../../utils/styles';
import { Colors } from '../../utils/colors';
import { Fonts } from '../../constants';
import { Size } from '../../utils/fontSize';
import Input from '@rneui/themed/dist/Input';
import {  EyeOff,  Lock,  Mail, UserRound, UserRoundPen } from 'lucide-react-native';
const {width} = Dimensions.get('window');

type Props = {
  navigation: any;
  route: any;
};

const SignupScreen = ({navigation, route}: Props) => {
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
              backgroundColor: Colors.lightBg,
            },
          ]}>
            <ScrollView
              nestedScrollEnabled={true}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }>
                <View style={styles.header}>
                  <Image
                    source={require('../../assets/images/brand.png')}
                    resizeMode="cover"
                    style={styles.logoImage}
                  />
                </View>
                <View style={styles.LoginBody}>
                  <Text style={{fontFamily:Fonts.bold, fontSize:Size.lg, width:'100%', textAlign:'center',
                    color:Colors.white, padding:0, margin:0,lineHeight:35,
                  }}>Sign Up</Text>
                  <Text style={{fontFamily:Fonts.light, fontSize:Size.md, width:'100%', textAlign:'center',
                    color:Colors.white,
                  }}>Enter credentials to Sign up</Text>
                  <View style={{paddingTop:20}}>

                      <Input
                        style={styles.inputBox}
                        inputStyle={{ paddingTop:18}}
                        labelStyle={{color:Colors.white}}
                        placeholderTextColor="#FFC691"
                        inputContainerStyle={{borderBottomWidth:0, backgroundColor:Colors.Orangelight, paddingHorizontal:10,borderRadius:20,
                          alignItems:'center',justifyContent:'center',margin:0,
                        }}
                        placeholder="Name"
                        leftIcon={
                          <UserRound color={Colors.white}  />
                        }
                      />
                      <Input
                        style={styles.inputBox}
                        inputStyle={{ paddingTop:18}}
                        labelStyle={{color:Colors.white}}
                        placeholderTextColor="#FFC691"
                        inputContainerStyle={{borderBottomWidth:0, backgroundColor:Colors.Orangelight, paddingHorizontal:10,borderRadius:20,
                          alignItems:'center',justifyContent:'center',margin:0,
                        }}
                        placeholder=" E-mail ID"
                        leftIcon={
                          <Mail color={Colors.white}  />
                        }
                      />
                      <Input
                        secureTextEntry={true}
                        style={styles.inputBox}
                        inputStyle={{ paddingTop:18}}
                        labelStyle={{color:Colors.white}}
                        placeholderTextColor="#FFC691"
                        inputContainerStyle={{borderBottomWidth:0, backgroundColor:Colors.Orangelight, paddingHorizontal:10,borderRadius:20,
                          alignItems:'center',justifyContent:'center',
                        }}
                        placeholder="Password"
                        leftIcon={
                          <Lock color={Colors.white}  />
                        }
                        rightIcon={
                          <TouchableOpacity>
                            <EyeOff color={Colors.white}  />
                            {/* <Eye color={Colors.white}  /> */}
                          </TouchableOpacity>
                        }
                      />
                      <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={() => navigation.navigate('HomeScreen')}>
                    <UserRoundPen  strokeWidth={1.4} color={Colors.white} />
                    <Text style={styles.checkinButtonText}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                  </View>
                </View>
                <Text style={{fontFamily:Fonts.regular, fontSize:Size.sm, width:'100%', textAlign:'center',
                    color:Colors.darkButton, marginTop:20}}>You have an account?
                    <Text style={{fontFamily:Fonts.semiBold}} onPress={() => navigation.navigate('LoginScreen')}> Login</Text> </Text>
            </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;


const styles = StyleSheet.create({
  header:{
       backgroundColor: Colors.white,
    minHeight: 300,
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
    justifyContent:'center',
    alignItems:'center',
  },
  logoImage: {
    width: width * 0.6,
    height: 50,
  },
  LoginBody:{ backgroundColor:Colors.orange , margin:'auto', width:'90%', position:'relative',
     marginTop:-80, zIndex:1, minHeight:400, borderRadius:30, padding:20, justifyContent:'center'},
  inputBox:{
    color:Colors.white, fontFamily:Fonts.light, fontSize:Size.xsmd, borderBottomWidth:0, margin:0,
  },
checkinButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 18,
    gap: 5,
    zIndex: 1,
    width:'93%',
    margin:'auto',
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
  });
