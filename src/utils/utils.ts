import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
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
    const {ACCESS_FINE_LOCATION: FINE, ACCESS_COARSE_LOCATION: COARSE} =
      PermissionsAndroid.PERMISSIONS;
    const {GRANTED, NEVER_ASK_AGAIN} = PermissionsAndroid.RESULTS;

    // Already granted: skip the prompt (avoids repeated dialogs).
    if (await PermissionsAndroid.check(FINE)) return true;

    // Android 12+ ignores a FINE-only request; FINE and COARSE must be
    // requested together. The user may also choose "Approximate", which grants
    // only COARSE — accept it (fixes will be less accurate and are flagged).
    const result = await PermissionsAndroid.requestMultiple([FINE, COARSE]);
    if (result[FINE] === GRANTED || result[COARSE] === GRANTED) return true;

    if (result[FINE] === NEVER_ASK_AGAIN || result[COARSE] === NEVER_ASK_AGAIN) {
      Alert.alert(
        'Location permission required',
        'Location access is blocked. Please enable it in App Settings > Permissions > Location.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ],
      );
    }
    return false;
  }

  return false;
}

// Accuracy (metres) we wait for before accepting a fix. Indoors the first fix is
// often a Wi-Fi / cell estimate that can be hundreds of metres off.
export const TARGET_LOCATION_ACCURACY = 30;
// Fixes worse than this are flagged to the user as low accuracy.
export const LOW_LOCATION_ACCURACY = 50;
const LOCATION_WAIT_MS = 20000;
// Max age of a cached fix we accept as an initial seed while GPS warms up.
const SEED_MAX_AGE_MS = 60000;
const FALLBACK_WAIT_MS = 10000;

export type AccuratePosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

// Errors that will not resolve by waiting longer (permission denied,
// location settings off / not satisfied).
const isFatalLocationError = (error: any) =>
  error?.code === 1 || error?.code === 5;

const getSinglePosition = (
  options: Parameters<typeof Geolocation.getCurrentPosition>[2],
): Promise<AccuratePosition> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude, accuracy} = position.coords;
        resolve({latitude, longitude, accuracy});
      },
      reject,
      options,
    );
  });

// Watches GPS until a fix within `targetAccuracy` arrives or `maxWaitMs`
// elapses, then resolves with the most accurate fix seen. A quick
// cached/network fix seeds the result so a cold GPS doesn't cause a failure.
const getAccuratePosition = (
  targetAccuracy = TARGET_LOCATION_ACCURACY,
  maxWaitMs = LOCATION_WAIT_MS,
): Promise<AccuratePosition> =>
  new Promise((resolve, reject) => {
    let best: AccuratePosition | null = null;
    let lastError: any = null;
    let settled = false;
    let watchId: number | null = null;

    const consider = (pos: AccuratePosition) => {
      if (settled) return;
      if (!best || pos.accuracy < best.accuracy) best = pos;
      if (pos.accuracy <= targetAccuracy) finish();
    };

    const finish = (error?: any) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (watchId !== null) Geolocation.clearWatch(watchId);
      if (best) resolve(best);
      else
        reject(
          error ?? lastError ?? {code: 3, message: 'Location request timed out'},
        );
    };

    const timer = setTimeout(() => finish(), maxWaitMs);

    // Seed with a recent cached / network fix (returns almost instantly).
    getSinglePosition({
      enableHighAccuracy: false,
      timeout: maxWaitMs,
      maximumAge: SEED_MAX_AGE_MS,
    })
      .then(consider)
      .catch(() => {});

    watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, accuracy} = position.coords;
        consider({latitude, longitude, accuracy});
      },
      error => {
        // Only abort on unrecoverable errors; otherwise keep waiting.
        if (isFatalLocationError(error)) finish(error);
        else lastError = error;
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

// Turn raw geolocation error codes into messages a field user can act on.
const toLocationError = (error: any): Error => {
  switch (error?.code) {
    case 1:
      return new Error(
        'Location permission denied. Please allow location access for this app.',
      );
    case 2:
      return new Error(
        'Location unavailable. Please turn on Location (GPS) and try again.',
      );
    case 4:
      return new Error(
        'Google Play Services is unavailable or outdated. Please update it and try again.',
      );
    case 5:
      return new Error(
        'Location is turned off. Please turn on Location (GPS) and try again.',
      );
    default:
      return timeoutError();
  }
};

export type LocationRequestOptions = {
  // Resolve with the first fix of any accuracy (for background lookups such
  // as listing nearby stores, where speed matters more than precision).
  fast?: boolean;
};

export const getCurrentPositionWithAccuracy = async (
  {fast = false}: LocationRequestOptions = {},
): Promise<AccuratePosition> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission not granted');
  }

  try {
    return fast
      ? await getAccuratePosition(Infinity, FALLBACK_WAIT_MS)
      : await getAccuratePosition();
  } catch (error: any) {
    if (isFatalLocationError(error)) throw toLocationError(error);
    // Last resort: network / Wi-Fi based fix (may be less accurate).
    try {
      return await getSinglePosition({
        enableHighAccuracy: false,
        timeout: FALLBACK_WAIT_MS,
        maximumAge: SEED_MAX_AGE_MS,
        forceRequestLocation: true,
      });
    } catch (fallbackError: any) {
      throw toLocationError(
        isFatalLocationError(fallbackError) ? fallbackError : error,
      );
    }
  }
};

export const getCurrentLocation = async (
  options?: LocationRequestOptions,
): Promise<string> => {
  const {latitude, longitude} = await getCurrentPositionWithAccuracy(options);
  return `${latitude},${longitude}`;
};

export const getCurrentLatLongWithAddress = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  const {latitude, longitude} = await getCurrentPositionWithAccuracy();
  return {latitude, longitude};
};

// export const getAddressFromCoordinates = async (
//   latitude: number,
//   longitude: number,
// ): Promise<string> => {
//   try {
//     const apiKey = 'YOUR_GOOGLE_MAP_API_KEY';

//     const response = await fetch(
//       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
//     );

//     const json = await response.json();

//     if (json.status === 'OK' && json.results.length > 0) {
//       return json.results[0].formatted_address;
//     }

//     return '';
//   } catch {
//     return '';
//   }
// };

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

export const APP_VERSION = '6.1.0';
