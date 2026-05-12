import { StyleSheet, SafeAreaView, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import PageHeader from '../../../components/ui/PageHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import ExpenseApprovalListComponent from '../../../components/SO/Expense/expense-approval-list-component';
import VisibilityApprovalListComponent from '../../../components/SO/Visibility/visibility-approval-list-component';
import { Tab, TabView } from '@rneui/themed';
import { Size } from '../../../utils/fontSize';
import { Fonts } from '../../../constants';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'ExpenseApprovalScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const ExpenseApprovalScreen = ({ navigation, route }: Props) => {
  const { index: initialIndex } = route.params || {};
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (initialIndex !== undefined) {
      setIndex(initialIndex);
    }
  }, [initialIndex]);
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
        title="Expense & Visibility Approval"
        navigation={() => {
          navigation.navigate('Home');
        }}
      />
      <View style={styles.tabSection}>
        <Tab
          value={index}
          onChange={e => setIndex(e)}
          indicatorStyle={{
            height: 0,
          }}
          variant="primary"
          style={{ backgroundColor: Colors.transparent, padding: 0 }}>
          <Tab.Item
            title="Expense Approval"
            titleStyle={{
              fontSize: Size.xxs,
              fontFamily: Fonts.medium,
              lineHeight: 9,
              paddingHorizontal: 0,
            }}
            containerStyle={active => ({
              backgroundColor: active ? Colors.Orangelight : undefined,
              borderRadius: active ? 10 : undefined,
              borderColor: active ? '#FFBF83' : undefined,
              borderTopWidth: active ? 1 : undefined,
              borderLeftWidth: active ? 1 : undefined,
              borderRightWidth: active ? 1 : undefined,
            })}
          />
          <Tab.Item
            title="Visibility Approval"
            titleStyle={{
              fontSize: Size.xxs,
              fontFamily: Fonts.medium,
              lineHeight: 9,
            }}
            containerStyle={active => ({
              backgroundColor: active ? Colors.Orangelight : undefined,
              borderRadius: active ? 10 : undefined,
              borderColor: active ? '#FFBF83' : undefined,
              borderTopWidth: active ? 1 : undefined,
              borderLeftWidth: active ? 1 : undefined,
              borderRightWidth: active ? 1 : undefined,
            })}
          />
        </Tab>
      </View>
      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item
          style={{ width: '100%', flex: 1, backgroundColor: Colors.lightBg }}>
          <ExpenseApprovalListComponent navigation={navigation} />
        </TabView.Item>
        <TabView.Item
          style={{ width: '100%', flex: 1, backgroundColor: Colors.lightBg }}>
          <VisibilityApprovalListComponent navigation={navigation} />
        </TabView.Item>
      </TabView>
    </SafeAreaView>
  );
};

export default ExpenseApprovalScreen;

const styles = StyleSheet.create({
  tabSection: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
