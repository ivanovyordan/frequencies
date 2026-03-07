// ── Raw API shape ──────────────────────────────────────────────────────────────

export interface RepeaterFreq {
  rx: number; // Hz integer, e.g. 145600000
  tx: number; // Hz integer, e.g. 145000000
  tone: number; // Hz float, e.g. 88.5 (0 = no CTCSS)
  channel: string; // e.g. "R2", "RU672"
}

export interface RepeaterModeFM {
  enabled: boolean;
}

export interface RepeaterModeDMR {
  enabled: boolean;
  ts1_groups: string;
  ts2_groups: string;
  color_code: string;
  callid: string;
}

export interface RepeaterModes {
  fm: RepeaterModeFM;
  dmr: RepeaterModeDMR;
  dstar: { enabled: boolean };
  fusion: { enabled: boolean };
  nxdn: { enabled: boolean };
  parrot: { enabled: boolean };
  beacon: { enabled: boolean };
  am?: { enabled: boolean };
  usb?: { enabled: boolean };
  lsb?: { enabled: boolean };
}

export interface Repeater {
  callsign: string;
  disabled: boolean;
  keeper: string;
  latitude: number;
  longitude: number;
  altitude: number;
  place: string;
  location?: string;
  qth: string;
  freq: RepeaterFreq;
  modes: RepeaterModes;
  internet?: { echolink?: number };
  info?: string[];
  added: string;
  updated: string;
}

// ── Static channels (simplex, PMR) ────────────────────────────────────────────

export interface StaticChannel {
  callsign: string;
  place: string;
  freq: RepeaterFreq;
  modes: RepeaterModes;
  pttProhibit?: boolean;
}

/** Type guard to distinguish repeaters from static channels. */
export function isRepeater(entry: Repeater | StaticChannel): entry is Repeater {
  return 'disabled' in entry;
}

// ── App state types ────────────────────────────────────────────────────────────

export type SoftwareOption = 'chirp' | 'anytone';

export interface FilterState {
  national: boolean;
  analog: boolean;
  dmr: boolean;
  parrot: boolean;
  simplex: boolean;
  pmr: boolean;
  aprs: boolean;
  custom: boolean;
}

export interface CustomChannelDMR {
  colorCode: string;   // e.g. "1"
  slot: '1' | '2';
  talkgroups: string;  // comma-separated TG IDs
}

export interface CustomChannel {
  id: string;
  name: string;    // ≤16 chars
  rxMhz: string;   // e.g. "144.500"
  txMhz: string;   // "" = same as RX (simplex)
  tone: string;    // Hz, "" = off (ignored for DMR)
  enabled: boolean;
  dmr?: CustomChannelDMR;
}

export interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface RadioId {
  callsign: string; // e.g. "LZ9DB"
  dmrId: string;    // numeric string, empty = not set
}

export interface ContactListSettings {
  enabled: boolean;
  scope: 'bulgaria' | 'worldwide';
}

