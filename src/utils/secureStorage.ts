import * as Keychain from 'react-native-keychain';
import {User} from '../types/authType';

export interface SecureSession {
  sid: string;
  emp_id?: string;
  api_key?: string;
  api_secret?: string;
  zone?: string;
  designation?: string;
  user?: User | null;
}

const KEYCHAIN_SERVICE = 'com.softsens.forceflow.auth';
const KEYCHAIN_USERNAME = 'forceflow-session';

let cachedSession: SecureSession | null = null;

// Prefer device-bound storage that never backs up / syncs to the cloud.
const keychainOptions = {
  service: KEYCHAIN_SERVICE,
  ...(Keychain.ACCESSIBLE
    ? {accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY}
    : {}),
};

function parse(raw: string): SecureSession | null {
  try {
    const data = JSON.parse(raw);
    if (data && typeof data.sid === 'string' && data.sid.length > 0) {
      return {
        sid: data.sid,
        emp_id: typeof data.emp_id === 'string' ? data.emp_id : undefined,
        api_key: typeof data.api_key === 'string' ? data.api_key : undefined,
        api_secret:
          typeof data.api_secret === 'string' ? data.api_secret : undefined,
        zone: typeof data.zone === 'string' ? data.zone : undefined,
        designation:
          typeof data.designation === 'string' ? data.designation : undefined,
        user: data.user ? data.user : null,
      };
    }
  } catch (error) {
    console.warn('secureStorage: failed to parse stored session', error);
  }
  return null;
}

export async function saveSecureSession(session: SecureSession): Promise<void> {
  cachedSession = session;
  try {
    await Keychain.setGenericPassword(
      KEYCHAIN_USERNAME,
      JSON.stringify(session),
      keychainOptions,
    );
  } catch (error) {
    console.warn('secureStorage: failed to write session to Keychain', error);
  }
}

export async function loadSecureSession(): Promise<SecureSession | null> {
  if (cachedSession) {
    return cachedSession;
  }
  try {
    const credentials = await Keychain.getGenericPassword(keychainOptions);
    if (credentials && typeof credentials.password === 'string') {
      cachedSession = parse(credentials.password);
    }
  } catch (error) {
    console.warn('secureStorage: failed to read session from Keychain', error);
  }
  return cachedSession;
}

export async function clearSecureSession(): Promise<void> {
  cachedSession = null;
  try {
    await Keychain.resetGenericPassword(keychainOptions);
  } catch (error) {
    console.warn('secureStorage: failed to clear session from Keychain', error);
  }
}

export function getCachedSecureSession(): SecureSession | null {
  return cachedSession;
}
