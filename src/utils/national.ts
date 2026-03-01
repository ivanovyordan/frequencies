import type { Repeater } from '../types/repeater';

// Matches a single channel token like "R0", "R2", "R12" — NOT "RU...", "RV..."
export const NATIONAL_CHANNEL_RE = /^R(\d+)$/;

/** Parse a comma-separated channel string into tokens. */
export function parseChannels(channelStr: string): string[] {
    return channelStr.split(',').map((c) => c.trim());
}

/** Returns the national channel number (0–14) if it's a national repeater, else null. */
export function getNationalNum(r: Repeater): number | null {
    for (const ch of parseChannels(r.freq.channel)) {
        const match = NATIONAL_CHANNEL_RE.exec(ch);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num <= 14) return num;
        }
    }
    return null;
}

/** Checks if a repeater is on a national channel. */
export function isNational(r: Repeater): boolean {
    return getNationalNum(r) !== null;
}
