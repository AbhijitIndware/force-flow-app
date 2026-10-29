import {useEffect, useMemo, useState} from 'react';
import {
  useGetAvailableStoreQuery,
  useGetEmployeeAssignedStoresQuery,
  usePromoterStatusQuery,
} from '../features/base/promoter-base-api';
import {AssignedStore} from '../types/baseType';
import {useIsTeamLeader} from '../utils/roles';
import {getCurrentLocation} from '../utils/utils';

// The stores a stock screen (Count Stock, Receive Stock, the returns, Store
// Activity) offers. A promoter gets their assigned stores. A Team Leader gets
// the store they are checked into; when they are not checked in anywhere,
// the same list as check-in (shift stores, then the nearest of their zone).
// Same shape as useGetEmployeeAssignedStoresQuery's data, so the screens
// read `data.message.data.stores` either way.
export const useStockStores = () => {
  const isTL = useIsTeamLeader();

  const assigned = useGetEmployeeAssignedStoresQuery(undefined, {skip: isTL});

  const {data: statusData, isLoading: statusLoading} = usePromoterStatusQuery(
    undefined,
    {skip: !isTL},
  );
  const openStore = statusData?.message?.data?.actions?.open_store;
  const needList = isTL && !statusLoading && !openStore;

  const [here, setHere] = useState<string | undefined>();
  const [locating, setLocating] = useState(true);
  useEffect(() => {
    if (!needList) return;
    getCurrentLocation()
      .then(setHere)
      .catch(() => {})
      .finally(() => setLocating(false));
  }, [needList]);

  const {data: shiftData} = useGetAvailableStoreQuery(
    {current_location: here},
    {skip: !needList || locating},
  );

  const tlStores = useMemo<AssignedStore[]>(() => {
    if (openStore) {
      return [
        {
          store_id: openStore.store,
          store_name: openStore.store_name,
          city: null,
          state: null,
        },
      ];
    }
    return (shiftData?.message?.data?.available_stores ?? []).map(s => ({
      store_id: s.store_id,
      store_name: s.store_name,
      city: s.city,
      state: s.state,
    }));
  }, [openStore, shiftData]);

  const tlData = useMemo(
    () => ({
      message: {
        success: true,
        data: {employee: '', total_stores: tlStores.length, stores: tlStores},
      },
    }),
    [tlStores],
  );

  return {data: isTL ? tlData : assigned.data};
};
