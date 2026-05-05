/* eslint-disable react-native/no-inline-styles */
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import SaleDetailComponent from '../../../components/SO/Order/Sale/SaleDetailComponent';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../../utils/colors';
import { flexCol } from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import { useGetSalesOrderByIdQuery } from '../../../features/base/base-api';
import { RSoDetailData } from '../../../types/baseType';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import { Size } from '../../../utils/fontSize';
import { Fonts } from '../../../constants';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'SaleDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
const SaleDetailScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const { data, isFetching, refetch } = useGetSalesOrderByIdQuery(id, {
    refetchOnMountOrArgChange: true,
  });

  const isDraft = data?.message?.data?.order_details?.status === 'Draft';
  const orderId = data?.message?.data?.order_details?.order_id;

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader
        title="Order Detail"
        navigation={() => navigation.goBack()}
      />

      {isFetching ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {isDraft && (
            <TouchableOpacity
              style={styles.editBanner}
              onPress={() => navigation.navigate('AddSaleScreen', { orderId })}
              activeOpacity={0.8}
            >
              <View style={styles.editBannerLeft}>
                <Icon name="edit" size={14} color="#534AB7" />
                <Text style={styles.editBannerText}>This order is in Draft — tap to edit</Text>
              </View>
              <Icon name="chevron-right" size={18} color="#534AB7" />
            </TouchableOpacity>
          )}

          <SaleDetailComponent
            detail={data?.message?.data as RSoDetailData}
            navigation={navigation}
            refetch={refetch}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default SaleDetailScreen;

const styles = StyleSheet.create({
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 3,
    borderLeftColor: '#534AB7',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#C7D2FE',
  },
  editBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBannerText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#534AB7',
  },
});