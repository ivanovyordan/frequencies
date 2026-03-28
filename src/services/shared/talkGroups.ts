export const DMR_RECEIVE_GROUP = 'BG DMR';

export interface DmrTalkGroup {
  name: string;
  id: number;
  type: 'GroupCall' | 'PrivateCall';
}

export const DMR_RECEIVE_TGS: DmrTalkGroup[] = [
  { name: 'Local', id: 9, type: 'GroupCall' },
  { name: 'Regional', id: 8, type: 'GroupCall' },
  { name: 'Worldwide', id: 91, type: 'GroupCall' },
  { name: 'Europe', id: 92, type: 'GroupCall' },
  { name: 'Bulgaria', id: 284, type: 'GroupCall' },
  { name: 'Varna', id: 2840, type: 'GroupCall' },
  { name: 'Sofia', id: 2842, type: 'GroupCall' },
  { name: 'Plovdiv', id: 2843, type: 'GroupCall' },
  { name: 'Burgas', id: 2844, type: 'GroupCall' },
  { name: 'Stara-Zagora', id: 2845, type: 'GroupCall' },
  { name: 'Northwest', id: 2846, type: 'GroupCall' },
  { name: 'Southwest', id: 2847, type: 'GroupCall' },
  { name: 'Ruse', id: 2848, type: 'GroupCall' },
  { name: 'Emergency', id: 284112, type: 'GroupCall' },
  { name: 'XLX359B', id: 284359, type: 'GroupCall' },
];

export const DMR_PRIVATE_TGS: DmrTalkGroup[] = [
  { name: 'SMS Test', id: 284990, type: 'PrivateCall' },
  { name: 'Repeater Info', id: 284991, type: 'PrivateCall' },
  { name: 'Parrot', id: 284997, type: 'PrivateCall' },
  { name: 'APRS', id: 284999, type: 'PrivateCall' },
  { name: 'Disconnect', id: 4000, type: 'PrivateCall' },
];

export const DMR_ALL_TGS: DmrTalkGroup[] = [...DMR_RECEIVE_TGS, ...DMR_PRIVATE_TGS];

export const APRS_TG_ID = 284999;
