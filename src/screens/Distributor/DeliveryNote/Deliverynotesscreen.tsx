/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Truck, Search } from 'lucide-react-native';
import moment from 'moment';
import { useGetDeliveryNotesListQuery } from '../../../features/base/distributor-api';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { DeliveryNoteItem } from '../../../types/distributorType';
import { flexRow } from '../../../utils/styles';
import { DistributorAppStackParamList } from '../../../types/Navigation';

type NavigationProp = NativeStackNavigationProp<
    DistributorAppStackParamList,
    'DeliveryNoteDetailScreen'
>;

type Props = { navigation: NavigationProp };

const C = {
    white: '#FFFFFF',
    text: '#1A1A2E',
    textMuted: '#6B7280',
    accent: '#185FA5',
    background: '#F5F5F7',
    card: '#FFFFFF',
    border: '#E5E7EB',
};

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Delivered', 'Partially Delivered', 'Rejected'];

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

const DeliveryNotesScreen = ({ navigation }: Props) => {
    const [search, setSearch] = useState('');
    const [activeStatus, setActiveStatus] = useState('All');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    const { data, isFetching, refetch } = useGetDeliveryNotesListQuery({
        page,
        page_size: 10,
        search: search || undefined,
        status: activeStatus === 'All' ? undefined : activeStatus,
    });

    const notes: DeliveryNoteItem[] = data?.message?.data?.delivery_notes ?? [];

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    }, [refetch]);

    const renderItem = ({ item }: { item: DeliveryNoteItem }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
                navigation.navigate('DeliveryNoteDetailScreen', {
                    id: item.delivery_note_id,
                })
            }
        >
            {/* Header Section: ID and Status */}
            <View style={styles.cardHeader}>
                <View style={styles.idContainer}>
                    <Truck size={14} color={C.accent} style={{ marginRight: 6 }} />
                    <Text style={styles.cardId}>{item.delivery_note_id}</Text>
                </View>
                <StatusBadge status={item.workflow_state} />
            </View>

            {/* Content Section */}
            <View style={styles.cardContent}>
                <View style={styles.mainInfo}>
                    <View style={[flexRow, { gap: 5, alignItems: 'center' }]}>
                        <Ionicons name="business-outline" size={15} color={C.textMuted} />
                        <Text style={styles.distributorName}>{item.store_name}</Text>
                    </View>

                    <Text style={styles.cardMeta}>
                        {moment(item.posting_date).format('MMM DD, YYYY')} • PO: {item.purchase_order}
                    </Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>AMOUNT</Text>
                        <Text style={styles.statValue}>₹{Number(item.grand_total).toLocaleString()}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>DELIVERED</Text>
                        <Text style={styles.statValue}>
                            {item.delivered_qty}
                            <Text style={styles.qtyTotal}> of {item.ordered_qty} delivered</Text>
                        </Text>
                    </View>

                </View>
            </View>

            {/* Footer Section */}
            {/* <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                </View>
                <Ionicons name="chevron-forward" size={14} color={C.accent} />
            </View> */}
        </TouchableOpacity>
    );
    const renderEmpty = () =>
        !isFetching ? (
            <View style={styles.emptyState}>
                <Truck size={44} color={C.textMuted} />
                <Text style={styles.emptyTitle}>No Delivery Notes</Text>
                <Text style={styles.emptySubtitle}>
                    {search
                        ? 'Try adjusting your search or filter'
                        : 'No delivery notes found for the selected filter'}
                </Text>
            </View>
        ) : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Notes</Text>
                <View style={{ width: 38 }} />
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Search size={16} color={C.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by note name..."
                        placeholderTextColor={C.textMuted}
                        value={search}
                        onChangeText={t => {
                            setSearch(t);
                            setPage(1);
                        }}
                    />
                    {search ? (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color={C.textMuted} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Filter chips */}
            <View style={styles.filterRow}>
                {STATUS_FILTERS.map(s => (
                    <TouchableOpacity
                        key={s}
                        style={[styles.chip, activeStatus === s && styles.chipActive]}
                        onPress={() => {
                            setActiveStatus(s);
                            setPage(1);
                        }}>
                        <Text style={[styles.chipText, activeStatus === s && styles.chipTextActive]}>
                            {s}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Summary */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                    {notes.length} Delivery note{notes.length !== 1 ? 's' : ''}
                    {activeStatus !== 'All' ? ` · ${activeStatus}` : ''}
                </Text>
            </View>

            {/* List */}
            <FlatList
                data={notes}
                keyExtractor={item => item.delivery_note_id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={
                    isFetching ? (
                        <ActivityIndicator color={C.accent} style={{ marginVertical: 16 }} />
                    ) : null
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </SafeAreaView>
    );
};

export default DeliveryNotesScreen;

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
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
        backgroundColor: C.white,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: C.background,
        borderWidth: 1,
        borderColor: C.border,
    },
    chipActive: { backgroundColor: C.accent, borderColor: C.accent },
    chipText: { fontSize: 11, fontFamily: Fonts.medium, color: C.textMuted },
    chipTextActive: { color: C.white },
    summaryRow: { paddingHorizontal: 16, paddingVertical: 8 },
    summaryText: { fontSize: 12, fontFamily: Fonts.regular, color: C.textMuted },
    listContent: { paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 },
    card: {
        backgroundColor: C.white,
        borderRadius: 16,
        marginBottom: 5,
        // Elevation for Android
        elevation: 3,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardId: {
        fontSize: 13,
        fontFamily: Fonts.bold,
        color: C.text,
        letterSpacing: 0.3
    },
    cardContent: {
        padding: 5,
        paddingHorizontal: 12
    },
    mainInfo: {
        marginBottom: 0,
        paddingHorizontal: 10
    },
    distributorName: {
        fontSize: 15,
        fontFamily: Fonts.semiBold,
        color: C.text,
        marginBottom: 4,
    },
    cardMeta: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: C.textMuted
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 12,
    },
    statLabel: {
        fontSize: 10,
        fontFamily: Fonts.bold,
        color: C.textMuted,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
        color: C.text,
    },
    qtyTotal: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: C.textMuted,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FCFCFD',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 11,
        fontFamily: Fonts.medium,
        color: C.textMuted,
    },
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
});

const badgeStyles = StyleSheet.create({
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    text: { fontSize: 10, fontWeight: '700' },
});