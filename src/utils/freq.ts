export const HZ_PER_MHZ = 1_000_000;

/** Convert Hz to MHz. */
export function hzToMhz(hz: number): number {
  return hz / HZ_PER_MHZ;
}

/** Format MHz for display or CSV (e.g. 145.400000). */
export function formatMhz(hz: number, decimals = 6): string {
  return hzToMhz(hz).toFixed(decimals);
}
