import type {Asset, CameraOptions} from 'react-native-image-picker';

// Keeping attendance photos below this size prevents the Base64 image, its
// preview URI, and the JSON request body from exhausting memory on Android.
export const MAX_ATTENDANCE_IMAGE_BYTES = 2 * 1024 * 1024;

export const attendanceCameraOptions: CameraOptions = {
  mediaType: 'photo',
  cameraType: 'back',
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.6,
  includeBase64: true,
  saveToPhotos: false,
};

export interface AttendanceImage {
  mime: string;
  data: string;
}

type AttendanceImageResult =
  | {image: AttendanceImage; error?: never}
  | {image?: never; error: string};

export const getBase64ByteSize = (data: string): number => {
  const raw = data.includes(',') ? data.slice(data.indexOf(',') + 1) : data;
  const padding = raw.endsWith('==') ? 2 : raw.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((raw.length * 3) / 4) - padding);
};

export const getAttendanceImage = (
  asset: Asset | undefined,
): AttendanceImageResult => {
  if (!asset?.base64 || !asset.type) {
    return {error: 'The photo could not be processed. Please take it again.'};
  }

  const size = asset.fileSize ?? getBase64ByteSize(asset.base64);
  if (size > MAX_ATTENDANCE_IMAGE_BYTES) {
    return {
      error: 'The photo is too large. Please retake it before submitting.',
    };
  }

  return {
    image: {
      data: asset.base64,
      mime: asset.type,
    },
  };
};
