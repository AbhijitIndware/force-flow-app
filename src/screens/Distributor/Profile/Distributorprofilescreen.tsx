/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    User,
    MapPin,
    Phone,
    Mail,
    Tag,
    Globe,
    Briefcase,
    Hash,
    LogOut,
    ChevronRight,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hook';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { DistributorInfo } from '../../../types/distributorType';
import { APP_VERSION } from '../../../utils/utils';
import Toast from 'react-native-toast-message';
import { logout } from '../../../features/auth/auth';
import { baseApi } from '../../../features/base/base-api';
import { dropdownApi } from '../../../features/dropdown/dropdown-api';
import { persistor } from '../../../store/store';

// Modern Color Palette
const THEME = {
    primary: '#534AB7',
    primaryLight: '#EEEDF9',
    background: '#F8F9FD',
    white: '#FFFFFF',
    textDark: '#1F2937',
    textMain: '#4B5563',
    textMuted: '#9CA3AF',
    divider: '#F3F4F6',
    danger: '#EF4444',
};

// ─── Refined Components ───────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => (
    <View style={rowStyles.row}>
        <View style={rowStyles.iconContainer}>
            <Icon size={18} color={THEME.primary} />
        </View>
        <View style={rowStyles.textContainer}>
            <Text style={rowStyles.label}>{label}</Text>
            <Text style={rowStyles.value}>{value || 'Not provided'}</Text>
        </View>
    </View>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={sectionStyles.card}>
        <Text style={sectionStyles.title}>{title}</Text>
        {children}
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const DistributorProfileScreen = ({ navigation }: any) => {
    const distributor: DistributorInfo | null = useAppSelector(
        state => (state?.persistedReducer as any)?.authSlice?.distributor ?? null,
    );

    const dispatch = useAppDispatch();

    const initials = distributor?.distributor_name
        ? distributor.distributor_name.split(' ').slice(0, 2).map(w => w[0]).join('')
        : 'D';

    const handleLogout = () => {
        Toast.show({ type: 'success', text1: 'Logged out successfully' });
        dispatch(logout());
        dispatch(baseApi.util.resetApiState());
        dispatch(dropdownApi.util.resetApiState());
        persistor.purge();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBackground} />

            {/* Custom Header */}
            <View style={styles.headerNav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={24} color={THEME.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
                    <LogOut size={20} color={THEME.white} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{distributor?.distributor_name || 'Distributor'}</Text>
                    <Text style={styles.userCode}>{distributor?.distributor_code}</Text>

                    <View style={styles.badgeRow}>
                        <View style={styles.chip}>
                            <Tag size={12} color={THEME.primary} />
                            <Text style={styles.chipText}>{distributor?.distributor_group || 'General'}</Text>
                        </View>
                    </View>
                </View>

                {/* Info Sections */}
                <View style={styles.infoWrapper}>
                    <Section title="Contact Details">
                        <InfoRow icon={Phone} label="Mobile" value={distributor?.mobile} />
                        <View style={rowStyles.line} />
                        <InfoRow icon={Mail} label="Email" value={distributor?.email} />
                    </Section>

                    <Section title="Assignment">
                        <InfoRow icon={Briefcase} label="Designation" value={distributor?.designation} />
                        <View style={rowStyles.line} />
                        <InfoRow icon={User} label="Reports To" value={distributor?.reports_to} />
                    </Section>

                    <Section title="Location">
                        <InfoRow icon={MapPin} label="City / State" value={`${distributor?.city || '-'}, ${distributor?.state || '-'}`} />
                        <View style={rowStyles.line} />
                        <InfoRow icon={Globe} label="Zone" value={distributor?.zone} />
                    </Section>
                </View>
                {/* ── High-Visibility Logout Card ── */}
                <TouchableOpacity
                    style={styles.logoutCard}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <View style={styles.logoutIconContainer}>
                        <LogOut size={20} color={THEME.danger} />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                    <ChevronRight size={18} color={THEME.textMuted} />
                </TouchableOpacity>
                <View style={styles.footer}>
                    <Text style={styles.versionText}>Version {APP_VERSION}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DistributorProfileScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background },
    topBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: Colors.orange,
    },
    headerNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: Fonts.semiBold,
        color: THEME.white,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },

    // Profile Header Card
    profileCard: {
        backgroundColor: THEME.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        // Shadow
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    avatarContainer: {
        padding: 4,
        backgroundColor: THEME.white,
        borderRadius: 100,
        marginTop: -10,
        marginBottom: 12,
    },
    avatar: {
        width: 85,
        height: 85,
        borderRadius: 100,
        backgroundColor: Colors.orange,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontSize: 32, color: THEME.white, fontFamily: Fonts.bold },
    userName: { fontSize: 20, fontFamily: Fonts.bold, color: THEME.textDark, marginBottom: 4 },
    userCode: { fontSize: 14, fontFamily: Fonts.medium, color: THEME.textMuted, marginBottom: 16 },

    badgeRow: { flexDirection: 'row', gap: 8 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        gap: 6,
    },
    chipText: { fontSize: 12, color: THEME.primary, fontFamily: Fonts.semiBold },

    infoWrapper: { gap: 16 }, logoutCard: {
        marginTop: 24,
        backgroundColor: THEME.white,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        // Subtle red border to hint at action without being "too much"
        borderWidth: 1,
        borderColor: '#FEE2E2', // light red
        elevation: 2,
        shadowColor: THEME.danger,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    logoutIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#FEF2F2', // very light red
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    logoutText: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: THEME.danger, // Bright red text
    },
    footer: { marginTop: 30, alignItems: 'center' },
    versionText: { fontSize: 15, color: THEME.textMuted, fontFamily: Fonts.regular },
});

const sectionStyles = StyleSheet.create({
    card: {
        backgroundColor: THEME.white,
        borderRadius: 20,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    title: {
        fontSize: 13,
        fontFamily: Fonts.bold,
        color: THEME.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
});

const rowStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: THEME.primaryLight,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    textContainer: { flex: 1 },
    label: { fontSize: 12, color: THEME.textMuted, fontFamily: Fonts.regular, marginBottom: 2 },
    value: { fontSize: 15, color: THEME.textDark, fontFamily: Fonts.semiBold },
    line: { height: 1, backgroundColor: THEME.divider, marginLeft: 54 },
});