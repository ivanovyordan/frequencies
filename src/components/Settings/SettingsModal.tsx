import { useEffect, useRef } from 'react';
import type { AprsSettings, ContactListSettings, RadioId, SoftwareOption } from '../../types/repeater';

const labelCls = 'text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-500';

const inputCls =
  'h-8 px-2 border border-slate-200 rounded bg-white text-slate-800 font-mono ' +
  'text-[13px] outline-none transition-colors ' +
  'focus:border-blue-700 focus:ring-[3px] focus:ring-blue-700/15 ' +
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

interface Props {
  open: boolean;
  onClose: () => void;
  software: SoftwareOption;
  radioId: RadioId;
  onRadioIdChange: (r: RadioId) => void;
  contactList: ContactListSettings;
  onContactListChange: (s: ContactListSettings) => void;
  aprsSettings: AprsSettings;
  onAprsSettingsChange: (s: AprsSettings) => void;
}

export function SettingsModal({
  open, onClose, software, radioId, onRadioIdChange, contactList, onContactListChange, aprsSettings, onAprsSettingsChange,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    // Close when clicking the backdrop (the dialog element itself, not its content)
    if (e.target === ref.current) onClose();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={handleDialogClick}
      className="m-auto w-full max-w-sm rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Настройки</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-xl leading-none transition-colors"
          aria-label="Затвори"
        >
          ×
        </button>
      </div>

      <div className="px-5 py-5 flex flex-col gap-6">

        {/* ── Radio ID ── */}
        <section className="flex flex-col gap-3">
          <div className={labelCls}>Radio ID</div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500">Позивна</span>
              <input
                type="text"
                placeholder="LZ9DB"
                maxLength={10}
                value={radioId.callsign}
                onChange={(e) => onRadioIdChange({ ...radioId, callsign: e.target.value.toUpperCase() })}
                className={`${inputCls} w-28`}
                aria-label="Позивна"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500">DMR ID</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="2050000"
                maxLength={7}
                value={radioId.dmrId}
                onChange={(e) => onRadioIdChange({ ...radioId, dmrId: e.target.value.replace(/\D/g, '') })}
                className={`${inputCls} w-28`}
                aria-label="DMR ID"
              />
            </div>
          </div>
        </section>

        {/* ── DMR Contact List (AnyTone + QDMR) ── */}
        {(software === 'anytone' || software === 'qdmr') && (
          <section className="flex flex-col gap-3 pt-5 border-t border-slate-100">
            <div className={labelCls}>DMR контактен лист</div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={contactList.enabled}
                onChange={(e) => onContactListChange({ ...contactList, enabled: e.target.checked })}
                className="w-4 h-4 accent-blue-700 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Включи в експорта</span>
            </label>

            {contactList.enabled && (
              <div className="flex flex-col gap-2 pl-6">
                <span className="text-[11px] text-slate-500">Обхват</span>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { value: 'bulgaria', label: 'България', hint: '~800 позивни' },
                      { value: 'worldwide', label: 'Целият свят', hint: '~300 000 позивни, бавно сваляне' },
                    ] as const
                  ).map(({ value, label, hint }) => (
                    <label key={value} className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="contact-scope"
                        value={value}
                        checked={contactList.scope === value}
                        onChange={() => onContactListChange({ ...contactList, scope: value })}
                        className="mt-0.5 accent-blue-700 cursor-pointer"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm text-slate-700">{label}</span>
                        <span className="text-[11px] text-slate-400">{hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── APRS (AnyTone + QDMR) ── */}
        {(software === 'anytone' || software === 'qdmr') && (
          <section className="flex flex-col gap-3 pt-5 border-t border-slate-100">
            <div className={labelCls}>APRS</div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500">Автоматичен интервал (сек, 0 = изкл.)</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="180"
                maxLength={5}
                value={aprsSettings.autoTxInterval}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                  onAprsSettingsChange({ ...aprsSettings, autoTxInterval: val });
                }}
                className={`${inputCls} w-28`}
                aria-label="APRS Auto TX Interval"
              />
            </div>
          </section>
        )}

      </div>
    </dialog>
  );
}
