import { DMR_RECEIVE_GROUP, DMR_RECEIVE_TGS } from '../anytone/talkGroups';
import type { QdmrDmrContact, QdmrGroupList } from './types';

export function tgKey(id: number): string {
  return `tg_${id}`;
}

const ALL_TGS: Array<{ name: string; id: number; type: 'GroupCall' | 'PrivateCall' }> = [
  ...DMR_RECEIVE_TGS.map((t) => ({ ...t, type: 'GroupCall' as const })),
  { name: 'SMS Test',       id: 284990, type: 'PrivateCall' },
  { name: 'Repeater Info',  id: 284991, type: 'PrivateCall' },
  { name: 'Parrot',         id: 284997, type: 'PrivateCall' },
  { name: 'APRS',           id: 284999, type: 'PrivateCall' },
  { name: 'Disconnect',     id: 4000,   type: 'PrivateCall' },
];

export function buildQdmrContacts(): Array<{ dmr: QdmrDmrContact }> {
  return ALL_TGS.map((t) => ({
    dmr: { id: tgKey(t.id), name: t.name, type: t.type, number: t.id },
  }));
}

export function buildQdmrGroupList(): QdmrGroupList {
  return {
    id: 'grp_bg',
    name: DMR_RECEIVE_GROUP,
    contacts: DMR_RECEIVE_TGS.map((t) => tgKey(t.id)),
  };
}
