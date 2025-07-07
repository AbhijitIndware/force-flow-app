import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
    label: string;
    value: string;
    onChange: (dateStr: string) => void;
    error?: string | false;
}

const ReusableDatePicker: React.FC<Props> = ({ label, value, onChange, error }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
            onChange(formatted);
        }
    };

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 4, fontSize: 14 }}>{label}</Text>
            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={{
                    borderColor: error ? 'red' : '#ccc',
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 6,
                }}
            >
                <Text>{value || 'Select date'}</Text>
            </TouchableOpacity>
            {error && <Text style={{ color: 'red', marginTop: 4 }}>{error}</Text>}
            {showPicker && (
                <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
};

export default ReusableDatePicker;
