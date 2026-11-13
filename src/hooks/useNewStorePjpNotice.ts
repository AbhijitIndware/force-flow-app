import {useCallback} from 'react';
import {useLazyGetPjpNextActionQuery} from '../features/base/base-api';
import {PjpWorkflowState} from '../types/baseType';

export type NewStorePjpNotice = {
  pjpId: string;
  message: string;
};

// States where there is no PJP for today to add a store to.
const NO_OPEN_PJP: PjpWorkflowState[] = ['NO_PJP', 'WEEKLY_OFF', 'COMPLETED'];

// A store just created is never on today's PJP: adding it stays the person's
// own step in Edit PJP, and nothing is added for them. When today's PJP
// exists, returns the notice to show (with the PJP to open); otherwise null.
export const useNewStorePjpNotice = () => {
  const [getNextAction] = useLazyGetPjpNextActionQuery();

  return useCallback(
    async (storeName?: string): Promise<NewStorePjpNotice | null> => {
      try {
        // Fresh, not cached: the PJP may have been created or started since.
        const res = await getNextAction(undefined, false).unwrap();
        const data = res?.message?.data;
        const pjpId = data?.pjp_document_name;
        if (!pjpId || NO_OPEN_PJP.includes(data.current_state)) return null;
        const name = storeName?.trim() || 'This store';
        return {
          pjpId,
          message: `${name} is not on your PJP yet. To visit it today, open Edit PJP, tick the store and Save.`,
        };
      } catch {
        return null;
      }
    },
    [getNextAction],
  );
};
