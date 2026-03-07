import type { Repeater, StaticChannel } from '../types/repeater';
import { buildCsvPlain } from '../utils/csv';
import { channelName } from '../utils/channelName';
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
  'Location', 'Name', 'Frequency', 'Duplex', 'Offset', 'Tone',
  'rToneFreq', 'cToneFreq', 'DtcsCode', 'DtcsPolarity', 'Mode',
  'TStep', 'Skip', 'Comment', 'URCALL', 'RPT1CALL', 'RPT2CALL', 'DVCODE',
];

function toRow(entry: Repeater | StaticChannel, location: number): (string | number)[] {
  // API naming is from the repeater's perspective:
  //   freq.rx = repeater input  = our TX
  //   freq.tx = repeater output = our RX
  const { rx: ourTx, tx: ourRx, tone, channel } = entry.freq;
  const place = entry.place ?? '';
  const toneFreq = tone > 0 ? tone : 88.5;
  return [
    location,
    channelName(entry).slice(0, 8).toUpperCase(),
    formatMhz(ourRx),
    toDuplex(ourRx, ourTx),
    toOffset(ourRx, ourTx),
    tone > 0 ? 'Tone' : '',
    toneFreq.toFixed(1),
    toneFreq.toFixed(1),
    '023',
    'NN',
    'FM',
    25,
    '',
    `${channel} ${place}`.trim(),
    '', '', '', '',
  ];
}

export function buildChirpCsv(entries: (Repeater | StaticChannel)[]): string {
  const rows: (string | number)[][] = [];
  let location = 0;
  for (const entry of entries) {
    // Only FM-capable entries go into the Chirp CSV
    if (entry.modes.fm.enabled) {
      rows.push(toRow(entry, location++));
    }
  }
  return buildCsvPlain(HEADER, rows);
}
