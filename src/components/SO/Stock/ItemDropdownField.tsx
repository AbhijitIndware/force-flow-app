import React, { useState, useMemo } from 'react';
import { useGetStockItemsQuery, useGetStoreStockStatusQuery } from '../../../features/base/base-api';
import ReusableDropdown from '../../ui-lib/resusable-dropdown';

interface Props {
  label: string;
  field: string;
  value: string;
  store: string;
  error?: string | false;
  onChange: (val: string) => void;
}

const ItemDropdownField = ({
  label,
  field,
  value,
  store,
  error,
  onChange,
}: Props) => {
  const [search, setSearch] = useState('');
  const { data: stockItemsData, isFetching, error: stockError } = useGetStoreStockStatusQuery({ store });

  const filteredData = useMemo(() => {
    if (!stockItemsData?.message) return [];

    let items = stockItemsData.message?.data?.map(item => ({
      label: `${item.item_name} (${item.current_stock})`,
      value: item.item_name,
    }));

    if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter(item =>
        item.label.toLowerCase().includes(lowerSearch) ||
        item.value.toLowerCase().includes(lowerSearch)
      );
    }

    return items;
  }, [stockItemsData, search]);

  const selectedLabel = useMemo(() => {
    const selected = stockItemsData?.message?.data?.find(i => i.item_name === value);
    return selected ? `${selected.item_name} (${selected.current_stock})` : undefined;
  }, [stockItemsData, value]);

  return (
    <ReusableDropdown
      label={label}
      field={field}
      value={value}
      data={filteredData}
      error={error}
      onChange={onChange}
      searchText={search}
      setSearchText={setSearch}
      placeholder="Select Item"
      marginBottom={0}
      loadingMore={isFetching}
      selectedLabel={selectedLabel}
    />
  );
};

export default ItemDropdownField;
