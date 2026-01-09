import {View} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {SafeAreaView} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import {
  useGetAttachmentByClaimIdQuery,
  useGetClaimByIdQuery,
} from '../../../features/tada/tadaApi';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import ExpenseClaimDetail from '../../../components/SO/Expense/expense-claim-detail';
import {ExpenseItem} from '../../../types/baseType';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ExpenseClaimScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ExpenseClaimScreen = ({navigation, route}: Props) => {
  const {id, name} = route.params;
  const {data, isFetching} = useGetClaimByIdQuery(
    {claimId: id as string},
    {skip: !id},
  );
  const {data: attachmentData} = useGetAttachmentByClaimIdQuery(
    {claimId: id as string},
    {skip: !id},
  );

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
        title={name || 'Expense Detail'}
        navigation={() => {
          navigation.navigate('AddExpenseScreen');
        }}
      />
      {/* Data Loaded */}
      {isFetching ? (
        <LoadingScreen />
      ) : (
        <ExpenseClaimDetail
          expenseData={data?.data?.expenses[0] as ExpenseItem}
          data={data?.data as any}
          attachmentData={attachmentData?.data || []}
        />
      )}
    </SafeAreaView>
  );
};

export default ExpenseClaimScreen;
