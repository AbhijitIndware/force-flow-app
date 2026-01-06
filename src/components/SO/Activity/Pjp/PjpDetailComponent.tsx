import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {PjpDailyStore} from '../../../../types/baseType';
import moment from 'moment';
import {Colors} from '../../../../utils/colors';
import {useUpdatePjpRouteMutation} from '../../../../features/base/base-api';
import {
  getCurrentLocation,
  requestLocationPermission,
} from '../../../../utils/utils';
import Toast from 'react-native-toast-message';
import MinStoresWarningModal from './MinStoresWarningModal';

type Props = {
  detail: PjpDailyStore;
  navigation: any;
  refetch: any;
};

const PjpDetailComponent = ({detail, navigation, refetch}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [updatePjpRoute] = useUpdatePjpRouteMutation();

  const [showMinStoreModal, setShowMinStoreModal] = useState(false);

  const pjpStatus = detail?.running_status;
  const isCompleted = pjpStatus === null || pjpStatus === 'Completed';
  const isRunning = pjpStatus === 'Running';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // refetch();
    }, 2000);
  }, []);

  const handleStartEndPjp = async () => {
    // 🚫 Guard: Completed or null → no action
    if (
      detail?.running_status === null ||
      detail?.running_status === 'Completed'
    ) {
      Toast.show({
        type: 'info',
        text1: 'ℹ️ PJP already completed',
      });
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Ask permission & get location
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: '📍 Location permission required',
        });
        return;
      }

      const location = await getCurrentLocation(); // "lat,lng"

      if (!location) {
        Toast.show({
          type: 'error',
          text1: '❌ Unable to fetch location',
        });
        return;
      }

      const isRunning = detail?.running_status === 'Running';

      // 2️⃣ Build payload
      const payload = {
        data: {
          document_name: detail?.pjp_daily_store_id,
          action_type: isRunning ? 'END_PJP' : 'START_PJP',
          ...(isRunning
            ? {end_location: location}
            : {start_location: location}),
        },
      };

      // 3️⃣ Call API
      const res = await updatePjpRoute(payload).unwrap();

      if (res?.message?.status === 'success') {
        Toast.show({
          type: 'success',
          text1: '✅ Success',
          text2: res?.message?.message,
        });

        // 🔄 Optional: update local status instantly
        // setDetail(prev => ({
        //   ...prev,
        //   running_status: isRunning ? 'Completed' : 'Running',
        // }));

        // OR refetch PJP detail here
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Action failed',
        text2: err?.data?.message ?? 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* PJP Daily Store Info */}
      <View style={styles.card}>
        <Text style={styles.title}>PJP Daily Store Detail</Text>
        <Text>ID: {detail.pjp_daily_store_id}</Text>
        <Text>Date: {detail.date}</Text>
        <Text>Employee: {detail.employee_name}</Text>
        <Text>
          Created:{' '}
          {moment(detail.creation, 'YYYY-MM-DD HH:mm:ss.SSSSSS').format(
            'DD MMM YYYY, hh:mm A',
          )}
        </Text>
        {/* <Text>Modified: {detail.modified}</Text> */}
        <Text>Total Stores: {detail.stores?.length || 0}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isCompleted
              ? styles.completedButton
              : isRunning
              ? styles.endButton
              : styles.startButton,
            loading && {opacity: 0.6},
          ]}
          onPress={() => {
            if (detail.stores.length < 15) setShowMinStoreModal(true);
            else handleStartEndPjp();
          }}
          activeOpacity={0.85}
          disabled={loading || isCompleted}>
          <Text style={styles.buttonText}>
            {isCompleted ? 'Completed' : isRunning ? 'End PJP' : 'Start PJP'}
          </Text>

          <Text style={styles.subText}>
            {loading
              ? 'Please wait...'
              : isCompleted
              ? 'Today’s plan is already completed'
              : isRunning
              ? 'Tap to finish today’s plan'
              : 'Tap to begin your route'}
          </Text>
        </TouchableOpacity>
      </View>

      <MinStoresWarningModal
        visible={showMinStoreModal}
        onCancel={() => {
          setShowMinStoreModal(false);
        }}
        onContinue={() => {
          setShowMinStoreModal(false);
          handleStartEndPjp();
        }}
      />
      {/* Stores List */}
      <View style={styles.card}>
        <Text style={styles.title}>Stores</Text>
        <FlatList
          data={detail.stores}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.store_id}-${index}`}
          renderItem={({item}) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.store_name}</Text>
              <Text>Category: {item.store_category}</Text>
              <Text>City: {item.city || '-'}</Text>
              <Text>State: {item.state || '-'}</Text>

              {/* Warehouses */}
              {item.warehouse.map((wh, idx) => (
                <View
                  key={`${wh.warehouse_id}-${idx}`}
                  style={styles.warehouse}>
                  <Text style={styles.warehouseTitle}>
                    Warehouse: {wh.warehouse_name}
                  </Text>
                  <Text>Distributor: {wh.distributor_name}</Text>
                  <Text>Company: {wh.company}</Text>
                  {/* <Text>Parent: {wh.parent_warehouse}</Text>
                  <Text>Group: {wh.is_group === 1 ? 'Yes' : 'No'}</Text> */}
                </View>
              ))}
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

export default PjpDetailComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  itemRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
    marginBottom: 8,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 15,
  },
  warehouse: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
  },
  warehouseTitle: {
    fontWeight: '600',
  },
  buttonContainer: {
    marginVertical: 16,
    marginBottom: 20,
    paddingHorizontal: 6,
  },

  actionButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  startButton: {
    backgroundColor: Colors.Orangelight, // green
  },

  endButton: {
    backgroundColor: Colors.primary, // red
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  subText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
  },
  completedButton: {
    backgroundColor: '#9ca3af', // gray
  },
});
