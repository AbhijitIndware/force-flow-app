import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import InAppCamera, { CapturedPhotoFile } from './in-app-camera';

// Lets utils/launchCamera open the in-app camera from plain functions (no
// component state needed at the call site). Mount <InAppCameraHost /> once at
// the app root.
//
// iOS presents a Modal from the nearest view controller, and a controller that
// is already presenting a Modal can't present another. So a screen that is
// itself inside a Modal (e.g. AddExpenseModal) mounts its own host inside that
// Modal; the most recently mounted host handles the request.

interface CameraRequest {
  cameraType: 'front' | 'back';
  resolve: (file: CapturedPhotoFile | null) => void;
}

type Presenter = (request: CameraRequest) => void;

const presenters: Presenter[] = [];

// iOS also refuses to present while another Modal is still animating closed,
// which is what happens when a screen closes an options sheet / review modal
// and calls launchCamera in the same tick.
const IOS_PRESENT_DELAY_MS = 400;

// Resolves with the captured file, or null if the user closed the camera.
export const openInAppCamera = (
  cameraType: 'front' | 'back',
): Promise<CapturedPhotoFile | null> =>
  new Promise((resolve, reject) => {
    const present = presenters[presenters.length - 1];
    if (!present) {
      reject(new Error('Camera is not available. Please restart the app.'));
      return;
    }
    present({ cameraType, resolve });
  });

const InAppCameraHost: React.FC = () => {
  const [request, setRequest] = useState<CameraRequest | null>(null);
  // Don't render InAppCamera until the first photo is requested. Rendering it
  // loads react-native-vision-camera, which reads the Android camera list once,
  // when its module is first loaded. At app start CameraX hasn't finished
  // initialising, so that list is empty for the rest of the session and the
  // camera shows "No back camera found". Check-in screens never hit this
  // because they render the camera later.
  const [mounted, setMounted] = useState(false);
  const requestRef = useRef<CameraRequest | null>(null);
  const presentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = (file: CapturedPhotoFile | null) => {
    requestRef.current?.resolve(file);
    requestRef.current = null;
    setRequest(null);
  };

  useEffect(() => {
    const present: Presenter = next => {
      // A second request replaces the first, which counts as cancelled.
      requestRef.current?.resolve(null);
      requestRef.current = next;
      setMounted(true);
      if (presentTimer.current) {
        clearTimeout(presentTimer.current);
      }
      if (Platform.OS === 'ios') {
        presentTimer.current = setTimeout(() => {
          if (requestRef.current === next) {
            setRequest(next);
          }
        }, IOS_PRESENT_DELAY_MS);
      } else {
        setRequest(next);
      }
    };
    presenters.push(present);
    return () => {
      presenters.splice(presenters.indexOf(present), 1);
      if (presentTimer.current) {
        clearTimeout(presentTimer.current);
      }
      // The screen holding this host went away mid-capture.
      requestRef.current?.resolve(null);
      requestRef.current = null;
    };
  }, []);

  if (!mounted) {
    return null;
  }

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
