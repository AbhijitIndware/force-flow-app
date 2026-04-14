// screens/OrderDetailScreen.tsx
import React from 'react';
import {
    SafeAreaView,
    TouchableOpacity,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    ChevronLeft,
    Package,
    User,
    Store,
    Clock,
    Truck,
    CreditCard,
    FileText,
    Hash,
    MessageSquare,
    ShoppingBag,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react-native';
import { useGetAsmOrderDetailQuery } from '../../../features/base/base-api';
import { SoAppStackParamList } from '../../../types/Navigation';

type Props = NativeStackScreenProps<SoAppStackParamList, 'OrderDetailScreen'>;

const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0 });

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isPending = status === 'Pending';
    return (
        <View style={[
            styles.statusBadge,
            { backgroundColor: isPending ? C.amberSoft : C.greenSoft },
        ]}>
            {isPending
                ? <AlertCircle size={11} color={C.amber} strokeWidth={2.5} />
                : <CheckCircle2 size={11} color={C.green} strokeWidth={2.5} />}
            <Text style={[
                styles.statusBadgeText,
                { color: isPending ? C.amber : C.green },
            ]}>
                {status}
            </Text>
        </View>
    );
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{
    icon: React.FC<any>;
    label: string;
    value: string;
    last?: boolean;
}> = ({ icon: Icon, label, value, last }) => (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
        <View style={styles.infoRowLeft}>
            <View style={styles.infoIconWrap}>
                <Icon size={13} color={C.accent} strokeWidth={1.8} />
            </View>
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const CardHeader: React.FC<{ icon: React.FC<any>; title: string }> = ({
    icon: Icon,
    title,
}) => (
    <View style={styles.cardHeader}>
        <View style={styles.cardHeaderIcon}>
            <Icon size={13} color={C.accent} strokeWidth={2} />
        </View>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
    </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
export const OrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { order_id } = route.params;
    const { data, isLoading, isError } = useGetAsmOrderDetailQuery({ order_id });
    const detail = data?.message;

    const grandTotal = detail?.order.grand_total ?? 0;
    const totalQty = detail?.items.reduce((s, i) => s + i.qty, 0) ?? 0;
    const deliveredQty = detail?.items.reduce((s, i) => s + i.delivered_qty, 0) ?? 0;

    return (
        <SafeAreaView style={styles.container}>

            {/* ── Header ── */}
            <View style={styles.pageHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={18} color={C.text} strokeWidth={2} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.pageTitle} numberOfLines={1}>{order_id}</Text>
                    {detail && (
                        <Text style={styles.pageSubtitle} numberOfLines={1}>
                            {detail.order.store}
                        </Text>
                    )}
                </View>
                {detail && <StatusBadge status={detail.order.delivery_display_status} />}
            </View>

            {isLoading ? (
                <ActivityIndicator style={{ marginTop: 48 }} color={C.accent} />
            ) : isError || !detail ? (
                <View style={styles.errorWrap}>
                    <AlertCircle size={32} color={C.textMuted} strokeWidth={1.5} />
                    <Text style={styles.emptyText}>Failed to load order</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>

                    {/* ── Summary strip ── */}
                    <View style={styles.summaryStrip}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{fmt(grandTotal)}</Text>
                            <Text style={styles.summaryLabel}>Order value</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{totalQty}</Text>
                            <Text style={styles.summaryLabel}>Total qty</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{deliveredQty}</Text>
                            <Text style={styles.summaryLabel}>Delivered</Text>
                        </View>
                    </View>

                    {/* ── Order info ── */}
                    <View style={styles.card}>
                        <CardHeader icon={FileText} title="Order info" />
                        <InfoRow icon={User} label="Customer" value={detail.order.customer} />
                        <InfoRow icon={Store} label="Store" value={detail.order.store} />
                        <InfoRow icon={User} label="Salesperson" value={detail.order.salesperson} />
                        <InfoRow icon={Clock} label="Order date" value={detail.order.date} />
                        <InfoRow icon={Truck} label="Delivery date" value={detail.order.delivery_date} />
                        <InfoRow icon={CreditCard} label="Payment" value={detail.order.billing_status} />
                        {detail.order.po_no && (
                            <InfoRow icon={Hash} label="PO No." value={detail.order.po_no} />
                        )}
                        {detail.order.remarks && (
                            <InfoRow
                                icon={MessageSquare}
                                label="Remarks"
                                value={detail.order.remarks}
                                last
                            />
                        )}
                    </View>

                    {/* ── Items ── */}
                    <View style={styles.card}>
                        <CardHeader icon={ShoppingBag} title={`Items (${detail.items.length})`} />
                        {detail.items.map((item, i) => (
                            <View
                                key={item.item_code}
                                style={[styles.itemRow, i > 0 && styles.itemRowBorder]}>
                                {/* Left — index pill */}
                                <View style={styles.itemIndex}>
                                    <Text style={styles.itemIndexText}>{i + 1}</Text>
                                </View>
                                {/* Middle — name + meta */}
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {item.item_name}
                                    </Text>
                                    <View style={styles.itemMeta}>
                                        <Text style={styles.itemMetaText}>{item.item_code}</Text>
                                        <View style={styles.itemMetaDot} />
                                        <Text style={styles.itemMetaText}>
                                            {item.qty} {item.uom}
                                        </Text>
                                        <View style={styles.itemMetaDot} />
                                        <Text style={styles.itemMetaText}>{fmt(item.rate)}/unit</Text>
                                    </View>
                                    {item.delivered_qty > 0 && (
                                        <View style={styles.deliveredBadge}>
                                            <CheckCircle2 size={9} color={C.green} strokeWidth={2.5} />
                                            <Text style={styles.deliveredText}>
                                                {item.delivered_qty} delivered
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                {/* Right — amount */}
                                <Text style={styles.itemAmount}>{fmt(item.amount)}</Text>
                            </View>
                        ))}

                        {/* Total */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Grand total</Text>
                            <Text style={styles.totalValue}>{fmt(detail.order.grand_total)}</Text>
                        </View>
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
};

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
    text: '#1A1A2E',
    textMuted: '#6B7280',
    accent: '#534AB7',
    accentSoft: 'rgba(83,74,183,0.08)',
    background: '#F5F5F7',
    card: '#FFFFFF',
    border: '#E5E7EB',
    amber: '#BA7517',
    amberSoft: 'rgba(239,159,39,0.12)',
    green: '#0F6E56',
    greenSoft: 'rgba(29,158,117,0.12)',
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.background,
    },

    // ── Header ──────────────────────────────────────────────────────────────
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
        width: 34,
        height: 34,
        borderRadius: 9,
        borderWidth: 0.5,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: C.text,
    },
    pageSubtitle: {
        fontSize: 12,
        color: C.textMuted,
        marginTop: 1,
    },

    // ── Status badge ────────────────────────────────────────────────────────
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // ── Scroll ──────────────────────────────────────────────────────────────
    scrollContent: {
        padding: 16,
        gap: 12,
    },

    // ── Summary strip ────────────────────────────────────────────────────────
    summaryStrip: {
        backgroundColor: C.card,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: C.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: C.text,
        marginBottom: 2,
    },
    summaryLabel: {
        fontSize: 11,
        color: C.textMuted,
    },
    summaryDivider: {
        width: 0.5,
        height: 32,
        backgroundColor: C.border,
    },

    // ── Card ────────────────────────────────────────────────────────────────
    card: {
        backgroundColor: C.card,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: C.border,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
        backgroundColor: C.background,
    },
    cardHeaderIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: C.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardHeaderTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: C.text,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },

    // ── Info rows ────────────────────────────────────────────────────────────
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    infoRowBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
    },
    infoRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    infoIconWrap: {
        width: 26,
        height: 26,
        borderRadius: 7,
        backgroundColor: C.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: C.textMuted,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '500',
        color: C.text,
        flex: 1,
        textAlign: 'right',
        marginLeft: 8,
    },

    // ── Items ────────────────────────────────────────────────────────────────
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    itemRowBorder: {
        borderTopWidth: 0.5,
        borderTopColor: C.border,
    },
    itemIndex: {
        width: 22,
        height: 22,
        borderRadius: 6,
        backgroundColor: C.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 1,
    },
    itemIndexText: {
        fontSize: 10,
        fontWeight: '600',
        color: C.accent,
    },
    itemName: {
        fontSize: 13,
        fontWeight: '500',
        color: C.text,
        marginBottom: 3,
        lineHeight: 18,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    itemMetaText: {
        fontSize: 11,
        color: C.textMuted,
    },
    itemMetaDot: {
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: C.textMuted,
    },
    deliveredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 5,
        alignSelf: 'flex-start',
        backgroundColor: C.greenSoft,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    deliveredText: {
        fontSize: 10,
        color: C.green,
        fontWeight: '500',
    },
    itemAmount: {
        fontSize: 13,
        fontWeight: '600',
        color: C.text,
        marginTop: 1,
    },

    // ── Total ────────────────────────────────────────────────────────────────
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderTopWidth: 0.5,
        borderTopColor: C.border,
        backgroundColor: C.background,
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: C.textMuted,
    },
    totalValue: {
        fontSize: 17,
        fontWeight: '700',
        color: C.text,
    },

    // ── Error ────────────────────────────────────────────────────────────────
    errorWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: C.textMuted,
    },
});