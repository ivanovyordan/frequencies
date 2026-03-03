import type { Repeater, StaticChannel } from '../types/repeater';
import { buildCsv } from '../utils/csv';
import { channelName } from '../utils/channelName';
import { formatMhz } from '../utils/freq';

// ── Helpers ────────────────────────────────────────────────────────────────────

function toDuplex(rx: number, tx: number): '' | '+' | '-' {
  if (tx === rx) return '';
  // CHIRP: Frequency column = RX. "+" means TX = RX + offset, "-" means TX = RX - offset.
  return tx > rx ? '+' : '-';
}

// ── CSV building ───────────────────────────────────────────────────────────────

const HEADER = [
  'Location', 'Name', 'Frequency', 'Duplex', 'Offset', 'Tone',
  'rToneFreq', 'cToneFreq', 'DtcsCode', 'DtcsPolarity', 'Mode',
  'TStep', 'Skip', 'Comment', 'URCALL', 'RPT1CALL', 'RPT2CALL', 'DVCODE',
];

function toRow(entry: Repeater | StaticChannel, location: number): (string | number)[] {
  const { rx, tx, tone, channel } = entry.freq;
  const place = entry.place ?? '';
  const toneFreq = tone > 0 ? tone : 88.5;
  return [
    location,
    channelName(entry).slice(0, 8).toUpperCase(),
    formatMhz(rx),
    toDuplex(rx, tx),
    formatMhz(Math.abs(tx - rx)),
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
  return buildCsv(HEADER, rows);
}
