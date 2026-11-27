import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  BanknoteArrowDown,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react-native';
import { Divider } from '@rneui/themed';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { useAppSelector } from '../../../store/hook';
import { useGetPendingLeaveApprovalsQuery } from '../../../features/base/base-api';
import { canUseLeave, managerStepRows } from '../../../types/leaveType';

interface ClaimsSectionProps {
  navigation: any;
}

type ClaimLink = {
  title: string;
  icon: LucideIcon;
  screen: string;
  params?: Record<string, unknown>;
  /** Manager items: orange icon. */
  approval?: boolean;
  /** Items waiting, shown as a badge. */
  count?: number;
};

const APPROVAL_COLOR = '#F59E0B';

/**
 * "Claims & Leave": the employee's own items (plain names), then for
 * managers the approvals (names ending in "Approval", orange icon). Each
 * screen's top title is the same as its link.
 */
export const ClaimsSection: React.FC<ClaimsSectionProps> = ({ navigation }) => {
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  const empId = useAppSelector(s => s.persistedReducer.authSlice.empId);
  const isSoOrIsr =
    employee?.designation === 'Sales Officer' ||
    employee?.designation === 'ISR';
  // SO / ISR never approve.
  const isManager = !!employee && !isSoOrIsr;

  const { data: leaveApprovals } = useGetPendingLeaveApprovalsQuery(undefined, {
    skip: !isManager,
  });
  const pendingLeave = managerStepRows(leaveApprovals?.message?.data, empId)
    .length;

  const links: ClaimLink[] = [
    {
      title: 'Expense Claim',
      icon: BanknoteArrowDown,
      screen: 'ExpenseScreen',
    },
    // Leave is only for RSM, ASM, ASE, Sales Officer and ISR.
    ...(canUseLeave(employee?.designation)
      ? [{ title: 'Leave', icon: CalendarDays, screen: 'LeaveScreen' }]
      : []),
    ...(isManager
      ? [
          {
            // Both expense and visibility claims to approve.
            title: 'Claim Approval',
            icon: CheckCircle2,
            screen: 'ExpenseApprovalScreen',
            params: { index: 0 },
            approval: true,
          },
          {
            title: 'Leave Approval',
            icon: CalendarCheck,
            screen: 'LeaveApprovalScreen',
            approval: true,
            count: pendingLeave,
          },
        ]
      : []),
  ];

  return (
    <View style={[styles.LinkSection, { paddingVertical: 15, marginTop: 10 }]}>
      <Text
        style={[
          styles.SectionHeading,
          { marginBottom: 10, paddingHorizontal: 20 },
        ]}>
        Claims & Leave
      </Text>
      {links.map(({ title, icon: Icon, screen, params, approval, count }, i) => (
        <React.Fragment key={title}>
          <TouchableOpacity
            onPress={() => navigation.navigate(screen, params)}
            style={styles.IconlinkBox}>
            <View
              style={[
                styles.iconbox,
                {
                  backgroundColor: approval
                    ? APPROVAL_COLOR
                    : Colors.darkButton,
                },
              ]}>
              <Icon strokeWidth={2} color={Colors.white} size={20} />
            </View>
            <Text style={styles.linkTitle}>{title}</Text>
            {!!count && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
            <View style={[styles.arrobox, { marginLeft: count ? 0 : 'auto' }]}>
              <Ionicons
                name="chevron-forward-outline"
                size={12}
                color={Colors.darkButton}
              />
            </View>
          </TouchableOpacity>
          {i < links.length - 1 && (
            <Divider
              width={1}
              color={Colors.lightGray}
              style={{ marginBottom: 10, borderStyle: 'dashed' }}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  LinkSection: { backgroundColor: Colors.white },
  SectionHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: Colors.darkButton,
  },
  IconlinkBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  iconbox: {
    width: 35,
    height: 35,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTitle: {
    color: Colors.darkButton,
    fontSize: Size.sm,
    fontFamily: Fonts.medium,
  },
  badge: {
    marginLeft: 'auto',
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: APPROVAL_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  arrobox: {
    width: 20,
    height: 20,
    backgroundColor: '#F0F2F6',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
});
