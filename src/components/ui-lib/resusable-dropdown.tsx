import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DropdownComponent from '../ui/CustomDropDown';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';

interface DropdownOption {
  label: string;
  value: string;
}

interface ReusableDropdownProps {
  label: string;
  field: string;
  value: string;
  data: DropdownOption[];
  error?: string | false;
  onChange: (value: string) => void;
  onLoadMore?: () => void; // 👈 New prop
  loadingMore?: boolean; // 👈 New prop

  searchText?: string; // 👈 new
  setSearchText?: (val: string) => void; // 👈 new

  showAddButton?: boolean;
  addButtonText?: string;
  onAddPress?: () => void;

  onOpen?: () => void;
  disabled?: boolean;
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
  // 👇 NEW
  showAddButton,
  addButtonText,
  onAddPress,

  onOpen,
  disabled,
}) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <DropdownComponent
        selectText={label}
        data={data}
        selectedId={value ? String(value) : null}
        setSelectedId={onChange}
        name={field}
        onLoadMore={onLoadMore} // 👈 Pass pagination handler
        loadingMore={loadingMore}
        searchText={searchText} // 👈 pass down
        setSearchText={setSearchText} // 👈 pass down
        showAddButton={showAddButton}
        addButtonText={addButtonText}
        onAddPress={onAddPress}
        onOpen={onOpen}
        disabled={disabled}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {marginBottom: 16},
  label: {
    fontSize: Size.xs,
    marginBottom: 4,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
  error: {fontSize: Size.xs, color: 'red', marginTop: 4},
});

export default ReusableDropdown;
