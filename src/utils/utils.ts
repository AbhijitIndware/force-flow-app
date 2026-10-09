import {PermissionsAndroid, Platform} from 'react-native';
import {Dimensions} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export {windowHeight, windowWidth};

export const soStatusColors: Record<string, string> = {
  Draft: '#FACC15', // yellow
  Pending: '#FACC15', // same as Draft
  Approve: '#22C55E', // green
  Approved: '#22C55E', // green
  Reject: '#EF4444', // red
  Cancelled: '#EF4444', // same as Reject
  'To Deliver and Bill': '#22C55E',
  'To Receive and Bill': '#22C55E',
  Delivered: '#049a3bff', // green
};

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const auth = await Geolocation.requestAuthorization('whenInUse');
    return auth === 'granted';
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'We need your location for store check-in verification.',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return false;
}

// Accuracy (metres) we wait for before accepting a fix. Indoors the first fix is
// often a Wi-Fi / cell estimate that can be hundreds of metres off.
export const TARGET_LOCATION_ACCURACY = 30;
// Fixes worse than this are flagged to the user as low accuracy.
export const LOW_LOCATION_ACCURACY = 50;
const LOCATION_WAIT_MS = 15000;

export type AccuratePosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

// Watches GPS until a fix within `targetAccuracy` arrives or `maxWaitMs`
// elapses, then resolves with the most accurate fix seen.
const getAccuratePosition = (
  targetAccuracy = TARGET_LOCATION_ACCURACY,
  maxWaitMs = LOCATION_WAIT_MS,
): Promise<AccuratePosition> =>
  new Promise((resolve, reject) => {
    let best: AccuratePosition | null = null;
    let settled = false;
    let watchId: number | null = null;

    const finish = (error?: any) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (watchId !== null) Geolocation.clearWatch(watchId);
      if (best) resolve(best);
      else reject(error ?? {code: 3, message: 'Location request timed out'});
    };

    const timer = setTimeout(() => finish(), maxWaitMs);

    watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, accuracy} = position.coords;
        if (!best || accuracy < best.accuracy) {
          best = {latitude, longitude, accuracy};
        }
        if (accuracy <= targetAccuracy) finish();
      },
      error => {
        // Keep waiting on transient errors if we already have a fix.
        if (!best) finish(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 1000,
        fastestInterval: 500,
        forceRequestLocation: true,
        showLocationDialog: true,
      },
    );
  });

const timeoutError = () =>
  new Error(
    'Location request timed out. Please move to an open area and try again.',
  );

export const getCurrentPositionWithAccuracy =
  async (): Promise<AccuratePosition> => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    try {
      return await getAccuratePosition();
    } catch (error: any) {
      if (error?.code === 3) throw timeoutError();
      throw error;
    }
  };

export const getCurrentLocation = async (): Promise<string> => {
  const {latitude, longitude} = await getCurrentPositionWithAccuracy();
  return `${latitude},${longitude}`;
};

export const getCurrentLatLongWithAddress = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  const {latitude, longitude} = await getCurrentPositionWithAccuracy();
  return {latitude, longitude};
};

export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const apiKey = 'YOUR_GOOGLE_MAP_API_KEY';

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
    );

    const json = await response.json();

    if (json.status === 'OK' && json.results.length > 0) {
      return json.results[0].formatted_address;
    }

    return '';
  } catch {
    return '';
  }
};

export const uniqueByValue = <T extends {value: string}>(arr: T[]) => {
  const seen = new Set<string>();
  return arr.filter(i => {
    if (seen.has(i.value)) return false;
    seen.add(i.value);
    return true;
  });
};

export const getInitials = (name?: string) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getStoreLabel = (item: any) => {
  if (!item) return '';
  let label = item.store_name || '';
  if (item.pin_code) label += ` (${item.pin_code})`;
  if (item.store_type) label += ` — ${item.store_type}`;
  // if (item.created_by_employee_name)
  //   label += ` | ${item.created_by_employee_name}`;
  if (item.store_owner_name) label += ` (${item.store_owner_name})`;
  return label;
};

export const APP_VERSION = '5.8.0';
