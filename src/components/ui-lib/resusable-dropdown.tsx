import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';
import DropdownComponent from '../ui/CustomDropDown';

// Extend to support per-item disabled flag (e.g. Visited stores)
interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface ReusableDropdownProps {
  label: string;
  field: string;
  value: string;
  data: DropdownOption[];
  error?: string | false;
  onChange: (value: string) => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  searchText?: string;
  setSearchText?: (val: string) => void;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddPress?: () => void;
  placeholder?: string;
  onOpen?: () => void;
  disabled?: boolean;
  clearTextAfterSearch?: boolean;
  marginBottom?: number;
  selectedLabel?: string;
  labelStyle?: any;
  height?: number;
  textSize?: number;
}

const ReusableDropdown: React.FC<ReusableDropdownProps> = ({
  label,
  field,
  value,
  data,
  error,
  onChange,
  onLoadMore,
  loadingMore,
  searchText,
  setSearchText,
  showAddButton,
  addButtonText,
  onAddPress,
  placeholder,
  disabled,
  clearTextAfterSearch = true,
  marginBottom = 16,
  selectedLabel,
  labelStyle,
  height,
  textSize,
}) => {
  return (
    <View style={[styles.inputWrapper, {marginBottom}]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <DropdownComponent
        selectText={placeholder || label}
        data={data}
        selectedId={value ? String(value) : null}
        setSelectedId={onChange}
        name={field}
        onLoadMore={onLoadMore}
        loadingMore={loadingMore}
        searchText={searchText}
        setSearchText={setSearchText}
        showAddButton={showAddButton}
        addButtonText={addButtonText}
        onAddPress={onAddPress}
        disabled={disabled}
        clearTextAfterSearch={clearTextAfterSearch}
        selectedLabelOverride={selectedLabel}
        height={height}
        textSize={textSize}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: Size.xs,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
  error: {
    fontSize: Size.xs,
    color: 'red',
    marginTop: 4,
  },
});

export default ReusableDropdown;
