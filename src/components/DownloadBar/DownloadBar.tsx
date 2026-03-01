import { useState } from 'react';
import type { Repeater, StaticChannel, SoftwareOption } from '../../types/repeater';
import { buildChirpCsv } from '../../services/chirpBuilder';
import { buildAnytoneZip, countAnytoneChannels } from '../../services/anytoneBuilder';
import { download } from '../../utils/download';

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
      const blob = new Blob([buildChirpCsv(entries)], { type: 'text/csv;charset=utf-8;' });
      download(blob, 'честоти-chirp.csv');
      return;
    }
    if (software === 'anytone') {
      setDownloading(true);
      try {
        const blob = await buildAnytoneZip(entries);
        download(blob, 'честоти-anytone.zip');
      } finally {
        setDownloading(false);
      }
    }
  }

  return (
    <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-center gap-4 px-5 shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      {software !== 'none' && (
        <span className="text-xs text-slate-500">{infoLabel(entries, software)}</span>
      )}
      <button
        className="h-10 px-6 inline-flex items-center justify-center bg-blue-700 text-white text-sm font-medium rounded transition-colors hover:enabled:bg-blue-800 disabled:opacity-45 disabled:cursor-not-allowed"
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
