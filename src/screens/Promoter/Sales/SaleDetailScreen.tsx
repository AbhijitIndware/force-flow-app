/* eslint-disable react-native/no-inline-styles */
import {ActivityIndicator} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {SafeAreaView} from 'react-native';
import {Colors} from '../../../utils/colors';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import SaleInvoiceComponent from '../../../components/Promoter/Sales/SaleInvoiceComponent';
import {useGetSalesInvoiceDetailsQuery} from '../../../features/base/promoter-base-api';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import {InvoiceData} from '../../../types/baseType';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'PromoterSaleDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
const PromoterSaleDetailScreen = ({navigation, route}: Props) => {
  const {id} = route.params;
  const {data, isFetching, refetch} = useGetSalesInvoiceDetailsQuery(
    {invoice_id: id},
    {
      skip: !id,
    },
  );
  console.log('🚀 ~ PromoterSaleDetailScreen ~ data:', data);

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Sales Invoice Detail"
        navigation={() => navigation.goBack()}
      />
      {isFetching ? (
        <LoadingScreen />
      ) : (
        <SaleInvoiceComponent
          detail={data?.message?.data as InvoiceData}
          navigation={navigation}
          refetch={refetch}
        />
      )}
    </SafeAreaView>
  );
};

export default PromoterSaleDetailScreen;
