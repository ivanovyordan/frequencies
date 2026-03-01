import type { Coordinates } from '../../types/repeater';

const labelCls = 'text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-500';

const inputCls =
  'h-8 w-[110px] px-2 border border-slate-200 rounded bg-white text-slate-800 font-mono ' +
  'text-[13px] outline-none transition-colors ' +
  'focus:border-blue-700 focus:ring-[3px] focus:ring-blue-700/15 ' +
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

interface Props {
  coords: Coordinates;
  onCoordsChange: (c: Coordinates) => void;
  onFindMe: () => void;
  geoLoading: boolean;
}

export function CoordinatesInput({ coords, onCoordsChange, onFindMe, geoLoading }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelCls}>Твоите координати</span>
      <div className="flex gap-2 items-end">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-500">Ширина</span>
          <input
            type="number"
            step="0.0001"
            min="-90"
            max="90"
            placeholder="42.0000"
            value={coords.latitude ?? ''}
            onChange={(e) =>
              onCoordsChange({
                ...coords,
                latitude: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={inputCls}
            aria-label="Географска ширина"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-500">Дължина</span>
          <input
            type="number"
            step="0.0001"
            min="-180"
            max="180"
            placeholder="25.0000"
            value={coords.longitude ?? ''}
            onChange={(e) =>
              onCoordsChange({
                ...coords,
                longitude: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={inputCls}
            aria-label="Географска дължина"
          />
        </div>
        <button
          className="h-8 px-3.5 inline-flex items-center justify-center border border-slate-200 rounded bg-slate-50 text-slate-800 text-[13px] font-medium transition-colors hover:enabled:bg-slate-200 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap"
          onClick={onFindMe}
          disabled={geoLoading}
          aria-label="Намери ме автоматично"
        >
          {geoLoading ? '…' : 'Намери ме'}
        </button>
      </div>
    </div>
  );
}
