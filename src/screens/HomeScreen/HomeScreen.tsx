/* eslint-disable react-native/no-inline-styles */
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {flexCol} from '../../utils/styles';
import {Colors} from '../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LoadingScreen from '../../components/ui/LoadingScreen';
import {useCallback, useState} from 'react';
import {AppStackParamList} from '../../types/Navigation';

type NavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'HomeScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const HomeScreen = ({navigation, route}: Props) => {
  console.log(navigation, route);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <View
      style={[
        flexCol,
        {
          flex: 1,
          backgroundColor: Colors.lightGray,
        },
      ]}>
      {refreshing ? (
        <LoadingScreen />
      ) : (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <Text>Home</Text>
        </ScrollView>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  contentContainer: {},
});
