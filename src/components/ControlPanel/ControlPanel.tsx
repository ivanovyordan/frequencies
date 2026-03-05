import type { Coordinates, RadioId, SoftwareOption } from '../../types/repeater';
import { CoordinatesInput } from './CoordinatesInput';
import { RadioIdInput } from './RadioIdInput';
import { SoftwareSelect } from './SoftwareSelect';

interface Props {
  coords: Coordinates;
  onCoordsChange: (c: Coordinates) => void;
  onFindMe: () => void;
  geoLoading: boolean;
  geoError: string | null;
  software: SoftwareOption;
  onSoftwareChange: (v: SoftwareOption) => void;
  radioId: RadioId;
  onRadioIdChange: (r: RadioId) => void;
}

export function ControlPanel({
  coords,
  onCoordsChange,
  onFindMe,
  geoLoading,
  geoError,
  software,
  onSoftwareChange,
  radioId,
  onRadioIdChange,
}: Props) {
  return (
    <div className="bg-white border-b border-slate-200 px-5 py-4 flex flex-col gap-2">
      <div className="flex gap-8 items-end flex-wrap">
        <CoordinatesInput
          coords={coords}
          onCoordsChange={onCoordsChange}
          onFindMe={onFindMe}
          geoLoading={geoLoading}
        />
        <SoftwareSelect value={software} onChange={onSoftwareChange} />
        {software === 'anytone' && (
          <RadioIdInput radioId={radioId} onChange={onRadioIdChange} />
        )}
      </div>
      {geoError && <p className="text-xs text-red-600">{geoError}</p>}
    </div>
  );
}
