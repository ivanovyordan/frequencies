import type { CustomChannel } from '../types/repeater';
import { useLocalStorage } from './useLocalStorage';

export function useCustomChannels() {
  return useLocalStorage<CustomChannel[]>('freq_custom_channels', []);
}
