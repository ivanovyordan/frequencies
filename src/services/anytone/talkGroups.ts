import { buildCsv } from '../../utils/csv';

// ── ReceiveGroupCallList.CSV ───────────────────────────────────────────────────

export const DMR_RECEIVE_GROUP = 'BG DMR';

/** Group-call TGs included in the receive group list (names must match TalkGroups.CSV). */
export const DMR_RECEIVE_TGS: Array<{ name: string; id: number }> = [
  { name: 'Local',        id: 9 },
  { name: 'Regional',     id: 8 },
  { name: 'Worldwide',    id: 91 },
  { name: 'Europe',       id: 92 },
  { name: 'Bulgaria',     id: 284 },
  { name: 'Varna',        id: 2840 },
  { name: 'Sofia',        id: 2842 },
  { name: 'Plovdiv',      id: 2843 },
  { name: 'Burgas',       id: 2844 },
  { name: 'Stara-Zagora', id: 2845 },
  { name: 'Northwest',    id: 2846 },
  { name: 'Southwest',    id: 2847 },
  { name: 'Ruse',        id: 2848 },
  { name: 'Emergency',    id: 284112 },
  { name: 'XLX359B',      id: 284359 },
];

export function buildReceiveGroupListCsv(): string {
  const header = ['No.', 'Group Name', 'Contact', 'Contact TG/DMR ID'];
  const names = DMR_RECEIVE_TGS.map((t) => t.name).join('|');
  const ids = DMR_RECEIVE_TGS.map((t) => t.id).join('|');
  return buildCsv(header, [[1, DMR_RECEIVE_GROUP, names, ids]]);
}

// ── TalkGroups.CSV ─────────────────────────────────────────────────────────────

export function buildTalkGroupCsv(): string {
  const rows: (string | number)[][] = [
    [1,   9,      'Local',        'Group Call',   'None'],
    [2,   8,      'Regional',     'Group Call',   'None'],
    [3,   91,     'Worldwide',    'Group Call',   'None'],
    [4,   92,     'Europe',       'Group Call',   'None'],
    [5,   284,    'Bulgaria',     'Group Call',   'None'],
    [6,   2840,   'Varna',        'Group Call',   'None'],
    [7,   2842,   'Sofia',        'Group Call',   'None'],
    [8,   2843,   'Plovdiv',      'Group Call',   'None'],
    [9,   2844,   'Burgas',       'Group Call',   'None'],
    [10,  2845,   'Stara-Zagora', 'Group Call',   'None'],
    [11,  2846,   'Northwest',    'Group Call',   'None'],
    [12,  2847,   'Southwest',    'Group Call',   'None'],
    [13,  2848,   'Ruse',        'Group Call',   'None'],
    [14,  284112, 'Emergency',    'Group Call',   'None'],
    [15,  284359, 'XLX359B',      'Group Call',   'None'],
    [16,  284990, 'SMS Test',     'Private Call', 'None'],
    [17,  284991, 'Repeater Info','Private Call', 'None'],
    [18,  284997, 'Parrot',       'Private Call', 'None'],
    [19,  284999, 'APRS',         'Private Call', 'None'],
  ];
  return buildCsv(['No.', 'Radio ID', 'Name', 'Call Type', 'Call Alert'], rows);
}
