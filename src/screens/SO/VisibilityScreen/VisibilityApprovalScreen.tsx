import {SafeAreaView, StyleSheet} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import VisibilityApprovalListComponent from '../../../components/SO/Visibility/visibility-approval-list-component';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'VisibilityApprovalScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const VisibilityApprovalScreen = ({navigation}: Props) => {
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
        title="Visibility Claims - Approval"
        navigation={() => {
          navigation.navigate('Home');
        }}
      />
      <VisibilityApprovalListComponent navigation={navigation} />
    </SafeAreaView>
  );
};

export default VisibilityApprovalScreen;

const styles = StyleSheet.create({});
