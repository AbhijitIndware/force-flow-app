import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../../../utils/colors';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {CirclePlus} from 'lucide-react-native';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';
import {useGetEmployeeQuery} from '../../../features/dropdown/dropdown-api';
import {uniqueByValue} from '../../../utils/utils';
import {useAppSelector} from '../../../store/hook';

const AddExpenseComponent = ({navigation}: any) => {
  const [empPage, setEmpPage] = useState(1);
  const [employeeListData, setEmployeeListData] = useState<
    {label: string; value: string}[]
  >([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [loadingEmpMore, setLoadingEmpMore] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<any>('');

  const {
    data: employeeData,
    error,
    isFetching: fetchingEmp,
  } = useGetEmployeeQuery({
    page: String(empPage),
    page_size: '20',
    name: employeeSearch,
  });
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  const transformEmployeeList = (arr: any[] = []) =>
    arr.map(item => ({
      label: `${item.employee_name}`,
      value: item.name,
    }));

  /** ─── Employee Data Merge ─────────────────────────── */
  useEffect(() => {
    if (employeeData?.message?.data) {
      setLoadingEmpMore(false);
      const newData = transformEmployeeList(employeeData.message.data);
      if (employeeSearch.trim() !== '' || empPage === 1) {
        setEmployeeListData(uniqueByValue(newData));
      } else {
        setEmployeeListData(prev => uniqueByValue([...prev, ...newData]));
      }
    }
  }, [employeeData]);

  /** ─── Pagination Handlers ─────────────────────────── */
  const handleLoadMoreEmployees = () => {
    if (fetchingEmp) return;

    const current = employeeData?.message?.pagination?.page ?? 1;
    const total = employeeData?.message?.pagination?.total_pages ?? 1;

    if (current >= total) return;
    setLoadingEmpMore(true);
    setEmpPage(prev => prev + 1);
  };

  useEffect(() => {
    if (employee?.id) {
      setSelectedEmpId(employee?.id);
    }
  }, [employee]);

  return (
    <View style={[styles.container]}>
      <ReusableDropdown
        label="Expense Approver"
        field="employee"
        value={selectedEmpId}
        data={employeeListData}
        // error={touched.employee && errors.employee}
        onChange={(val: string) => console.log(val)}
        onLoadMore={handleLoadMoreEmployees}
        loadingMore={loadingEmpMore}
        searchText={employeeSearch}
        setSearchText={setEmployeeSearch}
        // disabled={true}
      />
      <View style={styles.HeadingHead}>
        <Text style={styles.SectionHeading}>Expense</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddExpenseItemScreen')}>
          <View style={[{display: 'flex', flexDirection: 'row', gap: 10}]}>
            <Text style={[{fontSize: Size.sm, fontFamily: Fonts.medium}]}>
              ₹ 2,200
            </Text>
            <CirclePlus
              size={20}
              color={Colors.black}
              style={[{position: 'relative'}]}
            />
          </View>
        </TouchableOpacity>
      </View>
      <Animated.ScrollView
        onScroll={Animated.event([{nativeEvent: {contentOffset: {}}}], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.dataBoxSection}>
        <View style={styles.dataBox}>
          <View>
            <Text style={styles.quantityCount}>Food</Text>
            <Text style={styles.quantitytime}>Sanctioned : ₹ 1,000 27 Nov</Text>
          </View>
          <View style={styles.positionValue}>
            {/* <MoveUp strokeWidth={2} color={Colors.darkButton} /> */}
            <Text style={styles.incressValu}>₹ 1,000</Text>
          </View>
        </View>
        <View style={styles.dataBox}>
          <View>
            <Text style={styles.quantityCount}>Other</Text>
            <Text style={styles.quantitytime}>Sanctioned : ₹ 200 27 Nov</Text>
          </View>
          <View style={styles.positionValue}>
            {/* <MoveUp strokeWidth={2} color={Colors.darkButton} /> */}
            <Text style={styles.incressValu}>₹ 200</Text>
          </View>
        </View>
        <View style={styles.dataBox}>
          <View>
            <Text style={styles.quantityCount}>Food</Text>
            <Text style={styles.quantitytime}>Sanctioned : ₹ 1,000 27 Nov</Text>
          </View>
          <View style={styles.positionValue}>
            {/* <MoveUp strokeWidth={2} color={Colors.darkButton} /> */}
            <Text style={styles.incressValu}>₹ 1,000</Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default AddExpenseComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    padding: 20,
  },

  //target&achivement section css start
  HeadingHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  dataBoxSection: {paddingTop: 15},
  dataBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionValue: {display: 'flex', flexDirection: 'row', alignItems: 'center'},
  incressValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: Colors.sucess,
    paddingHorizontal: 0,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },
  quantityCount: {
    fontFamily: Fonts.medium,
    fontSize: Size.md,
    color: Colors.darkButton,
    lineHeight: 22,
  },
  quantitytime: {
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    color: Colors.darkButton,
    lineHeight: 20,
  },
  decriseValu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightDenger,
    color: Colors.denger,
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    borderRadius: 8,
  },
});
