import {useAppSelector} from '../store/hook';

const TEAM_LEADER = 'Team Leader';

// A Team Leader is a Sales Officer who also runs promoters. Their roles also
// include "Sales Officer", so check this before any Sales Officer check.
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
