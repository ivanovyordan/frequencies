import type { Repeater } from '../types/repeater';

export function makeRepeater(overrides: Partial<Repeater> & { callsign: string }): Repeater {
  return {
    disabled: false,
    keeper: 'LZ1XX',
    latitude: 43.2,
    longitude: 27.9,
    altitude: 100,
    place: 'Варна',
    qth: 'Varna',
    freq: { rx: 431_100_000, tx: 438_700_000, tone: 88.5, channel: 'RU696' },
    modes: {
      fm: { enabled: true },
      dmr: { enabled: false, ts1_groups: '', ts2_groups: '', color_code: '1', callid: '' },
      dstar: { enabled: false },
      fusion: { enabled: false },
      nxdn: { enabled: false },
      parrot: { enabled: false },
      beacon: { enabled: false },
    },
    added: '2021-01-01',
    updated: '2024-01-01',
    ...overrides,
  };
}

export function makeDmrRepeater(overrides: Partial<Repeater> & { callsign: string }): Repeater {
  return makeRepeater({
    modes: {
      fm: { enabled: false },
      dmr: { enabled: true, ts1_groups: '284', ts2_groups: '2840', color_code: '1', callid: '' },
      dstar: { enabled: false },
      fusion: { enabled: false },
      nxdn: { enabled: false },
      parrot: { enabled: false },
      beacon: { enabled: false },
    },
    ...overrides,
  });
}

export function makeMixedRepeater(overrides: Partial<Repeater> & { callsign: string }): Repeater {
  return makeRepeater({
    modes: {
      fm: { enabled: true },
      dmr: { enabled: true, ts1_groups: '284', ts2_groups: '2840', color_code: '1', callid: '' },
      dstar: { enabled: false },
      fusion: { enabled: false },
      nxdn: { enabled: false },
      parrot: { enabled: false },
      beacon: { enabled: false },
    },
    ...overrides,
  });
}

export function makeNationalRepeater(
  channel: string,
  overrides: Partial<Repeater> & { callsign: string },
): Repeater {
  return makeRepeater({
    freq: { rx: 145_000_000, tx: 145_600_000, tone: 88.5, channel },
    ...overrides,
  });
}

export const VARNA_COORDS = { latitude: 43.2, longitude: 27.9 };
export const NO_COORDS = { latitude: null, longitude: null };
