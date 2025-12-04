import {StyleSheet, SafeAreaView} from 'react-native';
import React from 'react';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import AddExpenseComponent from '../../../components/SO/Expense/add-expense';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddExpenseScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const AddExpenseScreen = ({navigation}: Props) => {
  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="New Expense Claim"
        navigation={() => navigation.navigate('Home')}
      />
      <AddExpenseComponent navigation={navigation} />
    </SafeAreaView>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({});
