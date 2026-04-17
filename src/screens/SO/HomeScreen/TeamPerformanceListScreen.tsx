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
import {
    useGetAsmAttendanceTabQuery,
    useGetAsmPjpTargetVsAchievementQuery,
    useGetAsmTargetVsAchievementQuery,
} from '../../../features/base/base-api';
import PerformanceCard from '../../../components/SO/HomeScreen/PerformanceCard';

type NavigationProp = NativeStackNavigationProp<
    SoAppStackParamList,
    'TeamPerformanceListScreen'
>;

type Props = {
    navigation: NavigationProp;
    route: any;
};

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
    bg: '#F0F2F6',
    surface: '#FFFFFF',
    amber: '#FFB302',
    amberSoft: '#FFF8E1',
    green: '#0AB72A',
    greenSoft: '#E7F8EA',
    purple: '#367CFF',
    purpleSoft: '#E3ECFF',
    red: '#D31010',
    redSoft: '#FBE8E8',
    blue: '#2563EB',
    blueSoft: '#EFF6FF',
    teal: '#0F9D8F',
    tealSoft: '#E6F7F6',
    text: '#1A1A1A',
    textSub: '#4F4F4F',
    textMuted: '#828282',
    border: '#E0E0E0',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtK = (val: number): string => {
    if (!val) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
};

const getInitials = (name: string): string =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const getRoleColor = (role: string) =>
    role === 'SO' ? { bg: C.purpleSoft, text: C.purple } : { bg: C.amberSoft, text: C.amber };

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, role }: { name: string; role: string }) => {
    const rc = getRoleColor(role);
    return (
        <View style={[pStyles.avatar, { backgroundColor: rc.bg, borderColor: rc.text + '40' }]}>
            <Text style={[pStyles.avatarText, { color: rc.text }]}>{getInitials(name)}</Text>
        </View>
    );
};

