import React from 'react';
import {View, StyleSheet} from 'react-native';
import DropdownComponent from '../ui/CustomDropDown';
import {Size} from '../../utils/fontSize';

interface DropdownOption {
  label: string;
  value: string;
}

interface SaleItemDropdownProps {
  field: string;
  value: string;
  data: DropdownOption[];
  onChange: (value: string) => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  searchText?: string;
  setSearchText?: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SaleItemDropdown: React.FC<SaleItemDropdownProps> = ({
  field,
  value,
  data,
  onChange,
  onLoadMore,
  loadingMore,
  searchText,
  setSearchText,
  placeholder = 'item...',
  disabled,
}) => {
  return (
    <View style={styles.dropdownWrapper}>
      <DropdownComponent
        selectText={placeholder}
        data={data}
        selectedId={value ? String(value) : null}
        setSelectedId={onChange}
        name={field}
        height={34}
        onLoadMore={onLoadMore}
        loadingMore={loadingMore}
        searchText={searchText}
        setSearchText={setSearchText}
        disabled={disabled}
        clearTextAfterSearch={true}
        textSize={Size.xxs}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownWrapper: {
    flex: 1,
  },
});

export default SaleItemDropdown;
