import type { SoftwareOption } from '../../types/repeater';

interface Props {
  value: SoftwareOption;
  onChange: (v: SoftwareOption) => void;
}

export function SoftwareSelect({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-500">
        Софтуер
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SoftwareOption)}
        aria-label="Изберете CPS софтуер"
        className="h-8 w-36 px-2 border border-slate-200 rounded bg-white text-slate-800 text-[13px] outline-none cursor-pointer transition-colors focus:border-blue-700 focus:ring-[3px] focus:ring-blue-700/15"
      >
        <option value="none">Изберете</option>
        <option value="chirp">Chirp</option>
        <option value="anytone">Anytone</option>
      </select>
    </div>
  );
}
