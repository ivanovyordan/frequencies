import type { RadioChannel } from '../types/channel';
import { buildCsvPlain } from '../utils/csv';
import { formatMhz } from '../utils/freq';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** CHIRP duplex direction: stationRx is the Frequency column, stationTx is where we transmit. */
function toDuplex(stationRx: number, stationTx: number): '' | '+' | '-' | 'split' {
  if (stationTx === stationRx) return '';
  // Cross-band (e.g. 2m RX / 70cm TX): CHIRP "split" puts the TX freq in the Offset column.
  if (Math.abs(stationRx - stationTx) > 10_000_000) return 'split';
  return stationTx > stationRx ? '+' : '-';
}

/** For split channels the Offset column holds the TX frequency; otherwise the delta. */
function toOffset(stationRx: number, stationTx: number): string {
  if (Math.abs(stationRx - stationTx) > 10_000_000) return formatMhz(stationTx);
  return formatMhz(Math.abs(stationRx - stationTx));
}

// ── CSV building ───────────────────────────────────────────────────────────────

const HEADER = [
  'Location',
  'Name',
  'Frequency',
  'Duplex',
  'Offset',
  'Tone',
  'rToneFreq',
  'cToneFreq',
  'DtcsCode',
  'DtcsPolarity',
  'Mode',
  'TStep',
  'Skip',
  'Comment',
  'URCALL',
  'RPT1CALL',
  'RPT2CALL',
  'DVCODE',
];

function toRow(channel: RadioChannel, location: number): (string | number)[] {
  const { rx, tx, ctcss } = channel;
  const toneFreq = ctcss > 0 ? ctcss : 88.5;
  return [
    location,
    channel.name.slice(0, 8).toUpperCase(),
    formatMhz(rx),
    toDuplex(rx, tx),
    toOffset(rx, tx),
    ctcss > 0 ? 'Tone' : '',
    toneFreq.toFixed(1),
    toneFreq.toFixed(1),
    '023',
    'NN',
    'FM',
    25,
    channel.place === 'PMR446' ? 'S' : '',
    channel.place,
    '',
    '',
    '',
    '',
  ];
}

export function buildChirpCsv(channels: RadioChannel[]): string {
  const rows: (string | number)[][] = [];
  let location = 0;
  for (const channel of channels) {
    // Pure digital channels (dmr set but NOT mixed-mode) are skipped entirely
    if (channel.dmr && !channel.dmr.mixedMode) continue;
    // Mixed-mode (dmr exists but also has FM) and pure FM channels are included as analog
    rows.push(toRow(channel, location++));
  }
  return buildCsvPlain(HEADER, rows);
}
