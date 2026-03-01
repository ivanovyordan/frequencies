import { useState } from 'react';
import type { Repeater, StaticChannel, SoftwareOption } from '../../types/repeater';
import { buildChirpCsv, downloadCsv } from '../../services/chirpBuilder';
import {
  buildAnytoneZip,
  countAnytoneChannels,
  downloadBlob,
} from '../../services/anytoneBuilder';

// ── Count helpers ──────────────────────────────────────────────────────────────

function chirpFmCount(entries: (Repeater | StaticChannel)[]): number {
  return entries.filter((e) => e.modes.fm.enabled).length;
}

function totalExportable(entries: (Repeater | StaticChannel)[], software: SoftwareOption): number {
  if (software === 'chirp') return chirpFmCount(entries);
  if (software === 'anytone') {
    const { fm, dmr } = countAnytoneChannels(entries);
    return fm + dmr;
  }
  return 0;
}

// ── Info label ─────────────────────────────────────────────────────────────────

function infoLabel(entries: (Repeater | StaticChannel)[], software: SoftwareOption): string {
  if (software === 'chirp') {
    return `${chirpFmCount(entries)} FM канала → Chirp`;
  }
  if (software === 'anytone') {
    const { fm, dmr } = countAnytoneChannels(entries);
    return dmr > 0 ? `${fm} FM + ${dmr} DMR → Anytone` : `${fm} FM → Anytone`;
  }
  return '';
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  software: SoftwareOption;
  entries: (Repeater | StaticChannel)[];
}

export function DownloadBar({ software, entries }: Props) {
  const [downloading, setDownloading] = useState(false);
  const count = totalExportable(entries, software);
  const disabled = software === 'none' || count === 0 || downloading;

  async function handleDownload() {
    if (software === 'chirp') {
      downloadCsv(buildChirpCsv(entries), 'честоти-chirp.csv');
      return;
    }
    if (software === 'anytone') {
      setDownloading(true);
      try {
        const blob = await buildAnytoneZip(entries);
        downloadBlob(blob, 'честоти-anytone.zip');
      } finally {
        setDownloading(false);
      }
    }
  }

  return (
    <footer className="download-bar">
      {software !== 'none' && (
        <span className="download-info">{infoLabel(entries, software)}</span>
      )}
      <button
        className="btn btn-primary"
        onClick={() => {
          void handleDownload();
        }}
        disabled={disabled}
        aria-label="Изтегли файловете за програмиране"
      >
        {downloading ? 'Подготвяне…' : 'Изтегли файлове'}
      </button>
    </footer>
  );
}
