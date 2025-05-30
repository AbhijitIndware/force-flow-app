/* eslint-disable react-native/no-inline-styles */
// MoreOptionsModal.tsx
import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { Size } from '../../utils/fontSize';
import { Fonts } from '../../constants';
import { Colors } from '../../utils/colors';
import { Divider } from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
          <Text style={styles.title}>More</Text>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                item.onPress();
                onClose();
              }}
              style={styles.menuItem}>
                <View style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexDirection:'row', paddingHorizontal:20, paddingBottom:10}}>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <View style={styles.arrobox}>
                    <Ionicons name="chevron-forward-outline" size={12} color={Colors.darkButton} />
                  </View>
                </View>
              <Divider width={1} color="#B9BFCB" style={{ borderStyle:'dashed'}} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  title: {
    fontSize:Size.md,
    marginBottom: 10,
    fontFamily:Fonts.semiBold,
    color:Colors.darkButton,
    padding:20,
    borderBottomWidth:1,
    borderColor:Colors.lightGray,
  },
  menuItem: {
 paddingVertical:10,
  },
  menuText: {
    fontSize:Size.sm,fontFamily:Fonts.medium,
    color:Colors.darkButton,
  },
  cancelButton:{
    padding:20, alignItems:'center',
  },
  cancelText: {
    fontSize:Size.sm,fontFamily:Fonts.medium,
    color:Colors.orange,
  },
  arrobox:{width:20, height:20, backgroundColor:'#F0F2F6',display:'flex', flexDirection:'row',
  alignItems:'center',justifyContent:'center', borderRadius:100},
});

export default MoreOptionsModal;
