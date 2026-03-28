import { describe, it, expect } from 'vitest';
import { haversineKm } from '../utils/geo';
import { hzToMhz, formatMhz } from '../utils/freq';
import { isNational, getNationalNum, parseChannels } from '../utils/national';
import { makeNationalRepeater, makeRepeater } from './fixtures';

// ── geo ────────────────────────────────────────────────────────────────────────

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(43.2, 27.9, 43.2, 27.9)).toBe(0);
  });

  it('returns ~111 km per degree of latitude', () => {
    const km = haversineKm(0, 0, 1, 0);
    expect(km).toBeCloseTo(111.2, 0);
  });

  it('calculates Sofia → Varna (~400 km)', () => {
    const km = haversineKm(42.7, 23.3, 43.2, 27.9);
    expect(km).toBeGreaterThan(350);
    expect(km).toBeLessThan(450);
  });
});

// ── freq ───────────────────────────────────────────────────────────────────────

describe('hzToMhz', () => {
  it('converts Hz to MHz', () => {
    expect(hzToMhz(145_600_000)).toBeCloseTo(145.6);
  });
});

describe('formatMhz', () => {
  it('formats with 6 decimal places by default', () => {
    expect(formatMhz(145_600_000)).toBe('145.600000');
  });

  it('formats with custom decimal places', () => {
    expect(formatMhz(438_700_000, 5)).toBe('438.70000');
  });
});

// ── national ───────────────────────────────────────────────────────────────────

describe('parseChannels', () => {
  it('splits comma-separated tokens', () => {
    expect(parseChannels('R2,RU696')).toEqual(['R2', 'RU696']);
  });

  it('trims whitespace', () => {
    expect(parseChannels('R2, R5')).toEqual(['R2', 'R5']);
  });
});

describe('getNationalNum', () => {
  it('extracts national channel number', () => {
    const r = makeNationalRepeater('R2', { callsign: 'R2 VRN' });
    expect(getNationalNum(r)).toBe(2);
  });

  it('returns null for non-national channels', () => {
    const r = makeRepeater({
      callsign: 'LZ0ZAF',
      freq: { rx: 431_100_000, tx: 438_700_000, tone: 88.5, channel: 'RU696' },
    });
    expect(getNationalNum(r)).toBeNull();
  });

  it('handles channel strings with suffix like R0KAC', () => {
    const r = makeNationalRepeater('R0KAC', { callsign: 'R0 KAC' });
    expect(getNationalNum(r)).toBe(0);
  });

  it('handles multi-channel strings', () => {
    const r = makeNationalRepeater('R2,RU696', { callsign: 'R2 VRN' });
    expect(getNationalNum(r)).toBe(2);
  });
});

describe('isNational', () => {
  it('returns true for national channels', () => {
    const r = makeNationalRepeater('R5', { callsign: 'R5 SOF' });
    expect(isNational(r)).toBe(true);
  });

  it('returns false for non-national channels', () => {
    const r = makeRepeater({ callsign: 'LZ0ZAF' });
    expect(isNational(r)).toBe(false);
  });
});
