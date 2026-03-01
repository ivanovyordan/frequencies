import JSZip from 'jszip';
import type { Repeater, StaticChannel, RepeaterModeDMR } from '../types/repeater';
import { isRepeater } from '../types/repeater';
import { BG_DMR_TALKGROUPS } from '../constants/dmrTalkGroups';
import { oblastForPlace } from '../constants/bgOblasts';
import { channelName } from '../utils/channelName';
import { buildCsv } from '../utils/csv';
import { formatMhz } from '../utils/freq';
import { isNational } from '../utils/national';

// ── Types ──────────────────────────────────────────────────────────────────────

type ChannelCategory = 'national' | 'local' | 'simplex' | 'pmr';

interface Channel {
  name: string;         // ≤16 chars, unique across the export
  rx: number;           // Hz
  tx: number;           // Hz
  ctcss: number;        // Hz, 0 = off
  category: ChannelCategory;
  place: string;
  dmr?: {               // present only for DMR channels
    colorCode: number;
    slot: 1 | 2;
    tgId: number;
    tgName: string;
  };
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

// ── Channel collection ─────────────────────────────────────────────────────────

function categoryOf(entry: Repeater | StaticChannel): ChannelCategory {
  if (!isRepeater(entry)) {
    return entry.callsign.startsWith('PMR') ? 'pmr' : 'simplex';
  }
  return isNational(entry) ? 'national' : 'local';
}

/** DMR channel name: always preserve the full TG ID; truncate only the callsign. */
function dmrChName(callsign: string, tgId: number): string {
  const suffix = ` ${tgId}`;
  return `${callsign.slice(0, 16 - suffix.length)}${suffix}`;
}

/** Expand one API entry into its Channel(s): one analog + one per talk group. */
function fromEntry(entry: Repeater | StaticChannel): Channel[] {
  const channels: Channel[] = [];
  const { rx, tx, tone } = entry.freq;

  if (entry.modes.fm.enabled) {
    const name = channelName(entry).slice(0, 16);
    channels.push({ name, rx, tx, ctcss: tone, category: categoryOf(entry), place: entry.place });
  }

  if ('disabled' in entry && entry.modes.dmr.enabled) {
    const cc = parseColorCode(entry.modes.dmr);
    if (cc !== null) {
      const { ts1_groups, ts2_groups } = entry.modes.dmr;
      const makeDmrCh = (id: number, slot: 1 | 2): Channel => ({
        name: dmrChName(entry.callsign, id),
        rx, tx, ctcss: 0,
        category: 'local',
        place: entry.place,
        dmr: { colorCode: cc, slot, tgId: id, tgName: tgLabel(id) },
      });
      parseTgIds(ts1_groups).forEach((id) => channels.push(makeDmrCh(id, 1)));
      parseTgIds(ts2_groups).forEach((id) => channels.push(makeDmrCh(id, 2)));
    }
  }

  return channels;
}

/**
 * Build the full deduplicated channel list from all entries.
 * Analog channels come first (preserves radio memory convention), then DMR.
 * First occurrence wins when names collide.
 */
function collectChannels(entries: (Repeater | StaticChannel)[]): Channel[] {
  const seen = new Set<string>();
  const analogs: Channel[] = [];
  const dmr: Channel[] = [];

  for (const entry of entries) {
    for (const ch of fromEntry(entry)) {
      if (seen.has(ch.name)) continue;
      seen.add(ch.name);
      (ch.dmr ? dmr : analogs).push(ch);
    }
  }

  return [...analogs, ...dmr];
}

// ── Helpers shared by zone + scan list ─────────────────────────────────────────

function groupBy<K, V>(items: V[], key: (v: V) => K): Map<K, V[]> {
  const map = new Map<K, V[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

// ── Channel.CSV ────────────────────────────────────────────────────────────────

function buildChannelCsv(channels: Channel[]): string {
  const header = [
    'No.', 'Channel Name', 'Receive Frequency', 'Transmit Frequency', 'Channel Type',
    'Transmit Power', 'Band Widht', 'CTCSS/DCS Decode', 'CTCSS/DCS Encode', 'Contact',
    'Contact TG/DMR ID', 'Busy Lock/TX Permit', 'Squelch Mode', 'Optional Signal',
    'DTMF ID', '2Tone ID', '5Tone ID', 'PTT ID', 'Color Code', 'Slot',
    'Scan List', 'Receive Group List', 'PTT Prohibit', 'Reverse', 'Simplex TDMA', 'Slot Suit',
  ];
  const rows = channels.map((ch, i) => {
    if (ch.dmr) {
      return [
        i + 1, ch.name, formatMhz(ch.tx), formatMhz(ch.rx),
        'D', 'High', '12.5K', 'Off', 'Off',
        ch.dmr.tgName, ch.dmr.tgId,
        'Same Color Code', 'CTCSS/DCS', 'Off',
        1, 0, 0, 0,
        ch.dmr.colorCode, ch.dmr.slot,
        ch.dmr.tgName, 'None',
        'Off', 'Off', 'Off', 'Off',
      ];
    }
    const ct = ctcssTone(ch.ctcss);
    return [
      i + 1, ch.name, formatMhz(ch.tx), formatMhz(ch.rx),
      'A', 'High', '25K', ct, ct,
      '', 0,
      'Always', 'Carrier', 'Off',
      1, 0, 0, 0,
      0, 0,
      'None', 'None',
      'Off', 'Off', 'Off', 'Off',
    ];
  });
  return buildCsv(header, rows);
}

// ── TalkGroups.CSV ─────────────────────────────────────────────────────────────

function buildTalkGroupCsv(channels: Channel[]): string {
  const seen = new Set<number>();
  const rows: (string | number)[][] = [];
  let no = 1;
  for (const ch of channels) {
    if (!ch.dmr || seen.has(ch.dmr.tgId)) continue;
    seen.add(ch.dmr.tgId);
    rows.push([no++, ch.dmr.tgId, ch.dmr.tgName, 'Group Call', 'None']);
  }
  return buildCsv(['No.', 'Radio ID', 'Name', 'Call Type', 'Call Alert'], rows);
}

// ── Zone.CSV ───────────────────────────────────────────────────────────────────

function buildZoneCsv(channels: Channel[]): string {
  const rows: (string | number)[][] = [];
  let no = 1;

  function addZone(name: string, members: Channel[]): void {
    if (members.length === 0) return;
    const chNames = members.map((m) => m.name).join('|');
    rows.push([no++, name, chNames, chNames]);
  }

  const nationals = channels.filter((ch) => ch.category === 'national');
  const locals = channels.filter((ch) => ch.category === 'local' && !ch.dmr);
  const dmr = channels.filter((ch) => !!ch.dmr);
  const simplex = channels.filter((ch) => ch.category === 'simplex');
  const pmr = channels.filter((ch) => ch.category === 'pmr');

  addZone('Nationals', nationals);
  addZone('Local Repeaters', locals);
  addZone('All Analog', [...nationals, ...locals]);
  addZone('All DMR', dmr);
  addZone('Simplex', simplex);
  addZone('PMR', pmr);

  const byOblast = groupBy([...nationals, ...locals], (ch) => oblastForPlace(ch.place));
  for (const [oblast, members] of byOblast) {
    addZone(oblast.slice(0, 16), members);
  }

  return buildCsv(['No.', 'Zone Name', 'Zone Channel List', 'Zone Sub Channel List'], rows);
}

// ── ScanList.CSV ───────────────────────────────────────────────────────────────

function buildScanListCsv(channels: Channel[]): string {
  const header = [
    'No.', 'Scan List Name', 'Scan Channel Member', 'Scan Channel Member RX Frequency',
    'Scan Channel Member TX Frequency', 'Scan Mode', 'Priority Channel Select',
    'Priority Channel 1', 'Priority Channel 1 RX Frequency', 'Priority Channel 1 TX Frequency',
    'Priority Channel 2', 'Priority Channel 2 RX Frequency', 'Priority Channel 2 TX Frequency',
    'Revert Channel', 'Look Back Time A[s]', 'Look Back Time B[s]', 'Dropout Delay Time[s]', 'Dwell Time[s]',
  ];
  const rows: (string | number)[][] = [];
  let no = 1;

  const byTg = groupBy(channels.filter((ch) => !!ch.dmr), (ch) => ch.dmr!.tgId);
  for (const [tgId, tgChs] of byTg) {
    const p1 = tgChs[0];
    rows.push([
      no++, tgLabel(tgId),
      tgChs.map((c) => c.name).join('|'),
      tgChs.map((c) => formatMhz(c.tx)).join('|'),
      tgChs.map((c) => formatMhz(c.rx)).join('|'),
      'Off', 'Off',
      p1.name, formatMhz(p1.tx), formatMhz(p1.rx),
      '', '', '',
      'Selected', '0.5', '0.5', '0.1', '0.1',
    ]);
  }

  return buildCsv(header, rows);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/** Count channels the Anytone export will produce (FM analog + expanded DMR). */
export function countAnytoneChannels(entries: (Repeater | StaticChannel)[]): {
  fm: number;
  dmr: number;
} {
  const channels = collectChannels(entries);
  return {
    fm: channels.filter((ch) => !ch.dmr).length,
    dmr: channels.filter((ch) => !!ch.dmr).length,
  };
}

/** Build a ZIP Blob containing the four Anytone CPS import files. */
export async function buildAnytoneZip(
  entries: (Repeater | StaticChannel)[],
): Promise<Blob> {
  const channels = collectChannels(entries);

  const zip = new JSZip();
  zip.file('Channel.CSV', buildChannelCsv(channels));
  zip.file('TalkGroups.CSV', buildTalkGroupCsv(channels));
  zip.file('Zone.CSV', buildZoneCsv(channels));
  zip.file('ScanList.CSV', buildScanListCsv(channels));

  return zip.generateAsync({ type: 'blob' });
}
