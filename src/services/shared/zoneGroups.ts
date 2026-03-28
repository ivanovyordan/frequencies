import { oblastForPlace } from '../../constants/bgOblasts';
import type { ExpandedChannel } from './channels';

export function groupBy<K, V>(items: V[], key: (v: V) => K): Map<K, V[]> {
  const map = new Map<K, V[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

export interface ZoneGroup {
  name: string;
  members: ExpandedChannel[];
}

export function buildZoneGroups(channels: ExpandedChannel[]): ZoneGroup[] {
  const zones: ZoneGroup[] = [];

  function add(name: string, members: ExpandedChannel[]): void {
    if (members.length === 0) return;
    zones.push({ name, members });
  }

  const nationals = channels.filter((ch) => ch.category === 'national' && !ch.dmr);
  const locals = channels.filter((ch) => ch.category === 'local' && !ch.dmr);
  const dmr = channels.filter((ch) => !!ch.dmr);
  const simplex = channels.filter((ch) => ch.category === 'simplex');
  const pmr = channels.filter((ch) => ch.category === 'pmr');
  const aprs = channels.filter((ch) => ch.category === 'aprs');
  const custom = channels.filter((ch) => ch.category === 'custom');

  add('All Channels', channels);
  add('National Repeaters', nationals);
  add('Local Repeaters', locals);
  add('Analog Repeaters', [...nationals, ...locals]);
  add('DMR Repeaters', dmr);

  const byOblast = groupBy([...nationals, ...locals], (ch) => oblastForPlace(ch.place));
  for (const [oblast, members] of byOblast) {
    add(oblast.slice(0, 16), members);
  }

  add('Simplex', simplex);
  add('PMR', pmr);
  add('APRS', aprs);
  add('Custom', custom);

  return zones;
}
