interface Props {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

export function ToggleSwitch({ id, label, checked, disabled, onChange }: Props) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-2.5 px-1.5 py-2 rounded select-none transition-colors ${
        disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer hover:bg-slate-50'
      }`}
      aria-disabled={disabled}
    >
      <span className="text-sm font-medium cursor-[inherit] flex-1">{label}</span>
      <span className="relative w-9 h-5 shrink-0" aria-hidden="true">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-blue-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-700 peer-focus-visible:outline-offset-2 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-3.5 after:h-3.5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-4" />
      </span>
    </label>
  );
}
