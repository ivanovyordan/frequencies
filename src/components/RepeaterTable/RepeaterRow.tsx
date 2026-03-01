import type { Repeater, StaticChannel, Coordinates, RepeaterModes } from '../../types/repeater';
import { haversineKm } from '../../utils/geo';

function hzToMhz(hz: number): string {
  return (hz / 1_000_000).toFixed(4);
}

function formatOffset(rx: number, tx: number): string {
  if (rx === tx) return '—';
  const sign = tx > rx ? '+' : '−';
  return `${sign}${hzToMhz(Math.abs(tx - rx))}`;
}

function ModeBadges({ modes }: { modes: RepeaterModes }) {
  return (
    <div className="mode-badges">
      {modes.fm.enabled && <span className="badge badge-fm">FM</span>}
      {modes.usb?.enabled && <span className="badge badge-usb">SSB</span>}
      {modes.dmr.enabled && <span className="badge badge-dmr">DMR</span>}
      {modes.dstar.enabled && <span className="badge badge-dstar">D-Star</span>}
      {modes.fusion.enabled && <span className="badge badge-fusion">Fusion</span>}
      {modes.parrot.enabled && <span className="badge badge-parrot">Папагал</span>}
    </div>
  );
}

interface Props {
  entry: Repeater | StaticChannel;
  index: number;
  coords: Coordinates;
  showDistance: boolean;
}

export function RepeaterRow({ entry, index, coords, showDistance }: Props) {
  const isRepeater = 'disabled' in entry;

  const distKm =
    showDistance && coords.latitude !== null && coords.longitude !== null && isRepeater
      ? haversineKm(coords.latitude, coords.longitude, entry.latitude, entry.longitude)
      : null;

  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <strong style={{ fontFamily: 'var(--font-mono)' }}>{entry.callsign}</strong>
      </td>
      <td className="freq-cell">{entry.freq.channel}</td>
      <td className="freq-cell">{hzToMhz(entry.freq.rx)}</td>
      <td className="freq-cell">{formatOffset(entry.freq.rx, entry.freq.tx)}</td>
      <td className="freq-cell">{entry.freq.tone > 0 ? entry.freq.tone.toFixed(1) : '—'}</td>
      <td>{entry.place}</td>
      <td>
        <ModeBadges modes={entry.modes} />
      </td>
      {showDistance && (
        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
          {distKm !== null ? `${Math.round(distKm)} км` : '—'}
        </td>
      )}
    </tr>
  );
}
