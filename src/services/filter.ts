import type { Repeater, StaticChannel, FilterState, Coordinates } from '../types/repeater';
import { SIMPLEX_CHANNELS } from '../constants/simplex';
import { PMR_CHANNELS } from '../constants/pmr';
import { haversineKm } from '../utils/geo';

// Matches a single channel token like "R0", "R2", "R12" — NOT "RU...", "RV..."
const NATIONAL_CHANNEL_RE = /^R(\d+)$/;

// The channel field can be comma-separated: "R2, RV52"
function parseChannels(channelStr: string): string[] {
  return channelStr.split(',').map((c) => c.trim());
}

// Returns the national channel number (0–12) if this repeater is national, else null.
function getNationalNum(r: Repeater): number | null {
  for (const ch of parseChannels(r.freq.channel)) {
    const match = NATIONAL_CHANNEL_RE.exec(ch);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num <= 12) return num;
    }
  }
  return null;
}

function isNational(r: Repeater): boolean {
  return getNationalNum(r) !== null;
}

function hasUsableMode(r: Repeater): boolean {
  return r.modes.fm.enabled || r.modes.dmr.enabled;
}

function matchesNonNationalFilters(r: Repeater, filters: FilterState): boolean {
  return (
    (filters.analog && r.modes.fm.enabled) ||
    (filters.dmr && r.modes.dmr.enabled) ||
    (filters.parrot && r.modes.parrot.enabled)
  );
}

function byDistance(coords: Coordinates) {
  return (a: Repeater, b: Repeater): number => {
    const { latitude: lat, longitude: lon } = coords;
    if (lat === null || lon === null) return 0;
    return (
      haversineKm(lat, lon, a.latitude, a.longitude) -
      haversineKm(lat, lon, b.latitude, b.longitude)
    );
  };
}

/**
 * Returns entries in display order:
 *   1. National repeaters   — sorted R0 → R12
 *   2. Other repeaters      — sorted by distance (nearest first)
 *   3. Simplex channels     — hardcoded, in frequency order
 *   4. PMR channels         — hardcoded, in frequency order
 */
export function applyFilters(
  repeaters: Repeater[],
  filters: FilterState,
  coords: Coordinates,
): (Repeater | StaticChannel)[] {
  const active = repeaters.filter((r) => !r.disabled);

  // Section 1 — National (FM or DMR only; skip pure D-Star/Fusion)
  const nationals: Repeater[] = filters.national
    ? active
        .filter((r) => isNational(r) && hasUsableMode(r))
        .sort((a, b) => (getNationalNum(a) ?? 99) - (getNationalNum(b) ?? 99))
    : [];

  const nationalCallsigns = new Set(nationals.map((r) => r.callsign));

  // Section 2 — Everything else that matches, sorted by distance
  const others: Repeater[] = active
    .filter((r) => !nationalCallsigns.has(r.callsign) && matchesNonNationalFilters(r, filters))
    .sort(byDistance(coords));

  const result: (Repeater | StaticChannel)[] = [...nationals, ...others];

  // Section 3 — Simplex
  if (filters.simplex) result.push(...SIMPLEX_CHANNELS);

  // Section 4 — PMR
  if (filters.pmr) result.push(...PMR_CHANNELS);

  return result;
}
