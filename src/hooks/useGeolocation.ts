import { useState, useCallback } from 'react';
import type { Coordinates } from '../types/repeater';

export interface UseGeolocationResult {
  coords: Coordinates;
  geoLoading: boolean;
  geoError: string | null;
  findMe: () => void;
  setCoords: (c: Coordinates) => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<Coordinates>({ latitude: null, longitude: null });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const findMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Геолокацията не се поддържа от браузъра');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        setGeoError(`Неуспешна геолокация: ${err.message}`);
        setGeoLoading(false);
      },
      { timeout: 10_000 },
    );
  }, []);

  return { coords, geoLoading, geoError, findMe, setCoords };
}
