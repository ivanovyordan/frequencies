import { describe, it, expect } from 'vitest';
import {
  expandChannels,
  regionalTgForPlace,
  OBLAST_TO_REGIONAL_TG,
} from '../services/anytone/channels';
import { mapChannels } from '../services/channelMapper';
import { makeDmrRepeater, makeMixedRepeater, makeRepeater } from './fixtures';

// ── regionalTgForPlace ─────────────────────────────────────────────────────────

describe('regionalTgForPlace', () => {
  it('returns correct TG for known city (Варна → Varna → 2840)', () => {
    expect(regionalTgForPlace('Варна')).toBe(2840);
  });

  it('returns correct TG for Plovdiv oblast', () => {
    expect(regionalTgForPlace('Пловдив')).toBe(2843);
  });

  it('returns undefined for unmapped place', () => {
    expect(regionalTgForPlace('Unknown City')).toBeUndefined();
  });

  it('covers all expected Bulgarian regions', () => {
    const expectedTgs = [2840, 2842, 2843, 2844, 2845, 2846, 2847, 2848];
    const covered = new Set(OBLAST_TO_REGIONAL_TG.values());
    for (const tg of expectedTgs) {
      expect(covered.has(tg)).toBe(true);
    }
  });
});

// ── expandChannels — DMR ───────────────────────────────────────────────────────

describe('expandChannels — DMR repeater with known region', () => {
  const repeater = makeDmrRepeater({ callsign: 'LZ0ZAF', place: 'Варна' });
  const radioChannels = mapChannels([repeater]);
  const expanded = expandChannels(radioChannels);

  it('produces 3 rows (BG + REG + LOC)', () => {
    expect(expanded).toHaveLength(3);
  });

  it('Row A is National — TS1 / TG 284', () => {
    const bg = expanded.find((c) => c.name.endsWith(' BG'));
    expect(bg?.dmr?.slot).toBe(1);
    expect(bg?.dmr?.tgId).toBe(284);
  });

  it('Row B is Regional — TS2 / regional TG', () => {
    const reg = expanded.find((c) => c.name.endsWith(' REG'));
    expect(reg?.dmr?.slot).toBe(2);
    expect(reg?.dmr?.tgId).toBe(2840);
  });

  it('Row C is Local — TS2 / TG 9', () => {
    const loc = expanded.find((c) => c.name.endsWith(' LOC'));
    expect(loc?.dmr?.slot).toBe(2);
    expect(loc?.dmr?.tgId).toBe(9);
  });
});

describe('expandChannels — DMR repeater with unmapped region', () => {
  const repeater = makeDmrRepeater({ callsign: 'LZ0XYZ', place: 'UnknownPlace' });
  const radioChannels = mapChannels([repeater]);
  const expanded = expandChannels(radioChannels);

  it('produces 2 rows (BG + LOC, no REG)', () => {
    expect(expanded).toHaveLength(2);
    expect(expanded.find((c) => c.name.endsWith(' REG'))).toBeUndefined();
  });
});

describe('expandChannels — mixed-mode (FM+DMR)', () => {
  const repeater = makeMixedRepeater({ callsign: 'LZ0ZAF', place: 'Варна' });
  const expanded = expandChannels(mapChannels([repeater]));

  it('marks all DMR rows as mixedMode', () => {
    for (const ch of expanded) {
      expect(ch.dmr?.mixedMode).toBe(true);
    }
  });
});

describe('expandChannels — FM-only repeater', () => {
  const repeater = makeRepeater({ callsign: 'LZ0ASG' });
  const expanded = expandChannels(mapChannels([repeater]));

  it('produces exactly 1 analog row', () => {
    expect(expanded).toHaveLength(1);
    expect(expanded[0].dmr).toBeUndefined();
  });
});

describe('expandChannels — deduplication', () => {
  it('first occurrence wins on name collision', () => {
    const r1 = makeDmrRepeater({ callsign: 'LZ0ZAF', place: 'Варна' });
    const r2 = makeDmrRepeater({ callsign: 'LZ0ZAF', place: 'Варна' });
    const expanded = expandChannels(mapChannels([r1, r2]));
    // mapChannels deduplicates at source, so only 3 rows expected
    expect(expanded).toHaveLength(3);
  });
});
