import { useMemo, useState } from 'react';
import type { AprsSettings, ContactListSettings, RadioId, Repeater, StaticChannel, SoftwareOption } from '../../types/repeater';
import type { RadioChannel } from '../../types/channel';
import { buildChirpCsv } from '../../services/chirpBuilder';
import { buildAnytoneZip } from '../../services/anytone';
import { buildQdmrYaml } from '../../services/qdmr';
import { mapChannels, countChannels } from '../../services/channelMapper';
import { buildContactListCsv, fetchContactList } from '../../services/contactListBuilder';
import { download } from '../../utils/download';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SOFTWARE_LABELS: Record<SoftwareOption, string> = {
  chirp: 'Chirp',
  qdmr: 'QDMR',
  anytone: 'Anytone',
};

function channelCounts(channels: RadioChannel[], software: SoftwareOption) {
  if (software === 'chirp') {
    const fm = channels.filter((ch) => !(ch.dmr && !ch.dmr.mixedMode)).length;
    return { fm, dmr: 0 };
  }
  return countChannels(channels);
}

function infoLabel(fm: number, dmr: number, software: SoftwareOption): string {
  const label = SOFTWARE_LABELS[software];
  if (software === 'chirp') return `${fm} FM канала → ${label}`;
  return dmr > 0 ? `${fm} FM + ${dmr} DMR → ${label}` : `${fm} FM → ${label}`;
}

async function buildExport(
  software: SoftwareOption,
  channels: RadioChannel[],
  radioId: RadioId,
  contactList: ContactListSettings,
  aprsSettings: AprsSettings,
): Promise<{ blob: Blob; filename: string }> {
  if (software === 'chirp') {
    return {
      blob: new Blob([buildChirpCsv(channels)], { type: 'text/csv;charset=utf-8;' }),
      filename: 'честоти-chirp.csv',
    };
  }
  if (software === 'qdmr') {
    const userContacts = contactList.enabled
      ? await fetchContactList(contactList.scope)
      : undefined;
    return {
      blob: new Blob(
        [buildQdmrYaml(channels, { radioId, contactList: userContacts, aprsSettings })],
        { type: 'application/yaml;charset=utf-8;' },
      ),
      filename: 'честоти-qdmr.yaml',
    };
  }
  const contactListCsv = contactList.enabled
    ? await buildContactListCsv(contactList.scope)
    : undefined;
  return {
    blob: await buildAnytoneZip(channels, { radioId, contactListCsv, aprsSettings }),
    filename: 'честоти-anytone.zip',
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  software: SoftwareOption;
  entries: (Repeater | StaticChannel)[];
  radioId: RadioId;
  contactList: ContactListSettings;
  aprsSettings: AprsSettings;
}

export function DownloadBar({ software, entries, radioId, contactList, aprsSettings }: Props) {
  const [downloading, setDownloading] = useState(false);
  const channels = useMemo(() => mapChannels(entries), [entries]);
  const { fm, dmr } = useMemo(() => channelCounts(channels, software), [channels, software]);
  const count = fm + dmr;
  const disabled = count === 0 || downloading;

  async function handleDownload() {
    setDownloading(true);
    try {
      const { blob, filename } = await buildExport(software, channels, radioId, contactList, aprsSettings);
      download(blob, filename);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-center gap-4 px-5 shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      <span className="text-xs text-slate-500">{infoLabel(fm, dmr, software)}</span>
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
