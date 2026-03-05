import type { RadioId } from '../types/repeater';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT: RadioId = { callsign: '', dmrId: '' };

export function useRadioId() {
  return useLocalStorage<RadioId>('freq_radio_id', DEFAULT);
}
