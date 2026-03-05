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
  customChannels: CustomChannel[];
  onCustomChannelsChange: (channels: CustomChannel[]) => void;
}

export function FilterPanel({ filters, disabledKeys, onToggle, customChannels, onCustomChannelsChange }: Props) {
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
          Потребителски канали
        </div>
        <CustomChannelsList channels={customChannels} onChange={onCustomChannelsChange} />
      </div>
    </aside>
  );
}
