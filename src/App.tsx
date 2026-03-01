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
    <div className="flex flex-col min-h-dvh bg-slate-100 text-slate-800 text-sm">
      <header className="h-14 bg-blue-700 text-white flex items-center px-5 gap-3 shadow-md shrink-0">
        <h1 className="text-lg font-semibold tracking-tight">Честотен програматор</h1>
      </header>

      <div className="grid grid-cols-[240px_1fr] flex-1 overflow-hidden">
        <FilterPanel filters={filters} disabledKeys={disabledKeys} onToggle={onToggle} />

        <div className="flex flex-col overflow-hidden">
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
    </div>
  );
}

export default App;
