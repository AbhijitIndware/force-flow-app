import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { Colors } from '../../../../utils/colors';
import { Fonts } from '../../../../constants';
import { Upload, X, Plus } from 'lucide-react-native';
import { pick } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import { validateFile } from '../../../../utils/uploadValidation';

interface StoreImageValue {
  mime: string;
  data: string;
}

interface Props {
  value: StoreImageValue | null;
  onChange: (val: StoreImageValue | null) => void;
  error?: string | false;
}

const StoreImagePicker = ({ value, onChange, error }: Props) => {
  const errorMessage = typeof error === 'string' ? error : undefined;
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const convertToBase64 = async (uri: string) => RNFS.readFile(uri, 'base64');

  const handlePickDocument = async () => {
    setShowOptions(false);
    try {
      const docs = await pick({ allowMultiSelection: false });
      if (!docs?.length) return;
      const doc = docs[0];
      const base64 = await convertToBase64(doc.uri);
      const validation = validateFile(
        { name: doc.name, type: doc.type, size: doc.size },
        { allowPdf: false, base64Data: base64 },
      );
      if (!validation.valid) {
        Toast.show({
          type: 'error',
          text1: `Image rejected: ${validation.reason}`,
          position: 'top',
        });
        return;
      }
      setPreviewUri(doc.uri);
      onChange({ mime: doc.type || 'image/jpeg', data: base64 });
    } catch (err) {
      console.warn(err);
    }
  };

  const handleOpenCamera = async () => {
    setShowOptions(false);
    const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (!res.assets?.[0]) return;
    const asset = res.assets[0];
    const base64 = await convertToBase64(asset.uri!);
    const validation = validateFile(
      { name: asset.fileName, type: asset.type, size: asset.fileSize },
      { allowPdf: false, base64Data: base64 },
    );
    if (!validation.valid) {
      Toast.show({
        type: 'error',
        text1: `Image rejected: ${validation.reason}`,
        position: 'top',
      });
      return;
    }
    setPreviewUri(asset.uri!);
    onChange({ mime: asset.type || 'image/jpeg', data: base64 });
  };

  const handleRemove = () => {
    setPreviewUri(null);
    onChange(null);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        Store Image <Text style={styles.optional}>(Required)</Text>
      </Text>

      {previewUri ? (
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.thumbCard}
            onPress={() => setShowPreview(true)}
            activeOpacity={0.85}>
            <Image
              source={{ uri: previewUri }}
              style={styles.thumbImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={handleRemove}
              activeOpacity={0.8}>
              <X size={11} color="#fff" />
            </TouchableOpacity>
            <View style={styles.viewHint}>
              <Text style={styles.viewHintText}>View</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addTile}
          onPress={() => handleOpenCamera()}
          activeOpacity={0.75}>
          <View style={styles.addIconCircle}>
            <Upload size={18} color={Colors.darkButton} />
          </View>
          <Text style={styles.addTileHint}>Upload Store Image</Text>
        </TouchableOpacity>
      )}

      {!previewUri && (
        <Text style={styles.hint}>Tap to upload store image</Text>
      )}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}>
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.previewCloseBtn}
            onPress={() => setShowPreview(false)}>
            <X size={18} color="#fff" />
          </TouchableOpacity>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <Modal visible={showOptions} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
        />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Pressable style={styles.optionBtn} onPress={handlePickDocument}>
            <Text style={styles.optionText}>📁 Select from Drive</Text>
          </Pressable>
          <Pressable style={styles.optionBtn} onPress={handleOpenCamera}>
            <Text style={styles.optionText}>📷 Click Photo</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

export default StoreImagePicker;

const THUMB_SIZE = 100;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    marginBottom: 6,
    color: Colors.darkButton,
  },
  optional: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.error,
  },
  imageContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  thumbCard: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  viewHintText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: Fonts.medium,
  },
  addTile: {
    width: '100%',
    height: THUMB_SIZE,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fafafa',
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTileHint: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
  },
  hint: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    marginTop: 4,
  },
  errorText: { color: 'red', fontSize: 11, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  bottomSheet: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  optionBtn: { width: '100%', paddingVertical: 14, alignItems: 'center' },
  optionText: { fontSize: 14, fontWeight: '600' },

  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '75%',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
