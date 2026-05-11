import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';

type Props = {
    claimId: string;
    itemCount: number;
};

export const DraftStatusBadge = ({ claimId, itemCount }: Props) => (
    <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.claimText} numberOfLines={1}>
            Draft · {claimId}
        </Text>
        <Text style={styles.countText}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.sucess + '12',
        borderWidth: 1,
        borderColor: Colors.sucess + '30',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 10,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: Colors.sucess,
    },
    claimText: {
        fontSize: 11,
        color: Colors.sucess,
        fontFamily: Fonts.medium,
        flex: 1,
    },
    countText: {
        fontSize: 11,
        color: Colors.sucess,
        fontFamily: Fonts.medium,
    },
});