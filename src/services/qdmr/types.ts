export interface QdmrAnalogChannel {
  id: string;
  name: string;
  rxFrequency: number;
  txFrequency: number;
  power: 'Low' | 'High';
  squelch: number;
  rxTone?: { ctcss: number };
  txTone?: { ctcss: number };
}

export interface QdmrDigitalChannel {
  id: string;
  name: string;
  rxFrequency: number;
  txFrequency: number;
  power: 'Low' | 'High';
  colorCode: number;
  timeSlot: 'TS1' | 'TS2';
  groupList: string;
  contact: string;
  radioId?: string;
}

export type QdmrChannelEntry = { analog: QdmrAnalogChannel } | { digital: QdmrDigitalChannel };

export interface QdmrDmrContact {
  id: string;
  name: string;
  type: 'GroupCall' | 'PrivateCall';
  number: number;
}

export interface QdmrGroupList {
  id: string;
  name: string;
  contacts: string[];
}

export interface QdmrZone {
  id: string;
  name: string;
  A: string[];
}

export interface QdmrRadioId {
  id: string;
  name: string;
  number: number;
}

export interface QdmrDmrPositioning {
  id: string;
  name: string;
  period: number;
  contact: string;
}

export interface QdmrGnss {
  systems: string[];
  units: 'Metric' | 'Archaic';
}

export interface QdmrDocument {
  radioIDs?: Array<{ dmr: QdmrRadioId }>;
  contacts: Array<{ dmr: QdmrDmrContact }>;
  groupLists: QdmrGroupList[];
  channels: QdmrChannelEntry[];
  zones: QdmrZone[];
  gnss?: QdmrGnss;
  positioning?: Array<{ dmr: QdmrDmrPositioning }>;
}
