import RNFS from 'react-native-fs';
import type {
  Asset,
  Callback,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { openInAppCamera } from '../components/ui-lib/in-app-camera-host';

// Opens the in-app camera (the same one used for store / promoter check-in)
// instead of the phone's Camera app. With the phone's Camera app our Activity
// goes to the background, and if the user takes too long Android kills the
// process and the app restarts. Same signature and response shape as
// image-picker's launchCamera, so callers don't change.
//
// Only cameraType and includeBase64 are honoured; the in-app camera already
// captures at a reduced size (see in-app-camera.tsx).
export const launchCamera = async (
  options: CameraOptions,
  callback?: Callback,
): Promise<ImagePickerResponse> => {
  let response: ImagePickerResponse;
  try {
    const file = await openInAppCamera(options.cameraType ?? 'back');
    if (!file) {
      response = { didCancel: true };
    } else {
      const asset: Asset = {
        uri: file.uri,
        type: 'image/jpeg',
        fileName: file.uri.split('/').pop(),
        fileSize: file.fileSize,
        width: file.width,
        height: file.height,
      };
      if (options.includeBase64) {
        asset.base64 = await RNFS.readFile(file.uri, 'base64');
      }
      response = { assets: [asset] };
    }
  } catch (err: any) {
    response = {
      errorCode: 'others',
      errorMessage: err?.message || 'The photo could not be taken. Please try again.',
    };
  }
  callback?.(response);
  return response;
};
