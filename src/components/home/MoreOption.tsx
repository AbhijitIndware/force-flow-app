// MoreOptionsModal.tsx
import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface MenuItem {
  id: string;
  title: string;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

const MoreOptionsModal: React.FC<Props> = ({visible, onClose, menuItems}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={onClose}
        style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>More Options</Text>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                item.onPress();
                onClose();
              }}
              style={styles.menuItem}>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  menuText: {
    fontSize: 16,
  },
  cancelText: {
    color: 'blue',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MoreOptionsModal;
