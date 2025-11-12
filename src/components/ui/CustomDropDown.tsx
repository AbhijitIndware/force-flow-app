/* eslint-disable react-native/no-inline-styles */
import React, {useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Text, ActivityIndicator, Menu, Button} from 'react-native-paper';
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
  styleType?: string;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  searchText?: string;
  setSearchText?: (val: string) => void;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddPress?: () => void;
  onOpen?: () => void;
  name?: string;
};

const DropdownComponent = ({
  selectText,
  data,
  selectedId,
  setSelectedId,
  height = 50,
  onLoadMore,
  loadingMore = false,
  searchText,
  setSearchText,
  showAddButton,
  addButtonText,
  onAddPress,
  onOpen,
  name,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState(searchText || '');

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, data]);

  const handleSelect = (value: string) => {
    setSelectedId(value);
    setVisible(false);
  };

  const selectedLabel =
    selectedId && data.find(item => item.value === selectedId)
      ? data.find(item => item.value === selectedId)?.label
      : `Select ${selectText}`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => {
                setVisible(true);
                onOpen?.();
              }}
              style={[
                styles.dropdown,
                {
                  height,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
              ]}>
              <Text
                style={[
                  styles.selectedText,
                  selectedId && styles.selectedTextActive, // 👈 add this line
                ]}>
                {selectedLabel}
              </Text>
              <ChevronDown color={Colors.inputBorder} size={18} />
            </TouchableOpacity>
          }
          // anchorPosition="bottom"
          contentStyle={{backgroundColor: Colors.white, width: '100%'}}>
          {/* Add Button */}
          {showAddButton && (
            <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
              <Text style={styles.addButtonText}>
                + {addButtonText || 'Add New'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              value={search}
              onChangeText={text => {
                setSearch(text);
                setSearchText?.(text);
              }}
              placeholder={`Search ${selectText}...`}
              placeholderTextColor={Colors.inputBorder}
              style={styles.inputSearchStyle}
            />
          </View>

          {/* List */}
          <FlatList
            data={filteredData}
            keyExtractor={item => item.value}
            keyboardShouldPersistTaps="handled"
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary}
                  style={{marginVertical: 10}}
                />
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
            style={{maxHeight: 200, minWidth: '90%'}}
          />
        </Menu>
      </View>
    </KeyboardAvoidingView>
  );
};

export default DropdownComponent;

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
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: Colors.primary,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
  },
  searchContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  selectedTextActive: {
    color: Colors.black, // make text black when selected
  },

  inputSearchStyle: {
    height: 40,
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
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
