import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors} from '../../../utils/colors';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';
import {useAppSelector} from '../../../store/hook';
import {
  useGetApproverNameQuery,
  useGetExpenseClaimByEmployeeQuery,
} from '../../../features/tada/tadaApi';
import moment from 'moment';
import LoadingScreen from '../../ui/LoadingScreen';

const ExpenseListComponent = ({navigation}: any) => {
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const {data: approverData} = useGetApproverNameQuery(
    {empId: employee?.id},
    {skip: !employee?.id},
  );

  const {data: claimByEmp, isFetching} = useGetExpenseClaimByEmployeeQuery({
    employee: employee?.id,
  });

  return (
    <View style={[styles.container]}>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Expense Approver</Text>

        <View style={styles.readonlyInput}>
          <Text style={styles.readonlyText}>
            {approverData?.message?.approver_name || 'No Employee Found'}
          </Text>
        </View>
      </View>

      {isFetching ? (
        <LoadingScreen />
      ) : (
        <Animated.ScrollView
          onScroll={Animated.event([{nativeEvent: {contentOffset: {}}}], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          contentContainerStyle={styles.dataBoxSection}>
          {claimByEmp?.message?.data?.map((expense, index) => (
            <TouchableOpacity
              key={`${expense?.claim}-${index}`}
              style={styles.dataBox}
              onPress={() =>
                navigation.navigate('ExpenseClaimScreen', {
                  id: expense?.claim,
                  name: expense?.expense_type,
                })
              }>
              <View>
                <Text style={styles.quantityCount}>
                  {expense?.expense_type}
                </Text>
                <Text style={styles.quantitytime}>
                  Sanctioned : ₹ {expense.sanctioned}
                </Text>
                <Text style={styles.quantitytime}>
                  {moment(expense.date).format('LL')}
                </Text>
              </View>
              <View style={styles.positionValue}>
                {/* <MoveUp strokeWidth={2} color={Colors.darkButton} /> */}
                <Text style={styles.incressValu}>₹ {expense.claimed}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      )}
    </View>
  );
};

export default ExpenseListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    position: 'relative',
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
    marginBottom: 6,
    color: Colors.darkButton,
  },

  readonlyInput: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border || '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
  },

  readonlyText: {
    fontSize: Size.sm,
    fontFamily: Fonts.regular,
    color: Colors.black,
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
    // lineHeight: 22,
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