// ─── PJP Card ─────────────────────────────────────────────────────────────────
const PjpCard = ({ item, onPress }: { item: any; onPress: () => void }) => {
    const rc = getRoleColor(item.role);
    const rate = item.achievement_rate ?? 0;
    const rateColor = rate >= 80 ? C.green : rate >= 50 ? C.amber : C.red;

    return (
        <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.75}>
            {/* Left accent */}
            <View style={[cardStyles.accent, { backgroundColor: C.purple }]} />

            <View style={cardStyles.body}>
                {/* Top row: avatar + name + role badge */}
                <View style={cardStyles.topRow}>
                    <Avatar name={item.employee_name} role={item.role} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={cardStyles.nameRow}>
                            <Text style={cardStyles.name} numberOfLines={1}>{item.employee_name}</Text>
                            <View style={[cardStyles.roleBadge, { backgroundColor: rc.bg }]}>
                                <Text style={[cardStyles.roleText, { color: rc.text }]}>{item.role}</Text>
                            </View>
                        </View>
                        <Text style={cardStyles.desig}>{item.designation}</Text>
                    </View>
                </View>

                {/* Stats row */}
                <View style={pjpStyles.statsRow}>
                    <View style={pjpStyles.statBlock}>
                        <Text style={pjpStyles.statLabel}>Planned</Text>
                        <Text style={[pjpStyles.statVal, { color: C.textSub }]}>{item.total_planned}</Text>
                    </View>
                    <View style={pjpStyles.divider} />
                    <View style={pjpStyles.statBlock}>
                        <Text style={pjpStyles.statLabel}>Visited</Text>
                        <Text style={[pjpStyles.statVal, { color: C.purple }]}>{item.total_visited}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ─── Value Card ───────────────────────────────────────────────────────────────
const ValueCard = ({ item, onPress }: { item: any; onPress: () => void }) => {
    const rc = getRoleColor(item.role);
    const pct = item.achievement_pct ?? 0;
    const pctColor = pct >= 80 ? C.green : pct >= 50 ? C.amber : C.red;
    const pctBg = pct >= 80 ? C.greenSoft : pct >= 50 ? C.amberSoft : C.redSoft;

    return (
        <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.75}>
            <View style={[cardStyles.accent, { backgroundColor: C.teal }]} />
            <View style={cardStyles.body}>
                <View style={cardStyles.topRow}>
                    <Avatar name={item.employee_name} role={item.role} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={cardStyles.nameRow}>
                            <Text style={cardStyles.name} numberOfLines={1}>{item.employee_name}</Text>
                            <View style={[cardStyles.roleBadge, { backgroundColor: rc.bg }]}>
                                <Text style={[cardStyles.roleText, { color: rc.text }]}>{item.role}</Text>
                            </View>
                        </View>
                        <Text style={cardStyles.desig}>{item.designation}</Text>
                    </View>
                </View>

                <View style={valueStyles.blocksRow}>
                    <View style={[valueStyles.block, { backgroundColor: C.tealSoft }]}>
                        <Text style={valueStyles.blockLabel}>Achieved</Text>
                        <Text style={[valueStyles.blockVal, { color: C.teal }]}>
                            {fmtK(item.so_total)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ─── Summary Cards ────────────────────────────────────────────────────────────
const PjpSummary = ({ s }: { s: any }) => (
    <View style={summaryStyles.row}>
        <View style={summaryStyles.chip}>
            <Text style={summaryStyles.chipLabel}>Planned</Text>
            <Text style={[summaryStyles.chipVal, { color: C.textSub }]}>{s.total_planned ?? 0}</Text>
        </View>
        <View style={summaryStyles.chip}>
            <Text style={summaryStyles.chipLabel}>Visited</Text>
            <Text style={[summaryStyles.chipVal, { color: C.purple }]}>{s.total_visited ?? 0}</Text>
        </View>
        <View style={[summaryStyles.chip, { backgroundColor: C.amberSoft, borderColor: C.amber + '30' }]}>
            <Text style={summaryStyles.chipLabel}>Achievement</Text>
            <Text style={[summaryStyles.chipVal, { color: C.amber }]}>{s.achievement_rate ?? 0}%</Text>
        </View>
    </View>
);

const ValueSummary = ({ s }: { s: any }) => (
    <View style={summaryStyles.row}>
        <View style={summaryStyles.chip}>
            <Text style={summaryStyles.chipLabel}>Total Sales</Text>
            <Text style={[summaryStyles.chipVal, { color: C.teal }]}>{fmtK(s.total_so)}</Text>
        </View>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const TeamPerformanceListScreen = ({ navigation, route }: Props) => {
    const { apiParams, today, mode = 'attendance' } = route?.params || {};

    const attendanceQuery = useGetAsmAttendanceTabQuery(apiParams, { skip: mode !== 'attendance' });
    const pjpQuery = useGetAsmPjpTargetVsAchievementQuery(apiParams, { skip: mode !== 'pjp' });
    const valueQuery = useGetAsmTargetVsAchievementQuery(apiParams, { skip: mode !== 'value' });

    const activeQuery = mode === 'attendance' ? attendanceQuery : mode === 'pjp' ? pjpQuery : valueQuery;
    const { data, isFetching, isError, refetch } = activeQuery;

    const records = data?.message?.records ?? [];
    const summary = (data?.message as any)?.summary;

    const getTitle = () => {
        switch (mode) {
            case 'pjp': return 'Team PJP Compliance';
            case 'value': return 'Team Sales Achievement';
            default: return 'Team Attendance';
        }
    };

    if (isFetching) {
        return (
            <SafeAreaView style={[flexCol, styles.center]}>
                <ActivityIndicator size="large" color={C.amber} />
                <Text style={styles.infoText}>Loading {mode} records...</Text>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={[flexCol, styles.center]}>
                <Text style={styles.errorText}>Failed to load records</Text>
                <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const navigateToDetail = (employee_id: string) =>
        navigation.navigate('TeamDetailScreen', { employee_id, date: today });

    return (
        <SafeAreaView style={[flexCol, styles.container]}>
            <PageHeader title={getTitle()} navigation={() => navigation.goBack()} />

            <FlatList
                data={records}
                keyExtractor={(item: any) => item.employee_id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}

                // ── Summary as list header ──────────────────────────────────
                ListHeaderComponent={
                    summary ? (
                        <View style={{ marginBottom: 16 }}>
                            {mode === 'pjp' && <PjpSummary s={summary} />}
                            {mode === 'value' && <ValueSummary s={summary} />}
                        </View>
                    ) : null
                }

                ListEmptyComponent={
                    <Text style={styles.emptyText}>No records found for {mode}</Text>
                }

                renderItem={({ item: r }) => {
                    if (mode === 'pjp') {
                        return <PjpCard item={r} onPress={() => navigateToDetail(r.employee_id)} />;
                    }
                    if (mode === 'value') {
                        return <ValueCard item={r} onPress={() => navigateToDetail(r.employee_id)} />;
                    }
                    // Attendance — keep existing PerformanceCard
                    return (
                        <PerformanceCard
                            onPress={() => navigateToDetail(r.employee_id)}
                            name={r.employee_name}
                            role={r.designation}
                            status={r.attendance_status || 'Absent'}
                            checkIn={r.check_in_time}
                            pjp="-"
                            pjpRate={0}
                            value="-"
                            valueRate={0}
                        />
                    );
                }}
            />
        </SafeAreaView>
    );
};

export default TeamPerformanceListScreen;

// ─── Shared card shell styles ─────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: C.surface,
        borderRadius: 14,       // was 16
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
    },
    accent: {
        width: 4,
    },
    body: {
        flex: 1,
        padding: 10,            // was 14
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,        // was 12
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontSize: 13,           // was 14
        fontWeight: '700',
        color: C.text,
        flex: 1,
    },
    desig: {
        fontSize: 11,
        color: C.textMuted,
        marginTop: 2,
    },
    roleBadge: {
        paddingHorizontal: 7,   // was 8
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '700',
    },
});

// ─── Avatar styles ────────────────────────────────────────────────────────────
const pStyles = StyleSheet.create({
    avatar: {
        width: 34,          // was 40
        height: 34,         // was 40
        borderRadius: 17,   // was 20
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 11,       // was 13
        fontWeight: '800',
    },
    track: {
        flex: 1,
        height: 6,
        backgroundColor: '#F0F2F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    },
});

// ─── PJP card styles ──────────────────────────────────────────────────────────
const pjpStyles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FF',
        borderRadius: 8,        // was 10
        paddingVertical: 7,     // was 10
        marginBottom: 0,        // was 12
        borderWidth: 1,
        borderColor: C.purple + '18',
    },
    statBlock: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 8,            // was 9
        color: C.textMuted,
        fontWeight: '600',
        marginBottom: 3,        // was 4
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    statVal: {
        fontSize: 14,           // was 16
        fontWeight: '800',
    },
    divider: {
        width: 1,
        backgroundColor: C.border,
        marginVertical: 4,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    rateText: {
        fontSize: 13,
        fontWeight: '800',
        minWidth: 44,
        textAlign: 'right',
    },
    rateLabel: {
        fontSize: 10,
        color: C.textMuted,
        fontWeight: '500',
    },
});

// ─── Value card styles ────────────────────────────────────────────────────────
const valueStyles = StyleSheet.create({
    blocksRow: {
        flexDirection: 'row',
        gap: 6,                 // was 8
        marginBottom: 0,        // was 12
    },
    block: {
        flex: 1,
        borderRadius: 8,        // was 10
        paddingVertical: 7,     // was 10
        paddingHorizontal: 6,   // was 8
        alignItems: 'flex-start',
    },
    blockLabel: {
        fontSize: 8,            // was 9
        color: C.textMuted,
        fontWeight: '600',
        marginBottom: 3,        // was 4
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    blockVal: {
        fontSize: 12,           // was 14
        fontWeight: '800',
    },
});

// ─── Summary bar styles ───────────────────────────────────────────────────────
const summaryStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        flex: 1,
        backgroundColor: C.surface,
        borderRadius: 10,       // was 12
        paddingVertical: 8,     // was 10
        paddingHorizontal: 8,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: C.border,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    chipLabel: {
        fontSize: 9,
        color: C.textMuted,
        fontWeight: '600',
        marginBottom: 3,        // was 4
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    chipVal: {
        fontSize: 14,           // was 15
        fontWeight: '800',
    },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    infoText: { marginTop: 10, color: C.textMuted },
    errorText: { fontSize: 14, fontWeight: '600', color: C.text },
    retryBtn: {
        marginTop: 10,
        backgroundColor: C.amber,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: { color: '#fff', fontWeight: '600' },
    emptyText: { textAlign: 'center', marginTop: 40, color: C.textMuted },
});