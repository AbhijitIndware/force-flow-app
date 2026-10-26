import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  CameraDevice,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { SwitchCamera, X } from 'lucide-react-native';
import { Colors } from '../../utils/colors';
import { Fonts } from '../../constants';
import { Size } from '../../utils/fontSize';
import { AttendanceImage, getAttendanceImage } from '../../utils/attendanceImage';

// Capturing inside the app (instead of launching the phone's Camera app via
// react-native-image-picker) keeps our Activity in the foreground, so Android
// can't kill the process mid-capture and restart the app on the Home screen.

export interface CapturedPhotoFile {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}

// vision-camera 4.x on Android (new arch) reads the device list before CameraX
// has initialised, caches that empty list, and never re-sends it, so
// useCameraDevice can stay undefined for the whole session. The native view
// only needs `id` (it opens the camera with CameraSelector.byId), so fall back
// to the standard Camera2 ids: "0" is the main back camera and "1" the main
// front camera on practically every Android phone.
const androidFallbackDevice = (facing: 'front' | 'back'): CameraDevice =>
  ({ id: facing === 'back' ? '0' : '1', position: facing } as CameraDevice);

interface Props {
  visible: boolean;
  cameraType: 'front' | 'back';
  onClose: () => void;
  onCapture?: (image: AttendanceImage) => void;
  // When set, the photo is kept on disk and handed over as a file instead of
  // being converted to an AttendanceImage. Used by utils/launchCamera.
  onCaptureFile?: (file: CapturedPhotoFile) => void;
  onError: (message: string) => void;
}

const InAppCamera: React.FC<Props> = ({
  visible,
  cameraType,
  onClose,
  onCapture,
  onCaptureFile,
  onError,
}) => {
  const cameraRef = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);
  // Shown inside the camera: a Toast would render behind this Modal.
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionAsked, setPermissionAsked] = useState(false);
  // Only 'background' pauses the camera. At app start currentState can still be
  // 'unknown' / null, and the root-mounted InAppCameraHost would otherwise keep
  // the camera inactive (black preview) until the app changed state once.
  const [appActive, setAppActive] = useState(AppState.currentState !== 'background');

  // cameraType is the starting side; the user can flip it while capturing.
  const [facing, setFacing] = useState<'front' | 'back'>(cameraType);

  const { hasPermission, requestPermission } = useCameraPermission();
  const listedDevice = useCameraDevice(facing);
  const device = useMemo(
    () =>
      listedDevice ?? (Platform.OS === 'android' ? androidFallbackDevice(facing) : undefined),
    [listedDevice, facing],
  );
  // Matches the old image-picker maxWidth/maxHeight so photos stay well under
  // MAX_ATTENDANCE_IMAGE_BYTES.
  // Formats only exist on a listed device; the fallback runs with the default.
  const format = useCameraFormat(listedDevice, [
    { photoResolution: { width: 1280, height: 960 } },
  ]);

  useEffect(() => {
    if (visible && !hasPermission) {
      requestPermission().finally(() => setPermissionAsked(true));
    }
  }, [visible, hasPermission, requestPermission]);

  useEffect(() => {
    if (visible) {
      setFacing(cameraType);
      setAppActive(AppState.currentState !== 'background');
      setCameraError(null);
    }
  }, [visible, cameraType]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state =>
      setAppActive(state !== 'background'),
    );
    return () => sub.remove();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) {
      return;
    }
    setCapturing(true);
    setCameraError(null);
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

      if (onCaptureFile) {
        const { size } = await RNFS.stat(path);
        onCaptureFile({ uri: path, width: photo.width, height: photo.height, fileSize: size });
        onClose();
        return;
      }

      const base64 = await RNFS.readFile(path, 'base64');
      RNFS.unlink(path).catch(() => {});

      const result = getAttendanceImage({ base64, type: 'image/jpeg' });
      if (result.image) {
        onCapture?.(result.image);
      } else {
        onError(result.error);
      }
      onClose();
    } catch (err: any) {
      console.warn('Camera capture error: ', err?.message);
      setCameraError('The photo could not be taken. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const toggleFacing = () => {
    setCameraError(null);
    setFacing(prev => (prev === 'front' ? 'back' : 'front'));
  };

  // A capture in progress would otherwise finish after the camera closed.
  const handleClose = () => {
    if (!capturing) {
      onClose();
    }
  };

  const renderBody = () => {
    if (!hasPermission && !permissionAsked) {
      // The system permission dialog is still open.
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.white} />
        </View>
      );
    }
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
          <Text style={styles.message}>No {facing} camera found on this device.</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={toggleFacing}>
            <Text style={styles.settingsText}>
              Use {facing === 'front' ? 'back' : 'front'} camera
            </Text>
          </TouchableOpacity>
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
          onError={error => {
            console.warn('Camera error: ', error.code, error.message);
            setCameraError('The camera could not start. Please close it and try again.');
          }}
        />
        <View style={styles.footer}>
          {cameraError && <Text style={styles.errorBanner}>{cameraError}</Text>}
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
          <TouchableOpacity
            style={styles.flipBtn}
            onPress={toggleFacing}
            disabled={capturing}>
            <SwitchCamera size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.container}>
        {renderBody()}
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} disabled={capturing}>
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
  errorBanner: {
    marginBottom: 16,
    marginHorizontal: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(220,38,38,0.9)',
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    textAlign: 'center',
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
  flipBtn: {
    position: 'absolute',
    // Vertically centred on the 76px shutter: (76 - (28 + 2 * 12)) / 2
    top: 12,
    right: 40,
    padding: 12,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
  },
});
