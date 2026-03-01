import type { Coordinates } from '../../types/repeater';

interface Props {
  coords: Coordinates;
  onCoordsChange: (c: Coordinates) => void;
  onFindMe: () => void;
  geoLoading: boolean;
  geoError: string | null;
}

export function CoordinatesInput({
  coords,
  onCoordsChange,
  onFindMe,
  geoLoading,
  geoError,
}: Props) {
  return (
    <div className="control-group">
      <span className="control-label">Твоите координати</span>
      <div className="coords-fields">
        <div className="coords-field">
          <span>Ширина</span>
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
            aria-label="Географска ширина"
          />
        </div>
        <div className="coords-field">
          <span>Дължина</span>
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
            aria-label="Географска дължина"
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={onFindMe}
          disabled={geoLoading}
          aria-label="Намери ме автоматично"
        >
          {geoLoading ? '…' : 'Намери ме'}
        </button>
      </div>
      {geoError && <div className="geo-error">{geoError}</div>}
    </div>
  );
}
