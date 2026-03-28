import type { ExpandedChannel } from '../shared/channels';
import { hzToMhz } from '../../utils/freq';
import { GROUP_LIST_ID, RADIO_ID_KEY, tgKey } from './contacts';
import type { QdmrChannelEntry } from './types';

export function channelKey(index: number): string {
  return `ch${index}`;
}

export function buildQdmrChannels(
  channels: ExpandedChannel[],
  hasRadioId: boolean,
): { key: string; entry: QdmrChannelEntry }[] {
  return channels.map((ch, i) => ({
    key: channelKey(i),
    entry: ch.dmr ? buildDigitalEntry(ch, hasRadioId) : buildAnalogEntry(ch),
  }));
}

function buildAnalogEntry(ch: ExpandedChannel): QdmrChannelEntry {
  const tone = ch.ctcss > 0 ? { ctcss: ch.ctcss } : undefined;
  return {
    analog: {
      name: ch.name,
      rxFrequency: hzToMhz(ch.rx),
      txFrequency: hzToMhz(ch.tx),
      power: ch.category === 'pmr' ? 'Low' : 'Mid',
      squelch: 4,
      ...(tone && { rxTone: tone, txTone: tone }),
    },
  };
}

function buildDigitalEntry(ch: ExpandedChannel, hasRadioId: boolean): QdmrChannelEntry {
  return {
    digital: {
      name: ch.name,
      rxFrequency: hzToMhz(ch.rx),
      txFrequency: hzToMhz(ch.tx),
      power: 'Mid',
      colorCode: ch.dmr!.colorCode,
      timeSlot: ch.dmr!.slot === 1 ? 'TS1' : 'TS2',
      groupList: GROUP_LIST_ID,
      contact: tgKey(ch.dmr!.tgId),
      ...(hasRadioId && { radioId: RADIO_ID_KEY }),
    },
  };
}
