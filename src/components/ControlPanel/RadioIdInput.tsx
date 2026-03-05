import type { RadioId } from '../../types/repeater';

const labelCls = 'text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-500';

const inputCls =
  'h-8 px-2 border border-slate-200 rounded bg-white text-slate-800 font-mono ' +
  'text-[13px] outline-none transition-colors ' +
  'focus:border-blue-700 focus:ring-[3px] focus:ring-blue-700/15 ' +
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

interface Props {
  radioId: RadioId;
  onChange: (r: RadioId) => void;
}

export function RadioIdInput({ radioId, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelCls}>Radio ID</span>
      <div className="flex gap-2 items-end">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-500">Позивна</span>
          <input
            type="text"
            placeholder="LZ9DB"
            maxLength={10}
            value={radioId.callsign}
            onChange={(e) => onChange({ ...radioId, callsign: e.target.value.toUpperCase() })}
            className={`${inputCls} w-24`}
            aria-label="Позивна"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-500">DMR ID (незадължително)</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="2050000"
            maxLength={7}
            value={radioId.dmrId}
            onChange={(e) => onChange({ ...radioId, dmrId: e.target.value.replace(/\D/g, '') })}
            className={`${inputCls} w-24`}
            aria-label="DMR ID"
          />
        </div>
      </div>
    </div>
  );
}
