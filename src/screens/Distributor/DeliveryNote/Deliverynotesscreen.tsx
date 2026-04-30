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

type DistributorAppStackParamList = {
    DeliveryNotes: undefined;
    DeliveryNoteDetail: { note_name: string };
};

type NavigationProp = NativeStackNavigationProp<
    DistributorAppStackParamList,
    'DeliveryNotes'
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

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Delivered'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
        Pending: { bg: '#FEF3C7', text: '#92400E' },
        Approved: { bg: '#DCFCE7', text: '#166534' },
        Delivered: { bg: '#DBEAFE', text: '#1E40AF' },
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
        page_size: 20,
        search: search || undefined,
        status: activeStatus === 'All' ? undefined : activeStatus,
    });

    const notes: DeliveryNoteItem[] = data?.data ?? [];

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    }, [refetch]);

    const renderItem = ({ item }: { item: DeliveryNoteItem }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() =>
                navigation.navigate('DeliveryNoteDetail', { note_name: item.name })
            }>
            <View style={[styles.cardStripe, { backgroundColor: C.accent }]} />
            <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                    <Text style={styles.cardId}>{item.name}</Text>
                    <StatusBadge status={item.workflow_state} />
                </View>
                <View style={styles.cardRow}>
                    <Text style={styles.cardMeta}>PO: {item.purchase_order}</Text>
                    <Text style={styles.cardMeta}>
                        {moment(item.date).format('DD MMM YYYY')}
                    </Text>
                </View>
                {item.invoice_no ? (
                    <Text style={styles.cardInvoice}>Invoice: {item.invoice_no}</Text>
                ) : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
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
                    {notes.length} note{notes.length !== 1 ? 's' : ''}
                    {activeStatus !== 'All' ? ` · ${activeStatus}` : ''}
                </Text>
            </View>

            {/* List */}
            <FlatList
                data={notes}
                keyExtractor={item => item.name}
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
    cardInvoice: { fontSize: 11, fontFamily: Fonts.regular, color: C.textMuted, marginTop: 2 },
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