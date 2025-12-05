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
  disabled?: boolean;
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
  disabled = false,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState(0);

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
              onLayout={e => setAnchorWidth(e.nativeEvent.layout.width)}
              onPress={() => {
                setVisible(true);
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
                  selectedId && styles.selectedTextActive, // 👈 add this line
                ]}>
                {selectedLabel}
              </Text>
              <ChevronDown color={Colors.inputBorder} size={18} />
            </TouchableOpacity>
          }
          // anchorPosition="bottom"
          contentStyle={{
            backgroundColor: Colors.white,
            width: anchorWidth || '90%',
            alignSelf: 'center',
          }}>
          {/* Add Button */}
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
          <View style={styles.searchContainer}>
            <TextInput
              value={searchText}
              onChangeText={text => {
                setSearchText?.(text);
              }}
              placeholder={`Search ${selectText}...`}
              placeholderTextColor={Colors.inputBorder}
              style={styles.inputSearchStyle}
            />
          </View>

          {/* List */}
          <FlatList
            data={data}
            keyExtractor={item => `${item.value}-${item?.label}`}
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
                onPress={() => {
                  handleSelect(item.value);
                  setSearchText?.('');
                }}
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
    width: '95%',
  },
  selectedTextActive: {
    color: Colors.black, // make text black when selected
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
    // paddingVertical: 2,
  },
  inputSearchStyle: {
    // height: 35,
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
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
