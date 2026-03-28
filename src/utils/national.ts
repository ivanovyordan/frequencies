import type { Repeater } from '../types/repeater';

// Matches any token starting with R followed by digits: "R0", "R12", "R0KAC", "R12-2M"
// NOT "RU..." or "RV..." (input-frequency designators filtered elsewhere).
export const NATIONAL_CHANNEL_RE = /^R(\d+)/i;

/** Parse a comma-separated channel string into tokens. */
export function parseChannels(channelStr: string): string[] {
  return channelStr.split(',').map((c) => c.trim());
}

/** Returns the national channel number if the repeater is on a national channel, else null. */
export function getNationalNum(r: Repeater): number | null {
  for (const ch of parseChannels(r.freq.channel)) {
    const match = NATIONAL_CHANNEL_RE.exec(ch);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

/** Checks if a repeater is on a national channel. */
export function isNational(r: Repeater): boolean {
  return getNationalNum(r) !== null;
}
