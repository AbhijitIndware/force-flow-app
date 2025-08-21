import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import SaleDetailComponent from '../../../components/SO/Order/Sale/SaleDetailComponent';
import {SafeAreaView} from 'react-native';
import {Colors} from '../../../utils/colors';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import {useGetSalesOrderByIdQuery} from '../../../features/base/base-api';
import {RSoDetailData} from '../../../types/baseType';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TouchableOpacity} from 'react-native';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'SaleDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
const SaleDetailScreen = ({navigation, route}: Props) => {
  const {id} = route.params;
  const {data, isFetching, refetch} = useGetSalesOrderByIdQuery(id);
  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Sales Order Detail"
        navigation={() => navigation.goBack()}
      />
      {/* Header with Edit */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sale Order Detail</Text>
        {data?.message?.data?.order_details?.status === 'Draft' && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddSaleScreen', {
                orderId: data?.message?.data?.order_details?.order_id,
              })
            }>
            <Icon name="edit" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {isFetching ? (
        <ActivityIndicator size="large" />
      ) : (
        <SaleDetailComponent
          detail={data?.message?.data as RSoDetailData}
          navigation={navigation}
          refetch={refetch}
        />
      )}
    </SafeAreaView>
  );
};

export default SaleDetailScreen;

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
