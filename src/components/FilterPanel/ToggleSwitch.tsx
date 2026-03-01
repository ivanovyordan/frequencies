interface Props {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

export function ToggleSwitch({ id, label, checked, disabled, onChange }: Props) {
  return (
    <div
      className={`toggle-row${disabled ? ' toggle-row--disabled' : ''}`}
      onClick={disabled ? undefined : onChange}
      aria-disabled={disabled}
    >
      <label htmlFor={id}>{label}</label>
      <span className="toggle-switch" aria-hidden="true">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          onClick={(e) => e.stopPropagation()}
        />
        <span className="toggle-track" />
      </span>
    </div>
  );
}
