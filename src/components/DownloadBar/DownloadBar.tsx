import type { Repeater, StaticChannel, SoftwareOption } from '../../types/repeater';
import { buildChirpCsv, downloadCsv } from '../../services/chirpBuilder';

const SOFTWARE_LABELS: Record<SoftwareOption, string> = {
  none: '',
  chirp: 'Chirp',
};

/** Count entries the selected software will actually export. */
function countExportable(entries: (Repeater | StaticChannel)[], software: SoftwareOption): number {
  if (software === 'chirp') return entries.filter((e) => e.modes.fm.enabled).length;
  return 0;
}

interface Props {
  software: SoftwareOption;
  entries: (Repeater | StaticChannel)[];
}

export function DownloadBar({ software, entries }: Props) {
  const count = countExportable(entries, software);
  const disabled = software === 'none' || count === 0;

  function handleDownload() {
    if (software === 'chirp') {
      const csv = buildChirpCsv(entries);
      downloadCsv(csv, 'честоти-chirp.csv');
    }
  }

  return (
    <footer className="download-bar">
      {software !== 'none' && (
        <span className="download-info">
          {count} FM канала за {SOFTWARE_LABELS[software]}
        </span>
      )}
      <button
        className="btn btn-primary"
        onClick={handleDownload}
        disabled={disabled}
        aria-label="Изтегли файловете за програмиране"
      >
        Изтегли файлове
      </button>
    </footer>
  );
}
