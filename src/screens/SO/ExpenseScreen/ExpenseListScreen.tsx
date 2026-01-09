import {SafeAreaView} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import ExpenseListComponent from '../../../components/SO/Expense/expense-component';
type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ExpenseListScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ExpenseListScreen = ({navigation}: Props) => {
  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Expense Claim List"
        navigation={() => navigation.navigate('ExpenseScreen')}
      />
      <ExpenseListComponent navigation={navigation} />
    </SafeAreaView>
  );
};

export default ExpenseListScreen;
