/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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
    ChevronRight,
} from 'lucide-react-native';
import { useAppSelector } from '../../../store/hook';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { DistributorInfo } from '../../../types/distributorType';

type DistributorAppStackParamList = {
    ProfileScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<
    DistributorAppStackParamList,
    'ProfileScreen'
>;

type Props = { navigation: NavigationProp };

const C = {
    white: '#FFFFFF',
    text: '#1A1A2E',
    textMuted: '#6B7280',
    accent: '#534AB7',
    accentSoft: 'rgba(83,74,183,0.1)',
    background: '#F5F5F7',
    card: '#FFFFFF',
    border: '#E5E7EB',
    orange: Colors.orange,
};

// ─── Info Row ────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string | null;
}> = ({ icon, label, value }) => (
    <View style={rowStyles.row}>
        <View style={rowStyles.iconWrap}>{icon}</View>
        <View style={rowStyles.textWrap}>
            <Text style={rowStyles.label}>{label}</Text>
            <Text style={rowStyles.value}>{value || '—'}</Text>
        </View>
    </View>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => (
    <View style={cardStyles.container}>
        <Text style={cardStyles.title}>{title}</Text>
        <View style={cardStyles.body}>{children}</View>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const DistributorProfileScreen = ({ navigation }: Props) => {
    const distributor: DistributorInfo | null = useAppSelector(
        state => (state?.persistedReducer as any)?.authSlice?.distributor ?? null,
    );

    const initials = distributor?.distributor_name
        ? distributor.distributor_name
            .split(' ')
            .slice(0, 2)
            .map(w => w[0])
            .join('')
            .toUpperCase()
        : 'D';

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ── Avatar Banner ── */}
                <View style={styles.banner}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    </View>
                    <Text style={styles.bannerName}>
                        {distributor?.distributor_name ?? 'Distributor'}
                    </Text>
                    {distributor?.designation ? (
                        <Text style={styles.bannerDesig}>{distributor.designation}</Text>
                    ) : null}

                    {/* Quick badges */}
                    <View style={styles.badgeRow}>
                        {distributor?.distributor_group ? (
                            <View style={styles.infoBadge}>
                                <Tag size={11} color={C.accent} />
                                <Text style={styles.infoBadgeText}>
                                    {distributor.distributor_group}
                                </Text>
                            </View>
                        ) : null}
                        {distributor?.zone ? (
                            <View style={styles.infoBadge}>
                                <Globe size={11} color={C.accent} />
                                <Text style={styles.infoBadgeText}>{distributor.zone}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                <View style={styles.content}>
                    {/* ── Basic Info ── */}
                    <SectionCard title="Basic Information">
                        <InfoRow
                            icon={<Hash size={16} color={C.accent} />}
                            label="Distributor Code"
                            value={distributor?.distributor_code}
                        />
                        <View style={rowStyles.divider} />
                        <InfoRow
                            icon={<Briefcase size={16} color={C.accent} />}
                            label="Designation"
                            value={distributor?.designation}
                        />
                        <View style={rowStyles.divider} />
                        <InfoRow
                            icon={<User size={16} color={C.accent} />}
                            label="Reports To"
                            value={distributor?.reports_to}
                        />
                    </SectionCard>

                    {/* ── Contact Info ── */}
                    <SectionCard title="Contact Information">
                        <InfoRow
                            icon={<Phone size={16} color={C.accent} />}
                            label="Mobile"
                            value={distributor?.mobile}
                        />
                        <View style={rowStyles.divider} />
                        <InfoRow
                            icon={<Mail size={16} color={C.accent} />}
                            label="Email"
                            value={distributor?.email}
                        />
                    </SectionCard>

                    {/* ── Location ── */}
                    <SectionCard title="Location">
                        <InfoRow
                            icon={<MapPin size={16} color={C.accent} />}
                            label="City"
                            value={distributor?.city}
                        />
                        <View style={rowStyles.divider} />
                        <InfoRow
                            icon={<Globe size={16} color={C.accent} />}
                            label="State"
                            value={distributor?.state}
                        />
                        <View style={rowStyles.divider} />
                        <InfoRow
                            icon={<Tag size={16} color={C.accent} />}
                            label="Zone"
                            value={distributor?.zone}
                        />
                    </SectionCard>

                    {/* ── Distribution Info ── */}
                    <SectionCard title="Distribution Details">
                        <InfoRow
                            icon={<Briefcase size={16} color={C.accent} />}
                            label="Distributor Group"
                            value={distributor?.distributor_group}
                        />
                    </SectionCard>

                    {/* Bottom spacer */}
                    <View style={{ height: 24 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DistributorProfileScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: C.white,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: C.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: Size.md,
        fontFamily: Fonts.semiBold,
        color: C.text,
    },

    // Banner
    banner: {
        backgroundColor: C.white,
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    avatarRing: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: C.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    avatar: {
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: C.orange,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 28,
        fontFamily: Fonts.semiBold,
        color: C.white,
        letterSpacing: 1,
    },
    bannerName: {
        fontSize: Size.lg,
        fontFamily: Fonts.semiBold,
        color: C.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    bannerDesig: {
        fontSize: Size.sm,
        fontFamily: Fonts.regular,
        color: C.textMuted,
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    infoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: C.accentSoft,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    infoBadgeText: {
        fontSize: 11,
        fontFamily: Fonts.medium,
        color: C.accent,
    },

    content: {
        padding: 16,
        gap: 12,
    },
});

const cardStyles = StyleSheet.create({
    container: {
        backgroundColor: C.white,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: C.border,
        overflow: 'hidden',
        marginBottom: 4,
    },
    title: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: C.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    body: {
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
});

const rowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(83,74,183,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrap: { flex: 1 },
    label: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: C.textMuted,
        marginBottom: 2,
    },
    value: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: C.text,
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginLeft: 44,
    },
});