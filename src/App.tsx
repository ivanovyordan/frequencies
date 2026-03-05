import { useMemo } from 'react';
import { useRepeaters } from './hooks/useRepeaters';
import { useFilters } from './hooks/useFilters';
import { useGeolocation } from './hooks/useGeolocation';
import { useRadioId } from './hooks/useRadioId';
import { useCustomChannels } from './hooks/useCustomChannels';
import { applyFilters } from './services/filter';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { RepeaterTable } from './components/RepeaterTable/RepeaterTable';
import { DownloadBar } from './components/DownloadBar/DownloadBar';

function App() {
  const { repeaters, loading, error } = useRepeaters();
  const { filters, disabledKeys, software, onToggle, onSoftwareChange } = useFilters();
  const { coords, geoLoading, geoError, findMe, setCoords } = useGeolocation();
  const [radioId, setRadioId] = useRadioId();
  const [customChannels, setCustomChannels] = useCustomChannels();

  const filteredEntries = useMemo(
    () => applyFilters(repeaters, filters, coords, customChannels),
    [repeaters, filters, coords, customChannels],
  );

  return (
    <div className="flex flex-col min-h-dvh bg-slate-100 text-slate-800 text-sm">
      <header className="h-14 bg-blue-700 text-white flex items-center px-5 gap-3 shadow-md shrink-0">
        <img src="/favicon.svg" alt="" className="h-8 w-auto" aria-hidden="true" />
        <h1 className="text-lg font-semibold tracking-tight flex-1">Честотен програматор</h1>
        <a
          href="https://github.com/ivanovyordan/frequencies"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-200 hover:text-white text-xs transition-colors"
        >
          Yordan, LZ9DB
        </a>
      </header>

      <div className="grid grid-cols-[240px_1fr] flex-1 overflow-hidden">
        <FilterPanel
          filters={filters}
          disabledKeys={disabledKeys}
          onToggle={onToggle}
          customChannels={customChannels}
          onCustomChannelsChange={setCustomChannels}
        />

        <div className="flex flex-col overflow-hidden">
          <ControlPanel
            coords={coords}
            onCoordsChange={setCoords}
            onFindMe={findMe}
            geoLoading={geoLoading}
            geoError={geoError}
            software={software}
            onSoftwareChange={onSoftwareChange}
            radioId={radioId}
            onRadioIdChange={setRadioId}
          />
          <RepeaterTable
            entries={filteredEntries}
            loading={loading}
            error={error}
            coords={coords}
          />
        </div>
      </div>

      <DownloadBar software={software} entries={filteredEntries} radioId={radioId} />
    </div>
  );
}

export default App;
