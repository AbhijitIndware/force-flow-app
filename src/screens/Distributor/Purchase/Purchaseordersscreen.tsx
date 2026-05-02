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
    Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ShoppingCart, Package, Search, CalendarDays, ChevronDown } from 'lucide-react-native';
import moment from 'moment';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useGetPurchaseOrdersListQuery } from '../../../features/base/distributor-api';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { PurchaseOrder } from '../../../types/distributorType';
import { DistributorAppStackParamList } from '../../../types/Navigation';

type NavigationProp = NativeStackNavigationProp<
    DistributorAppStackParamList,
    'PurchaseOrdersScreen'
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

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Delivered', 'Partially Delivered', 'Rejected'];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        Pending: { bg: '#FEF3C7', text: '#92400E' },
        Approved: { bg: '#DCFCE7', text: '#1E40AF' },
        Delivered: { bg: '#8de58dff', text: ' #21974eff' },
        'Partially Delivered': { bg: '#FEE2E2', text: '#991B1B' },
        Rejected: { bg: '#ff6557ff', text: '#92400E' },
    };
    const colors = colorMap[status] ?? { bg: C.background, text: C.textMuted };
    return (
        <View style={[badgeStyles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[badgeStyles.text, { color: colors.text }]}>{status}</Text>
        </View>
    );
};

// ─── Date Picker Button ───────────────────────────────────────────────────────
const DatePickerButton: React.FC<{
    label: string;
    date: Date;
    onPress: () => void;
}> = ({ label, date, onPress }) => (
    <TouchableOpacity style={datePickerStyles.btn} onPress={onPress} activeOpacity={0.75}>
        <CalendarDays size={13} color={C.accent} />
        <View style={{ flex: 1 }}>
            <Text style={datePickerStyles.btnLabel}>{label}</Text>
            <Text style={datePickerStyles.btnDate}>{moment(date).format('DD MMM YYYY')}</Text>
        </View>
        <ChevronDown size={14} color={C.textMuted} />
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const PurchaseOrdersScreen = ({ navigation }: Props) => {
    const [search, setSearch] = useState('');
    const [activeStatus, setActiveStatus] = useState('All');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    // ── Date Range State ───────────────────────────────────────────────────────
    const [fromDate, setFromDate] = useState<Date>(moment().startOf('month').toDate());
    const [toDate, setToDate] = useState<Date>(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const fromDateStr = moment(fromDate).format('YYYY-MM-DD');
    const toDateStr = moment(toDate).format('YYYY-MM-DD');

    const handleFromChange = (event: DateTimePickerEvent, selected?: Date) => {
        setShowFromPicker(Platform.OS === 'ios');
        if (event.type === 'set' && selected) {
            if (moment(selected).isAfter(toDate)) setToDate(selected);
            setFromDate(selected);
            setPage(1);
        }
    };

    const handleToChange = (event: DateTimePickerEvent, selected?: Date) => {
        setShowToPicker(Platform.OS === 'ios');
        if (event.type === 'set' && selected) {
            setToDate(selected);
            setPage(1);
        }
    };

    const { data, isFetching, refetch } = useGetPurchaseOrdersListQuery({
        page,
        page_size: 20,
        search: search || undefined,
        status: activeStatus === 'All' ? undefined : activeStatus,
        from_date: fromDateStr,
        to_date: toDateStr,
    });

    const orders: PurchaseOrder[] = data?.message?.data?.purchase_orders ?? [];
    const totalPages = data?.message?.data?.pagination?.total_pages ?? 1;

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    }, [refetch]);

    const handleStatusFilter = (status: string) => {
        setActiveStatus(status);
        setPage(1);
    };

    const renderItem = ({ item }: { item: PurchaseOrder }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() =>
                navigation.navigate('PurchaseOrderDetailScreen', { order_id: item.order_id })
            }>
            <View style={[styles.cardStripe, { backgroundColor: C.accent }]} />
            <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                    <Text style={styles.cardId}>{item.order_id}</Text>
                    <StatusBadge status={item.workflow_state} />
                </View>
                <View style={styles.cardRow}>
                    <Text style={styles.cardMeta}>
                        {moment(item.transaction_date).format('DD MMM YYYY')}
                    </Text>
                    <Text style={styles.cardAmount}>
                        ₹{item.grand_total.toLocaleString('en-IN')}
                    </Text>
                </View>
                {item.supplier_name ? (
                    <Text style={styles.cardSub}>{item.supplier_name}</Text>
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

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders</Text>
                <View style={{ width: 38 }} />
            </View>

            {/* ── Search ── */}
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

            {/* ── Date Range Picker ── */}
            <View style={datePickerStyles.container}>
                <DatePickerButton
                    label="From"
                    date={fromDate}
                    onPress={() => setShowFromPicker(true)}
                />
                <View style={datePickerStyles.divider} />
                <DatePickerButton
                    label="To"
                    date={toDate}
                    onPress={() => setShowToPicker(true)}
                />
            </View>

            {showFromPicker && (
                <DateTimePicker
                    value={fromDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    maximumDate={toDate}
                    onChange={handleFromChange}
                />
            )}
            {showToPicker && (
                <DateTimePicker
                    value={toDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    minimumDate={fromDate}
                    maximumDate={new Date()}
                    onChange={handleToChange}
                />
            )}

            {/* ── Status Filter Chips ── */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}>
                    {STATUS_FILTERS.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.chip, activeStatus === s && styles.chipActive]}
                            onPress={() => handleStatusFilter(s)}>
                            <Text style={[styles.chipText, activeStatus === s && styles.chipTextActive]}>
                                {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* ── Summary Row ── */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                    {activeStatus !== 'All' ? ` · ${activeStatus}` : ''}
                    {' · '}{moment(fromDate).format('DD MMM')} – {moment(toDate).format('DD MMM YYYY')}
                </Text>
            </View>

            {/* ── List ── */}
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

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <View style={styles.paginationBar}>
                    <TouchableOpacity
                        style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                        disabled={page === 1}
                        onPress={() => setPage(p => Math.max(1, p - 1))}>
                        <Ionicons name="chevron-back" size={16} color={page === 1 ? C.textMuted : C.accent} />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>Page {page} / {totalPages}</Text>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    filterContainer: {
        backgroundColor: C.white,
        paddingVertical: 10,
    },
    filterScrollContent: {
        paddingHorizontal: 16,
        gap: 8,
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
    chipTextActive: { color: C.white },
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
    cardId: { fontSize: 13, fontFamily: Fonts.semiBold, color: C.text },
    cardMeta: { fontSize: 11, fontFamily: Fonts.regular, color: C.textMuted },
    cardAmount: { fontSize: 13, fontFamily: Fonts.semiBold, color: C.accent },
    cardSub: { fontSize: 11, fontFamily: Fonts.regular, color: C.textMuted },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 10,
    },
    emptyTitle: { fontSize: Size.md, fontFamily: Fonts.semiBold, color: C.text },
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
    pageText: { fontSize: 13, fontFamily: Fonts.medium, color: C.text },
});

const badgeStyles = StyleSheet.create({
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    text: { fontSize: 10, fontWeight: '700' },
});

// ─── Date Picker Styles ───────────────────────────────────────────────────────
const datePickerStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 10,
        backgroundColor: C.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    divider: {
        width: 1,
        height: 36,
        backgroundColor: C.border,
    },
    btnLabel: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: C.textMuted,
        lineHeight: 13,
    },
    btnDate: {
        fontFamily: Fonts.semiBold,
        fontSize: 12,
        color: C.text,
        lineHeight: 16,
    },
});