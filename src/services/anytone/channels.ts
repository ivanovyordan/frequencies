import { oblastForPlace } from '../../constants/bgOblasts';
import type { RadioChannel } from '../../types/channel';
import { buildCsv } from '../../utils/csv';
import { formatMhz } from '../../utils/freq';
import { DMR_RECEIVE_GROUP } from './talkGroups';

// ── Internal AnyTone channel type ──────────────────────────────────────────────

export interface AnytoneChannel {
  name: string;         // ≤16 chars, unique across the export
  rx: number;           // Hz
  tx: number;           // Hz
  ctcss: number;        // Hz, 0 = off
  category: RadioChannel['category'];
  place: string;
  pttProhibit?: boolean;
  dmr?: {
    colorCode: number;
    slot: 1 | 2;
    mixedMode: boolean;
    tgId: number;       // primary talk group ID
  };
}

// ── Oblast → regional TG mapping ───────────────────────────────────────────────

/** Maps oblast names (from oblastForPlace) to their BrandMeister regional TG. */
export const OBLAST_TO_REGIONAL_TG = new Map<string, number>([
  ['Varna',        2840],
  ['Sofia',        2842],
  ['Plovdiv',      2843],
  ['Burgas',       2844],
  ['Stara Zagora', 2845],
  ['Montana',      2846],
  ['Vratsa',       2846],
  ['Lovech',       2846],
  ['Blagoevgrad',  2847],
  ['Kyustendil',   2847],
  ['Smolyan',      2847],
  ['Kardzhali',    2847],
  ['Pazardzhik',   2847],
  ['Haskovo',      2847],
  ['Ruse',         2848],
  ['Razgrad',      2848],
  ['Silistra',     2848],
  ['Dobrich',      2848],
  ['Shumen',       2848],
]);

/** Returns the regional TG for a place, or undefined if no mapping exists. */
export function regionalTgForPlace(place: string): number | undefined {
  return OBLAST_TO_REGIONAL_TG.get(oblastForPlace(place));
}

// ── DMR expansion ──────────────────────────────────────────────────────────────

/**
 * Expand RadioChannels into AnyTone-specific channels.
 * DMR channels are expanded into up to 3 rows: BG (TS1/TG284), REG (TS2/regional TG),
 * LOC (TS2/TG9). FM-only channels produce 1 analog row each.
 * Deduplication by name: first occurrence wins.
 */
export function expandChannels(channels: RadioChannel[]): AnytoneChannel[] {
  const seen = new Set<string>();
  const result: AnytoneChannel[] = [];

  function push(ch: AnytoneChannel): void {
    if (seen.has(ch.name)) return;
    seen.add(ch.name);
    result.push(ch);
  }

  for (const ch of channels) {
    if (ch.dmr) {
      const { colorCode, mixedMode } = ch.dmr;
      const base = { rx: ch.rx, tx: ch.tx, ctcss: ch.ctcss, category: ch.category, place: ch.place };
      const dmrBase = (slot: 1 | 2, tgId: number) =>
        ({ colorCode, slot, mixedMode, tgId }) as const;

      // The base name comes from the RadioChannel (already truncated to 16 chars by channelMapper)
      // Strip trailing suffixes to reconstruct the callsign-like prefix for BG/REG/LOC labels.
      // We use the channel name directly as a prefix for the expansion rows.
      const prefix = ch.name;

      // Row A — National: TS1 / TG 284
      push({ ...base, name: `${prefix} BG`.slice(0, 16), dmr: dmrBase(1, 284) });

      // Row B — Regional: TS2 / location-mapped TG (skipped if no mapping)
      const regTg = regionalTgForPlace(ch.place);
      if (regTg !== undefined) {
        push({ ...base, name: `${prefix} REG`.slice(0, 16), dmr: dmrBase(2, regTg) });
      }

      // Row C — Local: TS2 / TG 9
      push({ ...base, name: `${prefix} LOC`.slice(0, 16), dmr: dmrBase(2, 9) });
    } else {
      push({
        name: ch.name,
        rx: ch.rx,
        tx: ch.tx,
        ctcss: ch.ctcss,
        category: ch.category,
        place: ch.place,
        pttProhibit: ch.pttProhibit,
      });
    }
  }

  return result;
}

// ── Channel.CSV ────────────────────────────────────────────────────────────────

function ctcssTone(hz: number): string {
  return hz > 0 ? hz.toFixed(1) : 'Off';
}

function mhz5(hz: number): string {
  return formatMhz(hz, 5);
}

export function buildChannelCsv(channels: AnytoneChannel[], radioName: string): string {
  // 55 columns matching AnyTone CPS export format
  const header = [
    'No.', 'Channel Name', 'Receive Frequency', 'Transmit Frequency', 'Channel Type',
    'Transmit Power', 'Band Width', 'CTCSS/DCS Decode', 'CTCSS/DCS Encode', 'Contact',
    'Contact Call Type', 'Contact TG/DMR ID', 'Radio ID', 'Busy Lock/TX Permit', 'Squelch Mode',
    'Optional Signal', 'DTMF ID', '2Tone ID', '5Tone ID', 'PTT ID',
    'Color Code', 'Slot', 'Scan List', 'Receive Group List', 'PTT Prohibit',
    'Reverse', 'Simplex TDMA', 'Slot Suit', 'AES Digital Encryption', 'Digital Encryption',
    'Call Confirmation', 'Talk Around(Simplex)', 'Work Alone', 'Custom CTCSS', '2TONE Decode',
    'Ranging', 'Through Mode', 'APRS RX', 'Analog APRS PTT Mode', 'Digital APRS PTT Mode',
    'APRS Report Type', 'Digital APRS Report Channel', 'Correct Frequency[Hz]', 'SMS Confirmation',
    'Exclude channel from roaming', 'DMR MODE', 'DataACK Disable', 'R5toneBot', 'R5ToneEot',
    'Auto Scan', 'Ana Aprs Mute', 'Send Talker Alias', 'AnaAprsTxPath', 'ARC4',
    'ex_emg_kind',
  ];

  // Trailing 27 columns that are the same for every channel
  const tail = [
    'Normal Encryption', 'Off', 'Off', 'Off', 'Off', '251.1', '1',
    'Off', 'Off', 'Off', 'Off', 'Off', 'Off', '1', '0', 'Off',
    '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0',
  ];

  const rows = channels.map((ch, i) => {
    if (ch.dmr) {
      const chType = ch.dmr.mixedMode ? 'D+A TX D' : 'D-Digital';
      const ct = ctcssTone(ch.ctcss);
      return [
        i + 1, ch.name, mhz5(ch.rx), mhz5(ch.tx), chType,
        'Mid', '12.5K', ct, ct, 'Local',
        'Group Call', ch.dmr.tgId, radioName, 'Always', 'Carrier', 'Off',
        '1', '1', '1', 'Off', ch.dmr.colorCode, ch.dmr.slot,
        'None', DMR_RECEIVE_GROUP, 'Off', 'Off', 'Off', 'Off',
        ...tail,
      ];
    }
    const ct = ctcssTone(ch.ctcss);
    const power = ch.category === 'pmr' ? 'Low' : 'Mid';
    return [
      i + 1, ch.name, mhz5(ch.rx), mhz5(ch.tx), 'A-Analog',
      power, '12.5K', ct, ct, 'Local',
      'Group Call', '1', radioName, 'Off', 'Carrier', 'Off',
      '1', '1', '1', 'Off', '1', '1',
      'None', 'None', ch.pttProhibit ? 'On' : 'Off', 'Off', 'Off', 'Off',
      ...tail,
    ];
  });

  return buildCsv(header, rows);
}
