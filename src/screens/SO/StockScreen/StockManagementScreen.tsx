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
    console.log("🚀 ~ StockManagementScreen ~ selectedStore:", selectedStore)
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
    console.log("🚀 ~ StockManagementScreen ~ storeListData:", storeListData)

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
    console.log("🚀 ~ StockManagementScreen ~ error:", error)
    console.log("🚀 ~ StockManagementScreen ~ stockStatusData:", stockStatusData)

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
                <View style={[flexRow, itemsCenter, { marginBottom: 12 }]}>
                    <View style={styles.iconContainer}>
                        <Package size={20} color={Colors.white} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.itemName} numberOfLines={2}>{item.item_name}</Text>
                        <Text style={styles.itemCode}>{item.item_code}</Text>
                    </View>
                </View>

                <Divider style={{ marginVertical: 8 }} color={Colors.lightGray} width={0.5} />

                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Opening</Text>
                        <Text style={styles.value}>{item.opening_stock || 0}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>ERP Stock</Text>
                        <Text style={styles.value}>{item.current_stock || 0}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Monthly Cons.</Text>
                        <Text style={styles.value}>{item.mtd_territory || 0}</Text>
                    </View>
                </View>

                <View style={[styles.bottomStats, flexRow, justifyBetween, itemsCenter]}>
                    <View>
                        <Text style={styles.smallLabel}>Physical Count</Text>
                        <Text style={[styles.bigValue, { color: Colors.darkButton }]}>
                            {item.physical_count !== null ? item.physical_count : '—'}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.smallLabel}>Difference / Gap</Text>
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
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
            <PageHeader title="Stock Dashboard" navigation={() => navigation.goBack()} />

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
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.darkButton,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.xs,
        color: Colors.darkButton,
    },
    itemCode: {
        fontFamily: Fonts.regular,
        fontSize: Size.xxs,
        color: Colors.gray,
        marginTop: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 10,
    },
    gridItem: {
        flex: 1,
        minWidth: '28%',
    },
    label: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: Colors.gray,
        marginBottom: 2,
    },
    value: {
        fontFamily: Fonts.medium,
        fontSize: Size.xs,
        color: Colors.darkButton,
    },
    bottomStats: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    smallLabel: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: Colors.gray,
        marginBottom: 2,
    },
    bigValue: {
        fontFamily: Fonts.semiBold,
        fontSize: Size.sm,
    },
    gapBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
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
    gapText: {
        fontFamily: Fonts.semiBold,
        fontSize: 11,
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
