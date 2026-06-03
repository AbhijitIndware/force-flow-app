import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Fonts } from '../../../constants';
import { Colors } from '../../../utils/colors';

export const C = {
  white: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: '#6B7280',
  accent: '#534AB7',
  accentDark: '#3C3489',
  accentSoft: 'rgba(83,74,183,0.1)',
  background: '#F5F5F7',
  card: '#FFFFFF',
  border: '#E5E7EB',
  green: '#2E7D32',
  greenSoft: 'rgba(76,175,80,0.12)',
  heroTop: '#3C3489',
  heroBot: '#534AB7',
};

export const SectionTitle: React.FC<{ title: string; sub?: string }> = ({
  title,
  sub,
}) => (
  <View style={styles.sectionTitleRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
  </View>
);

export const TargetMetricBox: React.FC<{
  label: string;
  achieved: string;
  target?: string;
  rate?: number | string;
  accentColor: string;
  onPress?: () => void;
}> = ({ label, achieved, target, rate, accentColor, onPress }) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    style={targetStyles.card}>
    <View style={[targetStyles.stripe, { backgroundColor: accentColor }]} />
    <View style={targetStyles.body}>
      <Text style={targetStyles.label}>{label}</Text>
      <View style={targetStyles.numRow}>
        <Text
          style={[targetStyles.achieved, { color: accentColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}>
          {achieved}
        </Text>
        {target ? (
          <>
            <Text style={targetStyles.separator}>/</Text>
            <Text
              style={targetStyles.target}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}>
              {target}
            </Text>
          </>
        ) : null}
      </View>
      {rate !== undefined && (
        <View style={targetStyles.track}>
          <View
            style={[
              targetStyles.fill,
              {
                width: `${Math.min(Number(rate), 100)}%` as `${number}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
      )}
      {rate !== undefined && (
        <Text style={[targetStyles.rate, { color: accentColor }]}>
          {rate}% achieved
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  sectionSub: { fontSize: 12, color: C.textMuted },
});

const targetStyles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    overflow: 'hidden',
  },
  stripe: {
    width: 3,
  },
  body: {
    flex: 1,
    padding: 11,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: C.textMuted,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 6,
  },
  achieved: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    fontSize: 11,
    color: C.textMuted,
  },
  target: {
    fontSize: 11,
    color: C.textMuted,
  },
  track: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 5,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  rate: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
});
