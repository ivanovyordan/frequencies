import type { StaticChannel } from '../types/repeater';

// EU PMR446 (8 channels, 12.5 kHz spacing starting at 446.00625 MHz)
const PMR_FREQS_MHZ = [
  446.00625, 446.01875, 446.03125, 446.04375, 446.05625, 446.06875, 446.08125, 446.09375,
];

export const PMR_CHANNELS: StaticChannel[] = PMR_FREQS_MHZ.map((mhz, i) => {
  const hz = Math.round(mhz * 1_000_000);
  return {
    callsign: `PMR${i + 1}`,
    place: 'PMR446',
    freq: { rx: hz, tx: hz, tone: 0, channel: `PMR${i + 1}` },
    modes: {
      fm: { enabled: true },
      dmr: { enabled: false, ts1_groups: '', ts2_groups: '', color_code: '', callid: '' },
      dstar: { enabled: false },
      fusion: { enabled: false },
      nxdn: { enabled: false },
      parrot: { enabled: false },
      beacon: { enabled: false },
    },
  };
});
