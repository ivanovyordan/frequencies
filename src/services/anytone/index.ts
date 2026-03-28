import JSZip from 'jszip';
import type { RadioChannel } from '../../types/channel';
import type { RadioId } from '../../types/repeater';
import { buildCsv } from '../../utils/csv';
import type { BuilderOptions } from '../builders';
import { buildAprsCsv } from './aprs';
import { expandChannels } from '../shared/channels';
import { buildChannelCsv } from './channels';
import { buildLst } from './manifest';
import { buildReceiveGroupListCsv, buildTalkGroupCsv } from './talkGroups';
import { buildZoneCsv } from './zones';

export type { ExpandedChannel } from '../shared/channels';

// ── RadioIDList.CSV ────────────────────────────────────────────────────────────

function buildRadioIdListCsv(radioId: RadioId): string {
  const rows = [[1, parseInt(radioId.dmrId, 10), radioId.callsign]];
  return buildCsv(['No.', 'Radio ID', 'Name'], rows);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/** Build a ZIP Blob containing the AnyTone CPS import files. */
export async function buildAnytoneZip(
  channels: RadioChannel[],
  options?: BuilderOptions,
): Promise<Blob> {
  const radioId = options?.radioId ?? { callsign: '', dmrId: '' };
  const contactListCsv = options?.contactListCsv;

  const expanded = expandChannels(channels);
  const radioName = radioId.callsign.trim() || 'Local';

  const files = new Map<string, string>();
  files.set('Channel.CSV', buildChannelCsv(expanded, radioName));
  files.set('TalkGroups.CSV', buildTalkGroupCsv());
  files.set('ReceiveGroupCallList.CSV', buildReceiveGroupListCsv());
  files.set('Zone.CSV', buildZoneCsv(expanded));

  const dmrIdNum = parseInt(radioId.dmrId, 10);
  if (radioId.callsign.trim() && !isNaN(dmrIdNum) && dmrIdNum > 0) {
    files.set(
      'RadioIDList.CSV',
      buildRadioIdListCsv({ callsign: radioName, dmrId: radioId.dmrId }),
    );
  }

  if (contactListCsv) {
    files.set('DigitalContactList.CSV', contactListCsv);
  }

  if (radioName !== 'Local') {
    files.set('APRS.CSV', buildAprsCsv(radioName, options?.aprsSettings?.autoTxInterval));
  }

  const zip = new JSZip();
  for (const [name, content] of files) {
    zip.file(name, content);
  }
  zip.file('anytone.LST', buildLst(new Set(files.keys())));

  return zip.generateAsync({ type: 'blob' });
}
