/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { Text, ActivityIndicator, Menu } from 'react-native-paper';
import { Fonts } from '../../constants';
import { Colors } from '../../utils/colors';
import { Size } from '../../utils/fontSize';
import { DropDownList } from '../../types/Navigation';
import { ChevronDown } from 'lucide-react-native';

// Extend DropDownList locally if you can't modify the type file
type DropDownItem = DropDownList & { disabled?: boolean; imageUrl?: string };

type Props = {
  selectText: string;
  data: DropDownItem[];
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
  name?: string;
  disabled?: boolean;
  clearTextAfterSearch: boolean;
  selectedLabelOverride?: string;
  textSize?: number;
};

const DropdownComponent = ({
  selectText,
  data,
  selectedId,
  setSelectedId,
  height = 45,
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
  clearTextAfterSearch,
  selectedLabelOverride,
  textSize = Size.xs,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState(0);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  console.log("🚀 ~ DropdownComponent ~ previewImageUrl:", previewImageUrl)

  const handleSelect = (item: DropDownItem) => {
    if (item.disabled) return;
    setSelectedId(item.value === selectedId ? '' : item.value);
    setVisible(false);
    if (clearTextAfterSearch) setSearchText?.('');
  };

  const selectedLabel =
    selectedLabelOverride ||
    data.find(item => item.value === selectedId)?.label ||
    `Select ${selectText}`;

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
                  { fontSize: textSize },
                  disabled && { color: '#9E9E9E' },
                  selectedId && styles.selectedTextActive,
                ]}>
                {selectedLabel}
              </Text>
              <ChevronDown color={Colors.inputBorder} size={18} />
            </TouchableOpacity>
          }
          contentStyle={{
            backgroundColor: Colors.white,
            width: anchorWidth || '90%',
            alignSelf: 'center',
            zIndex: 9999,
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

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              value={searchText}
              onChangeText={text => setSearchText?.(text)}
              placeholder={`Search ${selectText}...`}
              placeholderTextColor={Colors.inputBorder}
              style={[styles.inputSearchStyle, { fontSize: textSize }]}
            />
          </View>

          {/* List */}
          <FlatList
            data={data}
            keyExtractor={(item, index) =>
              `${item.value}-${item.label}-${index}`
            }
            keyboardShouldPersistTaps="handled"
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            style={{ maxHeight: 200, minWidth: '90%', zIndex: 9999 }}
            contentContainerStyle={{ zIndex: 9999 }}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary}
                  style={{ marginVertical: 10 }}
                />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { fontSize: textSize }]}>
                  No {selectText} found
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.value === selectedId;
              const isDisabled = item.disabled;

              const image = item.imageUrl

              return (
                <View
                  style={[
                    styles.item,
                    isSelected && styles.selectedItem,
                    isDisabled && styles.disabledItem,
                  ]}>
                  {image ? (
                    <TouchableOpacity
                      onPress={() => setPreviewImageUrl(image!)}
                      activeOpacity={0.7}
                      style={styles.imageWrapper}>
                      <Image
                        source={{ uri: image }}
                        style={styles.storeImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.storeImage, styles.storeImagePlaceholder]}>
                      <Text style={styles.storeImagePlaceholderText}>🏪</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    disabled={isDisabled}
                    style={styles.labelWrapper}>
                    <Text
                      style={[
                        styles.itemText,
                        { fontSize: textSize },
                        isSelected && styles.selectedItemText,
                        isDisabled && styles.disabledItemText,
                      ]}
                      numberOfLines={1}>
                      {item.label}
                    </Text>
                    {/* Visited badge */}
                    {isDisabled && (
                      <View style={styles.visitedBadge}>
                        <Text style={styles.visitedBadgeText}>Visited</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </Menu>

        {/* Image Preview Modal */}
        <Modal
          visible={!!previewImageUrl}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewImageUrl(null)}>
          <View style={styles.previewOverlay}>
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => setPreviewImageUrl(null)}>
              <Text style={styles.previewCloseText}>✕</Text>
            </TouchableOpacity>
            {previewImageUrl && (
              <Image
                source={{ uri: previewImageUrl }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    width: '100%',
  },
  selectedText: {
    color: Colors.inputBorder,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    width: '95%',
  },
  selectedTextActive: {
    color: Colors.black,
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
    backgroundColor: '#eeededff',
  },
  inputSearchStyle: {
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    marginRight: 5,
  },
  labelWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    color: Colors.inputBorder,
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    flex: 1,
  },
  selectedItem: {
    backgroundColor: Colors.orange,
  },
  selectedItemText: {
    color: Colors.white,
  },
  disabledItem: {
    backgroundColor: '#F9FAFB',
  },
  disabledItemText: {
    color: '#9CA3AF',
  },
  visitedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  visitedBadgeText: {
    fontSize: 10,
    color: '#15803D',
    fontFamily: Fonts.medium,
    fontWeight: '600',
  },
  storeImage: {
    width: 45,
    height: 45,
    borderRadius: 0,
    marginRight: 5
  },
  storeImagePlaceholder: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeImagePlaceholderText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.inputBorder,
    fontFamily: Fonts.regular,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
