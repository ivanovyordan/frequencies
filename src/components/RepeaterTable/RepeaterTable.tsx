import type { Repeater, StaticChannel, Coordinates } from '../../types/repeater';
import { RepeaterRow } from './RepeaterRow';

const thCls =
  'sticky top-0 z-[1] bg-slate-50 border-b-2 border-slate-200 px-3 py-2 text-left ' +
  'text-[11px] font-semibold uppercase tracking-[0.6px] text-slate-500 whitespace-nowrap';

interface Props {
  entries: (Repeater | StaticChannel)[];
  loading: boolean;
  error: string | null;
  coords: Coordinates;
}

export function RepeaterTable({ entries, loading, error, coords }: Props) {
  const showDistance = coords.latitude !== null && coords.longitude !== null;

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="py-12 text-center text-slate-500">Зареждане на ретранслатори…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="py-12 text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="py-12 text-center text-slate-500">
          Няма намерени ретранслатори. Включете поне един филтър.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className={thCls}>#</th>
            <th className={thCls}>Позивна</th>
            <th className={thCls}>Канал</th>
            <th className={thCls}>Честота (MHz)</th>
            <th className={thCls}>Отместване</th>
            <th className={thCls}>CTCSS (Hz)</th>
            <th className={thCls}>Град</th>
            <th className={thCls}>Режими</th>
            {showDistance && <th className={thCls}>Разстояние</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <RepeaterRow
              key={`${entry.callsign}-${i}`}
              entry={entry}
              index={i}
              coords={coords}
              showDistance={showDistance}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
