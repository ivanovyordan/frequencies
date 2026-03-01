import { useMemo } from 'react';
import { useRepeaters } from './hooks/useRepeaters';
import { useFilters } from './hooks/useFilters';
import { useGeolocation } from './hooks/useGeolocation';
import { applyFilters } from './services/filter';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { RepeaterTable } from './components/RepeaterTable/RepeaterTable';
import { DownloadBar } from './components/DownloadBar/DownloadBar';

function App() {
  const { repeaters, loading, error } = useRepeaters();
  const { filters, disabledKeys, software, onToggle, onSoftwareChange } = useFilters();
  const { coords, geoLoading, geoError, findMe, setCoords } = useGeolocation();

  const filteredEntries = useMemo(
    () => applyFilters(repeaters, filters, coords),
    [repeaters, filters, coords],
  );

  return (
    <>
      <header className="app-header">
        <h1>Честотен програматор</h1>
      </header>

      <div className="app-main">
        <FilterPanel filters={filters} disabledKeys={disabledKeys} onToggle={onToggle} />

        <div className="content-area">
          <ControlPanel
            coords={coords}
            onCoordsChange={setCoords}
            onFindMe={findMe}
            geoLoading={geoLoading}
            geoError={geoError}
            software={software}
            onSoftwareChange={onSoftwareChange}
          />
          <RepeaterTable
            entries={filteredEntries}
            loading={loading}
            error={error}
            coords={coords}
          />
        </div>
      </div>

      <DownloadBar software={software} entries={filteredEntries} />
    </>
  );
}

export default App;
