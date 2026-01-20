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
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {Banknote, CalendarDays, Funnel, Search} from 'lucide-react-native';
import FilterModal from '../../../components/ui/filterModal';
import {useGetSalesInvoicesListQuery} from '../../../features/base/promoter-base-api';
import PageHeader from '../../../components/ui/PageHeader';
import SalesItemCard from '../../../components/Promoter/Sales/SalesItemCard';
import {SalesInvoice} from '../../../types/baseType';
import SearchModal from '../../../components/ui/SearchModal';
//import { fonts } from '@rneui/base';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'SalesScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const getDateParts = (dateStr: string) => {
  const date = new Date(dateStr);

  return {
    date: date.getDate().toString(),
    month: date.toLocaleString('default', {month: 'short'}),
  };
};

const SalesScreen = ({navigation}: Props) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<
    'All' | 'Draft' | 'Pending' | 'Delivered' | 'Cancelled'
  >('All');

  const {data, isFetching, refetch} = useGetSalesInvoicesListQuery({
    status: selectedStatus === 'All' ? undefined : selectedStatus,
    search: searchText || undefined,
    page: 1,
    page_size: 100,
  });

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
      <PageHeader title="Sales" navigation={() => navigation.goBack()} />
      {refreshing || isFetching ? (
        <LoadingScreen />
      ) : (
        <Animated.ScrollView
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
          stickyHeaderIndices={[1]} // Index of the Tab header
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          removeClippedSubviews={false}
          contentContainerStyle={{position: 'relative'}}
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
                ₹0
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: Size.xs,
                  color: Colors.sucess,
                  lineHeight: 16,
                  marginTop: 5,
                }}>
                0% MTD{' '}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.medium,
                  fontSize: Size.xs,
                  color: Colors.darkButton,
                }}>
                0% achieved{' '}
              </Text>
            </View>
            <View style={styles.welcomBox}>
              <Text style={styles.welcomeText}>
                Target <Text style={styles.name}>₹0</Text>
              </Text>
              <View style={styles.linkBox}>
                <View style={styles.linkContent}>
                  <Banknote size={30} color={Colors.white} />
                  <Text style={styles.welcomeText}>
                    Incentive earned <Text style={styles.name}>₹0</Text>
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
              <Text style={styles.bodyHeaderTitle}>Recent Sales Invoices</Text>
              <View style={styles.bodyHeaderIcon}>
                <SearchModal
                  visible={isSearchVisible}
                  onClose={() => setSearchVisible(false)}
                  onSearch={text => {
                    setSearchText(text);
                  }}
                />

                <FilterModal
                  visible={isFilterVisible}
                  onClose={() => setFilterVisible(false)}
                  onApply={() => setFilterVisible(false)}>
                  {['All', 'Draft', 'Pending', 'Delivered', 'Cancelled'].map(
                    status => (
                      <Text
                        key={status}
                        onPress={() => {
                          setSelectedStatus(status as any);
                          setFilterVisible(false);
                        }}
                        style={{
                          paddingVertical: 12,
                          fontFamily: Fonts.medium,
                          color:
                            selectedStatus === status
                              ? Colors.darkButton
                              : Colors.gray,
                        }}>
                        {status}
                      </Text>
                    ),
                  )}
                </FilterModal>
                {/* 🔍 Search */}
                <TouchableOpacity onPress={() => setSearchVisible(true)}>
                  <Search size={20} color="#4A4A4A" strokeWidth={1.7} />
                </TouchableOpacity>

                {/* 🧰 Filter */}
                <TouchableOpacity onPress={() => setFilterVisible(true)}>
                  <Funnel size={20} color="#4A4A4A" strokeWidth={1.7} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.bodyContent,
              {paddingHorizontal: 20, paddingBottom: 100},
            ]}>
            {data?.message?.data?.sales_invoices?.length ? (
              data.message.data.sales_invoices.map(
                (item: SalesInvoice, index: number) => {
                  const {date, month} = getDateParts(item.posting_date);

                  return (
                    <SalesItemCard
                      key={item.invoice_id || index}
                      time={item.posting_date}
                      date={date}
                      month={month}
                      orderNo={item.invoice_id}
                      // storeName={item.store_name}
                      // customerName={item.customer_name}
                      amount={item.grand_total}
                      status={item.status}
                      navigation={navigation}
                    />
                  );
                },
              )
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No sales invoice found</Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      )}
      <View
        style={{
          paddingHorizontal: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={styles.checkinButton}
          onPress={() => navigation.navigate('AddSalesScreen')}>
          <CalendarDays strokeWidth={1.4} color={Colors.white} />
          <Text style={styles.checkinButtonText}>Register Sales Invoice</Text>
        </TouchableOpacity>
      </View>
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
    minHeight: 150,
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
    paddingBottom: 10,

    // Android Shadow
    elevation: 2,
    marginBottom: 15,
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
  bodyContent: {
    width: '100%',
    backgroundColor: Colors.lightBg,
  },
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
  emptyBox: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.inputBorder,
  },
});
