import React from 'react';
import {CalendarCheck} from 'lucide-react-native';
import {Colors} from '../../../utils/colors';
import {useGetPendingLeaveApprovalsQuery} from '../../../features/base/base-api';
import {useAppSelector} from '../../../store/hook';
import {leaveRows} from '../../../types/leaveType';
import {ApprovalLinkCard} from './LateCheckinApprovalLink';

interface Props {
  navigation: any;
}

/** Home card for approvers (manager / HR): leave waiting for their decision. */
const LeaveApprovalLink: React.FC<Props> = ({navigation}) => {
  const empId = useAppSelector(s => s.persistedReducer.authSlice.empId);
  const {data} = useGetPendingLeaveApprovalsQuery();
  // Never count the user's own leave as something to approve.
  const pendingCount = leaveRows(data?.message?.data).filter(
    r => !r.employee || r.employee !== empId,
  ).length;
  return (
    <ApprovalLinkCard
      title="Leave Approvals"
      idleSubtitle="Review your team's leave"
      pendingCount={pendingCount}
      icon={<CalendarCheck strokeWidth={2} color={Colors.white} size={20} />}
      onPress={() => navigation.navigate('LeaveApprovalScreen')}
    />
  );
};

export default LeaveApprovalLink;
