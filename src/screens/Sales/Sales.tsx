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
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';
import {
  Banknote,
  CalendarDays,
  Clock2,
  EllipsisVertical,
  Funnel,
  Search,
} from 'lucide-react-native';
import FilterModal from '../../components/ui/filterModal';
//import { fonts } from '@rneui/base';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'SalesScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const SalesScreen = ({navigation}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  console.log('🚀 ~ SalesScreen ~ selectedCategory:', selectedCategory);

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
          <ScrollView
            nestedScrollEnabled={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={styles.headerSec}>
              <View style={styles.salesHeaderData}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.sm,
                    color: Colors.darkButton,
                  }}>
                  Total Sales
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: Size.md,
                    color: Colors.darkButton,
                  }}>
                  ₹325000
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: Size.xs,
                    color: Colors.sucess,
                    lineHeight: 16,
                    marginTop: 5,
                  }}>
                  +3.5 % MTD{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: Size.xs,
                    color: Colors.darkButton,
                  }}>
                  81.33% achieved{' '}
                </Text>
              </View>
              <View style={styles.welcomBox}>
                <Text style={styles.welcomeText}>
                  Target <Text style={styles.name}>₹325000</Text>
                </Text>
                <View style={styles.linkBox}>
                  <View style={styles.linkContent}>
                    <Banknote size={30} color={Colors.white} />
                    <Text style={styles.welcomeText}>
                      Incentive earned <Text style={styles.name}>₹2347</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.bodyContent,
                {paddingHorizontal: 20, marginTop: 70},
              ]}>
              <View style={styles.bodyHeader}>
                <Text style={styles.bodyHeaderTitle}>Recent Attendance</Text>
                <View style={styles.bodyHeaderIcon}>
                  <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
                  <FilterModal
                    visible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    onApply={() => setModalVisible(false)}>
                    <Text
                      onPress={() => setSelectedCategory('All')}
                      style={{paddingVertical: 10}}>
                      All
                    </Text>
                    <Text
                      onPress={() => setSelectedCategory('Electronics')}
                      style={{paddingVertical: 10}}>
                      Electronics
                    </Text>
                    <Text
                      onPress={() => setSelectedCategory('Books')}
                      style={{paddingVertical: 10}}>
                      Books
                    </Text>
                  </FilterModal>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
                  </TouchableOpacity>
                </View>
              </View>
              {/* card section start here */}
              <View style={styles.atteddanceCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.timeSection}>
                    <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                    <Text style={styles.time}>11:03:45 AM</Text>
                  </View>
                  <Text style={[styles.present, {marginLeft: 'auto'}]}>
                    Delivered
                  </Text>
                  <EllipsisVertical size={20} color={Colors.darkButton} />
                </View>
                <View style={styles.cardbody}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateText}>19</Text>
                    <Text style={styles.monthText}>APR</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                        lineHeight: 18,
                      }}>
                      Sales Order no: FF/223467
                    </Text>
                    <Text style={styles.contentText}>Store name</Text>
                    <Text style={styles.contentText}>Accestisa new mart</Text>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                      }}>
                      Amount: ₹ 1240
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.atteddanceCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.timeSection}>
                    <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                    <Text style={styles.time}>11:03:45 AM</Text>
                  </View>
                  <Text style={[styles.present, {marginLeft: 'auto'}]}>
                    Delivered
                  </Text>
                  <EllipsisVertical size={20} color={Colors.darkButton} />
                </View>
                <View style={styles.cardbody}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateText}>19</Text>
                    <Text style={styles.monthText}>APR</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                        lineHeight: 18,
                      }}>
                      Sales Order no: FF/223467
                    </Text>
                    <Text style={styles.contentText}>Store name</Text>
                    <Text style={styles.contentText}>Accestisa new mart</Text>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                      }}>
                      Amount: ₹ 1240
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.atteddanceCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.timeSection}>
                    <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                    <Text style={styles.time}>11:03:45 AM</Text>
                  </View>
                  <Text style={[styles.present, {marginLeft: 'auto'}]}>
                    Delivered
                  </Text>
                  <EllipsisVertical size={20} color={Colors.darkButton} />
                </View>
                <View style={styles.cardbody}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateText}>19</Text>
                    <Text style={styles.monthText}>APR</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                        lineHeight: 18,
                      }}>
                      Sales Order no: FF/223467
                    </Text>
                    <Text style={styles.contentText}>Store name</Text>
                    <Text style={styles.contentText}>Accestisa new mart</Text>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                      }}>
                      Amount: ₹ 1240
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.atteddanceCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.timeSection}>
                    <Clock2 size={16} color="#4A4A4A" strokeWidth={2} />
                    <Text style={styles.time}>11:03:45 AM</Text>
                  </View>
                  <Text style={[styles.present, {marginLeft: 'auto'}]}>
                    Delivered
                  </Text>
                  <EllipsisVertical size={20} color={Colors.darkButton} />
                </View>
                <View style={styles.cardbody}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateText}>19</Text>
                    <Text style={styles.monthText}>APR</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                        lineHeight: 18,
                      }}>
                      Sales Order no: FF/223467
                    </Text>
                    <Text style={styles.contentText}>Store name</Text>
                    <Text style={styles.contentText}>Accestisa new mart</Text>
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: Size.xsmd,
                        color: Colors.darkButton,
                      }}>
                      Amount: ₹ 1240
                    </Text>
                  </View>
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
              onPress={() => navigation.navigate('AttendanceScreen')}>
              <CalendarDays strokeWidth={1.4} color={Colors.white} />
              <Text style={styles.checkinButtonText}>Register Sale</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default SalesScreen;

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

  salesHeaderData: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
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
    backgroundColor: Colors.orange,
    borderRadius: 15,
    paddingVertical: 20,
    marginTop: 10,
    position: 'relative',
    bottom: -10,
    marginBottom: -50,
  },

  linkBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.Orangelight,
    borderRadius: 15,
    padding: 12,
    marginTop: 8,
    gap: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#FFBF83',
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
  bodyContent: {flex: 1, paddingBottom: 100},
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
    fontFamily: Fonts.medium,
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
    paddingTop: 10,
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
    bottom: 15,
    gap: 5,
    zIndex: 1,
    width: width * 0.9,
    marginBottom: 0,
  },
  checkinButtonText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.white,
    lineHeight: 22,
  },
});
