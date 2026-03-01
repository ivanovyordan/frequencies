import type { SoftwareOption } from '../../types/repeater';

interface Props {
  value: SoftwareOption;
  onChange: (v: SoftwareOption) => void;
}

export function SoftwareSelect({ value, onChange }: Props) {
  return (
    <div className="control-group">
      <span className="control-label">Софтуер</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SoftwareOption)}
        aria-label="Изберете CPS софтуер"
      >
        <option value="none">Изберете</option>
        <option value="chirp">Chirp</option>
        <option value="anytone">Anytone</option>
      </select>
    </div>
  );
}
