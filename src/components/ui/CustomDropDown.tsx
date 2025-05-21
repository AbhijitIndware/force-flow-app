/* eslint-disable react-native/no-inline-styles */
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';
import {Fonts} from '../../constants';
import {Colors} from '../../utils/colors';
import {DropDownList} from '../../types/Navigation';

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
  height = 50,
  styleType = 'bottomLine',
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
          styleType === 'fullBorder' ? styles.dropdown : styles.bottomLine,
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.placeholderStyle}
        data={data}
        maxHeight={250}
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
    borderBottomColor: Colors.primary,
    borderBottomWidth: 1,
    borderRadius: 10,
  },
  bottomLine: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingHorizontal: 10,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.inputBorder,
    // paddingHorizontal: 15,
  },
  selectedTextStyle: {
    paddingHorizontal: 5,
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
});
