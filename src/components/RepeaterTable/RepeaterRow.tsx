import type { Repeater, StaticChannel, Coordinates, RepeaterModes } from '../../types/repeater';
import { haversineKm } from '../../utils/geo';
import { channelName } from '../../utils/channelName';

function hzToMhz(hz: number): string {
  return (hz / 1_000_000).toFixed(4);
}

const tdCls = 'px-3 py-[7px] border-b border-slate-200 align-middle group-hover:bg-slate-50';
const tdMonoCls = `${tdCls} font-mono`;

const badgeCls =
  'inline-block px-[5px] py-[1px] rounded-[3px] text-[10px] font-semibold uppercase tracking-[0.4px]';

function ModeBadges({ modes }: { modes: RepeaterModes }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {modes.fm.enabled && <span className={`${badgeCls} bg-blue-100 text-blue-800`}>FM</span>}
      {modes.usb?.enabled && <span className={`${badgeCls} bg-sky-100 text-sky-800`}>SSB</span>}
      {modes.dmr.enabled && <span className={`${badgeCls} bg-amber-100 text-amber-800`}>DMR</span>}
      {modes.dstar.enabled && (
        <span className={`${badgeCls} bg-green-100 text-green-800`}>D-Star</span>
      )}
      {modes.fusion.enabled && (
        <span className={`${badgeCls} bg-violet-100 text-violet-800`}>Fusion</span>
      )}
      {modes.parrot.enabled && (
        <span className={`${badgeCls} bg-pink-100 text-pink-800`}>Папагал</span>
      )}
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
    <tr className="group">
      <td className={tdCls}>{index + 1}</td>
      <td className={tdMonoCls}>
        <strong>{channelName(entry)}</strong>
      </td>
      <td className={tdMonoCls}>{hzToMhz(entry.freq.rx)}</td>
      <td className={tdMonoCls}>
        {entry.freq.rx === entry.freq.tx ? '—' : hzToMhz(entry.freq.tx)}
      </td>
      <td className={tdMonoCls}>{entry.freq.tone > 0 ? entry.freq.tone.toFixed(1) : '—'}</td>
      <td className={tdCls}>{entry.place}</td>
      <td className={tdCls}>
        <ModeBadges modes={entry.modes} />
      </td>
      {showDistance && (
        <td className={`${tdMonoCls} text-slate-500`}>
          {distKm !== null ? `${Math.round(distKm)} км` : '—'}
        </td>
      )}
    </tr>
  );
}
