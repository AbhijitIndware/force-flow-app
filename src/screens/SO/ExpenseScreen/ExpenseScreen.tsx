import { SafeAreaView } from 'react-native';
import React from 'react';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import ExpenseComponent from '../../../components/SO/Expense/expense-component';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ExpenseScreen'
>;

type Props = {
  navigation: NavigationProp;
};

/**
 * The employee's own expense claims ("Expense Claim" in Claims & Leave).
 * Visibility claims have their own screen (VisibilityScreen).
 */
const ExpenseScreen = ({ navigation }: Props) => (
  <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
    <PageHeader
      title="Expense Claim"
      navigation={() => {
        navigation.navigate('Home');
      }}
    />
    <ExpenseComponent navigation={navigation} />
  </SafeAreaView>
);

export default ExpenseScreen;
