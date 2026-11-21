import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { useGetStoreListQuery } from '../../../../features/base/base-api';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';
import { formatStoreDistance, getStoreLabel } from '../../../../utils/utils';
import { imageBaseUrl } from '../../../../features/apiBaseUrl';

interface StoreItem {
  store_name: string;
  name: string;
  created_by_employee_name: string;
  store_type: string;
  pin_code: string;
  store_owner_name?: string;
  store_image?: string;
  // Only when the request had current_location; null = no map location.
  distance_m?: number | null;
}

interface DropdownOption {
  label: string;
  value: string;
  imageUrl?: string;
  subLabel?: string;
  subLabelMuted?: boolean;
}

interface Pagination {
  page: number;
  total_pages: number;
}

interface StoreApiResponse {
  message: {
    data: {
      stores: StoreItem[];
    };
    pagination: Pagination;
  };
}

interface Props {
  label: string;
  field: string;
  value: string;
  error?: string;
  onChange: (val: string) => void;
  navigation: any;
  disabled?: boolean;
  // The phone's "lat,lon" (see useCurrentLocation); stores come nearest first.
  here?: string;
  // True while the first location read is in progress.
  locating?: boolean;
  // Re-reads the location (on search).
  refreshLocation?: () => void;
}

const PAGE_SIZE = '20';

// Kept in the server's order (nearest first when a location was sent).
const transformStores = (arr: StoreItem[] = []): DropdownOption[] =>
  arr.map(item => {
    const distance = formatStoreDistance(item.distance_m);
    return {
      label: getStoreLabel(item),
      value: item.name,
      imageUrl: item.store_image
        ? `${imageBaseUrl}${item.store_image}`
        : undefined,
      subLabel: distance?.text,
      subLabelMuted: distance?.muted,
    };
  });

const StoreDropdownField = ({
  label,
  field,
  value,
  error,
  onChange,
  navigation,
  disabled = false,
  here,
  locating = false,
  refreshLocation,
}: Props) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [storeList, setStoreList] = useState<DropdownOption[]>([]);
  const [seededOption, setSeededOption] = useState<DropdownOption | null>(null);

  const { data: exactMatchData } = useGetStoreListQuery(
    {
      page: '1',
      page_size: '1',
      search: value,
      include_subordinates: '1',
      include_direct_subordinates: '1',
      current_location: here,
    },
    { skip: !value || locating },
  );

  // ✅ Seed with full label in edit mode
  useEffect(() => {
    const stores = (exactMatchData as StoreApiResponse)?.message?.data?.stores;
    if (stores?.length) {
      const newItems = transformStores(stores);
      setSeededOption(newItems[0]);
      setStoreList(prev => {
        // Merge without overwriting the full list
        const combined = [...newItems, ...prev];
        return Array.from(new Map(combined.map(i => [i.value, i])).values());
      });
    }
  }, [exactMatchData]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setStoreList([]);
  }, [debouncedSearch, here]);

  // A new search re-reads the location; the list only reloads if it moved.
  useEffect(() => {
    if (debouncedSearch) refreshLocation?.();
  }, [debouncedSearch, refreshLocation]);

  const { data, isFetching } = useGetStoreListQuery(
    {
      page: String(page),
      page_size: PAGE_SIZE,
      search: debouncedSearch,
      include_subordinates: '1',
      include_direct_subordinates: '1',
      current_location: here,
    },
    { skip: locating },
  );

  useEffect(() => {
    const stores = (data as StoreApiResponse)?.message?.data?.stores;
    if (!stores) return;

    const newData = transformStores(stores);

    setStoreList(prev => {
      if (page === 1) {
        let finalData = newData;
        if (value) {
          const existsInNewData = newData.some(i => i.value === value);
          if (!existsInNewData) {
            const seeded =
              seededOption?.value === value
                ? seededOption
                : prev.find(i => i.value === value);

            if (seeded) {
              finalData = [seeded, ...newData];
            }
          }
        }
        return finalData;
      }

      const merged = [...prev, ...newData];
      return Array.from(new Map(merged.map(i => [i.value, i])).values());
    });
  }, [data, value, seededOption]);

  const handleLoadMore = useCallback(() => {
    if (isFetching) return;
    const current = (data as StoreApiResponse)?.message?.pagination?.page ?? 1;
    const total =
      (data as StoreApiResponse)?.message?.pagination?.total_pages ?? 1;
    if (current >= total) return;
    setPage(prev => prev + 1);
  }, [isFetching, data]);

  const handleSelect = useCallback(
    (val: string) => {
      const selected = storeList.find(i => i.value === val);
      if (selected) {
        setSeededOption(selected);
      }
      onChange(val);
    },
    [storeList, onChange],
  );

  const handleAddStore = useCallback(() => {
    navigation.navigate('AddStoreScreen');
  }, [navigation]);

  return (
    <View>
      <ReusableDropdown
        label={label}
        field={field}
        value={value}
        data={storeList}
        error={error}
        onChange={handleSelect}
        onLoadMore={handleLoadMore}
        loadingMore={isFetching && page > 1}
        searchText={search}
        setSearchText={setSearch}
        showAddButton
        addButtonText="Add New Store"
        onAddPress={handleAddStore}
        disabled={disabled}
      />
    </View>
  );
};

export default StoreDropdownField;
