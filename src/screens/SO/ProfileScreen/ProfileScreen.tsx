/* eslint-disable react-native/no-inline-styles */
import {
  Image,
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
import {SoAppStackParamList} from '../../../types/Navigation';
import PageHeader from '../../../components/ui/PageHeader';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {CirclePower} from 'lucide-react-native';
import {Divider} from '@rneui/themed';
import {useAppDispatch, useAppSelector} from '../../../store/hook';
import {logout} from '../../../features/auth/auth';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ProfileScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ProfileScreen = ({navigation}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const user = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user,
  );
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    Toast.show({
      type: 'success',
      text1: '🔒 Logout successful',
      position: 'top',
    });
    dispatch(logout());
  };

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      <PageHeader title="Profile" navigation={() => navigation.goBack()} />
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.headerSec}>
            <View style={styles.salesHeaderData}>
              <View style={styles.userInfo}>
                <Image
                  source={require('../../../assets/images/user.jpg')}
                  resizeMode="cover"
                  style={styles.avtarImage}
                />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: Size.sm,
                  color: Colors.orange,
                  lineHeight: 16,
                  marginTop: 15,
                }}>
                {user?.email}
              </Text>
            </View>
          </View>
          <View style={styles.container}>
            <View
              style={{
                backgroundColor: Colors.white,
                marginTop: 80,
                borderRadius: 15,
                paddingVertical: 20,
              }}>
              <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.sm,
                    color: '#514E4E',
                    lineHeight: 16,
                  }}>
                  Name
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: '#514E4E',
                    lineHeight: 20,
                    marginTop: 3,
                  }}>
                  {user?.full_name}
                </Text>
              </View>
              <Divider
                width={1}
                color="#B9BFCB"
                style={{marginBottom: 10, borderStyle: 'dashed'}}
              />
              <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.sm,
                    color: '#514E4E',
                    lineHeight: 16,
                  }}>
                  Age on Network
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: '#514E4E',
                    lineHeight: 20,
                    marginTop: 3,
                  }}>
                  1223 Days
                </Text>
              </View>
              <Divider
                width={1}
                color="#B9BFCB"
                style={{marginBottom: 10, borderStyle: 'dashed'}}
              />
              <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.sm,
                    color: '#514E4E',
                    lineHeight: 20,
                  }}>
                  Date of joining
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: '#514E4E',
                    lineHeight: 20,
                    marginTop: 3,
                  }}>
                  09/11/2025
                </Text>
              </View>
              <Divider
                width={1}
                color="#B9BFCB"
                style={{marginBottom: 10, borderStyle: 'dashed'}}
              />
              <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.sm,
                    color: '#514E4E',
                    lineHeight: 16,
                  }}>
                  Zone
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: '#514E4E',
                    lineHeight: 20,
                    marginTop: 3,
                  }}>
                  East
                </Text>
              </View>
              <Divider
                width={1}
                color="#B9BFCB"
                style={{marginBottom: 10, borderStyle: 'dashed'}}
              />
              <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.sm,
                    color: '#514E4E',
                    lineHeight: 16,
                  }}>
                  Mobile no
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: '#514E4E',
                    lineHeight: 20,
                    marginTop: 3,
                  }}>
                  9748133185
                </Text>
              </View>
              <Divider
                width={1}
                color="#B9BFCB"
                style={{marginBottom: 10, borderStyle: 'dashed'}}
              />
              <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.sm,
                    color: '#514E4E',
                    lineHeight: 20,
                  }}>
                  Date of joining
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: '#514E4E',
                    lineHeight: 20,
                    marginTop: 3,
                  }}>
                  09/11/2025
                </Text>
              </View>
              <Divider
                width={1}
                color="#B9BFCB"
                style={{marginBottom: 10, borderStyle: 'dashed'}}
              />
              <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.sm,
                    color: '#514E4E',
                    lineHeight: 16,
                  }}>
                  Date of birth
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.xsmd,
                    color: '#514E4E',
                    lineHeight: 20,
                    marginTop: 3,
                  }}>
                  10/12/1985
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.checkinButton}
              onPress={() => handleLogout()}>
              <CirclePower strokeWidth={1.4} color={Colors.white} />
              <Text style={styles.checkinButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    paddingHorizontal: 20,
    paddingBottom: 15,
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
    position: 'relative',
    gap: 5,
    zIndex: 1,
    width: '100%',
    marginTop: 20,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
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
    backgroundColor: Colors.transparent,
    margin: 'auto',
    padding: 15,
    textAlign: 'center',
    borderRadius: 15,
    position: 'relative',
    marginBottom: -70,
  },

  userInfo: {
    overflow: 'hidden',
    borderRadius: 15,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  avtarImage: {
    height: 82,
    width: 82,
  },
});
