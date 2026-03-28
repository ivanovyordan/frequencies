import yaml from 'js-yaml';
import type { RadioChannel } from '../../types/channel';
import type { BuilderOptions } from '../builders';
import { expandChannels } from '../shared/channels';
import { APRS_TG_ID } from '../shared/talkGroups';
import { buildQdmrContacts, buildQdmrGroupList, RADIO_ID_KEY, tgKey } from './contacts';
import { buildQdmrChannels } from './channels';
import { buildQdmrZones } from './zones';
import type { QdmrDmrContact, QdmrDocument } from './types';

function buildUserContacts(options?: BuilderOptions): Array<{ dmr: QdmrDmrContact }> {
  const rows = options?.contactList;
  if (!rows || rows.length === 0) return [];
  return rows.map((r) => ({
    dmr: {
      id: `user_${r.radioId}`,
      name: `${r.callsign} ${r.name}`.trim(),
      type: 'PrivateCall' as const,
      number: r.radioId,
    },
  }));
}

export function buildQdmrYaml(
  channels: RadioChannel[],
  options?: BuilderOptions,
): string {
  const expanded = expandChannels(channels);
  const dmrId = parseInt(options?.radioId?.dmrId ?? '');
  const callsign = options?.radioId?.callsign.trim() ?? '';
  const hasRadioId = !!(callsign && dmrId > 0);
  const channelEntries = buildQdmrChannels(expanded, hasRadioId);
  const aprsPeriod = options?.aprsSettings?.autoTxInterval ?? 0;

  const doc: QdmrDocument = {
    ...(hasRadioId && {
      radioIDs: [{
        dmr: { id: RADIO_ID_KEY, name: callsign, number: dmrId },
      }],
    }),
    contacts: [...buildQdmrContacts(), ...buildUserContacts(options)],
    groupLists: [buildQdmrGroupList()],
    channels: channelEntries.map((e) => e.entry),
    zones: buildQdmrZones(expanded),
    ...(aprsPeriod > 0 && {
      gnss: {
        systems: ['GPS', 'Glonass'],
        units: 'Metric' as const,
      },
      positioning: [{
        dmr: {
          id: 'pos0',
          name: 'BM APRS',
          period: aprsPeriod,
          contact: tgKey(APRS_TG_ID),
        },
      }],
    }),
  };

  return yaml.dump(doc, { lineWidth: -1, noRefs: true });
}
