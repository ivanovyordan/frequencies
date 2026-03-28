import { buildCsv } from '../../utils/csv';
import { formatMhz } from '../../utils/freq';
import { DMR_RECEIVE_GROUP } from '../shared/talkGroups';
import type { ExpandedChannel } from '../shared/channels';

// Re-export shared types for existing consumers
export type { ExpandedChannel } from '../shared/channels';
export { expandChannels, OBLAST_TO_REGIONAL_TG, regionalTgForPlace } from '../shared/channels';

// Keep AnytoneChannel as a type alias for backward compat in tests
export type AnytoneChannel = ExpandedChannel;

function ctcssTone(hz: number): string {
  return hz > 0 ? hz.toFixed(1) : 'Off';
}

function mhz5(hz: number): string {
  return formatMhz(hz, 5);
}

export function buildChannelCsv(channels: ExpandedChannel[], radioName: string): string {
  // 55 columns matching AnyTone CPS export format
  const header = [
    'No.',
    'Channel Name',
    'Receive Frequency',
    'Transmit Frequency',
    'Channel Type',
    'Transmit Power',
    'Band Width',
    'CTCSS/DCS Decode',
    'CTCSS/DCS Encode',
    'Contact',
    'Contact Call Type',
    'Contact TG/DMR ID',
    'Radio ID',
    'Busy Lock/TX Permit',
    'Squelch Mode',
    'Optional Signal',
    'DTMF ID',
    '2Tone ID',
    '5Tone ID',
    'PTT ID',
    'Color Code',
    'Slot',
    'Scan List',
    'Receive Group List',
    'PTT Prohibit',
    'Reverse',
    'Simplex TDMA',
    'Slot Suit',
    'AES Digital Encryption',
    'Digital Encryption',
    'Call Confirmation',
    'Talk Around(Simplex)',
    'Work Alone',
    'Custom CTCSS',
    '2TONE Decode',
    'Ranging',
    'Through Mode',
    'APRS RX',
    'Analog APRS PTT Mode',
    'Digital APRS PTT Mode',
    'APRS Report Type',
    'Digital APRS Report Channel',
    'Correct Frequency[Hz]',
    'SMS Confirmation',
    'Exclude channel from roaming',
    'DMR MODE',
    'DataACK Disable',
    'R5toneBot',
    'R5ToneEot',
    'Auto Scan',
    'Ana Aprs Mute',
    'Send Talker Alias',
    'AnaAprsTxPath',
    'ARC4',
    'ex_emg_kind',
  ];

  // Trailing 27 columns that are the same for every channel
  const tail = [
    'Normal Encryption',
    'Off',
    'Off',
    'Off',
    'Off',
    '251.1',
    '1',
    'Off',
    'Off',
    'Off',
    'Off',
    'Off',
    'Off',
    '1',
    '0',
    'Off',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
  ];

  const rows = channels.map((ch, i) => {
    if (ch.dmr) {
      const chType = ch.dmr.mixedMode ? 'D+A TX D' : 'D-Digital';
      const ct = ctcssTone(ch.ctcss);
      return [
        i + 1,
        ch.name,
        mhz5(ch.rx),
        mhz5(ch.tx),
        chType,
        'Mid',
        '12.5K',
        ct,
        ct,
        'Local',
        'Group Call',
        ch.dmr.tgId,
        radioName,
        'Always',
        'Carrier',
        'Off',
        '1',
        '1',
        '1',
        'Off',
        ch.dmr.colorCode,
        ch.dmr.slot,
        'None',
        DMR_RECEIVE_GROUP,
        'Off',
        'Off',
        'Off',
        'Off',
        ...tail,
      ];
    }
    const ct = ctcssTone(ch.ctcss);
    const power = ch.category === 'pmr' ? 'Low' : 'Mid';
    return [
      i + 1,
      ch.name,
      mhz5(ch.rx),
      mhz5(ch.tx),
      'A-Analog',
      power,
      '12.5K',
      ct,
      ct,
      'Local',
      'Group Call',
      '1',
      radioName,
      'Off',
      'Carrier',
      'Off',
      '1',
      '1',
      '1',
      'Off',
      '1',
      '1',
      'None',
      'None',
      ch.pttProhibit ? 'On' : 'Off',
      'Off',
      'Off',
      'Off',
      ...tail,
    ];
  });

  return buildCsv(header, rows);
}
