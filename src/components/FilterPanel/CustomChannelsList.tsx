import { useState } from 'react';
import type { CustomChannel, CustomChannelDMR } from '../../types/repeater';

const inputCls =
  'h-7 px-1.5 border border-slate-200 rounded bg-white text-slate-800 font-mono text-[12px] ' +
  'outline-none transition-colors focus:border-blue-700 focus:ring-[3px] focus:ring-blue-700/15 w-full ' +
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

interface Props {
  channels: CustomChannel[];
  onChange: (channels: CustomChannel[]) => void;
}

export function CustomChannelsList({ channels, onChange }: Props) {
  const [name, setName] = useState('');
  const [rxMhz, setRxMhz] = useState('');
  const [txMhz, setTxMhz] = useState('');
  const [tone, setTone] = useState('');
  const [dmrEnabled, setDmrEnabled] = useState(false);
  const [colorCode, setColorCode] = useState('1');
  const [slot, setSlot] = useState<'1' | '2'>('1');
  const [talkgroups, setTalkgroups] = useState('');

  const rxNum = parseFloat(rxMhz);
  const canAdd =
    name.trim().length > 0 &&
    !isNaN(rxNum) && rxNum > 0 &&
    (!dmrEnabled || (colorCode.trim().length > 0 && talkgroups.trim().length > 0));

  function toggle(id: string) {
    onChange(channels.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c));
  }

  function add() {
    if (!canAdd) return;
    const dmr: CustomChannelDMR | undefined = dmrEnabled
      ? { colorCode: colorCode.trim(), slot, talkgroups: talkgroups.trim() }
      : undefined;
    onChange([
      ...channels,
      {
        id: Date.now().toString(),
        name: name.trim().slice(0, 16).toUpperCase(),
        rxMhz: rxMhz.trim(),
        txMhz: txMhz.trim(),
        tone: tone.trim(),
        enabled: true,
        dmr,
      },
    ]);
    setName('');
    setRxMhz('');
    setTxMhz('');
    setTone('');
    setDmrEnabled(false);
    setColorCode('1');
    setSlot('1');
    setTalkgroups('');
  }

  function remove(id: string) {
    onChange(channels.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-1">
      {channels.map((ch) => {
        const isDuplex = ch.txMhz && ch.txMhz !== ch.rxMhz;
        return (
          <div key={ch.id} className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-slate-50 group">
            <input
              type="checkbox"
              checked={ch.enabled !== false}
              onChange={() => toggle(ch.id)}
              aria-label={`Включи ${ch.name}`}
              className="shrink-0 accent-blue-700"
            />
            <span className={`text-[12px] font-medium truncate flex-1 ${ch.enabled !== false ? 'text-slate-700' : 'text-slate-400'}`}>{ch.name}</span>
            <span className="text-[11px] text-slate-400 shrink-0">
              {ch.rxMhz}{isDuplex ? `↑${ch.txMhz}` : ''}
            </span>
            {ch.dmr && (
              <span className="text-[10px] bg-blue-100 text-blue-700 rounded px-1 shrink-0">DMR</span>
            )}
            <button
              onClick={() => remove(ch.id)}
              className="ml-1 text-slate-300 hover:text-red-500 text-[14px] leading-none transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Премахни ${ch.name}`}
            >
              ×
            </button>
          </div>
        );
      })}

      <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-slate-100">
        <input
          type="text"
          placeholder="Име (напр. SSTV)"
          maxLength={16}
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          className={inputCls}
          aria-label="Име на канала"
        />
        <div className="flex gap-1">
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">RX MHz</span>
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="144.500"
              value={rxMhz}
              onChange={(e) => setRxMhz(e.target.value)}
              className={inputCls}
              aria-label="RX честота в MHz"
            />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">TX MHz (=RX)</span>
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder={rxMhz || '144.500'}
              value={txMhz}
              onChange={(e) => setTxMhz(e.target.value)}
              className={inputCls}
              aria-label="TX честота в MHz"
            />
          </div>
        </div>
        <div className="flex gap-1 items-end">
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400">Тон Hz (незадължително)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="88.5"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={inputCls}
              aria-label="CTCSS тон в Hz"
            />
          </div>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dmrEnabled}
            onChange={(e) => setDmrEnabled(e.target.checked)}
            className="accent-blue-700"
          />
          <span className="text-[11px] text-slate-600">Digital (DMR)</span>
        </label>
        {dmrEnabled && (
          <div className="flex gap-1">
            <div className="flex flex-col gap-0.5" style={{ width: '3rem' }}>
              <span className="text-[10px] text-slate-400">CC</span>
              <input
                type="number"
                min="0"
                max="15"
                placeholder="1"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className={inputCls}
                aria-label="Color Code"
              />
            </div>
            <div className="flex flex-col gap-0.5" style={{ width: '3.5rem' }}>
              <span className="text-[10px] text-slate-400">Slot</span>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as '1' | '2')}
                className={inputCls}
                aria-label="Timeslot"
              >
                <option value="1">TS1</option>
                <option value="2">TS2</option>
              </select>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-[10px] text-slate-400">TG IDs</span>
              <input
                type="text"
                placeholder="91,2842"
                value={talkgroups}
                onChange={(e) => setTalkgroups(e.target.value)}
                className={inputCls}
                aria-label="Talkgroup IDs"
              />
            </div>
          </div>
        )}
        <button
          onClick={add}
          disabled={!canAdd}
          className="h-7 px-2.5 text-[12px] font-medium rounded border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:enabled:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Добави
        </button>
      </div>
    </div>
  );
}
