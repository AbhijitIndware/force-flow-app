/* eslint-disable react-native/no-inline-styles */
import React, {useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import {Fonts} from '../../constants';
import {Colors} from '../../utils/colors';
import {Size} from '../../utils/fontSize';
import {DropDownList} from '../../types/Navigation';
import {ChevronDown} from 'lucide-react-native';

type Props = {
  selectText: string;
  data: DropDownList[];
  selectedId: string | null;
  setSelectedId: (val: string) => void;
  height?: number;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  searchText?: string;
  setSearchText?: (val: string) => void;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddPress?: () => void;
  onOpen?: () => void;
  disabled?: boolean;
  name: string;
};

const DropdownComponentV2 = ({
  selectText,
  data,
  selectedId,
  setSelectedId,
  height = 50,
  onLoadMore,
  loadingMore = false,
  searchText: propSearchText,
  setSearchText: propSetSearchText,
  showAddButton,
  addButtonText,
  onAddPress,
  onOpen,
  disabled = false,
  name,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState(0);
  const [internalSearchText, setInternalSearchText] = useState('');

  const searchText = propSearchText ?? internalSearchText;
  const setSearchText = propSetSearchText ?? setInternalSearchText;

  const handleSelect = (value: string) => {
    setSelectedId(value);
    setVisible(false);
    setSearchText('');
  };

  const selectedLabel =
    selectedId && data.find(item => item.value === selectedId)
      ? data.find(item => item.value === selectedId)?.label
      : `Select ${selectText}`;

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(item =>
      item.label.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [data, searchText]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onLayout={e => setAnchorWidth(e.nativeEvent.layout.width)}
        onPress={() => {
          setVisible(!visible);
          onOpen?.();
        }}
        disabled={disabled}
        style={[
          styles.dropdown,
          {
            height,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            backgroundColor: disabled ? '#F3F3F3' : '#FFFFFF',
            borderColor: disabled ? '#D4D4D4' : Colors.inputBorder,
            opacity: disabled ? 0.6 : 1,
          },
        ]}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.selectedText,
            disabled && {color: '#9E9E9E'},
            selectedId && styles.selectedTextActive,
          ]}>
          {selectedLabel}
        </Text>
        <ChevronDown color={Colors.inputBorder} size={18} />
      </TouchableOpacity>

      {visible && (
        <View
          style={[
            styles.dropdownList,
            {width: anchorWidth, top: height + 4, zIndex: 9999},
          ]}>
          {showAddButton && (
            <TouchableOpacity
              onPress={() => {
                onAddPress?.();
                setVisible(false);
              }}
              style={styles.addButton}>
              <Text style={styles.addButtonText}>
                + {addButtonText || 'Add New'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Search Input */}
          <TextInput
            value={searchText}
            onChangeText={text => setSearchText(text)}
            placeholder={`Search ${selectText}...`}
            placeholderTextColor={Colors.inputBorder}
            style={styles.inputSearchStyle}
          />

          <FlatList
            data={filteredData}
            keyExtractor={item => `${item.value}-${item.label}`}
            keyboardShouldPersistTaps="handled"
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <Text style={{padding: 10, textAlign: 'center'}}>
                  Loading...
                </Text>
              ) : null
            }
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.value)}
                style={[
                  styles.item,
                  item.value === selectedId && styles.selectedItem,
                ]}>
                <Text
                  style={[
                    styles.itemText,
                    item.value === selectedId && styles.selectedItemText,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            style={{maxHeight: 160}}
            ListEmptyComponent={
              <View style={{padding: 20, alignItems: 'center'}}>
                <Text
                  style={{
                    color: Colors.inputBorder,
                    fontFamily: Fonts.regular,
                  }}>
                  No {selectText} found
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

export default DropdownComponentV2;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecececff',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  selectedText: {
    color: Colors.inputBorder,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    width: '95%',
  },
  selectedTextActive: {
    color: Colors.black,
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addButtonText: {
    color: Colors.primary,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
  },
  inputSearchStyle: {
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    color: Colors.inputBorder,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
  },
  selectedItem: {
    backgroundColor: Colors.orange,
  },
  selectedItemText: {
    color: Colors.white,
  },
});
