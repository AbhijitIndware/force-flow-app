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
import {useGetStoreByIdQuery} from '../../../features/base/base-api';

import StoreDetailComponent from '../../../components/SO/Partner/Store/StoreDetailComponent';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import PageHeader from '../../../components/ui/PageHeader';

import {Colors} from '../../../utils/colors';
import {flexCol} from '../../../utils/styles';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'StoreDetailScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: {
    params: {
      storeId: string;
    };
  };
};

const StoreDetailScreen = ({navigation, route}: Props) => {
  const storeId = route?.params?.storeId;

  const {data, isFetching, isLoading, isError, error, refetch} =
    useGetStoreByIdQuery(storeId, {
      skip: !storeId,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    });

  const store = data?.message?.data;

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={[flexCol, styles.container]}>
      <PageHeader
        title={store?.store_name || 'Store Details'}
        navigation={() => navigation.goBack()}
      />

      {/* 🔄 Initial Loading */}
      {isLoading && <LoadingScreen />}

      {/* ❌ Error State */}
      {!isLoading && isError && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load store details.</Text>
        </View>
      )}

      {/* 📄 Content */}
      {!isLoading && !isError && store && (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
          }>
          <StoreDetailComponent store={store} navigation={navigation} />
        </ScrollView>
      )}

      {/* 🚫 Empty State */}
      {!isLoading && !isError && !store && (
        <View style={styles.center}>
          <Text>No Store Data Found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default StoreDetailScreen;

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
