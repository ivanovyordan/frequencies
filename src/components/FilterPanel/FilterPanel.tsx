import type { CustomChannel, FilterState } from '../../types/repeater';
import { ToggleSwitch } from './ToggleSwitch';
import { CustomChannelsList } from './CustomChannelsList';

interface FilterDef {
  key: keyof FilterState;
  label: string;
}

const FILTERS: FilterDef[] = [
  { key: 'national', label: 'Национални' },
  { key: 'analog', label: 'Аналогови' },
  { key: 'dmr', label: 'DMR' },
  { key: 'parrot', label: 'Папагали' },
  { key: 'simplex', label: 'Симплекс' },
  { key: 'pmr', label: 'PMR' },
  { key: 'aprs', label: 'APRS' },
  { key: 'custom', label: 'Потребителски' },
];

interface Props {
  filters: FilterState;
  disabledKeys: ReadonlySet<keyof FilterState>;
  onToggle: (key: keyof FilterState) => void;
  maxDistanceKm: number;
  onMaxDistanceChange: (km: number) => void;
  hasCoords: boolean;
  customChannels: CustomChannel[];
  onCustomChannelsChange: (channels: CustomChannel[]) => void;
}

const DISTANCE_OPTIONS = [0, 25, 50, 100, 150, 200, 300, 500];

export function FilterPanel({ filters, disabledKeys, onToggle, maxDistanceKm, onMaxDistanceChange, hasCoords, customChannels, onCustomChannelsChange }: Props) {
  return (
    <aside className="bg-white border-r border-slate-200 px-4 py-5 overflow-y-auto flex flex-col gap-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-500 mb-2">
        Филтри
      </div>
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

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-500 mb-2">
          Максимално разстояние
        </div>
        <select
          value={maxDistanceKm}
          onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
          disabled={!hasCoords}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {DISTANCE_OPTIONS.map((km) => (
            <option key={km} value={km}>
              {km === 0 ? 'Без ограничение' : `${km} km`}
            </option>
          ))}
        </select>
        {!hasCoords && (
          <p className="text-[10px] text-slate-400 mt-1">Нужна е локация</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-500 mb-2">
          Потребителски канали
        </div>
        <CustomChannelsList channels={customChannels} onChange={onCustomChannelsChange} />
      </div>
    </aside>
  );
}
