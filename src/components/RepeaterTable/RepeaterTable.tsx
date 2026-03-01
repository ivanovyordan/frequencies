import type { Repeater, StaticChannel, Coordinates } from '../../types/repeater';
import { RepeaterRow } from './RepeaterRow';

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
      <div className="table-container">
        <div className="table-message">Зареждане на ретранслатори…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-container">
        <div className="table-message error">{error}</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="table-container">
        <div className="table-message">Няма намерени ретранслатори. Включете поне един филтър.</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="repeater-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Позивна</th>
            <th>Канал</th>
            <th>Честота (MHz)</th>
            <th>Отместване</th>
            <th>CTCSS (Hz)</th>
            <th>Град</th>
            <th>Режими</th>
            {showDistance && <th>Разстояние</th>}
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
