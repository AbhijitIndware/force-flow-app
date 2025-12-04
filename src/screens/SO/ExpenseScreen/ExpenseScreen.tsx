import {StyleSheet, SafeAreaView} from 'react-native';
import React from 'react';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import ExpenseComponent from '../../../components/SO/Expense/expense';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ExpenseScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ExpenseScreen = ({navigation}: Props) => {
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
        title="Expense Dashboard"
        navigation={() => {
          navigation.navigate('Home');
        }}
      />
      <ExpenseComponent navigation={navigation} />
    </SafeAreaView>
  );
};

export default ExpenseScreen;

const styles = StyleSheet.create({});
