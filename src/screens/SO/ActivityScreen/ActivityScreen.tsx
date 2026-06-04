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
import React, {useCallback, useRef, useState} from 'react';
import {SoAppStackParamList} from '../../../types/Navigation';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {
  CalendarOff,
  ClipboardPenLine,
  FileCheck,
  MapPinCheck,
} from 'lucide-react-native';
import {Tab} from '@rneui/themed';
import {Button} from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MarketVisitScreen from '../../../components/SO/Activity/MarketVisit/MarketVisitScreen';
import PJPScreen from '../../../components/SO/Activity/Pjp/PjpScreen';
import PageHeader from '../../../components/ui/PageHeader';
import {useGetProdCountQuery} from '../../../features/base/base-api';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ActivityScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const today = new Date().toISOString().split('T')[0];

const ActivityScreen = ({navigation, route}: Props) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [index, setIndex] = React.useState(0);
  const {data: prodData, refetch} = useGetProdCountQuery(
    {date: today},
    {refetchOnMountOrArgChange: true},
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      refetch();
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
      <PageHeader title="Activity" navigation={() => navigation.goBack()} />
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <Animated.ScrollView
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
          stickyHeaderIndices={[1]} // Index of the Tab header
          scrollEventThrottle={16}
          contentContainerStyle={{position: 'relative'}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.headerSec}>
            {/* Stat Cards Row */}
            <View style={styles.statRow}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    {backgroundColor: Colors.holdLight},
                  ]}>
                  <ClipboardPenLine
                    strokeWidth={1.4}
                    color={Colors.orange}
                    size={18}
                  />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statNum}>
                    {prodData?.message?.counts?.total_stores ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Total Call</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    {backgroundColor: Colors.lightSuccess},
                  ]}>
                  <MapPinCheck
                    strokeWidth={1.4}
                    color={Colors.success}
                    size={18}
                  />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statNum}>
                    {prodData?.message?.counts?.status_counts?.Visited ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Productive Call</Text>
                </View>
              </View>
            </View>

            {/* Action Links Row */}
            <View style={styles.linksRow}>
              <TouchableOpacity
                style={styles.actionLink}
                onPress={() => navigation.navigate('WeeklyOffScreen')}>
                <CalendarOff
                  strokeWidth={1.4}
                  color={Colors.orange}
                  size={15}
                />
                <Text style={styles.actionLinkText}>Mark Weekly Off</Text>
                <View style={styles.arrobox}>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={11}
                    color={Colors.white}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionLink}
                onPress={() => navigation.navigate('ActivityCheckInScreen')}>
                <FileCheck strokeWidth={1.4} color={Colors.orange} size={15} />
                <Text style={styles.actionLinkText}>Activity Check-In</Text>
                <View style={styles.arrobox}>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={11}
                    color={Colors.white}
                  />
                </View>
              </TouchableOpacity>
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
                title="PJP"
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
                title="Market Visit"
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
            <PJPScreen navigation={navigation} />
          ) : (
            <MarketVisitScreen navigation={navigation} />
          )}
        </Animated.ScrollView>
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
              ? navigation.navigate('AddPjpScreen')
              : navigation.navigate('MarkActivityScreen')
          }>
          <FileCheck strokeWidth={1.4} color={Colors.white} />
          <Text style={styles.checkinButtonText}>
            {`Add ${index === 0 ? 'PJP' : 'Market Visit'}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ActivityScreen;

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
    gap: 10,
    marginBottom: 12,
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
  },
  statNum: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
    // lineHeight: 22,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  linksRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD6A5',
    backgroundColor: '#FFF8F0',
  },
  actionLinkText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: Colors.orange,
    lineHeight: 15,
  },
  // keep your existing arrobox style unchanged
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#FF7B00',
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
    width: width * 0.43,
    borderRadius: 15,
    padding: 15,
    minHeight: 107,
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
});
