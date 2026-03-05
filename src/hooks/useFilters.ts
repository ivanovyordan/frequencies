import { useCallback, useMemo } from 'react';
import type { FilterState, SoftwareOption } from '../types/repeater';
import { useLocalStorage } from './useLocalStorage';

// These toggles are incompatible with Chirp (analog-only software)
const CHIRP_DISABLED: ReadonlyArray<keyof FilterState> = ['dmr', 'aprs'];

const DEFAULT_FILTERS: FilterState = {
  national: true,
  analog: true,
  dmr: false,
  parrot: false,
  simplex: false,
  pmr: false,
  aprs: false,
};

export interface UseFiltersResult {
  filters: FilterState;
  disabledKeys: ReadonlySet<keyof FilterState>;
  software: SoftwareOption;
  onToggle: (key: keyof FilterState) => void;
  onSoftwareChange: (v: SoftwareOption) => void;
}

export function useFilters(): UseFiltersResult {
  const [filters, setFilters] = useLocalStorage<FilterState>('freq_filters', DEFAULT_FILTERS);
  const [software, setSoftware] = useLocalStorage<SoftwareOption>('freq_software', 'none');

  const disabledKeys = useMemo<ReadonlySet<keyof FilterState>>(
    () => (software === 'chirp' ? new Set(CHIRP_DISABLED) : new Set()),
    [software],
  );

  const onToggle = useCallback(
    (key: keyof FilterState) => {
      if (disabledKeys.has(key)) return;
      setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [disabledKeys, setFilters],
  );

  const onSoftwareChange = useCallback((v: SoftwareOption) => {
    setSoftware(v);
    if (v === 'chirp') {
      setFilters((prev) => {
        const next = { ...prev };
        for (const k of CHIRP_DISABLED) {
          next[k] = false;
        }
        return next;
      });
    }
  }, [setFilters, setSoftware]);

  return { filters, disabledKeys, software, onToggle, onSoftwareChange };
}
