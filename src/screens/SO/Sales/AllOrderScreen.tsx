// screens/AllOrdersScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { SafeAreaView, TouchableOpacity, View, Text, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { ChevronLeft, Clock, Package, ShoppingCart, Users } from 'lucide-react-native';
import { useGetAsmOrderStatusQuery } from '../../../features/base/base-api';
import { SoAppStackParamList } from '../../../types/Navigation';
import { StyleSheet } from 'react-native';
import { AsmOrderStatus } from './AsmDashboardScreen';

type Props = NativeStackScreenProps<SoAppStackParamList, 'AllOrdersScreen'>;

const FILTERS = ['All', 'Pending', 'Delivered'] as const;
type Filter = (typeof FILTERS)[number];

export const AllOrdersScreen: React.FC<Props> = ({ route, navigation }) => {
    const { date, employee } = route.params;
    console.log("🚀 ~ AllOrdersScreen ~ route:", route)
    console.log("🚀 ~ AllOrdersScreen ~ date:", date)
    const [filter, setFilter] = useState<Filter>('All');

    const { data, isLoading, isError } = useGetAsmOrderStatusQuery({ date, employee });
    console.log("🚀 ~ AllOrdersScreen ~ data:", data)
    const orders = data?.message?.data ?? [];

    const filtered =
        filter === 'All' ? orders : orders.filter(o => o.delivery_display_status === filter);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.pageHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={16} color={C.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Today's Orders</Text>
                    <Text style={styles.pageSubtitle}> {orders.length} orders</Text>
                </View>
            </View>

            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                        onPress={() => setFilter(f)}>
                        <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* List */}
            {isLoading ? (
                <ActivityIndicator style={{ marginTop: 32 }} />
            ) : isError ? (
                <Text style={styles.emptyText}>Failed to load orders</Text>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.order_id}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('OrderDetailScreen', { order_id: item.order_id })}>
                            <OrderCard order={item} index={index} navigation={navigation} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No orders</Text>}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </SafeAreaView>
    );
};

// ─── Orders ───────────────────────────────────────────────────────────────────
interface OrderCardProps {
    order: AsmOrderStatus;
    index: number;
    navigation: any
}

const fmt = (n?: number): string => {
    if (n === undefined || n === null) return '₹0';
    return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const OrderCard: React.FC<OrderCardProps> = ({ order, index, navigation }) => (
    <TouchableOpacity
        onPress={() => navigation.navigate('OrderDetailScreen', { order_id: order.order_id })}
        style={[styles.orderCard, index > 0 && { marginTop: 10 }]}>
        <View style={styles.orderStripe} />
        <View style={{ flex: 1 }}>
            <View style={styles.orderTop}>
                <View style={styles.orderIdRow}>
                    <Package size={12} color={C.accent} strokeWidth={2} />
                    <Text style={styles.orderId}>{order.order_id}</Text>
                </View>
                <View
                    style={[
                        styles.statusTag,
                        {
                            backgroundColor:
                                order.delivery_display_status === 'Pending'
                                    ? C.amberSoft
                                    : C.greenSoft,
                            borderColor:
                                order.delivery_display_status === 'Pending'
                                    ? `${C.amber}40`
                                    : `${C.green}40`,
                        },
                    ]}>
                    <Text
                        style={[
                            styles.statusTagText,
                            {
                                color:
                                    order.delivery_display_status === 'Pending'
                                        ? C.amber
                                        : C.green,
                            },
                        ]}>
                        {order.delivery_display_status}
                    </Text>
                </View>
            </View>
            <Text style={styles.orderStore}>{order.store}</Text>
            <View style={styles.orderMeta}>
                <View style={styles.orderMetaItem}>
                    <Clock size={11} color={C.textMuted} strokeWidth={2} />
                    <Text style={styles.orderMetaText}>{order.time}</Text>
                </View>
                <View style={styles.orderMetaItem}>
                    <Users size={11} color={C.textMuted} strokeWidth={2} />
                    <Text style={styles.orderMetaText}>{order.salesperson}</Text>
                </View>
                <View style={styles.orderMetaItem}>
                    <ShoppingCart size={11} color={C.textMuted} strokeWidth={2} />
                    <Text style={styles.orderMetaText}>{order.items} items</Text>
                </View>
            </View>
            <View style={styles.orderFooter}>
                <Text style={styles.orderValue}>{fmt(order.order_value)}</Text>
                <View style={styles.creditTag}>
                    <Text style={styles.creditTagText}>{order.payment}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);


const C = {
    // use your existing color constants — adjust to match your theme
    text: '#1A1A2E',
    textMuted: '#6B7280',
    accent: '#534AB7',
    background: '#F5F5F7',
    card: '#FFFFFF',
    border: '#E5E7EB',
    accentSoft: 'rgba(83,74,183,0.08)',
    accentBorder: 'rgba(83,74,183,0.25)',
    bg: '#F0F2F6',
    surface: '#FFFFFF',
    cardAlt: '#FFFAE4',
    green: '#0AB72A',
    greenSoft: '#E7F8EA',
    amber: '#FF7B00',
    amberSoft: '#FFE9D4',
    red: '#D31010',
    redSoft: '#FBE8E8',
    purple: '#367CFF',
    purpleSoft: '#E3ECFF',
    yellow: '#FFB302',
    yellowSoft: '#FFFAE4',
    textSub: '#4F4F4F',
    shadow: 'rgba(0,0,0,0.06)',
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.background,
    },

    // ─── Header ───────────────────────────────────────────────────────────────
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 14,
        backgroundColor: C.card,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
    },
    backBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.card,
    },
    pageTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: C.text,
    },
    pageSubtitle: {
        fontSize: 12,
        color: C.textMuted,
        marginTop: 1,
    },

    // ─── Filter row ───────────────────────────────────────────────────────────
    filterRow: {
        flexGrow: 0,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: C.card,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: C.border,
        marginRight: 8,
        backgroundColor: 'transparent',
    },
    filterChipActive: {
        backgroundColor: C.accentSoft,
        borderColor: C.accentBorder,
    },
    filterChipText: {
        fontSize: 12,
        color: C.textMuted,
    },
    filterChipTextActive: {
        color: C.accent,
        fontWeight: '500',
    },

    // ─── Empty / error states ─────────────────────────────────────────────────
    emptyText: {
        textAlign: 'center',
        marginTop: 48,
        fontSize: 14,
        color: C.textMuted,
    },

    // Orders
    orderCard: {
        backgroundColor: C.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        flexDirection: 'row',
        overflow: 'hidden',
        paddingRight: 14,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    orderStripe: {
        width: 4,
        backgroundColor: C.accent,
        borderRadius: 2,
        marginRight: 12,
    },
    orderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    orderId: {
        color: C.amber,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    statusTag: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
    },
    statusTagText: { fontSize: 9, fontWeight: '700' },
    orderStore: { color: C.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
    orderMeta: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    orderMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    orderMetaText: { color: C.textMuted, fontSize: 10 },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: 10,
    },
    orderValue: { color: C.text, fontSize: 16, fontWeight: '800' },
    creditTag: {
        backgroundColor: C.purpleSoft,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: `${C.purple}30`,
    },
    creditTagText: { color: C.purple, fontSize: 10, fontWeight: '700' },
});