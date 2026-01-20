import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSearch: (text: string) => void;
}

const SearchModal: React.FC<Props> = ({visible, onClose, onSearch}) => {
  const [text, setText] = useState('');

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Search Invoice</Text>

          <TextInput
            placeholder="Invoice / Store / Customer"
            style={styles.input}
            value={text}
            onChangeText={setText}
          />

          <View style={styles.row}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSearch(text);
                onClose();
              }}>
              <Text style={styles.search}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: Colors.white,
    width: '85%',
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  cancel: {
    fontFamily: Fonts.medium,
    color: Colors.gray,
  },
  search: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
  },
});
