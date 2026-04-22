/* eslint-disable react-native/no-inline-styles */
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';
import DeliveryNoteDetailComponent from '../../../components/SO/Order/DeliveryNote/DeliveryNoteDetailComponent';
import {SafeAreaView} from 'react-native';
import {Colors} from '../../../utils/colors';
import {flexCol} from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import {useGetDeliveryNoteByIdQuery} from '../../../features/base/base-api';
import {Size} from '../../../utils/fontSize';
import {Fonts} from '../../../constants';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'DeliveryNoteDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const DeliveryNoteDetailScreen = ({navigation, route}: Props) => {
  const {id} = route.params;
  const {data, isFetching, refetch} = useGetDeliveryNoteByIdQuery(id);

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Delivery Note Detail"
        navigation={() => navigation.goBack()}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Note Detail</Text>
      </View>
      {isFetching ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <DeliveryNoteDetailComponent
          detail={data?.message?.data as any}
          navigation={navigation}
          refetch={refetch}
        />
      )}
    </SafeAreaView>
  );
};

export default DeliveryNoteDetailScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xsmd,
    color: Colors.darkButton,
  },
});
