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

// Returns the national channel number (0–14) if this repeater is national, else null.
function getNationalNum(r: Repeater): number | null {
  for (const ch of parseChannels(r.freq.channel)) {
    const match = NATIONAL_CHANNEL_RE.exec(ch);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num <= 14) return num;
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

/** Keep one repeater per national channel number — prefer the closest when coords are available. */
function deduplicateNationals(repeaters: Repeater[], coords: Coordinates): Repeater[] {
  const best = new Map<number, Repeater>();
  for (const r of repeaters) {
    const num = getNationalNum(r)!;
    const existing = best.get(num);
    if (!existing) {
      best.set(num, r);
    } else if (coords.latitude !== null && coords.longitude !== null) {
      const existDist = haversineKm(coords.latitude, coords.longitude, existing.latitude, existing.longitude);
      const newDist = haversineKm(coords.latitude, coords.longitude, r.latitude, r.longitude);
      if (newDist < existDist) best.set(num, r);
    }
  }
  return [...best.values()];
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
 *   1. National repeaters   — deduplicated, sorted R0 → R14
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
  // Deduplicated to one per channel number, sorted R0 → R14.
  const allNationalCallsigns = new Set(active.filter(isNational).map((r) => r.callsign));

  const nationals: Repeater[] = filters.national
    ? deduplicateNationals(
        active.filter((r) => isNational(r) && hasUsableMode(r)),
        coords,
      ).sort((a, b) => (getNationalNum(a) ?? 99) - (getNationalNum(b) ?? 99))
    : [];

  // Section 2 — Everything else that matches, sorted by distance.
  // Exclude ALL national-channel repeaters so they never appear in both sections.
  const others: Repeater[] = active
    .filter((r) => !allNationalCallsigns.has(r.callsign) && matchesNonNationalFilters(r, filters))
    .sort(byDistance(coords));

  const result: (Repeater | StaticChannel)[] = [...nationals, ...others];

  // Section 3 — Simplex
  if (filters.simplex) result.push(...SIMPLEX_CHANNELS);

  // Section 4 — PMR
  if (filters.pmr) result.push(...PMR_CHANNELS);

  return result;
}
