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
}

// ── App state types ────────────────────────────────────────────────────────────

export type SoftwareOption = 'none' | 'chirp' | 'anytone';

export interface FilterState {
  national: boolean;
  analog: boolean;
  dmr: boolean;
  dstar: boolean;
  fusion: boolean;
  parrot: boolean;
  simplex: boolean;
  pmr: boolean;
}

export interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

// ── Chirp output types ─────────────────────────────────────────────────────────

export interface ChirpRow {
  Location: number;
  Name: string;
  Frequency: number; // MHz
  Duplex: '' | '+' | '-';
  Offset: number; // MHz
  Tone: 'Tone' | '';
  rToneFreq: number; // Hz e.g. 88.5
  cToneFreq: number;
  DtcsCode: number;
  DtcsPolarity: 'NN';
  Mode: 'FM';
  TStep: 25;
  Skip: '';
  Comment: string;
  URCALL: '';
  RPT1CALL: '';
  RPT2CALL: '';
  DVCODE: '';
}
