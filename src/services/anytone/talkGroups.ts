import { buildCsv } from '../../utils/csv';
import { DMR_ALL_TGS, DMR_RECEIVE_GROUP, DMR_RECEIVE_TGS } from '../shared/talkGroups';

// Re-export shared constants for existing consumers
export { DMR_RECEIVE_GROUP, DMR_RECEIVE_TGS } from '../shared/talkGroups';

export function buildReceiveGroupListCsv(): string {
  const header = ['No.', 'Group Name', 'Contact', 'Contact TG/DMR ID'];
  const names = DMR_RECEIVE_TGS.map((t) => t.name).join('|');
  const ids = DMR_RECEIVE_TGS.map((t) => t.id).join('|');
  return buildCsv(header, [[1, DMR_RECEIVE_GROUP, names, ids]]);
}

export function buildTalkGroupCsv(): string {
  const rows = DMR_ALL_TGS.map((t, i) => [
    i + 1, t.id, t.name, t.type === 'GroupCall' ? 'Group Call' : 'Private Call', 'None',
  ]);
  return buildCsv(['No.', 'Radio ID', 'Name', 'Call Type', 'Call Alert'], rows);
}
