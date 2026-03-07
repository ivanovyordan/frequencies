import JSZip from 'jszip';
import type { RadioId, Repeater, StaticChannel, RepeaterModeDMR } from '../types/repeater';
import { isRepeater } from '../types/repeater';
import { BG_DMR_TALKGROUPS } from '../constants/dmrTalkGroups';
import { oblastForPlace } from '../constants/bgOblasts';
import { channelName } from '../utils/channelName';
import { buildCsv } from '../utils/csv';
import { formatMhz } from '../utils/freq';
import { isNational } from '../utils/national';

// ── Types ──────────────────────────────────────────────────────────────────────

type ChannelCategory = 'national' | 'local' | 'simplex' | 'pmr' | 'custom';

interface Channel {
  name: string;         // ≤16 chars, unique across the export
  rx: number;           // Hz
  tx: number;           // Hz
  ctcss: number;        // Hz, 0 = off
  category: ChannelCategory;
  place: string;
  pttProhibit?: boolean;
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
    if (entry.place === 'Потребителски') return 'custom';
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
    const pttProhibit = !isRepeater(entry) && entry.pttProhibit === true;
    channels.push({ name, rx, tx, ctcss: tone, category: categoryOf(entry), place: entry.place, pttProhibit });
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

function mhz5(hz: number): string {
  return formatMhz(hz, 5);
}

// ── RadioIDList.CSV ────────────────────────────────────────────────────────────

function buildRadioIdListCsv(radioId: RadioId): string {
  const rows = [[1, parseInt(radioId.dmrId, 10), radioId.callsign]];
  return buildCsv(['No.', 'Radio ID', 'Name'], rows);
}

// ── Channel.CSV ────────────────────────────────────────────────────────────────

function buildChannelCsv(channels: Channel[], radioName: string): string {
  // 56 columns matching AnyTone CPS export format
  const header = [
    'No.', 'Channel Name', 'Receive Frequency', 'Transmit Frequency', 'Channel Type',
    'Transmit Power', 'Band Width', 'CTCSS/DCS Decode', 'CTCSS/DCS Encode', 'Contact',
    'Contact Call Type', 'Contact TG/DMR ID', 'Radio ID', 'Busy Lock/TX Permit', 'Squelch Mode',
    'Optional Signal', 'DTMF ID', '2Tone ID', '5Tone ID', 'PTT ID',
    'RX Color Code', 'Slot', 'Scan List', 'Receive Group List', 'PTT Prohibit',
    'Reverse', 'Simplex TDMA', 'Slot Suit', 'AES Digital Encryption', 'Digital Encryption',
    'Call Confirmation', 'Talk Around(Simplex)', 'Work Alone', 'Custom CTCSS', '2TONE Decode',
    'Ranging', 'Through Mode', 'APRS RX', 'Analog APRS PTT Mode', 'Digital APRS PTT Mode',
    'APRS Report Type', 'Digital APRS Report Channel', 'Correct Frequency[Hz]', 'SMS Confirmation',
    'Exclude channel from roaming', 'DMR MODE', 'DataACK Disable', 'R5toneBot', 'R5ToneEot',
    'Auto Scan', 'Ana Aprs Mute', 'Send Talker Alias', 'AnaAprsTxPath', 'ARC4',
    'ex_emg_kind', 'TxCC',
  ];

  // Trailing 28 columns that are the same for every channel
  const tail = [
    'Normal Encryption', 'Off', 'Off', 'Off', 'Off', '251.1', '0',
    'Off', 'Off', 'Off', 'Off', 'Off', 'Off', '1', '0', 'Off',
    '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1',
  ];

  const rows = channels.map((ch, i) => {
    const rxMhz = mhz5(ch.rx);
    const txMhz = mhz5(ch.tx);

    if (ch.dmr) {
      return [
        i + 1, ch.name, rxMhz, txMhz, 'D-Digital',
        'High', '12.5K', 'Off', 'Off', ch.dmr.tgName,
        'Group Call', ch.dmr.tgId, radioName, 'Always', 'Carrier', 'Off',
        '1', '1', '1', 'Off', ch.dmr.colorCode, ch.dmr.slot,
        'None', 'None', 'Off', 'Off', 'Off', 'Off',
        ...tail,
      ];
    }

    const ct = ctcssTone(ch.ctcss);
    return [
      i + 1, ch.name, rxMhz, txMhz, 'A-Analog',
      'High', '25K', ct, ct, '',
      'Group Call', '0', radioName, 'Always', 'Carrier', 'Off',
      '1', '1', '1', 'Off', '0', '1',
      'None', 'None', ch.pttProhibit ? 'On' : 'Off', 'Off', 'Off', 'Off',
      ...tail,
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
  // 12 columns matching AnyTone CPS zone export (trailing space on "Zone Hide " is intentional)
  const header = [
    'No.', 'Zone Name', 'Zone Channel Member',
    'Zone Channel Member RX Frequency', 'Zone Channel Member TX Frequency',
    'A Channel', 'A Channel RX Frequency', 'A Channel TX Frequency',
    'B Channel', 'B Channel RX Frequency', 'B Channel TX Frequency', 'Zone Hide ',
  ];

  const rows: (string | number)[][] = [];
  let no = 1;

  function addZone(name: string, members: Channel[]): void {
    if (members.length === 0) return;
    const chNames = members.map((m) => m.name).join('|');
    const chRx = members.map((m) => mhz5(m.rx)).join('|');
    const chTx = members.map((m) => mhz5(m.tx)).join('|');
    const a = members[0];
    const b = members.length > 1 ? members[1] : a;
    rows.push([
      no++, name, chNames, chRx, chTx,
      a.name, mhz5(a.rx), mhz5(a.tx),
      b.name, mhz5(b.rx), mhz5(b.tx), '0',
    ]);
  }

  const nationals = channels.filter((ch) => ch.category === 'national');
  const locals = channels.filter((ch) => ch.category === 'local' && !ch.dmr);
  const dmr = channels.filter((ch) => !!ch.dmr);
  const simplex = channels.filter((ch) => ch.category === 'simplex');
  const pmr = channels.filter((ch) => ch.category === 'pmr');
  const custom = channels.filter((ch) => ch.category === 'custom');

  addZone('All Channels', channels);
  addZone('National Repeaters', nationals);
  addZone('Local Repeaters', locals);
  addZone('Analog Repeaters', [...nationals, ...locals]);
  addZone('DMR Repeaters', dmr);
  addZone('Simplex', simplex);
  addZone('PMR', pmr);
  addZone('Custom', custom);

  const byOblast = groupBy([...nationals, ...locals], (ch) => oblastForPlace(ch.place));
  for (const [oblast, members] of byOblast) {
    addZone(oblast.slice(0, 16), members);
  }

  return buildCsv(header, rows);
}

// ── ScanList.CSV ───────────────────────────────────────────────────────────────

function buildScanListCsv(channels: Channel[]): string {
  const header = [
    'No.', 'Scan List Name', 'Scan Channel Member',
    'Scan Channel Member RX Frequency', 'Scan Channel Member TX Frequency',
    'Scan Mode', 'Priority Channel Select',
    'Priority Channel 1', 'Priority Channel 1 RX Frequency', 'Priority Channel 1 TX Frequency',
    'Priority Channel 2', 'Priority Channel 2 RX Frequency', 'Priority Channel 2 TX Frequency',
    'Revert Channel', 'Look Back Time A[s]', 'Look Back Time B[s]',
    'Dropout Delay Time[s]', 'Dwell Time[s]',
  ];

  const rows: (string | number)[][] = [];
  let no = 1;

  const byTg = groupBy(channels.filter((ch) => !!ch.dmr), (ch) => ch.dmr!.tgId);
  for (const [tgId, tgChs] of byTg) {
    rows.push([
      no++, tgLabel(tgId),
      tgChs.map((c) => c.name).join('|'),
      tgChs.map((c) => mhz5(c.rx)).join('|'),
      tgChs.map((c) => mhz5(c.tx)).join('|'),
      'Time', 'Off',
      'None', 'None', 'None',
      'None', 'None', 'None',
      'Selected', '2.0', '3.0', '0.1', '5.0',
    ]);
  }

  return buildCsv(header, rows);
}

// ── anytone.LST ────────────────────────────────────────────────────────────────

// Ordered list of all CPS-known files; indices are stable identifiers used by the radio.
const CPS_FILE_INDEX: readonly string[] = [
  'Channel.CSV',                 // 0
  'RadioIDList.CSV',             // 1
  'Zone.CSV',                    // 2
  'ScanList.CSV',                // 3
  'AnalogAddressBook.CSV',       // 4
  'TalkGroups.CSV',              // 5
  'PrefabricatedSMS.CSV',        // 6
  'FM.CSV',                      // 7
  'ReceiveGroupCallList.CSV',    // 8
  '5ToneEncode.CSV',             // 9
  '2ToneEncode.CSV',             // 10
  'DTMFEncode.CSV',              // 11
  'HotKey_QuickCall.CSV',        // 12
  'HotKey_State.CSV',            // 13
  'HotKey_HotKey.CSV',           // 14
  'DigitalContactList.CSV',      // 15
  'AutoRepeaterOffsetFrequencys.CSV', // 16
  'RoamingChannel.CSV',          // 17
  'RoamingZone.CSV',             // 18
  'APRS.CSV',                    // 19
  'GPSRoaming.CSV',              // 20
  'OptionalSetting.CSV',         // 21
  'AlertTone.CSV',               // 22
  'AESEncryptionCode.CSV',       // 23
  'ARC4EncryptionCode.CSV',      // 24
];

/** Build the LST manifest listing only files that are actually present in the zip. */
function buildLst(presentFiles: Set<string>): string {
  const entries = CPS_FILE_INDEX
    .map((f, i) => [i, f] as const)
    .filter(([, f]) => presentFiles.has(f));
  return `${entries.length}\r\n${entries.map(([n, f]) => `${n},"${f}"`).join('\r\n')}\r\n`;
}

// ── APRS.CSV ───────────────────────────────────────────────────────────────────

function buildAprsCsv(callsign: string): string {
  const header: string[] = [
    'Manual TX Interval[s]', 'APRS Auto TX Interval[s]', 'Support For Roaming', 'Fixed Location Beacon',
    'LatiDegree', 'LatiMinInt', 'LatiMinMark', 'North or South',
    'LongtiDegree', 'LongtiMinInt', 'LongtiMinMark', 'East or West Hemisphere',
  ];

  for (let i = 1; i <= 8; i++) {
    header.push(`channel${i}`, `slot${i}`, `Aprs Tg${i}`, `Call Type${i}`);
  }

  header.push(
    'APRS TG', 'Call Type', 'Repeater Activation Delay[ms]',
    'APRS TX Tone', 'TOCALL', 'TOCALL SSID', 'Your Call Sign', 'Your SSID',
    'APRS Symbol Table', 'APRS Map Icon', 'Digipeater Path', 'Enter Your Sending Text',
    'Transmission Frequency [MHz]', 'Transmit Delay[ms]', 'Send Sub Tone',
    'CTCSS', 'DCS', 'Prewave Time[ms]', 'Transmit Power',
  );

  for (let i = 1; i <= 32; i++) {
    header.push(`Receive Filter${i}`, `Call Sign${i}`, `SSID${i}`);
  }

  header.push('POSITION', 'MIC-E', 'OBJECT', 'ITEM', 'MESSAGE', 'WX REPORT', 'NMEA REPORT', 'STATUS REPORT', 'OTHER');

  for (let i = 0; i <= 7; i++) {
    header.push(`Transmission Frequency${i}`);
  }

  // Fix1–Fix4 use numeric suffixes; Fix5–Fix7 use _21–_23 (AnyTone CPS naming)
  for (const s of ['1', '2', '3', '4', '_21', '_22', '_23']) {
    header.push(
      `LatiDegree${s}`, `LatiMinInt${s}`, `LatiMinMark${s}`, `North or South${s}`,
      `LongtiDegree${s}`, `LongtiMinInt${s}`, `LongtiMinMark${s}`, `East or West Hemisphere${s}`,
    );
  }

  const row: (string | number)[] = [
    40, 0, 0, 0,   // Manual TX Interval, Auto TX Interval, Roaming, Fixed Beacon (off — no coords)
    0, 0, 0, 0,    // Lat (disabled)
    0, 0, 0, 0,    // Lon (disabled)
  ];

  // 8 digital APRS report channels (Channel VFO A / Channel Slot / TG 5057 / Private Call)
  for (let i = 0; i < 8; i++) row.push(4001, 0, 5057, 0);

  row.push(
    1, 0, 0,                                  // APRS TG, Call Type, Repeater Activation Delay
    1,                                         // APRS TX Tone
    'APAT81', 1,                               // TOCALL, TOCALL SSID (−1)
    callsign, 7,                               // Your Call Sign, Your SSID (−7)
    '/', '&',                                  // Symbol Table, Map Icon (balloon)
    'WIDE1-1,WIDE2-2',                         // Digipeater Path
    `73 ${callsign}`,                          // Sending Text
    144,                                       // Transmission Frequency [MHz]
    1200, 0, 0, 19, 1500, 0,                  // Delay, Sub Tone, CTCSS, DCS, Prewave, Power
  );

  for (let i = 0; i < 32; i++) row.push(0, '', 0);  // Receive filters (all Off)

  // Message type receive flags
  row.push(1, 1, 1, 1, 1, 1, 0, 0, 0);  // POS, MIC-E, OBJ, ITEM, MSG, WX, NMEA, STATUS, OTHER

  for (let i = 0; i < 8; i++) row.push('144.80000');  // Analog TX frequencies (APRS standard)

  for (let i = 0; i < 7 * 8; i++) row.push(0);  // Fix location coordinates (all zero)

  return buildCsv(header, [row]);
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

/** Build a ZIP Blob containing the AnyTone CPS import files. */
export async function buildAnytoneZip(
  entries: (Repeater | StaticChannel)[],
  radioId: RadioId = { callsign: '', dmrId: '' },
  contactListCsv?: string,
): Promise<Blob> {
  const channels = collectChannels(entries);
  const radioName = radioId.callsign.trim() || 'Local';

  const files = new Map<string, string>();
  files.set('Channel.CSV', buildChannelCsv(channels, radioName));
  files.set('TalkGroups.CSV', buildTalkGroupCsv(channels));
  files.set('Zone.CSV', buildZoneCsv(channels));
  files.set('ScanList.CSV', buildScanListCsv(channels));

  const dmrIdNum = parseInt(radioId.dmrId, 10);
  if (radioId.callsign.trim() && !isNaN(dmrIdNum) && dmrIdNum > 0) {
    files.set('RadioIDList.CSV', buildRadioIdListCsv({ callsign: radioName, dmrId: radioId.dmrId }));
  }

  if (contactListCsv) {
    files.set('DigitalContactList.CSV', contactListCsv);
  }

  if (radioName !== 'Local') {
    files.set('APRS.CSV', buildAprsCsv(radioName));
  }

  const zip = new JSZip();
  for (const [name, content] of files) {
    zip.file(name, content);
  }
  zip.file('anytone.LST', buildLst(new Set(files.keys())));

  return zip.generateAsync({ type: 'blob' });
}
