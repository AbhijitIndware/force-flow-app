import {useAppSelector} from '../store/hook';

const TEAM_LEADER = 'Team Leader';

// A Team Leader is a "big promoter": the promoter app in any store of their
// zone, plus the SO's Partners and Orders and a read-only view of the zone's
// promoters. Their roles may also include "Promoter" or "Sales Officer", so
// check this before those.
export const isTeamLeader = (
  designation?: string | null,
  roles?: string[] | null,
) => designation === TEAM_LEADER || !!roles?.includes(TEAM_LEADER);

export const useIsTeamLeader = () => {
  const designation = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee?.designation,
  );
  const roles = useAppSelector(
    state => state?.persistedReducer?.authSlice?.user?.roles,
  );
  return isTeamLeader(designation, roles);
};
