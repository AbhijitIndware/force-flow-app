import { StyleSheet, SafeAreaView } from 'react-native';
import React from 'react';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import LateCheckinApprovalListComponent from '../../../components/SO/HomeScreen/late-checkin-approval-list-component';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'LateCheckinApprovalScreen'
>;

type Props = {
  navigation: NavigationProp;
};

const LateCheckinApprovalScreen = ({ navigation }: Props) => {
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
        title="Late Check-In Approval"
        navigation={() => {
          navigation.navigate('Home');
        }}
      />

      <LateCheckinApprovalListComponent />
    </SafeAreaView>
  );
};

export default LateCheckinApprovalScreen;

const styles = StyleSheet.create({});
