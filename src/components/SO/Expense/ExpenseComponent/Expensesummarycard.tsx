import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleCheckBig, CircleX, RotateCw, TrendingUp } from 'lucide-react-native';
import { Fonts } from '../../../../constants';

interface ConsumedData {
    DA?: number;
    TA?: number;
    Lodging?: number;
    Telecom?: number;
    Incidental?: number;
}

interface Props {
    consumed: ConsumedData;
    totalConsumed: number;
    counts: {
        pending: number;
        approved: number;
        rejected: number;
    };
}

const BREAKDOWN_ITEMS = [
    { key: 'DA', label: 'DA', color: '#F97316' },
    { key: 'TA', label: 'TA', color: '#3B82F6' },
    { key: 'Lodging', label: 'Lodge', color: '#8B5CF6' },
    { key: 'Telecom', label: 'Telecom', color: '#10B981' },
    { key: 'Incidental', label: 'Incid.', color: '#EC4899' },
];

const ExpenseSummaryCard: React.FC<Props> = ({ consumed, totalConsumed, counts }) => {
    return (
        <View style={styles.wrapper}>
            {/* Summary dark card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryTopRow}>
                    <View style={styles.totalBlock}>
                        <Text style={styles.totalLabel}>Total Consumed</Text>
                        <Text style={styles.totalAmount}>
                            ₹{totalConsumed.toLocaleString('en-IN')}
                        </Text>
                    </View>
                    <View style={styles.trendBadge}>
                        <TrendingUp size={14} color="#F97316" />
                        <Text style={styles.trendText}>This Month</Text>
                    </View>
                </View>

                {/* Breakdown pills */}
                <View style={styles.divider} />
                <View style={styles.breakdownRow}>
                    {BREAKDOWN_ITEMS.map(item => (
                        <View key={item.key} style={styles.breakdownItem}>
                            <View style={[styles.dot, { backgroundColor: item.color }]} />
                            <Text style={styles.breakdownLabel}>{item.label}</Text>
                            <Text style={styles.breakdownValue}>
                                ₹{(consumed[item.key as keyof ConsumedData] || 0).toLocaleString('en-IN')}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Status row */}
            <View style={styles.statusRow}>
                <View style={[styles.statusCard, styles.statusCardPending]}>
                    <View style={styles.statusIconBox}>
                        <RotateCw size={16} color="#854F0B" />
                    </View>
                    <Text style={styles.statusCount}>{counts.pending}</Text>
                    <Text style={styles.statusLabel}>Pending</Text>
                </View>

                <View style={[styles.statusCard, styles.statusCardApproved]}>
                    <View style={[styles.statusIconBox, styles.statusIconApproved]}>
                        <CircleCheckBig size={16} color="#3B6D11" />
                    </View>
                    <Text style={[styles.statusCount, { color: '#3B6D11' }]}>{counts.approved}</Text>
                    <Text style={styles.statusLabel}>Approved</Text>
                </View>

                <View style={[styles.statusCard, styles.statusCardRejected]}>
                    <View style={[styles.statusIconBox, styles.statusIconRejected]}>
                        <CircleX size={16} color="#A32D2D" />
                    </View>
                    <Text style={[styles.statusCount, { color: '#A32D2D' }]}>{counts.rejected}</Text>
                    <Text style={styles.statusLabel}>Rejected</Text>
                </View>
            </View>
        </View>
    );
};

export default ExpenseSummaryCard;

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 16,
        marginTop: -14,
        gap: 12,
    },
    summaryCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 18,
        elevation: 6,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    summaryTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    totalBlock: {
        gap: 2,
    },
    totalLabel: {
        fontFamily: Fonts.medium,
        fontSize: 12,
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    totalAmount: {
        fontFamily: Fonts.bold,
        fontSize: 26,
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginTop: 2,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(249,115,22,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.2)',
    },
    trendText: {
        fontFamily: Fonts.medium,
        fontSize: 11,
        color: '#F97316',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginBottom: 14,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    breakdownItem: {
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    breakdownLabel: {
        fontFamily: Fonts.medium,
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    breakdownValue: {
        fontFamily: Fonts.bold,
        fontSize: 12,
        color: '#FFFFFF',
    },
    statusRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statusCard: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
    },
    statusCardPending: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
    },
    statusCardApproved: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    statusCardRejected: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    statusIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#FAEEDA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    statusIconApproved: {
        backgroundColor: '#DCFCE7',
    },
    statusIconRejected: {
        backgroundColor: '#FEE2E2',
    },
    statusCount: {
        fontFamily: Fonts.bold,
        fontSize: 20,
        color: '#854F0B',
        lineHeight: 24,
    },
    statusLabel: {
        fontFamily: Fonts.medium,
        fontSize: 11,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});