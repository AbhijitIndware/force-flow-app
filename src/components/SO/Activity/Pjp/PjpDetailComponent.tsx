import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {PjpDailyStore} from '../../../../types/baseType';
import moment from 'moment';

type Props = {
  detail: PjpDailyStore;
  navigation: any;
  // refetch: any;
};

const PjpDetailComponent = ({detail, navigation}: Props) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // refetch();
    }, 2000);
  }, []);

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
        <Text>Employee: {detail.employee}</Text>
        <Text>
          Created:{' '}
          {moment(detail.creation, 'YYYY-MM-DD HH:mm:ss.SSSSSS').format(
            'DD MMM YYYY, hh:mm A',
          )}
        </Text>
        {/* <Text>Modified: {detail.modified}</Text> */}
        <Text>Total Stores: {detail.total_stores}</Text>
      </View>

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
});
