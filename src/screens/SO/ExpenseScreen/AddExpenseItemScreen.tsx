import {StyleSheet, SafeAreaView} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import {Colors} from '../../../utils/colors';
import AddExpenseItem from '../../../components/SO/Expense/add-expense-item';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddExpenseItemScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const AddExpenseItemScreen = ({navigation}: Props) => {
  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Add Expense Item"
        navigation={() => navigation.navigate('AddExpenseScreen')}
      />
      <AddExpenseItem />
    </SafeAreaView>
  );
};

export default AddExpenseItemScreen;

const styles = StyleSheet.create({});
