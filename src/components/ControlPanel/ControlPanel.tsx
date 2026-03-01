import type { Coordinates, SoftwareOption } from '../../types/repeater';
import { CoordinatesInput } from './CoordinatesInput';
import { SoftwareSelect } from './SoftwareSelect';

interface Props {
  coords: Coordinates;
  onCoordsChange: (c: Coordinates) => void;
  onFindMe: () => void;
  geoLoading: boolean;
  geoError: string | null;
  software: SoftwareOption;
  onSoftwareChange: (v: SoftwareOption) => void;
}

export function ControlPanel({
  coords,
  onCoordsChange,
  onFindMe,
  geoLoading,
  geoError,
  software,
  onSoftwareChange,
}: Props) {
  return (
    <div className="control-panel">
      <CoordinatesInput
        coords={coords}
        onCoordsChange={onCoordsChange}
        onFindMe={onFindMe}
        geoLoading={geoLoading}
        geoError={geoError}
      />
      <SoftwareSelect value={software} onChange={onSoftwareChange} />
    </div>
  );
}
