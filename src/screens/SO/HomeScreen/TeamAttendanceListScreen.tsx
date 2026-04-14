import {
    StyleSheet,
    SafeAreaView,
    FlatList,
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import React from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import { flexCol } from '../../../utils/styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useGetAsmAttendanceTabQuery } from '../../../features/base/base-api';
import PerformanceCard from '../../../components/SO/HomeScreen/PerformanceCard';

type NavigationProp = NativeStackNavigationProp<
    SoAppStackParamList,
    'TeamAttendanceListScreen'
>;

type Props = {
    navigation: NavigationProp;
    route: any;
};

const TeamAttendanceListScreen = ({ navigation, route }: Props) => {
    const { apiParams, today } = route?.params;

    const { data, isFetching, isError, refetch } =
        useGetAsmAttendanceTabQuery(apiParams);
    console.log("🚀 ~ TeamAttendanceListScreen ~ data:", data)

    const records = data?.message?.records ?? [];
    const summary = data?.message?.summary;

    // ── Loading ─────────────────────────────────────────
    if (isFetching) {
        return (
            <SafeAreaView style={[flexCol, styles.center]}>
                <ActivityIndicator size="large" color="#FFB302" />
                <Text style={styles.infoText}>Loading Attendance...</Text>
            </SafeAreaView>
        );
    }

    // ── Error ───────────────────────────────────────────
    if (isError) {
        return (
            <SafeAreaView style={[flexCol, styles.center]}>
                <Text style={styles.errorText}>Failed to load data</Text>
                <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[flexCol, styles.container]}>
            <PageHeader
                title={`Team Attendance`}
                navigation={() => navigation.goBack()}
            />

            {/* 🔹 Summary Card */}
            {summary && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>
                        Total: {summary.total}
                    </Text>
                    <Text style={[styles.summaryText, { color: '#0AB72A' }]}>
                        Present: {summary.present}
                    </Text>
                    <Text style={[styles.summaryText, { color: '#D31010' }]}>
                        Absent: {summary.absent}
                    </Text>
                    <Text style={styles.summaryRate}>
                        {summary.attendance_rate}% Attendance
                    </Text>
                </View>
            )}

            {/* 🔹 List */}
            <FlatList
                data={records}
                keyExtractor={(item: any) => item.employee_id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No records found</Text>
                }
                renderItem={({ item: r }) => (
                    <PerformanceCard
                        onPress={() =>
                            navigation.navigate('TeamDetailScreen', {
                                employee_id: r.employee_id,
                                date: today,
                            })
                        }
                        name={r.employee_name}
                        role={r.designation}
                        status={r.attendance_status}
                        checkIn={r.check_in_time}
                        pjp={'-'}          // Not available here
                        pjpRate={0}
                        value={'-'}        // Not available here
                        valueRate={0}
                    />
                )}
            />
        </SafeAreaView>
    );
};

export default TeamAttendanceListScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F6' },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoText: { marginTop: 10, color: '#828282' },
    errorText: { fontSize: 14, fontWeight: '600' },

    retryBtn: {
        marginTop: 10,
        backgroundColor: '#FFB302',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: { color: '#fff', fontWeight: '600' },

    summaryCard: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        elevation: 2,
    },

    summaryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
    },

    summaryRate: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFB302',
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#828282',
    },
});