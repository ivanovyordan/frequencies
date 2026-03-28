import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { buildQdmrContacts, buildQdmrGroupList } from '../services/qdmr/contacts';
import { buildQdmrChannels } from '../services/qdmr/channels';
import { buildQdmrZones } from '../services/qdmr/zones';
import { buildQdmrYaml } from '../services/qdmr';
import { expandChannels } from '../services/shared/channels';
import { mapChannels } from '../services/channelMapper';
import { makeDmrRepeater, makeRepeater } from './fixtures';
import type { QdmrDocument } from '../services/qdmr/types';

// ── Contacts ──────────────────────────────────────────────────────────────────

describe('buildQdmrContacts', () => {
  const contacts = buildQdmrContacts();

  it('includes all group-call TGs plus private-call entries', () => {
    expect(contacts.length).toBe(20); // 15 group + 5 private
  });

  it('includes Bulgaria TG 284 as GroupCall', () => {
    const bg = contacts.find((c) => c.dmr.number === 284);
    expect(bg).toBeDefined();
    expect(bg!.dmr.type).toBe('GroupCall');
    expect(bg!.dmr.id).toBe('tg_284');
  });

  it('includes Local TG 9 as GroupCall', () => {
    const local = contacts.find((c) => c.dmr.number === 9);
    expect(local).toBeDefined();
    expect(local!.dmr.type).toBe('GroupCall');
  });

  it('includes Parrot as PrivateCall', () => {
    const parrot = contacts.find((c) => c.dmr.number === 284997);
    expect(parrot).toBeDefined();
    expect(parrot!.dmr.type).toBe('PrivateCall');
  });
});

// ── Group List ────────────────────────────────────────────────────────────────

describe('buildQdmrGroupList', () => {
  const grp = buildQdmrGroupList();

  it('has id grp_bg and name BG DMR', () => {
    expect(grp.id).toBe('grp_bg');
    expect(grp.name).toBe('BG DMR');
  });

  it('contains only group-call TG keys (15 entries)', () => {
    expect(grp.contacts).toHaveLength(15);
    expect(grp.contacts).toContain('tg_284');
    expect(grp.contacts).toContain('tg_9');
  });

  it('does not contain private-call TGs', () => {
    expect(grp.contacts).not.toContain('tg_284997');
    expect(grp.contacts).not.toContain('tg_4000');
  });
});

// ── Channels — analog ─────────────────────────────────────────────────────────

describe('buildQdmrChannels — analog', () => {
  const repeater = makeRepeater({ callsign: 'LZ0ASG' });
  const expanded = expandChannels(mapChannels([repeater]));
  const result = buildQdmrChannels(expanded, false);

  it('produces one entry', () => {
    expect(result).toHaveLength(1);
  });

  it('has analog wrapper key', () => {
    expect('analog' in result[0].entry).toBe(true);
  });

  it('converts frequency to MHz', () => {
    const ch = (result[0].entry as { analog: { rxFrequency: number; txFrequency: number } }).analog;
    expect(ch.rxFrequency).toBeCloseTo(438.7);
    expect(ch.txFrequency).toBeCloseTo(431.1);
  });

  it('includes CTCSS tones when > 0', () => {
    const ch = (result[0].entry as { analog: { rxTone?: { ctcss: number } } }).analog;
    expect(ch.rxTone).toEqual({ ctcss: 88.5 });
  });

  it('assigns key ch0', () => {
    expect(result[0].key).toBe('ch0');
  });
});

describe('buildQdmrChannels — analog without CTCSS', () => {
  const repeater = makeRepeater({
    callsign: 'LZ0TEST',
    freq: { rx: 145_500_000, tx: 145_500_000, tone: 0, channel: 'S20' },
  });
  const expanded = expandChannels(mapChannels([repeater]));
  const result = buildQdmrChannels(expanded, false);

  it('omits tone fields when CTCSS is 0', () => {
    const ch = (result[0].entry as { analog: { rxTone?: unknown; txTone?: unknown } }).analog;
    expect(ch.rxTone).toBeUndefined();
    expect(ch.txTone).toBeUndefined();
  });
});

// ── Channels — digital (DMR) ─────────────────────────────────────────────────

describe('buildQdmrChannels — DMR', () => {
  const repeater = makeDmrRepeater({ callsign: 'LZ0ZAF', place: 'Варна' });
  const expanded = expandChannels(mapChannels([repeater]));
  const result = buildQdmrChannels(expanded, false);

  it('produces 3 entries (BG + REG + LOC)', () => {
    expect(result).toHaveLength(3);
  });

  it('BG row has TS1 and tg_284', () => {
    const bg = result[0].entry as { digital: { timeSlot: string; contact: string } };
    expect(bg.digital.timeSlot).toBe('TS1');
    expect(bg.digital.contact).toBe('tg_284');
  });

  it('REG row has TS2 and tg_2840 (Varna)', () => {
    const reg = result[1].entry as { digital: { timeSlot: string; contact: string } };
    expect(reg.digital.timeSlot).toBe('TS2');
    expect(reg.digital.contact).toBe('tg_2840');
  });

  it('LOC row has TS2 and tg_9', () => {
    const loc = result[2].entry as { digital: { timeSlot: string; contact: string } };
    expect(loc.digital.timeSlot).toBe('TS2');
    expect(loc.digital.contact).toBe('tg_9');
  });

  it('all rows reference grp_bg', () => {
    for (const { entry } of result) {
      const ch = entry as { digital: { groupList: string } };
      expect(ch.digital.groupList).toBe('grp_bg');
    }
  });

  it('omits radioId when not provided', () => {
    const ch = result[0].entry as { digital: { radioId?: string } };
    expect(ch.digital.radioId).toBeUndefined();
  });
});

