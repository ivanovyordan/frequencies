import type { AnytoneChannel } from '../anytone/channels';
import { hzToMhz } from '../../utils/freq';
import { tgKey } from './contacts';
import type { QdmrChannelEntry } from './types';

export function channelKey(index: number): string {
  return `ch${index}`;
}

export function buildQdmrChannels(
  channels: AnytoneChannel[],
  hasRadioId: boolean,
): { key: string; entry: QdmrChannelEntry }[] {
  return channels.map((ch, i) => ({
    key: channelKey(i),
    entry: ch.dmr ? buildDigitalEntry(ch, hasRadioId) : buildAnalogEntry(ch),
  }));
}

function buildAnalogEntry(ch: AnytoneChannel): QdmrChannelEntry {
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

function buildDigitalEntry(ch: AnytoneChannel, hasRadioId: boolean): QdmrChannelEntry {
  return {
    digital: {
      name: ch.name,
      rxFrequency: hzToMhz(ch.rx),
      txFrequency: hzToMhz(ch.tx),
      power: 'Mid',
      colorCode: ch.dmr!.colorCode,
      timeSlot: ch.dmr!.slot === 1 ? 'TS1' : 'TS2',
      groupList: 'grp_bg',
      contact: tgKey(ch.dmr!.tgId),
      ...(hasRadioId && { radioId: 'id0' }),
    },
  };
}
