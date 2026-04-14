import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Target, CheckCircle2 } from 'lucide-react-native';

const C = {
  bg: '#F8FAFC',
  background: '#F1F5F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  accent: '#FFB302',
  accentSoft: '#FFF7E6',
  green: '#10B981',
  greenSoft: '#ECFDF5',
  text: '#1E293B',
  textSub: '#475569',
  textMuted: '#94A8B2',
  border: '#E2E8F0',
  white: '#FFFFFF',
} as const;

export interface PerformanceCardProps {
  name: string;
  role: string | number;
  status: string;
  checkIn: string | null;
  pjp: string;
  pjpRate: number | string;
  value: string;
  valueRate: number | string;
  onPress: () => void;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  name,
  role,
  status,
  checkIn,
  pjp,
  pjpRate,
  value,
  valueRate,
  onPress,
}) => (
  <TouchableOpacity style={styles.perfCard} onPress={onPress}>
    <View style={styles.perfTop}>
      <View style={styles.perfAvatar}>
        <Text style={styles.perfAvatarText}>{(name || '?').substring(0, 1)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.perfName} numberOfLines={1}>{name}</Text>
        <Text style={styles.perfRole} numberOfLines={1}>{role}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        { backgroundColor: status === 'Present' ? C.greenSoft : '#FEE2E2' }
      ]}>
        <Text style={[
          styles.statusBadgeText,
          { color: status === 'Present' ? C.green : '#B91C1C' }
        ]}>{status}</Text>
      </View>
    </View>

    {/* <View style={styles.perfMetrics}>
      <View style={styles.perfMetricCol}>
        <View style={styles.perfMetricTitleRow}>
          <Clock size={10} color={C.textMuted} />
          <Text style={styles.perfMetricLabel}>Check-in</Text>
        </View>
        <Text style={styles.perfMetricVal}>{checkIn || '--:--'}</Text>
      </View>
      <View style={styles.perfMetricDivider} />
      <View style={styles.perfMetricCol}>
        <View style={styles.perfMetricTitleRow}>
          <Target size={10} color={C.textMuted} />
          <Text style={styles.perfMetricLabel}>PJP</Text>
        </View>
        <Text style={styles.perfMetricVal}>{pjp} ({pjpRate}%)</Text>
      </View>
      <View style={styles.perfMetricDivider} />
      <View style={styles.perfMetricCol}>
        <View style={styles.perfMetricTitleRow}>
          <CheckCircle2 size={10} color={C.textMuted} />
          <Text style={styles.perfMetricLabel}>Sales</Text>
        </View>
        <Text style={styles.perfMetricVal}>{value} ({valueRate}%)</Text>
      </View>
    </View> */}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  perfCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 0.5, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  perfTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  perfAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  perfAvatarText: { color: C.white, fontSize: 16, fontWeight: 'bold' },
  perfName: { fontSize: 15, fontWeight: '600', color: C.text },
  perfRole: { fontSize: 12, color: C.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  perfMetrics: {
    flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5,
    borderTopColor: C.border, paddingTop: 12,
  },
  perfMetricCol: { flex: 1, alignItems: 'center' },
  perfMetricDivider: { width: 1, height: 20, backgroundColor: C.border },
  perfMetricTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  perfMetricLabel: { fontSize: 10, color: C.textMuted },
  perfMetricVal: { fontSize: 12, fontWeight: '600', color: C.text },
});

export default PerformanceCard;
