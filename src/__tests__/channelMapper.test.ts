import { describe, it, expect } from 'vitest';
import { mapChannels, countChannels } from '../services/channelMapper';
import { makeRepeater, makeDmrRepeater, makeMixedRepeater } from './fixtures';

describe('mapChannels', () => {
  it('produces one RadioChannel per FM repeater', () => {
    const repeater = makeRepeater({ callsign: 'LZ0ASG' });
    const channels = mapChannels([repeater]);
    expect(channels).toHaveLength(1);
    expect(channels[0].dmr).toBeUndefined();
  });

  it('produces one RadioChannel per DMR repeater', () => {
    const repeater = makeDmrRepeater({ callsign: 'LZ0ZAF' });
    const channels = mapChannels([repeater]);
    expect(channels).toHaveLength(1);
    expect(channels[0].dmr).toBeDefined();
  });

  it('sets mixedMode=true for FM+DMR repeaters', () => {
    const repeater = makeMixedRepeater({ callsign: 'LZ0ZAF' });
    const channels = mapChannels([repeater]);
    expect(channels[0].dmr?.mixedMode).toBe(true);
  });

  it('sets mixedMode=false for DMR-only repeaters', () => {
    const repeater = makeDmrRepeater({ callsign: 'LZ0ZAF' });
    const channels = mapChannels([repeater]);
    expect(channels[0].dmr?.mixedMode).toBe(false);
  });

  it('swaps rx/tx correctly (API perspective vs user perspective)', () => {
    const repeater = makeRepeater({
      callsign: 'LZ0ZAF',
      freq: { rx: 431_100_000, tx: 438_700_000, tone: 88.5, channel: 'RU696' },
    });
    const channels = mapChannels([repeater]);
    // freq.tx = repeater output = our RX
    expect(channels[0].rx).toBe(438_700_000);
    // freq.rx = repeater input  = our TX
    expect(channels[0].tx).toBe(431_100_000);
  });

  it('deduplicates by name — first occurrence wins', () => {
    const r1 = makeRepeater({ callsign: 'LZ0ZAF', latitude: 43.0 });
    const r2 = makeRepeater({ callsign: 'LZ0ZAF', latitude: 44.0 });
    const channels = mapChannels([r1, r2]);
    expect(channels).toHaveLength(1);
    expect(channels[0].rx).toBe(438_700_000);
  });

  it('skips disabled repeaters that have no modes (no-mode entries return null)', () => {
    const noMode = makeRepeater({
      callsign: 'LZ0NONE',
      modes: {
        fm: { enabled: false },
        dmr: { enabled: false, ts1_groups: '', ts2_groups: '', color_code: '', callid: '' },
        dstar: { enabled: false },
        fusion: { enabled: false },
        nxdn: { enabled: false },
        parrot: { enabled: false },
        beacon: { enabled: false },
      },
    });
    expect(mapChannels([noMode])).toHaveLength(0);
  });

  it('passes through raw DMR API fields', () => {
    const repeater = makeDmrRepeater({
      callsign: 'LZ0ZAF',
      modes: {
        fm: { enabled: false },
        dmr: { enabled: true, ts1_groups: '284', ts2_groups: '2840', color_code: '3', callid: '' },
        dstar: { enabled: false },
        fusion: { enabled: false },
        nxdn: { enabled: false },
        parrot: { enabled: false },
        beacon: { enabled: false },
      },
    });
    const ch = mapChannels([repeater])[0];
    expect(ch.dmr?.colorCode).toBe(3);
    expect(ch.dmr?.ts1Groups).toBe('284');
    expect(ch.dmr?.ts2Groups).toBe('2840');
  });

  it('assigns correct category for local repeater', () => {
    const repeater = makeRepeater({ callsign: 'LZ0ZAF' });
    expect(mapChannels([repeater])[0].category).toBe('local');
  });
});

describe('countChannels', () => {
  it('counts FM and DMR channels correctly', () => {
    const fm = makeRepeater({ callsign: 'LZ0FM' });
    const dmr = makeDmrRepeater({ callsign: 'LZ0DMR' });
    const channels = mapChannels([fm, dmr]);
    expect(countChannels(channels)).toEqual({ fm: 1, dmr: 1 });
  });

  it('returns zeros for empty input', () => {
    expect(countChannels([])).toEqual({ fm: 0, dmr: 0 });
  });
});