describe('buildQdmrChannels — DMR with radioId', () => {
  const repeater = makeDmrRepeater({ callsign: 'LZ0ZAF', place: 'Варна' });
  const expanded = expandChannels(mapChannels([repeater]));
  const result = buildQdmrChannels(expanded, true);

  it('includes radioId on digital channels', () => {
    const ch = result[0].entry as { digital: { radioId?: string } };
    expect(ch.digital.radioId).toBe('id0');
  });
});

// ── Zones ─────────────────────────────────────────────────────────────────────

describe('buildQdmrZones', () => {
  const fm = makeRepeater({ callsign: 'LZ0ASG', place: 'Варна' });
  const dmr = makeDmrRepeater({ callsign: 'LZ0ZAF', place: 'Варна' });
  const expanded = expandChannels(mapChannels([fm, dmr]));
  const zones = buildQdmrZones(expanded);

  it('includes All Channels zone with all channel keys', () => {
    const all = zones.find((z) => z.id === 'zone_all_channels');
    expect(all).toBeDefined();
    expect(all!.channels).toHaveLength(expanded.length);
  });

  it('DMR Repeaters zone only has digital channels', () => {
    const dmrZone = zones.find((z) => z.id === 'zone_dmr_repeaters');
    expect(dmrZone).toBeDefined();
    expect(dmrZone!.channels).toHaveLength(3); // BG + REG + LOC
  });

  it('skips empty zones', () => {
    const pmr = zones.find((z) => z.id === 'zone_pmr');
    expect(pmr).toBeUndefined();
  });
});

// ── Full YAML output ──────────────────────────────────────────────────────────

describe('buildQdmrYaml', () => {
  const fm = makeRepeater({ callsign: 'LZ0ASG' });
  const dmr = makeDmrRepeater({ callsign: 'LZ0ZAF', place: 'Варна' });
  const channels = mapChannels([fm, dmr]);

  it('produces valid YAML with expected top-level keys', () => {
    const output = buildQdmrYaml(channels);
    const doc = yaml.load(output) as QdmrDocument;
    expect(doc.contacts).toBeDefined();
    expect(doc.groupLists).toBeDefined();
    expect(doc.channels).toBeDefined();
    expect(doc.zones).toBeDefined();
  });

  it('omits radioIDs when no radioId provided', () => {
    const output = buildQdmrYaml(channels);
    const doc = yaml.load(output) as QdmrDocument;
    expect(doc.radioIDs).toBeUndefined();
  });

  it('includes radioIDs when valid radioId provided', () => {
    const output = buildQdmrYaml(channels, {
      radioId: { callsign: 'LZ1XYZ', dmrId: '2840001' },
    });
    const doc = yaml.load(output) as QdmrDocument;
    expect(doc.radioIDs).toHaveLength(1);
    expect(doc.radioIDs![0].dmr.name).toBe('LZ1XYZ');
    expect(doc.radioIDs![0].dmr.number).toBe(2840001);
  });

  it('omits radioIDs when dmrId is empty', () => {
    const output = buildQdmrYaml(channels, {
      radioId: { callsign: 'LZ1XYZ', dmrId: '' },
    });
    const doc = yaml.load(output) as QdmrDocument;
    expect(doc.radioIDs).toBeUndefined();
  });

  it('includes gnss and positioning when aprsSettings interval > 0', () => {
    const output = buildQdmrYaml(channels, {
      aprsSettings: { autoTxInterval: 180 },
    });
    const doc = yaml.load(output) as QdmrDocument;
    expect(doc.gnss).toEqual({ systems: ['GPS', 'Glonass'], units: 'Metric' });
    expect(doc.positioning).toHaveLength(1);
    expect(doc.positioning![0].dmr.period).toBe(180);
    expect(doc.positioning![0].dmr.contact).toBe('tg_284999');
    expect(doc.positioning![0].dmr.name).toBe('BM APRS');
  });

  it('includes user contacts when contactList provided', () => {
    const output = buildQdmrYaml(channels, {
      contactList: [
        { radioId: 2840001, callsign: 'LZ1ABC', name: 'Ivan', city: '', state: '', country: 'Bulgaria' },
        { radioId: 2840002, callsign: 'LZ2XYZ', name: 'Petar', city: '', state: '', country: 'Bulgaria' },
      ],
    });
    const doc = yaml.load(output) as QdmrDocument;
    // 20 built-in TGs + 2 user contacts
    expect(doc.contacts).toHaveLength(22);
    const userContact = doc.contacts.find((c) => c.dmr.number === 2840001);
    expect(userContact).toBeDefined();
    expect(userContact!.dmr.type).toBe('PrivateCall');
    expect(userContact!.dmr.name).toBe('LZ1ABC Ivan');
    expect(userContact!.dmr.id).toBe('user_2840001');
  });

  it('omits gnss and positioning when aprsSettings interval is 0', () => {
    const output = buildQdmrYaml(channels, {
      aprsSettings: { autoTxInterval: 0 },
    });
    const doc = yaml.load(output) as QdmrDocument;
    expect(doc.gnss).toBeUndefined();
    expect(doc.positioning).toBeUndefined();
  });
});
