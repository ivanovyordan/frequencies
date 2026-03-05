import type { ContactListSettings } from '../types/repeater';
import { useLocalStorage } from './useLocalStorage';

export function useContactList() {
  return useLocalStorage<ContactListSettings>('freq_contact_list', {
    enabled: false,
    scope: 'bulgaria',
  });
}
