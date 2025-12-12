import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {SafeAreaView} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import {useGetClaimByIdQuery} from '../../../features/tada/tadaApi';
import {windowHeight} from '../../../utils/utils';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ExpenseClaimScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ExpenseClaimScreen = ({navigation, route}: Props) => {
  const {id} = route.params;
  console.log('🚀 ~ ExpenseClaimScreen ~ id:', id);
  const {data} = useGetClaimByIdQuery({claimId: id as string}, {skip: !id});
  console.log('🚀 ~ ExpenseClaimScreen ~ data:', data);
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
        title="Expense Detail"
        navigation={() => {
          navigation.navigate('Home');
        }}
      />
      <View
        style={{
          paddingHorizontal: 16,
        }}>
        {/* Data Loaded */}
        {data ? (
          <View style={styles.card}>
            <Text style={styles.label}>Expense Type</Text>
            <Text style={styles.value}>{data.expense_type}</Text>

            <Text style={styles.label}>Expense Date</Text>
            <Text style={styles.value}>
              {new Date(data.expense_date).toDateString()}
            </Text>

            <Text style={styles.label}>Amount</Text>
            <Text style={styles.amount}>₹ {data.amount}</Text>

            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{data.custom_claim_description}</Text>
          </View>
        ) : (
          <Text style={{textAlign: 'center', marginTop: 20}}>
            Loading details...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ExpenseClaimScreen;

const styles = StyleSheet.create({
  card: {
    minHeight: windowHeight * 0.8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: Colors.black,
    marginTop: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    color: Colors.primary,
  },
});
