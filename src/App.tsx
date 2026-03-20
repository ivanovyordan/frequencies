import { useMemo, useState } from 'react';
import { useRepeaters } from './hooks/useRepeaters';
import { useFilters } from './hooks/useFilters';
import { useGeolocation } from './hooks/useGeolocation';
import { useRadioId } from './hooks/useRadioId';
import { useCustomChannels } from './hooks/useCustomChannels';
import { useContactList } from './hooks/useContactList';
import { useAprsSettings } from './hooks/useAprsSettings';
import { applyFilters } from './services/filter';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { RepeaterTable } from './components/RepeaterTable/RepeaterTable';
import { DownloadBar } from './components/DownloadBar/DownloadBar';
import { SettingsModal } from './components/Settings/SettingsModal';

function App() {
  const { repeaters, loading, error } = useRepeaters();
  const { filters, disabledKeys, software, maxDistanceKm, onToggle, onSoftwareChange, onMaxDistanceChange } = useFilters();
  const { coords, geoLoading, geoError, findMe, setCoords } = useGeolocation();
  const [radioId, setRadioId] = useRadioId();
  const [customChannels, setCustomChannels] = useCustomChannels();
  const [contactList, setContactList] = useContactList();
  const [aprsSettings, setAprsSettings] = useAprsSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filteredEntries = useMemo(
    () => applyFilters(repeaters, filters, coords, customChannels, maxDistanceKm),
    [repeaters, filters, coords, customChannels, maxDistanceKm],
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
        <button
          onClick={() => setSettingsOpen(true)}
          className="text-blue-200 hover:text-white transition-colors"
          aria-label="Настройки"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <div className="grid grid-cols-[240px_1fr] flex-1 overflow-hidden">
        <FilterPanel
          filters={filters}
          disabledKeys={disabledKeys}
          onToggle={onToggle}
          maxDistanceKm={maxDistanceKm}
          onMaxDistanceChange={onMaxDistanceChange}
          hasCoords={coords.latitude !== null}
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
          />
          <RepeaterTable
            entries={filteredEntries}
            loading={loading}
            error={error}
            coords={coords}
          />
        </div>
      </div>

      <DownloadBar
        software={software}
        entries={filteredEntries}
        radioId={radioId}
        contactList={contactList}
        aprsSettings={aprsSettings}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        radioId={radioId}
        onRadioIdChange={setRadioId}
        contactList={contactList}
        onContactListChange={setContactList}
        aprsSettings={aprsSettings}
        onAprsSettingsChange={setAprsSettings}
      />
    </div>
  );
}

export default App;
