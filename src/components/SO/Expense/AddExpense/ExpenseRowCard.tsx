import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Trash2, Upload } from 'lucide-react-native';
import moment from 'moment';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Size } from '../../../../utils/fontSize';
import { LocalExpenseItem } from '../add-expense';

const TYPE_CONFIG: Record<string, { icon: string; bg: string }> = {
    'Daily Allowance': { icon: '💵', bg: '#EAF3DE' },

    'TA - Auto': { icon: '🛺', bg: '#E6F1FB' },
    'TA - Cab': { icon: '🚕', bg: '#E6F1FB' },
    'TA - Bus': { icon: '🚌', bg: '#E6F1FB' },
    'TA - Rail': { icon: '🚆', bg: '#E6F1FB' },
    'TA - Bike (Petrol)': { icon: '🏍️', bg: '#E6F1FB' },
    'TA - Local Travel': { icon: '🚗', bg: '#E6F1FB' },

    'Lodging / Boarding / Hotel': { icon: '🏨', bg: '#FAEEDA' },

    'Food / Meals': { icon: '🍽️', bg: '#FFF4E5' },

    'Mobile Bill': { icon: '📱', bg: '#EEEDFE' },

    Courier: { icon: '📦', bg: '#FAECE7' },
    Xerox: { icon: '📄', bg: '#FAECE7' },
};

type Props = {
    expense: LocalExpenseItem;
    loading: boolean;
    onRemove: () => void;
};

export const ExpenseRowCard = ({ expense, loading, onRemove }: Props) => {
    const config = TYPE_CONFIG[expense.expense_type] ?? { icon: '💰', bg: '#F1EFE8' };

    return (
        <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                <Text style={{ fontSize: 18 }}>{config.icon}</Text>
            </View>

            <View style={styles.body}>
                <Text style={styles.type}>{expense.expense_type}</Text>
                <Text style={styles.meta}>
                    {moment(expense.expense_date).format('MMM D, YYYY')}
                    {expense.ta_mode ? ` · ${expense.ta_mode}` : ''}
                    {expense.ta_rail_class ? ` · ${expense.ta_rail_class}` : ''}
                </Text>
                {expense.custom_claim_description ? (
                    <Text style={styles.desc} numberOfLines={3}>
                        {expense.custom_claim_description}
                    </Text>
                ) : null}
                {expense.attachment ? (
                    <View style={styles.attachPill}>
                        <Upload size={11} color="#888" />
                        <Text style={styles.attachText} numberOfLines={1}>
                            {expense.attachment.name}
                        </Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.right}>
                <Text style={styles.amount}>
                    ₹ {expense.amount.toLocaleString('en-IN')}
                </Text>
                <TouchableOpacity
                    disabled={loading}
                    onPress={onRemove}
                    style={[styles.removeBtn, loading && { opacity: 0.5 }]}>
                    <Trash2 size={12} color="#A32D2D" />
                    <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: '#E2E8F0',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 10,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    body: {
        flex: 1,
        minWidth: 0,
    },
    type: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: Colors.darkButton,
        marginBottom: 2,
    },
    meta: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: Colors.gray,
    },
    desc: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: Colors.gray,
        marginTop: 2,
    },
    attachPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
        alignSelf: 'flex-start',
        backgroundColor: '#F1F5F9',
        borderWidth: 0.5,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    attachText: {
        fontSize: 11,
        fontFamily: Fonts.medium,
        color: Colors.gray,
        maxWidth: 120,
    },
    right: {
        alignItems: 'flex-end',
        gap: 8,
        flexShrink: 0,
    },
    amount: {
        fontSize: 15,
        fontFamily: Fonts.medium,
        color: Colors.sucess,
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FCEBEB',
        borderWidth: 0.5,
        borderColor: '#F7C1C1',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    removeText: {
        fontSize: 11,
        fontFamily: Fonts.medium,
        color: '#A32D2D',
    },
});