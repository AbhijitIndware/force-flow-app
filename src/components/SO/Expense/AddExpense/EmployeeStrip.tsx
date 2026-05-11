import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';

export const EmployeeStrip = ({ employee }: { employee: any }) => (
    <View style={styles.strip}>
        <View style={{ flex: 1 }}>
            <Text style={styles.label}>EMPLOYEE</Text>
            <Text style={styles.value} numberOfLines={1}>
                {employee?.full_name || 'N/A'}
            </Text>
        </View>
        <View style={styles.divider} />
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>EMP ID</Text>
            <Text style={styles.value}>{employee?.company_emp_id || 'N/A'}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    strip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.Orangelight + '08',
        borderWidth: 1,
        borderColor: Colors.Orangelight + '20',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
        gap: 12,
    },
    label: {
        fontSize: 9,
        color: Colors.Orangelight,
        fontFamily: Fonts.medium,
        letterSpacing: 0.8,
    },
    value: {
        fontSize: 13,
        color: '#333',
        fontFamily: Fonts.medium,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 26,
        backgroundColor: Colors.Orangelight + '20',
    },
});