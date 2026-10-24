import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { X } from 'lucide-react-native';
import { Colors } from '../../utils/colors';
import { Fonts } from '../../constants';
import { Size } from '../../utils/fontSize';
import { AttendanceImage, getAttendanceImage } from '../../utils/attendanceImage';

// Capturing inside the app (instead of launching the phone's Camera app via
// react-native-image-picker) keeps our Activity in the foreground, so Android
// can't kill the process mid-capture and restart the app on the Home screen.

interface Props {
  visible: boolean;
  cameraType: 'front' | 'back';
  onClose: () => void;
  onCapture: (image: AttendanceImage) => void;
  onError: (message: string) => void;
}

const InAppCamera: React.FC<Props> = ({
  visible,
  cameraType,
  onClose,
  onCapture,
  onError,
}) => {
  const cameraRef = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(cameraType);
  // Matches the old image-picker maxWidth/maxHeight so photos stay well under
  // MAX_ATTENDANCE_IMAGE_BYTES.
  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 960 } },
  ]);

  useEffect(() => {
    if (visible && !hasPermission) {
      requestPermission();
    }
  }, [visible, hasPermission, requestPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state =>
      setAppActive(state === 'active'),
    );
    return () => sub.remove();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) {
      return;
    }
    setCapturing(true);
    try {
      // useCameraFormat is only a preference: on devices without a small photo
      // format takePhoto returns a full-resolution JPEG (often > 2 MB) with no
      // way to compress it. On Android, snapshot the preview instead, which is
      // screen-sized and JPEG-compressed. iOS snapshots need video, so keep
      // takePhoto there.
      const photo =
        Platform.OS === 'android'
          ? await cameraRef.current.takeSnapshot({ quality: 70 })
          : await cameraRef.current.takePhoto({ flash: 'off' });
      const path = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      const base64 = await RNFS.readFile(path, 'base64');
      RNFS.unlink(path).catch(() => {});

      const result = getAttendanceImage({ base64, type: 'image/jpeg' });
      if (result.image) {
        onCapture(result.image);
      } else {
        onError(result.error);
      }
      onClose();
    } catch (err: any) {
      console.warn('Camera capture error: ', err?.message);
      onError('The photo could not be taken. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const renderBody = () => {
    if (!hasPermission) {
      return (
        <View style={styles.centered}>
          <Text style={styles.message}>Camera permission is required to take a photo.</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!device) {
      return (
        <View style={styles.centered}>
          <Text style={styles.message}>No {cameraType} camera found on this device.</Text>
        </View>
      );
    }
    return (
      <>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          format={format}
          isActive={visible && appActive}
          photo
          photoQualityBalance="speed"
        />
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.shutterOuter}
            onPress={handleCapture}
            disabled={capturing}>
            {capturing ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        {renderBody()}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={capturing}>
          <X size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default InAppCamera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  message: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: Size.sm,
    textAlign: 'center',
  },
  settingsBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.darkButton,
  },
  settingsText: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
  },
  closeBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
  },
});
