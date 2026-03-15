import type { Repeater, StaticChannel } from '../types/repeater';
import { isRepeater } from '../types/repeater';
import type { ChannelCategory, RadioChannel } from '../types/channel';
import { channelName } from '../utils/channelName';
import { isNational } from '../utils/national';

// ── Category ───────────────────────────────────────────────────────────────────

function categoryOf(entry: Repeater | StaticChannel): ChannelCategory {
  if (!isRepeater(entry)) {
    if (entry.place === 'Потребителски') return 'custom';
    if (entry.place === 'APRS') return 'aprs';
    return entry.callsign.startsWith('PMR') ? 'pmr' : 'simplex';
  }
  return isNational(entry) ? 'national' : 'local';
}

// ── Single-entry mapping ───────────────────────────────────────────────────────

/**
 * Map one API entry to exactly one RadioChannel, or null if the entry has
 * no enabled modes. The DMR BG/REG/LOC expansion is NOT done here — that is
 * the concern of the AnyTone-specific layer.
 */
function fromEntry(entry: Repeater | StaticChannel): RadioChannel | null {
  // API naming is from the repeater's perspective:
  //   freq.rx = repeater input  = our TX
  //   freq.tx = repeater output = our RX
  const { rx: ourTx, tx: ourRx, tone } = entry.freq;

  const hasFm = entry.modes.fm.enabled;
  const hasDmr = entry.modes.dmr.enabled;

  if (hasDmr) {
    // Use callsign as the base name for DMR channels (e.g. "LZ9DB") so the
    // AnyTone expansion produces "LZ9DB BG", "LZ9DB REG", "LZ9DB LOC".
    const name = entry.callsign.slice(0, 16);
    return {
      name,
      rx: ourRx,
      tx: ourTx,
      ctcss: tone,
      category: categoryOf(entry),
      place: entry.place,
      dmr: {
        colorCode: parseInt(entry.modes.dmr.color_code, 10) || 1,
        ts1Groups: entry.modes.dmr.ts1_groups,
        ts2Groups: entry.modes.dmr.ts2_groups,
        mixedMode: hasFm,
      },
    };
  }

  if (hasFm) {
    const name = channelName(entry).slice(0, 16);
    const pttProhibit = !isRepeater(entry) && entry.pttProhibit === true;
    return {
      name,
      rx: ourRx,
      tx: ourTx,
      ctcss: tone,
      category: categoryOf(entry),
      place: entry.place,
      pttProhibit,
    };
  }

  return null;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Map a list of API entries to RadioChannels. Each entry produces at most one
 * RadioChannel (no DMR expansion). Deduplication by name: first occurrence wins.
 */
export function mapChannels(entries: (Repeater | StaticChannel)[]): RadioChannel[] {
  const seen = new Set<string>();
  const channels: RadioChannel[] = [];
  for (const entry of entries) {
    const ch = fromEntry(entry);
    if (ch === null) continue;
    if (seen.has(ch.name)) continue;
    seen.add(ch.name);
    channels.push(ch);
  }
  return channels;
}

/** Count FM and DMR channels in a RadioChannel list. */
export function countChannels(channels: RadioChannel[]): { fm: number; dmr: number } {
  return {
    fm: channels.filter((ch) => !ch.dmr).length,
    dmr: channels.filter((ch) => !!ch.dmr).length,
  };
}
