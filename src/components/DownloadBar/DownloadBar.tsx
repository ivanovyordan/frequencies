import { useState } from 'react';
import type { ContactListSettings, RadioId, Repeater, StaticChannel, SoftwareOption } from '../../types/repeater';
import { buildChirpCsv } from '../../services/chirpBuilder';
import { buildAnytoneZip } from '../../services/anytone';
import { mapChannels, countChannels } from '../../services/channelMapper';
import { buildContactListCsv } from '../../services/contactListBuilder';
import { download } from '../../utils/download';

// ── Count helpers ──────────────────────────────────────────────────────────────

function totalExportable(entries: (Repeater | StaticChannel)[], software: SoftwareOption): number {
  const channels = mapChannels(entries);
  if (software === 'chirp') {
    return channels.filter((ch) => !(ch.dmr && !ch.dmr.mixedMode)).length;
  }
  const { fm, dmr } = countChannels(channels);
  // AnyTone DMR channels expand to up to 3 rows each; for count purposes report pre-expansion
  return fm + dmr;
}

// ── Info label ─────────────────────────────────────────────────────────────────

function infoLabel(entries: (Repeater | StaticChannel)[], software: SoftwareOption): string {
  const channels = mapChannels(entries);
  if (software === 'chirp') {
    const count = channels.filter((ch) => !(ch.dmr && !ch.dmr.mixedMode)).length;
    return `${count} FM канала → Chirp`;
  }
  const { fm, dmr } = countChannels(channels);
  return dmr > 0 ? `${fm} FM + ${dmr} DMR → Anytone` : `${fm} FM → Anytone`;
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  software: SoftwareOption;
  entries: (Repeater | StaticChannel)[];
  radioId: RadioId;
  contactList: ContactListSettings;
}

export function DownloadBar({ software, entries, radioId, contactList }: Props) {
  const [downloading, setDownloading] = useState(false);
  const count = totalExportable(entries, software);
  const disabled = count === 0 || downloading;

  async function handleDownload() {
    const channels = mapChannels(entries);
    if (software === 'chirp') {
      const blob = new Blob([buildChirpCsv(channels)], { type: 'text/csv;charset=utf-8;' });
      download(blob, 'честоти-chirp.csv');
      return;
    }
    setDownloading(true);
    try {
      const contactListCsv = contactList.enabled
        ? await buildContactListCsv(contactList.scope)
        : undefined;
      const blob = await buildAnytoneZip(channels, { radioId, contactListCsv });
      download(blob, 'честоти-anytone.zip');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-center gap-4 px-5 shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      <span className="text-xs text-slate-500">{infoLabel(entries, software)}</span>
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
