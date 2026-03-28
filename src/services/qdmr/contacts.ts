import { DMR_ALL_TGS, DMR_RECEIVE_GROUP, DMR_RECEIVE_TGS } from '../shared/talkGroups';
import type { QdmrDmrContact, QdmrGroupList } from './types';

export const GROUP_LIST_ID = 'grp_bg';
export const RADIO_ID_KEY = 'id0';

export function tgKey(id: number): string {
  return `tg_${id}`;
}

export function buildQdmrContacts(): Array<{ dmr: QdmrDmrContact }> {
  return DMR_ALL_TGS.map((t) => ({
    dmr: { id: tgKey(t.id), name: t.name, type: t.type, number: t.id },
  }));
}

export function buildQdmrGroupList(): QdmrGroupList {
  return {
    id: GROUP_LIST_ID,
    name: DMR_RECEIVE_GROUP,
    contacts: DMR_RECEIVE_TGS.map((t) => tgKey(t.id)),
  };
}
