import React, { useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import InAppCamera, { CapturedPhotoFile } from './in-app-camera';

// Lets utils/launchCamera open the in-app camera from plain functions (no
// component state needed at the call site). Mount <InAppCameraHost /> once at
// the app root.

interface CameraRequest {
  cameraType: 'front' | 'back';
  resolve: (file: CapturedPhotoFile | null) => void;
}

let presentCamera: ((request: CameraRequest) => void) | null = null;

// Resolves with the captured file, or null if the user closed the camera.
export const openInAppCamera = (
  cameraType: 'front' | 'back',
): Promise<CapturedPhotoFile | null> =>
  new Promise((resolve, reject) => {
    if (!presentCamera) {
      reject(new Error('Camera is not available. Please restart the app.'));
      return;
    }
    presentCamera({ cameraType, resolve });
  });

const InAppCameraHost: React.FC = () => {
  const [request, setRequest] = useState<CameraRequest | null>(null);
  const requestRef = useRef<CameraRequest | null>(null);

  const finish = (file: CapturedPhotoFile | null) => {
    requestRef.current?.resolve(file);
    requestRef.current = null;
    setRequest(null);
  };

  useEffect(() => {
    presentCamera = next => {
      // A second request replaces the first, which counts as cancelled.
      requestRef.current?.resolve(null);
      requestRef.current = next;
      setRequest(next);
    };
    return () => {
      presentCamera = null;
    };
  }, []);

  return (
    <InAppCamera
      visible={!!request}
      cameraType={request?.cameraType ?? 'back'}
      onClose={() => finish(null)}
      onCaptureFile={finish}
      onError={message => Toast.show({ type: 'error', text1: message })}
    />
  );
};

export default InAppCameraHost;
