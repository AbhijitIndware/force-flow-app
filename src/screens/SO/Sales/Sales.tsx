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
  Banknote,
  ClipboardPenLine,
  FileCheck,
  MapPinCheck,
} from 'lucide-react-native';
import {Button, Tab} from '@rneui/themed';
import {Animated} from 'react-native';
import RecentTeamSaleScreen from './RecentTeamSaleScreen';
import RecentSaleScreen from './RecentSaleScreen';
import PageHeader from '../../../components/ui/PageHeader';
import {useGetSalesRepotsQuery} from '../../../features/base/base-api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsmDashboard from './AsmDashboardScreen';
import {useAppSelector} from '../../../store/hook';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'SalesScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const SalesScreen = ({navigation, route}: Props) => {
  const {index: initialIndex} = route.params || {};
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [index, setIndex] = React.useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const isAsm =
    employee?.designation === 'ASM' ||
    employee?.designation === 'Area Sales Executive' ||
    employee?.designation === 'ASE';

  const {data, refetch, isFetching} = useGetSalesRepotsQuery({
    view_type: isAsm
      ? index === 1
        ? 'self'
        : 'team_include_self'
      : index === 0
      ? 'self'
      : 'team_include_self',
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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
      <PageHeader title="Sales" navigation={() => navigation.goBack()} />
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
            {/* Stat Cards */}
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
                    {data?.message?.summary?.total_orders ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Total Sales</Text>
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
                    ₹
                    {Number(data?.message?.summary?.total_value || 0).toFixed(
                      2,
                    )}
                  </Text>
                  <Text style={styles.statLabel}>Total Value</Text>
                </View>
              </View>
            </View>

            {/* Action Links */}
            <View style={styles.linksRow}>
              <TouchableOpacity
                style={styles.actionLink}
                onPress={() =>
                  navigation.navigate('TeamsSalesReport', {
                    reportName: 'PJP Report',
                  })
                }>
                <FileCheck strokeWidth={1.4} color={Colors.orange} size={15} />
                <Text style={styles.actionLinkText}>View Sales Report</Text>
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

          <View style={styles.tabSection}>
            <Tab
              value={index}
              onChange={e => setIndex(e)}
              indicatorStyle={{
                height: 0,
              }}
              variant="primary"
              style={{backgroundColor: Colors.transparent, padding: 0}}>
              {isAsm && (
                <Tab.Item
                  title="Dashboard"
                  titleStyle={{
                    fontSize: Size.xs,
                    fontFamily: Fonts.medium,
                    lineHeight: 9,
                    width: width * 1,
                  }}
                  containerStyle={active => ({
                    backgroundColor: active ? Colors.Orangelight : undefined,
                    borderRadius: active ? 10 : undefined,
                    borderColor: active ? '#FFBF83' : undefined,
                    borderTopWidth: active ? 1 : undefined,
                    borderLeftWidth: active ? 1 : undefined,
                    borderRightWidth: active ? 1 : undefined,
                  })}
                />
              )}
              <Tab.Item
                title="Individual"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 9,
                  width: width * 1,
                }}
                containerStyle={active => ({
                  backgroundColor: active ? Colors.Orangelight : undefined,
                  borderRadius: active ? 10 : undefined,
                  borderColor: active ? '#FFBF83' : undefined,
                  borderTopWidth: active ? 1 : undefined,
                  borderLeftWidth: active ? 1 : undefined,
                  borderRightWidth: active ? 1 : undefined,
                })}
              />
              <Tab.Item
                title=" Team"
                titleStyle={{
                  fontSize: Size.xs,
                  fontFamily: Fonts.medium,
                  lineHeight: 9,
                  width: width * 1,
                }}
                containerStyle={active => ({
                  backgroundColor: active ? Colors.Orangelight : undefined,
                  borderRadius: active ? 10 : undefined,
                  borderColor: active ? '#FFBF83' : undefined,
                  borderTopWidth: active ? 1 : undefined,
                  borderLeftWidth: active ? 1 : undefined,
                  borderRightWidth: active ? 1 : undefined,
                })}
              />
            </Tab>
          </View>
          {/* Conditionally rendered tab content */}
          {(() => {
            if (isAsm) {
              switch (index) {
                case 0:
                  return <AsmDashboard navigation={navigation} />;
                case 1:
                  return (
                    <RecentSaleScreen
                      navigation={navigation}
                      data={data?.message?.data || []}
                      refetch={refetch}
                      isFetching={isFetching}
                    />
                  );
                case 2:
                  return (
                    <RecentTeamSaleScreen
                      navigation={navigation}
                      data={data?.message?.data || []}
                      refetch={refetch}
                      isFetching={isFetching}
                    />
                  );
                default:
                  return null;
              }
            } else {
              switch (index) {
                case 0:
                  return (
                    <RecentSaleScreen
                      navigation={navigation}
                      data={data?.message?.data || []}
                      refetch={refetch}
                      isFetching={isFetching}
                    />
                  );
                case 1:
                  return (
                    <RecentTeamSaleScreen
                      navigation={navigation}
                      data={data?.message?.data || []}
                      refetch={refetch}
                      isFetching={isFetching}
                    />
                  );
                default:
                  return null;
              }
            }
          })()}
        </Animated.ScrollView>
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
  salesHeaderData: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
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
    paddingVertical: 10,
    marginTop: 5,
    position: 'relative',
  },

  linkBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#575757',
    borderRadius: 15,
    padding: 5,
    marginTop: 5,
    gap: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#A5A5A5',
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
  tabSection: {
    backgroundColor: Colors.orange,
    paddingVertical: 5,
    paddingHorizontal: 20,
    position: 'relative',
    marginTop: 10,
    // paddingTop: 10,
  },
  upparrow: {
    width: 30,
    height: 30,
    backgroundColor: Colors.lightSuccess,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  downarrow: {
    width: 30,
    height: 30,
    backgroundColor: Colors.lightDenger,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  salesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  salesTile: {
    flex: 1,
    gap: 5,
  },
  salesDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    alignSelf: 'center',
  },
  salesTileLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  salesTileValue: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.lg,
    color: Colors.darkButton,
    letterSpacing: -0.3,
  },
  mtdChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F7EE',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mtdChipText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.success,
  },
  reportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD6A5',
    backgroundColor: '#FFF8F0',
  },
  reportLinkText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xsmd,
    color: Colors.orange,
  },
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
    gap: 2,
  },
  statNum: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
    lineHeight: 20,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#888',
  },
  linksRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontSize: 11,
    color: Colors.orange,
    lineHeight: 15,
  },
  arrobox: {
    width: 18,
    height: 18,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
});
