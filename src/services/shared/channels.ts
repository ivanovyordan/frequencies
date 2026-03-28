import { oblastForPlace } from '../../constants/bgOblasts';
import type { RadioChannel } from '../../types/channel';

export interface ExpandedChannel {
  name: string; // ≤16 chars, unique across the export
  rx: number; // Hz
  tx: number; // Hz
  ctcss: number; // Hz, 0 = off
  category: RadioChannel['category'];
  place: string;
  pttProhibit?: boolean;
  dmr?: {
    colorCode: number;
    slot: 1 | 2;
    mixedMode: boolean;
    tgId: number; // primary talk group ID
  };
}

/** Maps oblast names (from oblastForPlace) to their BrandMeister regional TG. */
export const OBLAST_TO_REGIONAL_TG = new Map<string, number>([
  ['Varna', 2840],
  ['Sofia', 2842],
  ['Plovdiv', 2843],
  ['Burgas', 2844],
  ['Stara Zagora', 2845],
  ['Montana', 2846],
  ['Vratsa', 2846],
  ['Lovech', 2846],
  ['Blagoevgrad', 2847],
  ['Kyustendil', 2847],
  ['Smolyan', 2847],
  ['Kardzhali', 2847],
  ['Pazardzhik', 2847],
  ['Haskovo', 2847],
  ['Ruse', 2848],
  ['Razgrad', 2848],
  ['Silistra', 2848],
  ['Dobrich', 2848],
  ['Shumen', 2848],
]);

/** Returns the regional TG for a place, or undefined if no mapping exists. */
export function regionalTgForPlace(place: string): number | undefined {
  return OBLAST_TO_REGIONAL_TG.get(oblastForPlace(place));
}

/**
 * Expand RadioChannels into format-independent expanded channels.
 * DMR channels are expanded into up to 3 rows: BG (TS1/TG284), REG (TS2/regional TG),
 * LOC (TS2/TG9). FM-only channels produce 1 analog row each.
 * Deduplication by name: first occurrence wins.
 */
export function expandChannels(channels: RadioChannel[]): ExpandedChannel[] {
  const seen = new Set<string>();
  const result: ExpandedChannel[] = [];

  function push(ch: ExpandedChannel): void {
    if (seen.has(ch.name)) return;
    seen.add(ch.name);
    result.push(ch);
  }

  for (const ch of channels) {
    if (ch.dmr) {
      const { colorCode, mixedMode } = ch.dmr;
      const base = {
        rx: ch.rx,
        tx: ch.tx,
        ctcss: ch.ctcss,
        category: ch.category,
        place: ch.place,
      };
      const dmrBase = (slot: 1 | 2, tgId: number) =>
        ({ colorCode, slot, mixedMode, tgId }) as const;

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
