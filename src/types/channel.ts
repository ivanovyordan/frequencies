export type ChannelCategory = 'national' | 'local' | 'simplex' | 'pmr' | 'custom' | 'aprs';

export interface RadioChannel {
  name: string;
  rx: number; // Hz
  tx: number; // Hz
  ctcss: number; // Hz, 0 = off
  category: ChannelCategory;
  place: string;
  pttProhibit?: boolean;
  dmr?: {
    colorCode: number; // from API
    ts1Groups: string; // raw API string e.g. "284"
    ts2Groups: string; // raw API string e.g. "2840,2843"
    mixedMode: boolean; // true if repeater also has FM
  };
}
