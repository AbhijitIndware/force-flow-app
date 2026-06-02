import {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isSlowNetwork: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
}

const SLOW_NETWORK_THRESHOLD = 1; // 1 Mbps

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isSlowNetwork: false,
    effectiveType: 'unknown',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? true;

      let effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown' = 'unknown';
      let isSlowNetwork = false;

      // Check for slow network based on connection type and speed
      if (state.type === 'cellular') {
        // 2G networks (EDGE, GPRS) - very slow
        if (state.details?.cellularGeneration === '2g') {
          effectiveType = 'slow-2g';
          isSlowNetwork = true;
        }
        // 3G networks (UMTS, HSPA) - moderate speed
        else if (state.details?.cellularGeneration === '3g') {
          effectiveType = '3g';
          isSlowNetwork = true;
        }
        // 4G/LTE - generally fast
        else if (state.details?.cellularGeneration === '4g') {
          effectiveType = '4g';
          isSlowNetwork = false;
        }
      } else if (state.type === 'wifi') {
        effectiveType = '4g';
        isSlowNetwork = false;
      } else if (state.type === 'unknown' || state.type === 'none') {
        isSlowNetwork = !isConnected;
      }

      setNetworkState({
        isConnected: isConnected,
        isSlowNetwork: isSlowNetwork,
        effectiveType: effectiveType,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkState;
};
