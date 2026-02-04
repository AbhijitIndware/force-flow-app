import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import {Button, Card} from '@rneui/base';
import {BarChart} from 'react-native-gifted-charts';
import moment from 'moment';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {
  useGetReportQuery,
  useGetStoreListQuery,
} from '../../../features/base/base-api';
import {ReportMessage} from '../../../types/baseType';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import {RotateCw} from 'lucide-react-native';
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {uniqueByValue} from '../../../utils/utils';
import {useGetItemsQuery} from '../../../features/dropdown/dropdown-api';
import {useAppSelector} from '../../../store/hook';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'StockReport'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
// 🏬 Unique by Store Name (or code)
export const uniqueByStoreName = <T extends {name: string}>(arr: T[]) => {
  const seen = new Set<string>();
  return arr.filter(store => {
    if (seen.has(store.name)) return false;
    seen.add(store.name);
    return true;
  });
};
const StockReport = ({navigation, route}: Props) => {
  const {reportName} = route.params;
  // 🗓️ State for date filters
  const [startDate, setStartDate] = useState(moment().subtract(7, 'days'));
  const [endDate, setEndDate] = useState(moment());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const userType =
    employee?.designation !== 'Promoter' ? 'Sales Officer' : 'PROMOTER';
  /** ─── Store State ─────────────────────────────────── */
  const [storePage, setStorePage] = useState(1);
  const [storeListData, setStoreListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [loadingStoreMore, setLoadingStoreMore] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  const [searchItem, setSearchItem] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [itemPage, setItemPage] = useState(1);
  const [loadingMoreItems, setLoadingMoreItems] = useState(false);

  const [itemListData, setItemListData] = useState<
    {label: string; value: string}[]
  >([]);

  const {data: itemData, isFetching: itemFetching} = useGetItemsQuery({
    search: searchItem,
    page: String(itemPage),
    page_size: '20',
  });

  const {data: storeData, isFetching: fetchingStore} = useGetStoreListQuery({
    page: String(storePage),
    page_size: '100',
    search: storeSearch,
    include_subordinates: '1',
    include_direct_subordinates: '1',
  });
  const transformToDropdownList = (arr: any[] = []) =>
    arr.map(item => ({label: item.store_name, value: item.name}));

  // 🧾 Filters — converted to JSON string
  const filters = JSON.stringify({
    company: 'Softsens',
    from_date: startDate.format('YYYY-MM-DD'),
    to_date: endDate.format('YYYY-MM-DD'),
    valuation_field_type: 'Currency',
    item_code: selectedItems,
    store: selectedStores,

    zone_wise: userType === 'Sales Officer' ? 1 : 0,
    // own_stores: userType === 'PROMOTER' ? 1 : 0,
  });

  // 🚀 Call the RTK Query hook with parameters
  const {data, isLoading, isFetching, isError, error, refetch} =
    useGetReportQuery({
      report_name: reportName,
      filters,
      ignore_prepared_report: 'true',
      are_default_filters: 'true',
    });

  const reportData = data?.message ?? {};
  // console.log('🚀 ~ StockReport ~ reportData:', reportData);
  const {
    result = [],
    columns = [],
    chart = {data: {labels: [], datasets: [{values: []}]}},
  } = reportData as ReportMessage;

  // Remove total row (last array)
  const rows = result.filter(
    (r: any) => typeof r === 'object' && !Array.isArray(r),
  );
  const totalRow = result.find((r: any) => Array.isArray(r));

  // Prepare chart data
  const chartLabels = chart?.data?.labels || [];
  const chartValues = chart?.data?.datasets?.[0]?.values || [];

  const chartData = chartLabels.map((label: string, idx: number) => ({
    value: chartValues[idx],
    label: label || '',
    frontColor: '#FF6B8A',
  }));

  const getDynamicBarWidth = (count: number) => {
    if (count <= 2) return 120; // very few bars — make them big
    if (count <= 4) return 80; // small dataset
    if (count <= 8) return 50; // moderate dataset
    if (count <= 12) return 35; // larger dataset
    return 25; // very large dataset — narrower bars
  };

  // 🎞️ Animation setup
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFetching || isLoading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [isFetching, isLoading]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  /** ─── Store Data Merge ────────────────────────────── */
  useEffect(() => {
    if (storeData?.message?.data?.stores) {
      setLoadingStoreMore(false);
      const newData = transformToDropdownList(storeData.message.data.stores);
      if (storeSearch.trim() !== '' || storePage === 1) {
        setStoreListData(uniqueByValue(newData));
      } else {
        setStoreListData(prev => uniqueByValue([...prev, ...newData]));
      }
    }
  }, [storeData]);

  useEffect(() => {
    setStorePage(1);
  }, [storeSearch]);

  const handleLoadMoreStores = () => {
    if (fetchingStore || loadingStoreMore) return;

    const current = storeData?.message?.pagination?.page ?? 1;
    const total = storeData?.message?.pagination?.total_pages ?? 1;

    if (current >= total) return; // 🚫 Stop loading

    setLoadingStoreMore(true);
    setStorePage(prev => prev + 1);
  };

  /* ---------------- Item Pagination ---------------- */

  const handleLoadMoreItems = () => {
    if (itemFetching || loadingMoreItems) return;

    const currentPage = itemData?.message?.pagination?.page ?? 1;
    const totalPages = itemData?.message?.pagination?.total_pages ?? 1;

    if (currentPage >= totalPages) return;

    setLoadingMoreItems(true);
    setItemPage(prev => prev + 1);
  };

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (itemData?.message?.data) {
      setLoadingMoreItems(false);

      const newDropdownData = itemData.message.data.map(item => ({
        value: item.item_code,
        label: `${item.item_name} - ₹${item.selling_rate}`,
      }));

      if (searchItem || itemPage === 1) {
        setItemListData(uniqueByValue(newDropdownData));
      } else {
        setItemListData(prev => uniqueByValue([...prev, ...newDropdownData]));
      }
    }
  }, [itemData]);

  useEffect(() => {
    setItemPage(1);
  }, [searchItem]);

  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightBg,
        },
      ]}>
      <PageHeader
        title={'Stock Report'}
        navigation={() => navigation.goBack()}
      />

      {/* 🗓️ Date Range */}
      <View style={[styles.dateRow, {alignItems: 'center'}]}>
        {/* From Date */}
        <View style={styles.dateColumn}>
          <Text style={styles.dateLabel}>Date:</Text>
          <TouchableOpacity
            onPress={() => setShowFromPicker(true)}
            style={styles.outlinedButton}>
            <Text style={{color: '#333'}}>
              {startDate.format('DD-MM-YYYY')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* To Date */}
        <View style={styles.dateColumn}>
          <Text style={styles.dateLabel}>To</Text>
          <TouchableOpacity
            onPress={() => setShowToPicker(true)}
            style={styles.outlinedButton}>
            <Text style={{color: '#333'}}>{endDate.format('DD-MM-YYYY')}</Text>
          </TouchableOpacity>
        </View>

        {/* 🔄 Refresh Button */}
        <TouchableOpacity
          onPress={() => {
            refetch();
            setSelectedStores([]);
          }}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 50,
            padding: 6,
            marginLeft: 12,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}>
          <Animated.View style={{transform: [{rotate}]}}>
            <RotateCw color="#333" size={18} />
          </Animated.View>
        </TouchableOpacity>

        {/* From Date Modal */}
        <Modal
          visible={showFromPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFromPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                mode="single"
                date={startDate.toDate()}
                onChange={(params: any) => {
                  const newDate = moment(params.date);
                  setStartDate(newDate);
                }}
                styles={{
                  // ...defaultStyles,
                  today: {borderColor: 'blue', borderWidth: 1}, // Add a border to today's date
                  selected: {backgroundColor: 'blue'}, // Highlight the selected day
                  selected_label: {color: 'white'}, // Highlight the selected day label
                }}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowFromPicker(false)}>
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* To Date Modal */}
        <Modal
          visible={showToPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowToPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                mode="single"
                date={endDate.toDate()}
                styles={{
                  // ...defaultStyles,
                  today: {borderColor: 'blue', borderWidth: 1}, // Add a border to today's date
                  selected: {backgroundColor: 'blue'}, // Highlight the selected day
                  selected_label: {color: 'white'}, // Highlight the selected day label
                }}
                onChange={(params: any) => {
                  const newDate = moment(params.date);
                  setEndDate(newDate);
                }}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowToPicker(false)}>
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {/* Store and Item Filter */}
      <View style={[flexCol, {paddingHorizontal: 20, width: '95%'}]}>
        <ReusableDropdown
          label="Store"
          field={`store`}
          value={selectedStores[0] ?? ''}
          data={storeListData}
          onChange={(val: string) => {
            setSelectedStores([val]); // single store
          }}
          onLoadMore={handleLoadMoreStores}
          loadingMore={loadingStoreMore}
          searchText={storeSearch}
          setSearchText={(text: string) => {
            setStoreSearch(text);
          }}
          showAddButton={false}
          clearTextAfterSearch={false}
        />
        {/* <ReusableDropdown
          label="Item"
          field="item"
          value={selectedItems[0] ?? ''}
          data={itemListData}
          onChange={(val: string) => {
            setSelectedItems([val]); // single item
          }}
          onLoadMore={handleLoadMoreItems}
          loadingMore={loadingMoreItems}
          searchText={searchItem}
          setSearchText={(text: string) => {
            setSearchItem(text);
            setItemPage(1);
            setItemListData([]);
          }}
          showAddButton={false}
        /> */}
      </View>

      {isLoading || isFetching ? (
        <LoadingScreen />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {(error as any)?.data?.message || 'Report Stock Report not found.'}
          </Text>
          <Button
            title="Retry"
            onPress={() => refetch()}
            buttonStyle={styles.retryButton}
          />
        </View>
      ) : !reportData ? (
        <View style={[styles.centerView]}>
          <Text style={styles.title}>No report data available</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}>
          {/* Header */}
          {/* <Text style={styles.title}>{'Stock Report'}</Text> */}

          {/* Chart */}
          {chartData.length > 0 && (
            <Card containerStyle={styles.cardContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={chartData}
                  barWidth={getDynamicBarWidth(chartData.length)}
                  spacing={20}
                  noOfSections={4}
                  yAxisTextStyle={{color: '#777'}}
                  xAxisLabelTextStyle={{color: '#444', fontSize: 10}}
                  hideRules
                  initialSpacing={20}
                  height={220}
                  frontColor="#FF6B8A"
                  //   width={chartData.length * 80}
                />
              </ScrollView>
            </Card>
          )}

          {/* Table */}
          {rows?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <Card containerStyle={styles.cardContainer}>
                {(() => {
                  // const visibleColumns = columns.filter(col => !col.hidden);
                  const requiredFields = [
                    'item_code',
                    // 'item_name',
                    'store_name',
                    'bal_qty',
                    // 'bal_val',
                  ];

                  const visibleColumns = columns.filter(col =>
                    requiredFields.includes(col.fieldname),
                  );

                  // Helper function to format values
                  const formatValue = (col: any, value: any) => {
                    if (value == null || value === '') return '-';

                    switch (col.fieldtype) {
                      case 'Currency':
                        return `₹ ${parseFloat(value).toFixed(2)}`;
                      case 'Float':
                        return parseFloat(value).toFixed(2);
                      default:
                        return value;
                    }
                  };

                  // Helper for total row values
                  const formatTotalValue = (col: any, value: any) => {
                    if (col.fieldtype === 'Float') {
                      return value ? parseFloat(value).toFixed(2) : '0.00';
                    } else if (col.fieldtype === 'Currency') {
                      return value
                        ? `₹ ${parseFloat(value).toFixed(2)}`
                        : '₹ 0.00';
                    } else {
                      return value ?? '';
                    }
                  };

                  return (
                    <>
                      {/* Header */}
                      <View style={styles.tableHeader}>
                        {visibleColumns.map(col => (
                          <View
                            key={col.fieldname}
                            style={{
                              width: col.width ?? 100,
                              paddingHorizontal: 6,
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}>
                            <Text
                              style={[
                                styles.tableHeaderText,
                                {textAlign: 'center', fontWeight: 'bold'},
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {col.label}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Rows */}
                      {rows.map((r: any, idx: number) => (
                        <View
                          key={idx}
                          style={[
                            styles.tableRow,
                            {
                              borderBottomWidth:
                                idx === rows.length - 1 ? 0 : 1,
                            },
                          ]}>
                          {visibleColumns.map(col => (
                            <View
                              key={col.fieldname}
                              style={{
                                width: col.width ?? 120,
                                paddingHorizontal: 6,
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontSize: 12,
                                  color: '#333',
                                }}>
                                {formatValue(col, r[col.fieldname])}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ))}

                      {/* Total Row */}
                      {totalRow && (
                        <View style={[styles.tableTotal, {borderTopWidth: 1}]}>
                          {visibleColumns.map(col => {
                            // find the original index of this column in the unfiltered list
                            const originalIndex = columns.findIndex(
                              c => c.fieldname === col.fieldname,
                            );

                            const value = totalRow[originalIndex];

                            return (
                              <View
                                key={col.fieldname}
                                style={{
                                  width: col.width ?? 100,
                                  paddingHorizontal: 6,
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                }}>
                                <Text
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                  style={{
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: '#000',
                                  }}>
                                  {formatTotalValue(col, value)}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </>
                  );
                })()}
              </Card>
            </ScrollView>
          )}

          {/* Footer */}
          {rows?.length > 0 && (
            <Text style={styles.footer}>
              For comparison, use {'>'}5, {'<'}10 or =324. For ranges, use 5:10
              (for values between 5 & 10).
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default StockReport;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9f9f9'},
  content: {padding: 16},
  title: {fontSize: 20, fontWeight: '700', marginBottom: 12},
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingHorizontal: 20,
  },
  dateColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 1,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 2,
  },
  outlinedButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cardContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {fontWeight: '600', marginBottom: 8},
  tableHeader: {flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 8},
  tableHeaderText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableCell: {flex: 1, fontSize: 12},
  center: {textAlign: 'center'},
  tableTotal: {flexDirection: 'row', backgroundColor: '#fafafa', padding: 8},
  footer: {
    marginTop: 12,
    color: '#999',
    fontSize: 13,
    textAlign: 'right',
    paddingRight: 20,
  },
  centerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B8A',
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    elevation: 5,
  },
  modalButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B8A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
