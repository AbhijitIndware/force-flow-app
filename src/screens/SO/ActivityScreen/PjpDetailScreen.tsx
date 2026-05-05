import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../../utils/colors';
import { flexCol } from '../../../utils/styles';
import PageHeader from '../../../components/ui/PageHeader';
import { useGetDailyPjpByIdQuery } from '../../../features/base/base-api';
import { PjpDailyStore } from '../../../types/baseType';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import PjpDetailComponent from '../../../components/SO/Activity/Pjp/PjpDetailComponent';
import moment from 'moment';
import { Fonts } from '../../../constants';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'PjpDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};
const PjpDetailScreen = ({ navigation, route }: Props) => {
  const { details } = route.params;

  const { data, isFetching, refetch } = useGetDailyPjpByIdQuery(
    details?.pjp_daily_store_id,
  );

  const isPastDate = details?.date
    ? moment(details.date, 'YYYY-MM-DD').isBefore(moment(), 'day')
    : false;

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader title="PJP Detail" navigation={() => navigation.goBack()} />

      {isFetching ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {!isPastDate && (
            <TouchableOpacity
              style={styles.editBanner}
              onPress={() => navigation.navigate('AddPjpScreen', { id: details?.pjp_daily_store_id })}
              activeOpacity={0.8}
            >
              <View style={styles.editBannerLeft}>
                <Icon name="edit" size={14} color="#534AB7" />
                <Text style={styles.editBannerText}>Tap to modify this PJP</Text>
              </View>
              <Icon name="chevron-right" size={18} color="#534AB7" />
            </TouchableOpacity>
          )}

          <PjpDetailComponent
            detail={data?.message?.data as PjpDailyStore}
            navigation={navigation}
            refetch={refetch}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default PjpDetailScreen;

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