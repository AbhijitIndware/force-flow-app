import React, {useState, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {useGetStoreListQuery} from '../../../../features/base/base-api';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';

interface StoreItem {
  store_name: string;
  name: string;
  created_by_employee_name: string;
  store_type: string;
}

interface DropdownOption {
  label: string;
  value: string;
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
}

const PAGE_SIZE = '20';

const transformStores = (arr: StoreItem[] = []): DropdownOption[] =>
  arr.map(item => ({
    label: `${item.store_name} · By: ${item.created_by_employee_name} · Type: ${item.store_type}`,
    value: item.name,
  }));

const StoreDropdownField = ({
  label,
  field,
  value,
  error,
  onChange,
  navigation,
}: Props) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [storeList, setStoreList] = useState<DropdownOption[]>([]);

  const {data: exactMatchData} = useGetStoreListQuery(
    {
      page: '1',
      page_size: '1',
      search: value,
      include_subordinates: '1',
      include_direct_subordinates: '1',
    },
    {skip: !value},
  );

  // ✅ Seed with full label in edit mode
  useEffect(() => {
    const stores = (exactMatchData as StoreApiResponse)?.message?.data?.stores;
    if (stores?.length) {
      setStoreList(transformStores(stores));
    }
  }, [exactMatchData]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setStoreList([]);
  }, [debouncedSearch]);

  const {data, isFetching} = useGetStoreListQuery({
    page: String(page),
    page_size: PAGE_SIZE,
    search: debouncedSearch,
    include_subordinates: '1',
    include_direct_subordinates: '1',
  });

  useEffect(() => {
    const stores = (data as StoreApiResponse)?.message?.data?.stores;
    if (!stores) return;

    const newData = transformStores(stores);

    setStoreList(prev => {
      if (page === 1) {
        if (value) {
          const existsInNewData = newData.some(i => i.value === value);
          if (!existsInNewData) {
            const seeded = prev.find(i => i.value === value);
            if (seeded) return [seeded, ...newData];
          }
        }
        return newData;
      }

      const merged = [...prev, ...newData];
      return Array.from(new Map(merged.map(i => [i.value, i])).values());
    });
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (isFetching) return;
    const current = (data as StoreApiResponse)?.message?.pagination?.page ?? 1;
    const total =
      (data as StoreApiResponse)?.message?.pagination?.total_pages ?? 1;
    if (current >= total) return;
    setPage(prev => prev + 1);
  }, [isFetching, data]);

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
        onChange={onChange}
        onLoadMore={handleLoadMore}
        loadingMore={isFetching && page > 1}
        searchText={search}
        setSearchText={setSearch}
        showAddButton
        addButtonText="Add New Store"
        onAddPress={handleAddStore}
      />
    </View>
  );
};

export default StoreDropdownField;
