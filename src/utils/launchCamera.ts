import {PermissionsAndroid, Platform} from 'react-native';
import {
  launchCamera as launchImagePickerCamera,
  type Callback,
  type CameraOptions,
  type ImagePickerResponse,
} from 'react-native-image-picker';

// The manifest declares android.permission.CAMERA (needed by
// react-native-vision-camera). Once it is declared, image-picker's launchCamera
// refuses to open until the permission is granted at runtime, so request it
// first. Same signature as image-picker's launchCamera, so it is a drop-in swap.
export const launchCamera = async (
  options: CameraOptions,
  callback?: Callback,
): Promise<ImagePickerResponse> => {
  if (Platform.OS === 'android') {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (status !== PermissionsAndroid.RESULTS.GRANTED) {
      const response: ImagePickerResponse = {
        errorCode: 'permission',
        errorMessage:
          'Camera permission is required. Please allow it in Settings → Apps → ForceFlow → Permissions.',
      };
      callback?.(response);
      return response;
    }
  }
  return launchImagePickerCamera(options, callback);
};
