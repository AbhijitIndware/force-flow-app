import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Clock} from 'lucide-react-native';
import {Colors} from '../../../utils/colors';
import {Fonts} from '../../../constants';
import {useGetPendingLateApprovalsQuery} from '../../../features/base/base-api';

interface Props {
  navigation: any;
}

const ACCENT = Colors.orange;

const LateCheckinApprovalLink: React.FC<Props> = ({navigation}) => {
  // Same query as the approval list, so the count shares its cache and
  // refreshes after an approve/reject.
  const {data} = useGetPendingLateApprovalsQuery();
  const pendingCount = data?.message?.data?.length ?? 0;
  const hasPending = pendingCount > 0;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('LateCheckinApprovalScreen')}
        style={[styles.card, hasPending && styles.cardPending]}>
        <View style={styles.iconBox}>
          <Clock strokeWidth={2} color={Colors.white} size={20} />
          {hasPending && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingCount > 99 ? '99+' : pendingCount}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.textBox}>
          <Text style={styles.title}>Late Check-In Approval</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {hasPending
              ? `${pendingCount} request${
                  pendingCount > 1 ? 's' : ''
                } waiting for approval`
              : "Review your team's late check-ins"}
          </Text>
        </View>
        <View style={styles.arrowBox}>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={Colors.darkButton}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LateCheckinApprovalLink;

const styles = StyleSheet.create({
  // Matches StatsOverview's 20px side padding so the edges line up.
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
  },
  cardPending: {
    backgroundColor: '#FFF4E8',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    lineHeight: 12,
  },
  textBox: {
    flex: 1,
  },
  title: {
    color: Colors.darkButton,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    lineHeight: 20,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 11,
    fontFamily: Fonts.regular,
    lineHeight: 15,
  },
  arrowBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
