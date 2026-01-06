import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import SaleDetailComponent from '../../../components/SO/Order/Sale/SaleDetailComponent';
import {SafeAreaView} from 'react-native';
import {Colors} from '../../../utils/colors';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import {useGetDailyPjpByIdQuery} from '../../../features/base/base-api';
import {PjpDailyStore} from '../../../types/baseType';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TouchableOpacity} from 'react-native';
import PjpDetailComponent from '../../../components/SO/Activity/Pjp/PjpDetailComponent';
import moment from 'moment';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PjpDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
const PjpDetailScreen = ({navigation, route}: Props) => {
  const {details} = route.params;

  const {data, isFetching, refetch} = useGetDailyPjpByIdQuery(
    details?.pjp_daily_store_id,
  );

  // inside component
  const isPastDate = details?.date
    ? moment(details.date, 'YYYY-MM-DD').isBefore(moment(), 'day')
    : false;
  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader title="Pjp Detail" navigation={() => navigation.goBack()} />
      {/* Header with Edit */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pjp Detail</Text>
        {!isPastDate && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddPjpScreen', {
                id: details?.pjp_daily_store_id,
              })
            }>
            <Icon name="edit" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {isFetching ? (
        <ActivityIndicator size="large" />
      ) : (
        <PjpDetailComponent
          detail={data?.message?.data as PjpDailyStore}
          navigation={navigation}
          refetch={refetch}
        />
      )}
    </SafeAreaView>
  );
};

export default PjpDetailScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
