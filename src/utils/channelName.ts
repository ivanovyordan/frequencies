import type { Repeater, StaticChannel } from '../types/repeater';

/**
 * Human-readable channel name for display and CSV export.
 *
 * Uses the plan designator (e.g. "R2") when the channel field contains one,
 * stripping any RV/RU tokens. Falls back to the callsign for repeaters,
 * or the raw channel string for static channels (simplex/PMR).
 */
export function channelName(entry: Repeater | StaticChannel): string {
  const cleaned = entry.freq.channel
    .split(',')
    .map((c) => c.trim())
    .filter((c) => !/^R[UV]/i.test(c))
    .map((c) => { const m = /^(R\d+)/i.exec(c); return m ? m[1].toUpperCase() : c; })
    .join(', ');

  if (cleaned) return cleaned;
  return 'disabled' in entry ? entry.callsign : entry.freq.channel;
}
