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
  return channels.map((ch, i) => {
    const key = channelKey(i);
    return {
      key,
      entry: ch.dmr ? buildDigitalEntry(key, ch, hasRadioId) : buildAnalogEntry(key, ch),
    };
  });
}

function buildAnalogEntry(id: string, ch: ExpandedChannel): QdmrChannelEntry {
  const tone = ch.ctcss > 0 ? { ctcss: ch.ctcss } : undefined;
  return {
    analog: {
      id,
      name: ch.name,
      rxFrequency: hzToMhz(ch.rx),
      txFrequency: hzToMhz(ch.tx),
      power: ch.category === 'pmr' ? 'Low' : 'High',
      squelch: 4,
      ...(tone && { rxTone: tone, txTone: tone }),
    },
  };
}

function buildDigitalEntry(id: string, ch: ExpandedChannel, hasRadioId: boolean): QdmrChannelEntry {
  return {
    digital: {
      id,
      name: ch.name,
      rxFrequency: hzToMhz(ch.rx),
      txFrequency: hzToMhz(ch.tx),
      power: 'High',
      colorCode: ch.dmr!.colorCode,
      timeSlot: ch.dmr!.slot === 1 ? 'TS1' : 'TS2',
      groupList: GROUP_LIST_ID,
      contact: tgKey(ch.dmr!.tgId),
      ...(hasRadioId && { radioId: RADIO_ID_KEY }),
    },
  };
}
