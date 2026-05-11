import { StyleSheet, SafeAreaView } from 'react-native';
import React from 'react';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import AddExpenseComponent from '../../../components/SO/Expense/add-expense';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'AddExpenseScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};


const AddExpenseScreen = ({ navigation, route }: Props) => {
  const existingClaimId = route?.params?.claimId;

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader
        title="Expense Claim"
        navigation={() => navigation.navigate('ExpenseScreen')}
      />
      <AddExpenseComponent navigation={navigation} existingClaimId={existingClaimId} />
    </SafeAreaView>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
    marginHorizontal: 16,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
