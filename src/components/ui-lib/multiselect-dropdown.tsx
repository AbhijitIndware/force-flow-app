import React, {useState} from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../utils/colors';
import {Size} from '../../utils/fontSize';
import {Fonts} from '../../constants';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  label: string;
  data: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  height?: number;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  data,
  selectedValues,
  onChange,
  placeholder = 'Select employees...',
  searchPlaceholder = 'Search...',
  disabled = false,
  error,
  height = 40,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = data.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeChip = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  };

  const selectedLabels = data.filter(d => selectedValues.includes(d.value));

  return (
    <View style={{marginBottom: 0}}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Trigger box */}
      <TouchableOpacity
        style={[
          styles.trigger,
          disabled && styles.triggerDisabled,
          {
            height: height,
          },
        ]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}>
        <View style={styles.triggerInner}>
          {selectedLabels.length === 0 ? (
            <Text style={styles.placeholder}>{placeholder}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{flex: 1}}>
              <View style={styles.chipsRow}>
                {selectedLabels.map(item => (
                  <View key={item.value} style={styles.chip}>
                    <Text style={styles.chipText} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeChip(item.value)}
                      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                      <Ionicons name="close" size={13} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={disabled ? Colors.gray : '#555'}
            style={{marginLeft: 6}}
          />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Dropdown Modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            setOpen(false);
            setSearch('');
          }}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sheet}
            onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => {
                  setOpen(false);
                  setSearch('');
                }}>
                <Ionicons name="close-circle" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color={Colors.gray} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor={Colors.gray}
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close" size={15} color={Colors.gray} />
                </TouchableOpacity>
              )}
            </View>

            {/* Select All / Clear All row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => onChange(data.map(d => d.value))}>
                <Text style={styles.actionText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onChange([])}>
                <Text style={[styles.actionText, {color: '#EF4444'}]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={item => item.value}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({item}) => {
                const selected = selectedValues.includes(item.value);
                return (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => toggle(item.value)}>
                    <View
                      style={[styles.checkbox, selected && styles.checkboxOn]}>
                      {selected && (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.listItemText,
                        selected && {color: Colors.darkButton},
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No results found</Text>
              }
            />

            {/* Done button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                setOpen(false);
                setSearch('');
              }}>
              <Text style={styles.doneButtonText}>
                Done ({selectedValues.length} selected)
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: Size.xs,
    marginBottom: 4,
    color: '#666',
    fontFamily: Fonts.regular,
  },
  trigger: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 0,
    backgroundColor: '#FAFAFA',
    minHeight: 40,
    justifyContent: 'center',
  },
  triggerDisabled: {opacity: 0.5},
  triggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: Fonts.regular,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkButton,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    marginRight: 4,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.white,
    maxWidth: 100,
  },
  error: {fontSize: Size.xs, color: 'red', marginTop: 4},
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '88%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#1A1A1A',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#1A1A1A',
    padding: 0,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  actionText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
  },
  list: {maxHeight: 300},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxOn: {
    backgroundColor: Colors.darkButton,
    borderColor: Colors.darkButton,
  },
  listItemText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#374151',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.gray,
    fontFamily: Fonts.regular,
    fontSize: 13,
    paddingVertical: 20,
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: Colors.darkButton,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
});

export default MultiSelectDropdown;
