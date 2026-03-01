import JSZip from 'jszip';
import type { Repeater, StaticChannel, RepeaterModeDMR } from '../types/repeater';
import { BG_DMR_TALKGROUPS } from '../constants/dmrTalkGroups';

// ── Internal types ─────────────────────────────────────────────────────────────

interface AnalogCh {
  name: string;
  rx: number; // Hz
  tx: number; // Hz
  ctcss: number; // Hz, 0 = off
  zone: string;
}

interface DmrCh {
  name: string;
  rx: number; // Hz
  tx: number; // Hz
  colorCode: number;
  slot: 1 | 2;
  tgId: number;
  tgName: string;
  repeaterCallsign: string;
}

type ZoneMember = { name: string; rx: number; tx: number };

// ── Helpers ────────────────────────────────────────────────────────────────────

const CRLF = '\r\n';

function mhz(hz: number): string {
  return (hz / 1_000_000).toFixed(6);
}

function ctcssTone(hz: number): string {
  return hz > 0 ? hz.toFixed(1) : 'Off';
}

/** Human-readable TG name; falls back to "TG{id}" for unknown IDs. */
function tgLabel(id: number): string {
  return BG_DMR_TALKGROUPS.get(id) ?? `TG${id}`;
}

/** Parse a comma-separated string of TG IDs into an array of numbers. */
function parseTgIds(s: string): number[] {
  return s
    .split(',')
    .map((t) => parseInt(t.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
}

/** Parse color_code string; returns null if missing or not a valid integer. */
function parseColorCode(dmr: RepeaterModeDMR): number | null {
  if (!dmr.color_code) return null;
  const cc = parseInt(dmr.color_code, 10);
  return isNaN(cc) ? null : cc;
}

function isVhf(hz: number): boolean {
  return hz >= 144_000_000 && hz < 148_000_000;
}

// ── Channel extraction ─────────────────────────────────────────────────────────

function analogZoneName(entry: Repeater | StaticChannel): string {
  if (!('disabled' in entry)) {
    return entry.callsign.startsWith('PMR') ? 'PMR' : 'Simplex';
  }
  return isVhf(entry.freq.rx) ? 'VHF FM' : 'UHF FM';
}

function toAnalogCh(entry: Repeater | StaticChannel): AnalogCh {
  return {
    name: entry.callsign.slice(0, 16),
    rx: entry.freq.rx,
    tx: entry.freq.tx,
    ctcss: entry.freq.tone,
    zone: analogZoneName(entry),
  };
}

function dmrChName(callsign: string, tgId: number): string {
  const n = `${callsign} ${tgId}`;
  return n.length <= 16 ? n : n.slice(0, 16);
}

function tgChannels(
  rep: Repeater,
  ids: number[],
  slot: 1 | 2,
  colorCode: number,
): DmrCh[] {
  return ids.map((id) => ({
    name: dmrChName(rep.callsign, id),
    rx: rep.freq.rx,
    tx: rep.freq.tx,
    colorCode,
    slot,
    tgId: id,
    tgName: tgLabel(id),
    repeaterCallsign: rep.callsign,
  }));
}

function repeaterDmrChannels(rep: Repeater): DmrCh[] {
  if (!rep.modes.dmr.enabled) return [];
  const cc = parseColorCode(rep.modes.dmr);
  if (cc === null) return [];

  const { ts1_groups, ts2_groups } = rep.modes.dmr;
  return [
    ...tgChannels(rep, parseTgIds(ts1_groups), 1, cc),
    ...tgChannels(rep, parseTgIds(ts2_groups), 2, cc),
  ];
}

function buildAllChannels(entries: (Repeater | StaticChannel)[]): {
  analogs: AnalogCh[];
  dmrChannels: DmrCh[];
} {
  const analogs: AnalogCh[] = [];
  const dmrChannels: DmrCh[] = [];

  for (const e of entries) {
    if (e.modes.fm.enabled) analogs.push(toAnalogCh(e));
    if ('disabled' in e) dmrChannels.push(...repeaterDmrChannels(e));
  }

  return { analogs, dmrChannels };
}

// ── Channel.CSV ────────────────────────────────────────────────────────────────

const CHANNEL_HEADER =
  'No.,Channel Name,Receive Frequency,Transmit Frequency,Channel Type,' +
  'Transmit Power,Band Width,CTCSS/DCS Decode,CTCSS/DCS Encode,Contact,' +
  'Contact Call Type,Contact TG/DMR ID,Radio ID,Busy Lock/TX Permit,' +
  'Squelch Mode,Optional Signal,2Tone Decode,DTMF ID,Color Code,Slot,' +
  'Scan List,Receive Group List,TX Prohibit,Reverse,Simplex TDMA,' +
  'TDMA Adaptive,AES Digital Encryption,Digital Encryption,Call Confirmation,' +
  'Talk Around(Simplex),Work Alone,Custom CTCSS,2TONE Decode,Ranging,' +
  'Through Mode,APRS RX,Analog APRS PTT Mode,Digital APRS PTT Mode,' +
  'APRS Report Type,Digital APRS Report Channel,Correct Frequency[Hz],' +
  'SMS Confirmation,Exclude channel from roaming,DMR MODE,DataACK Disable,' +
  'R5toneBot,R5ToneEot';

// Columns 23-46 are identical for all channels (defaults)
const CHANNEL_TAIL = [
  'Off', 'Off', 'Off', 'Off',              // TX Prohibit, Reverse, Simplex TDMA, TDMA Adaptive
  'Normal Encryption', 'Off', 'Off', 'Off', 'Off', // AES, Digital Enc, Confirm, Talk Around, Work Alone
  '251.1', '0', 'Off', 'Off',              // Custom CTCSS, 2TONE Decode, Ranging, Through Mode
  'Off', 'Off', 'Off', 'Analog', '1',      // APRS RX, Analog PTT, Digital PTT, Report Type, Report Ch
  '0', 'Off', '0',                         // Correct Freq, SMS Confirm, Exclude from roaming
];

function analogRow(ch: AnalogCh, no: number): string {
  const ct = ctcssTone(ch.ctcss);
  return [
    String(no), ch.name, mhz(ch.rx), mhz(ch.tx),
    'A', 'High', '25K', ct, ct,
    '', 'Group Call', '0', '1',
    'Always', 'Carrier', 'Off', '0', '1', '0', '0',
    'None', 'None',
    ...CHANNEL_TAIL,
    '0', '1', '0', '0', // DMR MODE=0 (analog), DataACK Disable=1, R5toneBot=0, R5ToneEot=0
  ].join(',');
}

function dmrRow(ch: DmrCh, no: number): string {
  const scanList = ch.tgName;
  return [
    String(no), ch.name, mhz(ch.rx), mhz(ch.tx),
    'D', 'High', '12.5K', 'Off', 'Off',
    ch.tgName, 'Group Call', String(ch.tgId), '1',
    'Same Color Code', 'CTCSS/DCS', 'Off', '0', '1',
    String(ch.colorCode), String(ch.slot),
    scanList, 'None',
    ...CHANNEL_TAIL,
    '1', '1', '0', '0', // DMR MODE=1 (repeater), DataACK Disable=1, R5toneBot=0, R5ToneEot=0
  ].join(',');
}

function buildChannelCsv(analogs: AnalogCh[], dmrChannels: DmrCh[]): string {
  const rows = [CHANNEL_HEADER];
  let no = 1;
  for (const ch of analogs) rows.push(analogRow(ch, no++));
  for (const ch of dmrChannels) rows.push(dmrRow(ch, no++));
  return rows.join(CRLF);
}

// ── TalkGroups.CSV ─────────────────────────────────────────────────────────────

const TG_HEADER = 'No.,Radio ID,Name,Call Type,Call Alert';

function buildTalkGroupCsv(dmrChannels: DmrCh[]): string {
  const seen = new Set<number>();
  const rows = [TG_HEADER];
  let no = 1;
  for (const ch of dmrChannels) {
    if (seen.has(ch.tgId)) continue;
    seen.add(ch.tgId);
    rows.push([String(no++), String(ch.tgId), ch.tgName, 'Group Call', 'None'].join(','));
  }
  return rows.join(CRLF);
}

// ── Zone.CSV ───────────────────────────────────────────────────────────────────

const ZONE_HEADER =
  'No.,Zone Name,Zone Channel Member,Zone Channel Member RX Frequency,' +
  'Zone Channel Member TX Frequency,A Channel,A Channel RX Frequency,' +
  'A Channel TX Frequency,B Channel,B Channel RX Frequency,B Channel TX Frequency';

function groupBy<K, V>(items: V[], key: (v: V) => K): Map<K, V[]> {
  const map = new Map<K, V[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

function zoneRow(no: number, name: string, members: ZoneMember[]): string {
  const chNames = members.map((m) => m.name).join('|');
  const rxFreqs = members.map((m) => mhz(m.rx)).join('|');
  const txFreqs = members.map((m) => mhz(m.tx)).join('|');
  const a = members[0];
  const b = members[1] ?? a; // use first channel for both A and B if only one
  return [
    String(no), name, chNames, rxFreqs, txFreqs,
    a.name, mhz(a.rx), mhz(a.tx),
    b.name, mhz(b.rx), mhz(b.tx),
  ].join(',');
}

function buildZoneCsv(analogs: AnalogCh[], dmrChannels: DmrCh[]): string {
  const rows = [ZONE_HEADER];
  let no = 1;

  // Analog zones grouped by band/type
  const analogGroups = groupBy(analogs, (ch) => ch.zone);
  for (const [name, channels] of analogGroups) {
    rows.push(zoneRow(no++, name, channels));
  }

  // One DMR zone per repeater (zone name = callsign)
  const dmrGroups = groupBy(dmrChannels, (ch) => ch.repeaterCallsign);
  for (const [callsign, channels] of dmrGroups) {
    rows.push(zoneRow(no++, callsign, channels));
  }

  return rows.join(CRLF);
}

// ── ScanList.CSV ───────────────────────────────────────────────────────────────

const SCAN_HEADER =
  'No.,Scan List Name,Scan Channel Member,Scan Channel Member RX Frequency,' +
  'Scan Channel Member TX Frequency,Scan Mode,Priority Channel Select,' +
  'Priority Channel 1,Priority Channel 1 RX Frequency,Priority Channel 1 TX Frequency,' +
  'Priority Channel 2,Priority Channel 2 RX Frequency,Priority Channel 2 TX Frequency,' +
  'Revert Channel,Look Back Time A[s],Look Back Time B[s],Dropout Delay Time[s],Dwell Time[s]';

function buildScanListCsv(dmrChannels: DmrCh[]): string {
  const rows = [SCAN_HEADER];
  let no = 1;

  const byTg = groupBy(dmrChannels, (ch) => ch.tgId);
  for (const [tgId, channels] of byTg) {
    const name = tgLabel(tgId);
    const chNames = channels.map((c) => c.name).join('|');
    const rxFreqs = channels.map((c) => mhz(c.rx)).join('|');
    const txFreqs = channels.map((c) => mhz(c.tx)).join('|');
    const p1 = channels[0];
    rows.push(
      [
        String(no++), name, chNames, rxFreqs, txFreqs,
        'Off', 'Off',
        p1.name, mhz(p1.rx), mhz(p1.tx), // Priority Channel 1
        '', '', '',                         // Priority Channel 2 (none)
        'Selected', '0.5', '0.5', '0.1', '0.1',
      ].join(','),
    );
  }

  return rows.join(CRLF);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/** Count channels the Anytone export will produce (FM analog + expanded DMR). */
export function countAnytoneChannels(entries: (Repeater | StaticChannel)[]): {
  fm: number;
  dmr: number;
} {
  let fm = 0;
  let dmr = 0;
  for (const e of entries) {
    if (e.modes.fm.enabled) fm++;
    if ('disabled' in e) dmr += repeaterDmrChannels(e).length;
  }
  return { fm, dmr };
}

/** Build a ZIP Blob containing the four Anytone CPS import files. */
export async function buildAnytoneZip(
  entries: (Repeater | StaticChannel)[],
): Promise<Blob> {
  const { analogs, dmrChannels } = buildAllChannels(entries);

  const zip = new JSZip();
  zip.file('Channel.CSV', buildChannelCsv(analogs, dmrChannels));
  zip.file('TalkGroups.CSV', buildTalkGroupCsv(dmrChannels));
  zip.file('Zone.CSV', buildZoneCsv(analogs, dmrChannels));
  zip.file('ScanList.CSV', buildScanListCsv(dmrChannels));

  return zip.generateAsync({ type: 'blob' });
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
