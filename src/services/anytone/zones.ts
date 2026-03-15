import { oblastForPlace } from '../../constants/bgOblasts';
import { buildCsv } from '../../utils/csv';
import { formatMhz } from '../../utils/freq';
import type { AnytoneChannel } from './channels';

// ── Helpers ────────────────────────────────────────────────────────────────────

export function groupBy<K, V>(items: V[], key: (v: V) => K): Map<K, V[]> {
  const map = new Map<K, V[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

function mhz5(hz: number): string {
  return formatMhz(hz, 5);
}

// ── Zone.CSV ───────────────────────────────────────────────────────────────────

export function buildZoneCsv(channels: AnytoneChannel[]): string {
  // 12 columns matching AnyTone CPS zone export (trailing space on "Zone Hide " is intentional)
  const header = [
    'No.', 'Zone Name', 'Zone Channel Member',
    'Zone Channel Member RX Frequency', 'Zone Channel Member TX Frequency',
    'A Channel', 'A Channel RX Frequency', 'A Channel TX Frequency',
    'B Channel', 'B Channel RX Frequency', 'B Channel TX Frequency', 'Zone Hide ',
  ];

  const rows: (string | number)[][] = [];
  let no = 1;

  function addZone(name: string, members: AnytoneChannel[]): void {
    if (members.length === 0) return;
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

  const nationals = channels.filter((ch) => ch.category === 'national' && !ch.dmr);
  const locals = channels.filter((ch) => ch.category === 'local' && !ch.dmr);
  const dmr = channels.filter((ch) => !!ch.dmr);
  const simplex = channels.filter((ch) => ch.category === 'simplex');
  const pmr = channels.filter((ch) => ch.category === 'pmr');
  const aprs = channels.filter((ch) => ch.category === 'aprs');
  const custom = channels.filter((ch) => ch.category === 'custom');

  addZone('All Channels', channels);
  addZone('National Repeaters', nationals);
  addZone('Local Repeaters', locals);
  addZone('Analog Repeaters', [...nationals, ...locals]);
  addZone('DMR Repeaters', dmr);

  const byOblast = groupBy([...nationals, ...locals], (ch) => oblastForPlace(ch.place));
  for (const [oblast, members] of byOblast) {
    addZone(oblast.slice(0, 16), members);
  }

  addZone('Simplex', simplex);
  addZone('PMR', pmr);
  addZone('APRS', aprs);
  addZone('Custom', custom);

  return buildCsv(header, rows);
}
