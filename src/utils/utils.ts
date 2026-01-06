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

export const getCurrentLocation = async (): Promise<string> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Location permission not granted');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        resolve(`${latitude},${longitude}`);
      },
      error => {
        console.error('❌ Geolocation error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true, // fixes "no provider" sometimes
        showLocationDialog: true, // shows "Turn on GPS" dialog
      },
    );
  });
};

export const uniqueByValue = <T extends {value: string}>(arr: T[]) => {
  const seen = new Set<string>();
  return arr.filter(i => {
    if (seen.has(i.value)) return false;
    seen.add(i.value);
    return true;
  });
};
