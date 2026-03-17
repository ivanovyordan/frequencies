import { describe, it, expect } from 'vitest';
import { applyFilters } from '../services/filter';
import { makeRepeater, makeDmrRepeater, makeNationalRepeater, VARNA_COORDS, NO_COORDS } from './fixtures';
import type { FilterState } from '../types/repeater';

const ALL_OFF: FilterState = {
  national: false, analog: false, dmr: false, parrot: false,
  simplex: false, pmr: false, aprs: false, custom: false,
};

describe('applyFilters', () => {
  it('excludes disabled repeaters', () => {
    const r = makeRepeater({ callsign: 'LZ0DIS', disabled: true });
    const result = applyFilters([r], { ...ALL_OFF, analog: true }, NO_COORDS);
    expect(result).toHaveLength(0);
  });

  it('returns empty when all filters are off (no statics)', () => {
    const r = makeRepeater({ callsign: 'LZ0ASG' });
    // With all off, simplex/pmr/aprs are also off so only statics would be added
    const result = applyFilters([r], ALL_OFF, NO_COORDS);
    expect(result).toHaveLength(0);
  });

  it('includes FM repeaters when analog filter is on', () => {
    const r = makeRepeater({ callsign: 'LZ0ASG' });
    const result = applyFilters([r], { ...ALL_OFF, analog: true }, NO_COORDS);
    expect(result).toContain(r);
  });

  it('excludes FM repeaters when analog filter is off', () => {
    const r = makeRepeater({ callsign: 'LZ0ASG' });
    const result = applyFilters([r], { ...ALL_OFF, dmr: true }, NO_COORDS);
    expect(result).not.toContain(r);
  });

  it('includes DMR repeaters when dmr filter is on', () => {
    const r = makeDmrRepeater({ callsign: 'LZ0ZAF' });
    const result = applyFilters([r], { ...ALL_OFF, dmr: true }, NO_COORDS);
    expect(result).toContain(r);
  });

  it('national repeaters appear only once even when both national+analog are on', () => {
    const r = makeNationalRepeater('R2', { callsign: 'R2 VRN' });
    const result = applyFilters([r], { ...ALL_OFF, national: true, analog: true }, NO_COORDS);
    expect(result.filter((e) => 'callsign' in e && e.callsign === 'R2 VRN')).toHaveLength(1);
  });

  it('deduplicates nationals — keeps one per channel number', () => {
    const r1 = makeNationalRepeater('R2', { callsign: 'R2 VRN', latitude: 43.2 });
    const r2 = makeNationalRepeater('R2', { callsign: 'R2 SOF', latitude: 42.7 });
    const result = applyFilters([r1, r2], { ...ALL_OFF, national: true }, NO_COORDS);
    expect(result).toHaveLength(1);
  });

  it('prefers closer national repeater when coords are provided', () => {
    // Varna coords — r1 is closer
    const r1 = makeNationalRepeater('R2', { callsign: 'R2 VRN', latitude: 43.2, longitude: 27.9 });
    const r2 = makeNationalRepeater('R2', { callsign: 'R2 SOF', latitude: 42.7, longitude: 23.3 });
    const result = applyFilters([r1, r2], { ...ALL_OFF, national: true }, VARNA_COORDS);
    expect(result[0]).toBe(r1);
  });

  it('sorts nationals by channel number', () => {
    const r5 = makeNationalRepeater('R5', { callsign: 'R5 SOF' });
    const r2 = makeNationalRepeater('R2', { callsign: 'R2 VRN' });
    const result = applyFilters([r5, r2], { ...ALL_OFF, national: true }, NO_COORDS);
    const callsigns = result.map((e) => ('callsign' in e ? e.callsign : ''));
    expect(callsigns).toEqual(['R2 VRN', 'R5 SOF']);
  });

  it('appends simplex channels when simplex filter is on', () => {
    const result = applyFilters([], { ...ALL_OFF, simplex: true }, NO_COORDS);
    expect(result.length).toBeGreaterThan(0);
  });

  it('appends PMR channels when pmr filter is on', () => {
    const result = applyFilters([], { ...ALL_OFF, pmr: true }, NO_COORDS);
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes enabled custom channels', () => {
    const result = applyFilters([], { ...ALL_OFF, custom: true }, NO_COORDS, [
      { id: '1', name: 'TEST', rxMhz: '145.500', txMhz: '', tone: '', enabled: true },
    ]);
    expect(result).toHaveLength(1);
  });

  it('excludes disabled custom channels', () => {
    const result = applyFilters([], { ...ALL_OFF, custom: true }, NO_COORDS, [
      { id: '1', name: 'TEST', rxMhz: '145.500', txMhz: '', tone: '', enabled: false },
    ]);
    expect(result).toHaveLength(0);
  });
});
