import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import {SafeAreaView} from 'react-native';
import {Colors} from '../../../utils/colors';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import {useGetPurchaseOrderByIdQuery} from '../../../features/base/base-api';
import {POOrderData} from '../../../types/baseType';
import PurchaseDetailComponent from '../../../components/SO/Order/Purchase/PurchaseDetailComponent';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PurchaseDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
const PurchaseDetailScreen = ({navigation, route}: Props) => {
  const {id} = route.params;
  const {data, isFetching, refetch} = useGetPurchaseOrderByIdQuery(id);
  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Purchase Order Detail"
        navigation={() => navigation.goBack()}
      />
      {/* Header with Edit */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Purchase Order Detail</Text>
        {/* {data?.message?.data?.order_details?.status === 'Draft' && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'AddPurchaseScreen',
                //   , {
                //   orderId: data?.message?.data?.order_details?.order_id,
                // }
              )
            }>
            <Icon name="edit" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )} */}
      </View>
      {isFetching ? (
        <ActivityIndicator size="large" />
      ) : (
        <PurchaseDetailComponent
          detail={data?.message?.data as POOrderData}
          navigation={navigation}
          refetch={refetch}
        />
      )}
    </SafeAreaView>
  );
};

export default PurchaseDetailScreen;

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
