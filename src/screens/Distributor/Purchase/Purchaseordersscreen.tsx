/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ShoppingCart, Package, Search, Filter } from 'lucide-react-native';
import moment from 'moment';
import { useGetPurchaseOrdersListQuery } from '../../../features/base/distributor-api';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { PurchaseOrderItem } from '../../../types/distributorType';

type DistributorAppStackParamList = {
    PurchaseOrders: undefined;
    PurchaseOrderDetail: { order_id: string };
};

type NavigationProp = NativeStackNavigationProp<
    DistributorAppStackParamList,
    'PurchaseOrders'
>;

type Props = {
    navigation: NavigationProp;
};

const C = {
    white: '#FFFFFF',
    text: '#1A1A2E',
    textMuted: '#6B7280',
    accent: '#534AB7',
    background: '#F5F5F7',
    card: '#FFFFFF',
    border: '#E5E7EB',
};

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Delivered', 'Partially Delivered'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        Pending: { bg: '#FEF3C7', text: '#92400E' },
        Approved: { bg: '#DCFCE7', text: '#166534' },
        Delivered: { bg: '#DBEAFE', text: '#1E40AF' },
        'Partially Delivered': { bg: '#FEE2E2', text: '#991B1B' },
    };
    const colors = colorMap[status] ?? { bg: C.background, text: C.textMuted };
    return (
        <View style={[badgeStyles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[badgeStyles.text, { color: colors.text }]}>{status}</Text>
        </View>
    );
};

const PurchaseOrdersScreen = ({ navigation }: Props) => {
    const [search, setSearch] = useState('');
    const [activeStatus, setActiveStatus] = useState('All');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    const { data, isFetching, refetch } = useGetPurchaseOrdersListQuery({
        page,
        page_size: 20,
        search: search || undefined,
        status: activeStatus === 'All' ? undefined : activeStatus,
    });

    const orders: PurchaseOrderItem[] = data?.data ?? [];
    const totalPages = data?.pagination?.total_pages ?? 1;

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    }, [refetch]);

    const handleStatusFilter = (status: string) => {
        setActiveStatus(status);
        setPage(1);
    };

    const renderItem = ({ item }: { item: PurchaseOrderItem }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() =>
                navigation.navigate('PurchaseOrderDetail', { order_id: item.order_id })
            }>
            <View style={[styles.cardStripe, { backgroundColor: C.accent }]} />
            <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                    <Text style={styles.cardId}>{item.order_id}</Text>
                    <StatusBadge status={item.status} />
                </View>
                <View style={styles.cardRow}>
                    <Text style={styles.cardMeta}>
                        {moment(item.transaction_date).format('DD MMM YYYY')}
                    </Text>
                    <Text style={styles.cardAmount}>
                        ₹{item.grand_total.toLocaleString('en-IN')}
                    </Text>
                </View>
                {item.distributor_name ? (
                    <Text style={styles.cardSub}>{item.distributor_name}</Text>
                ) : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
        </TouchableOpacity>
    );

    const renderEmpty = () =>
        !isFetching ? (
            <View style={styles.emptyState}>
                <Package size={44} color={C.textMuted} />
                <Text style={styles.emptyTitle}>No Purchase Orders</Text>
                <Text style={styles.emptySubtitle}>
                    {search
                        ? 'Try adjusting your search or filter'
                        : 'No orders found for the selected filter'}
                </Text>
            </View>
        ) : null;

    const renderFooter = () =>
        isFetching ? (
            <ActivityIndicator color={C.accent} style={{ marginVertical: 16 }} />
        ) : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Purchase Orders</Text>
                <View style={{ width: 38 }} />
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Search size={16} color={C.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search order ID..."
                        placeholderTextColor={C.textMuted}
                        value={search}
                        onChangeText={t => {
                            setSearch(t);
                            setPage(1);
                        }}
                        returnKeyType="search"
                    />
                    {search ? (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color={C.textMuted} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    {STATUS_FILTERS.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[
                                styles.chip,
                                activeStatus === s && styles.chipActive,
                            ]}
                            onPress={() => handleStatusFilter(s)}>
                            <Text
                                style={[
                                    styles.chipText,
                                    activeStatus === s && styles.chipTextActive,
                                ]}>
                                {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Summary row */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                    {activeStatus !== 'All' ? ` · ${activeStatus}` : ''}
                </Text>
            </View>

            {/* List */}
            <FlatList
                data={orders}
                keyExtractor={item => item.order_id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={() => {
                    if (!isFetching && page < totalPages) setPage(p => p + 1);
                }}
                onEndReachedThreshold={0.3}
            />

            {/* Pagination footer */}
            {totalPages > 1 && (
                <View style={styles.paginationBar}>
                    <TouchableOpacity
                        style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                        disabled={page === 1}
                        onPress={() => setPage(p => Math.max(1, p - 1))}>
                        <Ionicons name="chevron-back" size={16} color={page === 1 ? C.textMuted : C.accent} />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>
                        Page {page} / {totalPages}
                    </Text>
                    <TouchableOpacity
                        style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                        disabled={page >= totalPages}
                        onPress={() => setPage(p => p + 1)}>
                        <Ionicons name="chevron-forward" size={16} color={page >= totalPages ? C.textMuted : C.accent} />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default PurchaseOrdersScreen;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: C.white,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    }, filterContainer: {
        backgroundColor: Colors.white, // or your background color
        paddingVertical: 12,
    },
    filterScrollContent: {
        paddingHorizontal: 16, // Keeps chips from hitting screen edges
        gap: 8, // Modern way to handle spacing between chips
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: C.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: Size.md,
        fontFamily: Fonts.semiBold,
        color: C.text,
    },
    searchRow: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: C.white,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.background,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: C.border,
    },
    searchInput: {
        flex: 1,
        fontSize: Size.sm,
        fontFamily: Fonts.regular,
        color: C.text,
        padding: 0,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
        backgroundColor: C.white,
        flexWrap: 'nowrap',
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: C.background,
        borderWidth: 1,
        borderColor: C.border,
    },
    chipActive: {
        backgroundColor: C.accent,
        borderColor: C.accent,
    },
    chipText: {
        fontSize: 11,
        fontFamily: Fonts.medium,
        color: C.textMuted,
    },
    chipTextActive: {
        color: C.white,
    },
    summaryRow: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    summaryText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: C.textMuted,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.card,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: C.border,
        marginBottom: 8,
        overflow: 'hidden',
    },
    cardStripe: { width: 4, alignSelf: 'stretch' },
    cardBody: { flex: 1, padding: 12, gap: 4 },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardId: {
        fontSize: 13,
        fontFamily: Fonts.semiBold,
        color: C.text,
    },
    cardMeta: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: C.textMuted,
    },
    cardAmount: {
        fontSize: 13,
        fontFamily: Fonts.semiBold,
        color: C.accent,
    },
    cardSub: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: C.textMuted,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 10,
    },
    emptyTitle: {
        fontSize: Size.md,
        fontFamily: Fonts.semiBold,
        color: C.text,
    },
    emptySubtitle: {
        fontSize: Size.sm,
        fontFamily: Fonts.regular,
        color: C.textMuted,
        textAlign: 'center',
    },
    paginationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: C.border,
        backgroundColor: C.white,
    },
    pageBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: C.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageBtnDisabled: { opacity: 0.4 },
    pageText: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: C.text,
    },
});

const badgeStyles = StyleSheet.create({
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    text: { fontSize: 10, fontWeight: '700' },
});