import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    FlatList,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { flexCol, flexRow, itemsCenter, justifyBetween } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useGetStoreStockStatusQuery, useGetStoreListQuery } from '../../../features/base/base-api';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import ReusableDropdown from '../../../components/ui-lib/resusable-dropdown';
import { Boxes, Info, Package, AlertCircle, TrendingUp, History } from 'lucide-react-native';
import { Divider } from '@rneui/themed';

type NavigationProp = NativeStackNavigationProp<
    SoAppStackParamList,
    'StockManagementScreen'
>;

type Props = {
    navigation: NavigationProp;
    route: any;
};

const StockManagementScreen = ({ navigation }: Props) => {
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [selectedStoreName, setSelectedStoreName] = useState<string>('');

    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [storesList, setStoresList] = useState<{ label: string; value: string }[]>([]);

    // Fetch stores with pagination and search
    const { data: storeListData, isFetching: isStoresFetching } = useGetStoreListQuery({
        include_direct_subordinates: '1',
        include_subordinates: '1',
        page_size: '20',
        page: page.toString(),
        search: searchText,
    });

    useEffect(() => {
        if (storeListData?.message?.data?.stores) {
            const newStores = storeListData.message.data.stores.map(s => ({
                label: s.store_name,
                value: s.store_name,
            }));
            if (page === 1) {
                setStoresList(newStores);
            } else {
                setStoresList(prev => {
                    // Prevent duplicates
                    const existingValues = new Set(prev.map(i => i.value));
                    const uniqueNew = newStores.filter(i => !existingValues.has(i.value));
                    return [...prev, ...uniqueNew];
                });
            }
        }
    }, [storeListData, page]);

    const handleLoadMore = useCallback(() => {
        if (!isStoresFetching && storeListData?.message?.data?.stores?.length === 20) {
            setPage(prev => prev + 1);
        }
    }, [isStoresFetching, storeListData]);

    const handleSearch = useCallback((val: string) => {
        setSearchText(val);
        setPage(1); // Reset to first page on search
        setStoresList([]); // Clear list for new search
    }, []);

    // Fetch stock status for selected store
    const {
        data: stockStatusData,
        isLoading: isStockLoading,
        isFetching: isStockFetching,
        error
    } = useGetStoreStockStatusQuery(
        { store: selectedStore },
        { skip: !selectedStore }
    );

    const handleStoreSelect = (value: string) => {
        setSelectedStore(value);
        const store = storesList.find(s => s.value === value);
        if (store) setSelectedStoreName(store.label);
    };

    const renderStockCard = ({ item }: { item: any }) => {
        const isGapPositive = (item.stock_difference || 0) > 0;
        const isGapNegative = (item.stock_difference || 0) < 0;

        return (
            <View style={styles.card}>
                <View style={[flexRow, itemsCenter, { justifyContent: 'space-between' }]}>
                    <View style={[flexRow, itemsCenter, { flex: 1, marginRight: 10 }]}>
                        <View style={styles.iconContainer}>
                            <Package size={16} color={Colors.white} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.item_name}</Text>
                            <Text style={styles.itemCode}>{item.item_code}</Text>
                        </View>
                    </View>

                    <View style={[
                        styles.gapBadge,
                        isGapPositive && styles.positiveGap,
                        isGapNegative && styles.negativeGap,
                        item.stock_difference === 0 && styles.neutralGap
                    ]}>
                        <Text style={[
                            styles.gapText,
                            isGapPositive && { color: Colors.success },
                            isGapNegative && { color: Colors.denger },
                            item.stock_difference === 0 && { color: Colors.gray }
                        ]}>
                            {item.stock_difference !== null
                                ? (item.stock_difference > 0 ? `+${item.stock_difference}` : item.stock_difference)
                                : 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.miniMetricsContainer}>
                    <View style={styles.miniMetric}>
                        <Text style={styles.miniLabel}>Opening: <Text style={styles.miniValue}>{item.opening_stock || 0}</Text></Text>
                    </View>
                    <View style={styles.miniMetric}>
                        <Text style={styles.miniLabel}>System: <Text style={styles.miniValue}>{item.current_stock || 0}</Text></Text>
                    </View>
                    <View style={styles.miniMetric}>
                        <Text style={styles.miniLabel}>MTD: <Text style={styles.miniValue}>{item.mtd_territory || 0}</Text></Text>
                    </View>
                    <View style={styles.miniMetric}>
                        <Text style={styles.miniLabel}>Physical: <Text style={[styles.miniValue, { color: Colors.orange }]}>{item.physical_count !== null ? item.physical_count : '—'}</Text></Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
            <PageHeader title="Stock Management" navigation={() => navigation.goBack()} />

            <View style={styles.filterContainer}>
                <ReusableDropdown
                    placeholder="Select Store"
                    data={storesList}
                    value={selectedStore}
                    onChange={handleStoreSelect}
                    error={false}
                    field='label'
                    label=''
                    onLoadMore={handleLoadMore}
                    loadingMore={isStoresFetching}
                    searchText={searchText}
                    setSearchText={handleSearch}
                    selectedLabel={selectedStoreName}
                    marginBottom={0}
                />
            </View>

            {isStockLoading || isStockFetching ? (
                <LoadingScreen />
            ) : !selectedStore ? (
                <View style={styles.emptyContainer}>
                    <Boxes size={60} color={Colors.lightGray} strokeWidth={1} />
                    <Text style={styles.emptyText}>Please select a store to view stock details</Text>
                </View>
            ) : stockStatusData?.message?.warning ? (
                <View style={styles.warningContainer}>
                    <AlertCircle size={40} color={Colors.orange} />
                    <Text style={styles.warningText}>{stockStatusData.message.warning}</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={stockStatusData?.message?.data || []}
                        keyExtractor={(item) => item.item_code}
                        renderItem={renderStockCard}
                        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
                        ListHeaderComponent={
                            <View style={styles.summaryBox}>
                                <View style={[flexRow, itemsCenter, justifyBetween]}>
                                    <View>
                                        <Text style={styles.summaryTitle}>Stock Overview</Text>
                                        <Text style={styles.summarySubtitle}>{selectedStoreName}</Text>
                                    </View>
                                    <View style={styles.statsBadge}>
                                        <Text style={styles.statsCount}>
                                            {(stockStatusData?.message?.data || []).length} Items
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <TrendingUp size={60} color={Colors.lightGray} strokeWidth={1} />
                                <Text style={styles.emptyText}>No stock activity found for this store</Text>
                            </View>
                        }
                    />

                    <TouchableOpacity
                        style={styles.fab}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('StockManagementFormScreen', {
                            store: selectedStore,
                            storeName: selectedStoreName
                        })}
                    >
                        <History size={24} color={Colors.white} />
                        <Text style={styles.fabText}>Update Physical Stock</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default StockManagementScreen;

const styles = StyleSheet.create({
    filterContainer: {
        paddingHorizontal: 15,
        backgroundColor: Colors.white,
        paddingBottom: 10,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    summaryBox: {
        backgroundColor: '#F8F9FB',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
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
        marginBottom: 10,
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
    gapBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    gapText: {
        fontFamily: Fonts.bold,
        fontSize: 10,
    },
    positiveGap: {
        backgroundColor: '#E8F5E9',
    },
    negativeGap: {
        backgroundColor: '#FFEBEE',
    },
    neutralGap: {
        backgroundColor: '#F5F5F5',
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
        shadowOffset: { width: 0, height: 4 },
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
