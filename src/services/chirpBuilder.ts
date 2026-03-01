import type { Repeater, StaticChannel, ChirpRow } from '../types/repeater';

const CHIRP_HEADER =
  'Location,Name,Frequency,Duplex,Offset,Tone,rToneFreq,cToneFreq,' +
  'DtcsCode,DtcsPolarity,Mode,TStep,Skip,Comment,URCALL,RPT1CALL,RPT2CALL,DVCODE';

// ── Name resolution ────────────────────────────────────────────────────────────

const NATIONAL_CH_RE = /^R(\d+)$/;

/** Returns the "R<n>" token if the channel string contains a national channel, else null. */
function getNationalToken(channelStr: string): string | null {
  for (const ch of channelStr.split(',').map((c) => c.trim())) {
    const m = NATIONAL_CH_RE.exec(ch);
    if (m && parseInt(m[1], 10) <= 12) return ch;
  }
  return null;
}

/**
 * Resolves the CHIRP Name field (max 8 chars) per entry type:
 *   National repeater → "R2" (the R-number token)
 *   Static channel    → callsign as-is ("PMR1", "145300", "433500", …)
 *   Other repeater    → callsign truncated to 8 chars
 */
function chirpName(entry: Repeater | StaticChannel): string {
  // National repeaters: prefer the R-number channel name
  const national = getNationalToken(entry.freq.channel);
  if (national) return national;

  // Static channels (no `disabled` field = simplex or PMR): callsign has no dots
  if (!('disabled' in entry)) return entry.callsign;

  // Regular repeater: use callsign
  return entry.callsign.slice(0, 8).toUpperCase();
}

// ── CSV row building ───────────────────────────────────────────────────────────

function hzToMhz(hz: number): number {
  return hz / 1_000_000;
}

function toDuplex(rx: number, tx: number): '' | '+' | '-' {
  if (tx === rx) return '';
  // CHIRP: Frequency column = RX. "+" means TX = RX + offset, "-" means TX = RX - offset.
  return tx > rx ? '+' : '-';
}

function toChirpRow(entry: Repeater | StaticChannel, index: number): ChirpRow {
  const { rx, tx, tone, channel } = entry.freq;
  const place = entry.place ?? '';

  return {
    Location: index,
    Name: chirpName(entry),
    Frequency: hzToMhz(rx),
    Duplex: toDuplex(rx, tx),
    Offset: hzToMhz(Math.abs(tx - rx)),
    Tone: tone > 0 ? 'Tone' : '',
    rToneFreq: tone > 0 ? tone : 88.5,
    cToneFreq: tone > 0 ? tone : 88.5,
    DtcsCode: 23,
    DtcsPolarity: 'NN',
    Mode: 'FM',
    TStep: 25,
    Skip: '',
    Comment: `${channel} ${place}`.trim(),
    URCALL: '',
    RPT1CALL: '',
    RPT2CALL: '',
    DVCODE: '',
  };
}

function rowToCsvLine(row: ChirpRow): string {
  return [
    row.Location,
    row.Name,
    row.Frequency.toFixed(6),
    row.Duplex,
    row.Offset.toFixed(6),
    row.Tone,
    row.rToneFreq.toFixed(1),
    row.cToneFreq.toFixed(1),
    String(row.DtcsCode).padStart(3, '0'),
    row.DtcsPolarity,
    row.Mode,
    row.TStep,
    row.Skip,
    row.Comment,
    row.URCALL,
    row.RPT1CALL,
    row.RPT2CALL,
    row.DVCODE,
  ].join(',');
}

export function buildChirpCsv(entries: (Repeater | StaticChannel)[]): string {
  const lines = [CHIRP_HEADER];
  let location = 0;
  for (const entry of entries) {
    // Only FM-capable entries go into the Chirp CSV
    if (entry.modes.fm.enabled) {
      lines.push(rowToCsvLine(toChirpRow(entry, location)));
      location++;
    }
  }
  return lines.join('\r\n');
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
