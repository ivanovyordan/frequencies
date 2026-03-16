import type { AprsSettings } from '../types/repeater';
import { useLocalStorage } from './useLocalStorage';

export function useAprsSettings() {
  return useLocalStorage<AprsSettings>('freq_aprs_settings', { autoTxInterval: 180 });
}
