import { SafeAreaView } from 'react-native';
import React from 'react';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import PjpReopenApprovalListComponent from '../../../components/SO/HomeScreen/pjp-reopen-approval-list-component';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PjpReopenApprovalScreen'
>;

type Props = {
  navigation: NavigationProp;
};

const PjpReopenApprovalScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView
      style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader
        title="PJP Reopen Requests"
        navigation={() => {
          navigation.navigate('Home');
        }}
      />
      <PjpReopenApprovalListComponent />
    </SafeAreaView>
  );
};

export default PjpReopenApprovalScreen;
