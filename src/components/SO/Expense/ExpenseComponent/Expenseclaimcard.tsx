import React, { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { Fonts } from '../../../../constants';

interface Claim {
    name: string;
    approval_status: string;
    custom_travel_end_date: string;
    total_claimed_amount: number | string;
}

interface StatusConfig {
    color: string;
    dotColor: string;
    label: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
    Approved: { color: '#3B6D11', dotColor: '#4ADE80', label: 'Approved' },
    Rejected: { color: '#A32D2D', dotColor: '#F87171', label: 'Rejected' },
};

const DEFAULT_STATUS: StatusConfig = {
    color: '#854F0B',
    dotColor: '#FBBF24',
    label: 'Pending',
};

interface Props {
    claim: Claim;
    onPress: () => void;
}

const ExpenseClaimCard: React.FC<Props> = ({ claim, onPress }) => {
    const s = STATUS_MAP[claim.approval_status] ?? {
        ...DEFAULT_STATUS,
        label: claim.approval_status || 'Pending',
    };

    return (
        <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={onPress}>
            {/* Status dot */}
            <View style={[styles.dot, { backgroundColor: s.dotColor }]} />

            {/* Info */}
            <View style={styles.body}>
                <Text style={styles.claimId} numberOfLines={1}>{claim.name}</Text>
                <Text style={styles.claimDate}>
                    {moment(claim.custom_travel_end_date).format('DD MMM YYYY')}
                </Text>
            </View>

            {/* Right */}
            <View style={styles.right}>
                <Text style={styles.amount}>
                    ₹{Number(claim.total_claimed_amount).toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.status, { color: s.color }]}>{s.label}</Text>
            </View>

            <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
        </TouchableOpacity>
    );
};

export default ExpenseClaimCard;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 12,
        marginBottom: 6,
        gap: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        flexShrink: 0,
    },
    body: {
        flex: 1,
        gap: 3,
    },
    claimId: {
        fontFamily: Fonts.bold,
        fontSize: 13,
        color: '#0F172A',
    },
    claimDate: {
        fontFamily: Fonts.regular,
        fontSize: 11,
        color: '#94A3B8',
    },
    right: {
        alignItems: 'flex-end',
        gap: 3,
    },
    amount: {
        fontFamily: Fonts.bold,
        fontSize: 13,
        color: '#0F172A',
    },
    status: {
        fontFamily: Fonts.medium,
        fontSize: 11,
    },
});