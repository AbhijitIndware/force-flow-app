import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { useGetDailyPjpListQuery } from '../../../../features/base/base-api';
import moment from 'moment';

type Props = {
    value: string;
    onSelect: (id: string) => void;
    selectedDate: string;
    disabled?: boolean;
    error?: string;
};

export const PjpSelectionDropdown = ({ value, onSelect, selectedDate, disabled, error }: Props) => {
    const { data, isLoading } = useGetDailyPjpListQuery({
        page: 1,
        page_size: 20,
        status: 'All',
        date: selectedDate || moment().format('YYYY-MM-DD'),
    });

    const pjpList = data?.message?.data?.pjp_daily_stores || [];
    const pjpItem = pjpList[0];

    useEffect(() => {
        if (disabled) return;
        const itemName = pjpItem?.pjp_daily_store_id || '';
        if (itemName && value !== itemName) {
            onSelect(itemName);
        } else if (pjpList.length === 0 && value !== '') {
            onSelect('');
        }
    }, [pjpItem?.pjp_daily_store_id, pjpList.length, disabled]);

    return (
        <View>
            <Text style={styles.label}>Daily PJP</Text>
            <View style={[
                styles.input,
                error ? { borderColor: 'red' } : null,
                disabled ? { opacity: 0.6 } : null,
            ]}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                ) : pjpItem ? (
                    <Text style={styles.valueText} numberOfLines={1}>
                        {pjpItem.pjp_daily_store_id}
                    </Text>
                ) : (
                    <Text style={styles.errorText} numberOfLines={1}>
                        No PJP for {selectedDate}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 11,
        fontFamily: Fonts.medium,
        color: '#666',
        marginBottom: 4,
    },
    input: {
        height: 42,
        borderWidth: 1,
        borderColor: '#DADADA',
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: 'center',
        backgroundColor: '#F7F7F7',
    },
    valueText: {
        fontSize: 13,
        fontFamily: Fonts.regular,
        color: '#111',
    },
    errorText: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: 'red',
    },
});