import type { ExpandedChannel } from '../shared/channels';
import { buildZoneGroups } from '../shared/zoneGroups';
import { channelKey } from './channels';
import type { QdmrZone } from './types';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

export function buildQdmrZones(channels: ExpandedChannel[]): QdmrZone[] {
  const nameToKey = new Map<string, string>();
  channels.forEach((ch, i) => nameToKey.set(ch.name, channelKey(i)));

  return buildZoneGroups(channels).map(({ name, members }) => ({
    id: `zone_${slugify(name)}`,
    name,
    channels: members.map((ch) => nameToKey.get(ch.name)!),
  }));
}
