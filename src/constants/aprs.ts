import type { StaticChannel, RepeaterModes } from '../types/repeater';

const APRS_MODES: RepeaterModes = {
  fm: { enabled: true },
  dmr: { enabled: false, ts1_groups: '', ts2_groups: '', color_code: '', callid: '' },
  dstar: { enabled: false },
  fusion: { enabled: false },
  nxdn: { enabled: false },
  parrot: { enabled: false },
  beacon: { enabled: false },
};

function makeAprs(name: string, freqMhz: number): StaticChannel {
  const hz = Math.round(freqMhz * 1_000_000);
  return {
    callsign: name,
    place: 'APRS',
    freq: { rx: hz, tx: hz, tone: 0, channel: name },
    modes: APRS_MODES,
    pttProhibit: true,
  };
}

// Standard European APRS frequencies (IARU Region 1)
export const APRS_CHANNELS: StaticChannel[] = [
  makeAprs('APRS',     144.800),         // VHF primary (EU/AF)
  makeAprs('APRS ISS', 145.825),        // ISS / satellite
  makeAprs('APRS UHF', 432.500),        // UHF packet
];
