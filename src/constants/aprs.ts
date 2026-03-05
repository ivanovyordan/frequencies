import type { StaticChannel } from '../types/repeater';

// Standard European APRS frequencies (IARU Region 1)
export const APRS_CHANNELS: StaticChannel[] = [
  {
    callsign: 'APRS',
    place: 'APRS',
    freq: { rx: 144_800_000, tx: 144_800_000, tone: 0, channel: 'APRS' },
    modes: {
      fm: { enabled: true },
      dmr: { enabled: false, ts1_groups: '', ts2_groups: '', color_code: '', callid: '' },
      dstar: { enabled: false },
      fusion: { enabled: false },
      nxdn: { enabled: false },
      parrot: { enabled: false },
      beacon: { enabled: false },
    },
  },
  {
    callsign: 'APRS432',
    place: 'APRS',
    freq: { rx: 432_500_000, tx: 432_500_000, tone: 0, channel: 'APRS432' },
    modes: {
      fm: { enabled: true },
      dmr: { enabled: false, ts1_groups: '', ts2_groups: '', color_code: '', callid: '' },
      dstar: { enabled: false },
      fusion: { enabled: false },
      nxdn: { enabled: false },
      parrot: { enabled: false },
      beacon: { enabled: false },
    },
  },
];
