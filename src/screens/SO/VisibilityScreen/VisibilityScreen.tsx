import { SafeAreaView } from 'react-native';
import React from 'react';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import VisibilityComponent from '../../../components/SO/Visibility/visibility-component';

type Props = {
  navigation: NativeStackNavigationProp<SoAppStackParamList, 'VisibilityScreen'>;
};

/**
 * Visibility claims, raised for a store: opened from "Create Visibility
 * Claim" in Quick links. Expense claims have their own screen (ExpenseScreen).
 */
const VisibilityScreen = ({ navigation }: Props) => (
  <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
    <PageHeader
      title="Create Visibility Claim"
      navigation={() => navigation.goBack()}
    />
    <VisibilityComponent navigation={navigation} />
  </SafeAreaView>
);

export default VisibilityScreen;
