import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Fonts } from '../../../../constants';

type Props = {
    claimId: string;
    itemCount: number;
    status: string | undefined;
};

const STATUS_STYLE: Record<
    string,
    { bg: string; border: string; dot: string; text: string }
> = {
    Draft: {
        bg: '#f8fafc',
        border: '#cbd5e1',
        dot: '#94a3b8',
        text: '#475569',
    },
    'Pending Approval': {
        bg: '#fffbeb',
        border: '#fde68a',
        dot: '#f59e0b',
        text: '#d97706',
    },
    Approved: {
        bg: '#f0fdf4',
        border: '#86efac',
        dot: '#22c55e',
        text: '#16a34a',
    },
    Rejected: {
        bg: '#fff1f2',
        border: '#fecdd3',
        dot: '#f87171',
        text: '#dc2626',
    },
};

const DEFAULT_STYLE = {
    bg: '#f8fafc',
    border: '#cbd5e1',
    dot: '#94a3b8',
    text: '#475569',
};

export const DraftStatusBadge = ({ claimId, itemCount, status }: Props) => {
    const s = STATUS_STYLE[status ?? ''] ?? DEFAULT_STYLE;

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: s.bg,
                    borderColor: s.border,
                },
            ]}>
            <View style={[styles.dot, { backgroundColor: s.dot }]} />
            <Text style={[styles.claimText, { color: s.text }]} numberOfLines={1}>
                {status ?? 'Draft'} · {claimId}
            </Text>
            <Text style={[styles.countText, { color: s.text }]}>
                {itemCount} item{itemCount !== 1 ? 's' : ''}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 10,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    claimText: {
        fontSize: 11,
        fontFamily: Fonts.medium,
        flex: 1,
    },
    countText: {
        fontSize: 11,
        fontFamily: Fonts.medium,
    },
});