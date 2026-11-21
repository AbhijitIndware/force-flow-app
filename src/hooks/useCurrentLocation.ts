import {useCallback, useEffect, useRef, useState} from 'react';
import {getCurrentLocation} from '../utils/utils';

// Longest a store list waits for a fix before loading without one.
const MAX_WAIT_MS = 6000;
// A new fix only replaces the old one after this much movement, so a
// refresh while standing still doesn't refetch the list.
const MIN_MOVE_M = 25;

const toPoint = (loc?: string) => {
  const [lat, lon] = (loc ?? '').split(',').map(Number);
  return Number.isFinite(lat) && Number.isFinite(lon) ? {lat, lon} : null;
};

const metresBetween = (a?: string, b?: string) => {
  const p = toPoint(a);
  const q = toPoint(b);
  if (!p || !q) return Infinity;
  const rad = Math.PI / 180;
  const dLat = (q.lat - p.lat) * rad;
  const dLon = (q.lon - p.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p.lat * rad) * Math.cos(q.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

const readLocation = () =>
  Promise.race<string | undefined>([
    getCurrentLocation({fast: true}).catch(() => undefined),
    new Promise(resolve => setTimeout(() => resolve(undefined), MAX_WAIT_MS)),
  ]);

// The phone's position as "lat,lon", for the store lists that return the
// nearest stores first. `here` is undefined when location isn't available;
// the lists then load as before. `locating` is true only for the first read.
export const useCurrentLocation = (enabled = true) => {
  const [here, setHere] = useState<string | undefined>();
  const [locating, setLocating] = useState(enabled);
  const hereRef = useRef<string | undefined>(undefined);

  const refresh = useCallback(async () => {
    const next = await readLocation();
    if (next && metresBetween(hereRef.current, next) >= MIN_MOVE_M) {
      hereRef.current = next;
      setHere(next);
    }
    return hereRef.current;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLocating(false);
      return;
    }
    let active = true;
    refresh().finally(() => active && setLocating(false));
    return () => {
      active = false;
    };
  }, [enabled, refresh]);

  return {here, locating, refresh};
};
