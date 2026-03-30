import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import {SafeAreaView} from 'react-native';
import {flexCol} from '../../../utils/styles';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {Colors} from '../../../utils/colors';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'TeamDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
const TeamDetailScreen = ({navigation, route}: Props) => {
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
        title={'Team Detail'}
        navigation={() => navigation.goBack()}
      />
      <Text>TeamDetailScreen</Text>
    </SafeAreaView>
  );
};

export default TeamDetailScreen;

const styles = StyleSheet.create({});
