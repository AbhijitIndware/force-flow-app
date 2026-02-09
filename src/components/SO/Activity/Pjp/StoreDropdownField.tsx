import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {useGetStoreListQuery} from '../../../../features/base/base-api';
import ReusableDropdown from '../../../ui-lib/resusable-dropdown';

interface Props {
  label: string;
  field: string;
  value: string;
  error?: string;
  onChange: (val: string) => void;
  navigation: any;
}

const StoreDropdownField = ({
  label,
  field,
  value,
  error,
  onChange,
  navigation,
}: Props) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [storeList, setStoreList] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const {data, isFetching} = useGetStoreListQuery({
    page: String(page),
    page_size: '20',
    search: search,
    include_subordinates: '1',
    include_direct_subordinates: '1',
  });

  const transform = (arr: any[] = []) =>
    arr.map(item => ({
      label: item.store_name,
      value: item.name,
    }));

  useEffect(() => {
    if (data?.message?.data?.stores) {
      const newData = transform(data.message.data.stores);

      if (search.trim() !== '' || page === 1) {
        setStoreList(newData);
      } else {
        setStoreList(prev => {
          const merged = [...prev, ...newData];
          return Array.from(new Map(merged.map(i => [i.value, i])).values());
        });
      }
      setLoadingMore(false);
    }
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleLoadMore = () => {
    if (isFetching || loadingMore) return;

    const current = data?.message?.pagination?.page ?? 1;
    const total = data?.message?.pagination?.total_pages ?? 1;

    if (current >= total) return;

    setLoadingMore(true);
    setPage(prev => prev + 1);
  };

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
        loadingMore={loadingMore}
        searchText={search}
        setSearchText={setSearch}
        showAddButton
        addButtonText="Add New Store"
        onAddPress={() => navigation.navigate('AddStoreScreen')}
      />
    </View>
  );
};

export default StoreDropdownField;
