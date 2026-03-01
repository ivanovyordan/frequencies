import type { FilterState } from '../../types/repeater';
import { ToggleSwitch } from './ToggleSwitch';

interface FilterDef {
  key: keyof FilterState;
  label: string;
}

const FILTERS: FilterDef[] = [
  { key: 'national', label: 'Национални' },
  { key: 'analog', label: 'Аналогови' },
  { key: 'dmr', label: 'DMR' },
  { key: 'dstar', label: 'D-Star' },
  { key: 'fusion', label: 'Fusion' },
  { key: 'parrot', label: 'Папагали' },
  { key: 'simplex', label: 'Симплекс' },
  { key: 'pmr', label: 'PMR' },
];

interface Props {
  filters: FilterState;
  disabledKeys: ReadonlySet<keyof FilterState>;
  onToggle: (key: keyof FilterState) => void;
}

export function FilterPanel({ filters, disabledKeys, onToggle }: Props) {
  return (
    <aside className="filter-panel">
      <div className="filter-panel-title">Филтри</div>
      {FILTERS.map(({ key, label }) => (
        <ToggleSwitch
          key={key}
          id={`filter-${key}`}
          label={label}
          checked={filters[key]}
          disabled={disabledKeys.has(key)}
          onChange={() => onToggle(key)}
        />
      ))}
    </aside>
  );
}
