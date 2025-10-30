/* eslint-disable react-native/no-inline-styles */
import {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {Fonts} from '../../constants';
import {Colors} from '../../utils/colors';
import {DropDownList} from '../../types/Navigation';
import {Size} from '../../utils/fontSize';

type Props = {
  selectText: string;
  data: DropDownList[];
  selectedId: string | null;
  setSelectedId: (val: string) => void;
  height?: number;
  name: string;
  styleType?: string;
  onLoadMore?: () => void; // 👈 pagination handler
  loadingMore?: boolean; // 👈 loading indicator

  searchText?: string; // 👈 add this
  setSearchText?: (val: string) => void; // 👈 add this
};

const DropdownComponent = ({
  selectText,
  data,
  setSelectedId,
  selectedId,
  height = 50,
  styleType = 'fullBorder',
  onLoadMore,
  loadingMore = false,
  searchText,
  setSearchText,
}: Props) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[
          {
            height: height,
            width: '100%',
          },
          styleType === 'fullBorder' ? styles.dropdown : styles.dropdown,
        ]}
        renderItem={(item, selected) => (
          <View style={[styles.item, selected && styles.selectedItem]}>
            <Text
              style={[styles.itemText, selected && styles.selectedItemText]}>
              {item.label}
            </Text>
          </View>
        )}
        itemContainerStyle={{padding: 0}}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        data={data}
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? `Select ${selectText}` : '...'}
        value={selectedId}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item: {value: any}) => {
          setSelectedId(item?.value);
          setIsFocus(false);
        }}
        search
        searchPlaceholder="Search..."
        keyboardAvoiding
        inputSearchStyle={styles.inputSearchStyle}
        renderInputSearch={onSearchTextChange => (
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.inputSearchStyle, isFocus && styles.inputFocused]}
              placeholder="Search..."
              placeholderTextColor={Colors.inputBorder}
              value={searchText}
              onChangeText={text => {
                onSearchTextChange(text); // internal filtering
                setSearchText?.(text); // external search handler
              }}
            />
          </View>
        )}
        // searchField={searchText} // 👈 control search text
        // onChangeText={text => {
        //   console.log('🚀 ~ DropdownComponent ~ text:', text);
        //   return setSearchText?.(text);
        // }} // 👈 update from parent
        flatListProps={{
          onEndReached: onLoadMore, // 👈 detects scroll end
          onEndReachedThreshold: 0.5,
          ListFooterComponent: loadingMore ? (
            <ActivityIndicator
              size="small"
              color={Colors.primary || 'gray'}
              style={{marginVertical: 10}}
            />
          ) : null,
        }}
      />
    </View>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ecececff',
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
  },
  placeholderStyle: {
    color: Colors.inputBorder,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
  },
  item: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: Colors.white,
  },
  selectedItem: {
    backgroundColor: Colors.orange,
  },
  itemText: {
    fontSize: 15,
    color: Colors.inputBorder,
    fontFamily: Fonts.regular,
  },
  itemTextStyle: {
    color: Colors.inputBorder,
    margin: 0,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
  },
  selectedItemText: {
    paddingHorizontal: 5,
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  selectedTextStyle: {
    paddingHorizontal: 5,
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  inputSearchStyle: {
    height: 50,
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#fff',
  },
});
