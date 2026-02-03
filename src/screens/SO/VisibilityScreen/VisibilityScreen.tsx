import {SafeAreaView, StyleSheet} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {flexCol} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import VisibilityComponent from '../../../components/SO/Visibility/visibility-component';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'VisibilityScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const VisibilityScreen = ({navigation}: Props) => {
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
        title="Visibility Dashboard"
        navigation={() => {
          navigation.navigate('Home');
        }}
      />
      <VisibilityComponent navigation={navigation} />
    </SafeAreaView>
  );
};

export default VisibilityScreen;

const styles = StyleSheet.create({});
