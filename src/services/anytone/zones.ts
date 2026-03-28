import { buildCsv } from '../../utils/csv';
import { formatMhz } from '../../utils/freq';
import type { ExpandedChannel } from '../shared/channels';
import { buildZoneGroups } from '../shared/zoneGroups';

// Re-export for existing consumers
export { groupBy } from '../shared/zoneGroups';

function mhz5(hz: number): string {
  return formatMhz(hz, 5);
}

export function buildZoneCsv(channels: ExpandedChannel[]): string {
  // 12 columns matching AnyTone CPS zone export (trailing space on "Zone Hide " is intentional)
  const header = [
    'No.', 'Zone Name', 'Zone Channel Member',
    'Zone Channel Member RX Frequency', 'Zone Channel Member TX Frequency',
    'A Channel', 'A Channel RX Frequency', 'A Channel TX Frequency',
    'B Channel', 'B Channel RX Frequency', 'B Channel TX Frequency', 'Zone Hide ',
  ];

  const rows: (string | number)[][] = [];
  let no = 1;

  for (const { name, members } of buildZoneGroups(channels)) {
    const chNames = members.map((m) => m.name).join('|');
    const chRx = members.map((m) => mhz5(m.rx)).join('|');
    const chTx = members.map((m) => mhz5(m.tx)).join('|');
    const a = members[0];
    const b = members.length > 1 ? members[1] : a;
    rows.push([
      no++, name, chNames, chRx, chTx,
      a.name, mhz5(a.rx), mhz5(a.tx),
      b.name, mhz5(b.rx), mhz5(b.tx), '0',
    ]);
  }

  return buildCsv(header, rows);
}
