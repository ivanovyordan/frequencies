import { oblastForPlace } from '../../constants/bgOblasts';
import type { AnytoneChannel } from '../anytone/channels';
import { groupBy } from '../anytone/zones';
import { channelKey } from './channels';
import type { QdmrZone } from './types';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

export function buildQdmrZones(channels: AnytoneChannel[]): QdmrZone[] {
  const zones: QdmrZone[] = [];
  const nameToKey = new Map<string, string>();
  channels.forEach((ch, i) => nameToKey.set(ch.name, channelKey(i)));

  function keys(members: AnytoneChannel[]): string[] {
    return members.map((ch) => nameToKey.get(ch.name)!);
  }

  function addZone(id: string, name: string, members: AnytoneChannel[]): void {
    if (members.length === 0) return;
    zones.push({ id, name, channels: keys(members) });
  }

  const nationals = channels.filter((ch) => ch.category === 'national' && !ch.dmr);
  const locals = channels.filter((ch) => ch.category === 'local' && !ch.dmr);
  const dmr = channels.filter((ch) => !!ch.dmr);
  const simplex = channels.filter((ch) => ch.category === 'simplex');
  const pmr = channels.filter((ch) => ch.category === 'pmr');
  const aprs = channels.filter((ch) => ch.category === 'aprs');
  const custom = channels.filter((ch) => ch.category === 'custom');

  addZone('zone_all', 'All Channels', channels);
  addZone('zone_national', 'National Repeaters', nationals);
  addZone('zone_local', 'Local Repeaters', locals);
  addZone('zone_analog', 'Analog Repeaters', [...nationals, ...locals]);
  addZone('zone_dmr', 'DMR Repeaters', dmr);

  const byOblast = groupBy([...nationals, ...locals], (ch) => oblastForPlace(ch.place));
  for (const [oblast, members] of byOblast) {
    addZone(`zone_${slugify(oblast)}`, oblast, members);
  }

  addZone('zone_simplex', 'Simplex', simplex);
  addZone('zone_pmr', 'PMR', pmr);
  addZone('zone_aprs', 'APRS', aprs);
  addZone('zone_custom', 'Custom', custom);

  return zones;
}
