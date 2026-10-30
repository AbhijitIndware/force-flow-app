import React, {useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  RefreshControl,
  ScrollView,
  Text,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {SoAppStackParamList} from '../../../types/Navigation';
import {useGetDistributorDetailsQuery} from '../../../features/base/base-api';

import DistributorDetailComponent from '../../../components/SO/Partner/Distributor/DistributorDetailComponent';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import PageHeader from '../../../components/ui/PageHeader';

import {Colors} from '../../../utils/colors';
import {flexCol} from '../../../utils/styles';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'DistributorDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: {
    params: {
      distributorId: string;
    };
  };
};

const DistributorDetailScreen = ({navigation, route}: Props) => {
  const distributorId = route?.params?.distributorId;

  const {data, isFetching, isLoading, isError, refetch} =
    useGetDistributorDetailsQuery(distributorId, {
      skip: !distributorId,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    });

  const distributor = data?.message?.data;

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={[flexCol, styles.container]}>
      <PageHeader
        title={distributor?.distributor_name || 'Distributor Details'}
        navigation={() => navigation.goBack()}
      />

      {/* 🔄 Initial Loading */}
      {isLoading && <LoadingScreen />}

      {/* ❌ Error State */}
      {!isLoading && isError && (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Failed to load distributor details.
          </Text>
        </View>
      )}

      {/* 📄 Content */}
      {!isLoading && !isError && distributor && (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
          }>
          <DistributorDetailComponent
            distributor={distributor}
            navigation={navigation}
          />
        </ScrollView>
      )}

      {/* 🚫 Empty State */}
      {!isLoading && !isError && !distributor && (
        <View style={styles.center}>
          <Text>No Distributor Data Found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DistributorDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  scroll: {
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});
