import { SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import ExpenseApprovalDetailComponent from '../../../components/SO/Expense/expense-approval-detail-component';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ExpenseApprovalDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: {
    params: {
      claimId: string;
    };
  };
};

const ExpenseApprovalDetailScreen = ({ navigation, route }: Props) => {
  const { claimId } = route.params;

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
        title="Expense Claim Details"
        navigation={() => {
          navigation.goBack();
        }}
      />
      <ExpenseApprovalDetailComponent
        claimId={claimId}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

export default ExpenseApprovalDetailScreen;

const styles = StyleSheet.create({});
