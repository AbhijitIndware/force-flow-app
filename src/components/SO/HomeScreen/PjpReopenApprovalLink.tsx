import React from 'react';
import {RotateCcw} from 'lucide-react-native';
import {Colors} from '../../../utils/colors';
import {useGetPjpReopenRequestsQuery} from '../../../features/base/base-api';
import {ApprovalLinkCard} from './LateCheckinApprovalLink';

interface Props {
  navigation: any;
}

/** Manager home card: PJP reopen requests waiting for a decision. */
const PjpReopenApprovalLink: React.FC<Props> = ({navigation}) => {
  // Same query args as the list screen so they share one cache entry.
  const {data} = useGetPjpReopenRequestsQuery({days: 7});
  const pendingCount =
    data?.message?.data?.filter(r => r.can_decide).length ?? 0;
  return (
    <ApprovalLinkCard
      title="PJP Reopen Requests"
      idleSubtitle="Review requests to reopen an ended PJP"
      pendingCount={pendingCount}
      icon={<RotateCcw strokeWidth={2} color={Colors.white} size={20} />}
      onPress={() => navigation.navigate('PjpReopenApprovalScreen')}
    />
  );
};

export default PjpReopenApprovalLink;
