/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useMemo, useState, memo} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import PageHeader from '../../../components/ui/PageHeader';
import {flexCol, flexRow, itemsCenter, justifyBetween} from '../../../utils/styles';
import {Colors} from '../../../utils/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PromoterAppStackParamList} from '../../../types/Navigation';
import {
  useGetStoreStockStatusQuery,
  useGetEmployeeAssignedStoresQuery,
} from '../../../features/base/promoter-base-api';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import {
  Boxes,
  Package,
  AlertCircle,
  TrendingUp,
  Search,
  X,
  History,
} from 'lucide-react-native';
import {StockDashboardItem} from '../../../types/baseType';

type NavigationProp = NativeStackNavigationProp<
  PromoterAppStackParamList,
  'StockScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

// ─── Fixed card height for getItemLayout ──────────────────────────────────────
const CARD_HEIGHT = 124;
const CARD_MARGIN_BOTTOM = 10;
const ITEM_HEIGHT = CARD_HEIGHT + CARD_MARGIN_BOTTOM;

// ─── Memoized card to prevent re-renders ─────────────────────────────────────
const StockCard = memo(({item}: {item: StockDashboardItem}) => {
  return (
    <View style={styles.card}>
      <View style={[flexRow, itemsCenter, {justifyContent: 'space-between'}]}>
        <View style={[flexRow, itemsCenter, {flex: 1, marginRight: 10}]}>
          <View style={styles.iconContainer}>
            <Package size={16} color={Colors.white} />
          </View>
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.item_name}
            </Text>
            <Text style={styles.itemCode}>{item.item_code}</Text>
          </View>
        </View>
      </View>

      <View style={styles.miniMetricsContainer}>
        <View style={styles.miniMetric}>
          <Text style={styles.miniLabel}>
            Opening:{' '}
            <Text style={styles.miniValue}>{item.opening_stock || 0}</Text>
          </Text>
        </View>
        <View style={styles.miniMetric}>
          <Text style={styles.miniLabel}>
            Current:{' '}
            <Text style={styles.miniValue}>{item.current_stock || 0}</Text>
          </Text>
        </View>
        <View style={styles.miniMetric}>
          <Text style={styles.miniLabel}>
            MTD Territory:{' '}
            <Text style={styles.miniValue}>{item.mtd_territory || 0}</Text>
          </Text>
        </View>
        <View style={styles.miniMetric}>
          <Text style={styles.miniLabel}>
            New:{' '}
            <Text style={[styles.miniValue, {color: Colors.orange}]}>
              {item.new_orders !== null ? item.new_orders : '—'}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const StockScreen = ({navigation}: Props) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [storesList, setStoresList] = useState<
    {label: string; value: string}[]
  >([]);
  const [itemSearch, setItemSearch] = useState('');

  const {data: assignedStoresData} = useGetEmployeeAssignedStoresQuery();

  useEffect(() => {
    const stores =
      assignedStoresData?.message?.data?.stores?.map(s => ({
        label: s.store_name,
        value: s.store_id,
      })) ?? [];
    setStoresList(stores);
  }, [assignedStoresData]);

  const handleStoreSelect = useCallback(
    (value: string) => {
      setSelectedStoreId(value);
      setItemSearch('');
      const store = storesList.find(s => s.value === value);
      if (store) setSelectedStoreName(store.label);
    },
    [storesList],
  );

  const {
    data: stockStatusData,
    isLoading: isStockLoading,
    isFetching: isStockFetching,
  } = useGetStoreStockStatusQuery(
    {store: selectedStoreId},
    {skip: !selectedStoreId},
  );

  // ── Merge all_items and previous_items into one stable list ──
  const allItems = useMemo(() => {
    const all = stockStatusData?.message?.all_items ?? [];
    const previous = stockStatusData?.message?.previous_items ?? [];
    const merged = [...previous, ...all];
    return Array.from(
      new Map(merged.map((item: any) => [item.item_code, item])).values(),
    );
  }, [stockStatusData]);

  const totalStockValue = useMemo(
    () =>
      allItems.reduce(
        (sum: number, item: any) =>
          sum + (item.current_stock * item.item_rate || 0),
        0,
      ),
    [allItems],
  );

  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return allItems;
    const q = itemSearch.toLowerCase();
    return allItems.filter(
      (item: any) =>
        item.item_name?.toLowerCase().includes(q) ||
        item.item_code?.toLowerCase().includes(q),
    );
  }, [allItems, itemSearch]);

  const renderItem = useCallback(
    ({item}: {item: StockDashboardItem}) => <StockCard item={item} />,
    [],
  );
  const keyExtractor = useCallback(
    (item: StockDashboardItem) => item.item_code,
    [],
  );
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.summaryBox}>
        <View style={[flexRow, itemsCenter, justifyBetween]}>
          <View style={{width: '80%'}}>
            <Text style={styles.summaryTitle}>Stock Overview</Text>
            <Text style={styles.summarySubtitle}>{selectedStoreName}</Text>
          </View>
          <View style={styles.statsBadge}>
            <Text style={styles.statsCount}>
              {filteredItems.length}
              {itemSearch ? ` of ${allItems.length}` : ''} Items
            </Text>
          </View>
        </View>
      </View>
    ),
    [selectedStoreName, filteredItems.length, allItems.length, itemSearch],
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <TrendingUp size={60} color={Colors.lightGray} strokeWidth={1} />
        <Text style={styles.emptyText}>
          {itemSearch
            ? `No items match "${itemSearch}"`
            : 'No stock activity found for this store'}
        </Text>
      </View>
    ),
    [itemSearch],
  );

  return (
    <SafeAreaView style={[flexCol, {flex: 1, backgroundColor: Colors.lightBg}]}>
      <PageHeader
        title="Stock Management"
        navigation={() => navigation.goBack()}
      />

      {/* Store picker */}
      <View style={styles.filterContainer}>
        <ReusableDropdown
          placeholder="Select Store"
          data={storesList}
          value={selectedStoreId}
          onChange={handleStoreSelect}
          error={false}
          field="label"
          label=""
          selectedLabel={selectedStoreName}
          marginBottom={0}
        />
      </View>

      {isStockLoading || isStockFetching ? (
        <LoadingScreen />
      ) : !selectedStoreId ? (
        <View style={styles.emptyContainer}>
          <Boxes size={60} color={Colors.lightGray} strokeWidth={1} />
          <Text style={styles.emptyText}>
            Please select a store to view stock details
          </Text>
        </View>
      ) : stockStatusData?.message?.warning ? (
        <View style={styles.warningContainer}>
          <AlertCircle size={40} color={Colors.orange} />
          <Text style={styles.warningText}>
            {stockStatusData.message.warning}
          </Text>
        </View>
      ) : (
        <View style={{flex: 1}}>
          {/* ── Item search bar ── */}
          <View style={styles.itemSearchContainer}>
            <Search size={16} color={Colors.gray} style={{marginRight: 8}} />
            <TextInput
              style={styles.itemSearchInput}
              placeholder="Search by item name or code…"
              placeholderTextColor={Colors.gray}
              value={itemSearch}
              onChangeText={setItemSearch}
              clearButtonMode="never"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {itemSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => setItemSearch('')}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <X size={16} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={{padding: 12, paddingBottom: 120}}
            getItemLayout={getItemLayout}
            removeClippedSubviews={true}
            maxToRenderPerBatch={12}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={7}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={ListEmpty}
          />

          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('StockEntryFormScreen', {
                store: selectedStoreId,
                storeName: selectedStoreName,
              })
            }>
            <History size={24} color={Colors.white} />
            <Text style={styles.fabText}>Update Physical Stock</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default StockScreen;

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 15,
    backgroundColor: Colors.white,
    paddingBottom: 10,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  itemSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  itemSearchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.darkButton,
    paddingVertical: 0,
  },
  summaryBox: {
    backgroundColor: '#F8F9FB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E4E9',
  },
  summaryTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  summarySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },
  statsBadge: {
    backgroundColor: Colors.darkButton,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsCount: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: CARD_MARGIN_BOTTOM,
    height: CARD_HEIGHT,
    elevation: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.darkButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.darkButton,
  },
  itemCode: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.gray,
  },
  miniMetricsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  miniMetric: {
    flex: 1,
    alignItems: 'center',
  },
  miniLabel: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: '#64748B',
  },
  miniValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.darkButton,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 50,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 15,
  },
  warningContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF4E5',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  warningText: {
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    color: Colors.orange,
    textAlign: 'center',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Colors.darkButton,
    borderRadius: 30,
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.white,
    marginLeft: 10,
  },
});