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
  Reject: '#EF4444', // red
  Cancelled: '#EF4444', // same as Reject
  'To Deliver and Bill': '#22C55E',
  'To Receive and Bill': '#22C55E',
  Delivered: '#22C55E', // green
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

const getPositionWithRetry = async (
  retries = 1,
): Promise<{latitude: number; longitude: number}> => {
  try {
    return await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({latitude, longitude});
        },
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 20000, // ⏱️ increased
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        },
      );
    });
  } catch (error: any) {
    // ⏱️ Retry once on timeout
    if (error?.code === 3 && retries > 0) {
      return getPositionWithRetry(retries - 1);
    }
    throw error;
  }
};

export const getCurrentLocation = async (): Promise<string> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission not granted');
  }

  try {
    const {latitude, longitude} = await getPositionWithRetry();
    return `${latitude},${longitude}`;
  } catch (error: any) {
    if (error?.code === 3) {
      throw new Error(
        'Location request timed out. Please move to an open area and try again.',
      );
    }
    throw error;
  }
};

export const getCurrentLatLongWithAddress = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission not granted');
  }

  try {
    return await getPositionWithRetry();
  } catch (error: any) {
    if (error?.code === 3) {
      throw new Error(
        'Location request timed out. Please move to an open area and try again.',
      );
    }
    throw error;
  }
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
  } catch (error) {
    console.log('Reverse geocoding error:', error);
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
