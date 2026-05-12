import { SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import VisibilityApprovalDetailComponent from '../../../components/SO/Visibility/visibility-approval-detail-component';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'VisibilityApprovalDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: {
    params: {
      claimId: string;
      isApprover: boolean;
    };
  };
};

const VisibilityApprovalDetailScreen = ({ navigation, route }: Props) => {
  const { claimId, isApprover } = route.params;

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
        title="Claim Details"
        navigation={() => {
          navigation.goBack();
        }}
      />
      <VisibilityApprovalDetailComponent
        claimId={claimId}
        navigation={navigation}
        isApprover={isApprover}
      />
    </SafeAreaView>
  );
};

export default VisibilityApprovalDetailScreen;

const styles = StyleSheet.create({});
