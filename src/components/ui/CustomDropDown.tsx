/* eslint-disable react-native/no-inline-styles */
import {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';
import {Fonts} from '../../constants';
import {Colors} from '../../utils/colors';
import {DropDownList} from '../../types/Navigation';
import {color} from '@rneui/base';

type Props = {
  selectText: string;
  data: DropDownList[];
  selectedId: string | null;
  setSelectedId: any;
  height?: number;
  name: string;
  styleType?: string;
};

const DropdownComponent = ({
  selectText,
  data,
  setSelectedId,
  selectedId,
  height = 40,
  styleType = 'fullBorder',
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
          <View
            style={[
              styles.item,
              selected && styles.selectedItem, // Highlight selected item
            ]}>
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
        inputSearchStyle={styles.inputSearchStyle}
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
    borderColor: '#ccc',
  },
  bottomLine: {
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.primary,
    // paddingHorizontal: 10,
  },
  placeholderStyle: {
    fontSize: 15,
    color: Colors.inputBorder,
    // paddingHorizontal: 15,
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
    color: Colors.white,
  },

  itemText: {
    fontSize: 15,
    color: Colors.inputBorder,
    fontFamily: Fonts.regular,
  },
  itemTextStyle: {
    fontSize: 15,
    color: Colors.inputBorder,
    margin: 0,
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
    height: 40,
    fontSize: 15,
    color: Colors.black,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
  },
});
