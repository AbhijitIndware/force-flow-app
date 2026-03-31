import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'DetailByStoreScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const DetailByStoreScreen = ({navigation, route}: Props) => {
  return (
    <SafeAreaView
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: '#F0F2F6',
        },
      ]}>
      <PageHeader title={'Detail'} navigation={() => navigation.goBack()} />
      <Text>DetailByUserScreen</Text>
    </SafeAreaView>
  );
};

export default DetailByStoreScreen;

const styles = StyleSheet.create({});
