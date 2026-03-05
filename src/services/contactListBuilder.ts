import { buildCsv } from '../utils/csv';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ContactRow {
  radioId: number;
  callsign: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

// ── Bulgaria (paginated API) ───────────────────────────────────────────────────

interface ApiPage {
  pages: number;
  results: {
    radio_id: number;
    callsign: string;
    fname: string;
    surname: string;
    city: string | null;
    state: string | null;
    country: string;
  }[];
}

async function fetchApiPage(page: number): Promise<ApiPage> {
  const res = await fetch(
    `https://radioid.net/api/dmr/user/?country=Bulgaria&page=${page}`,
  );
  if (!res.ok) throw new Error(`RadioID API error ${res.status}`);
  return res.json() as Promise<ApiPage>;
}

function apiPageToRows(page: ApiPage): ContactRow[] {
  return page.results.map((u) => ({
    radioId: u.radio_id,
    callsign: u.callsign,
    name: [u.fname, u.surname].filter(Boolean).join(' '),
    city: u.city ?? '',
    state: u.state ?? '',
    country: u.country,
  }));
}

async function fetchBulgaria(): Promise<ContactRow[]> {
  const first = await fetchApiPage(1);
  const remaining = await Promise.all(
    Array.from({ length: first.pages - 1 }, (_, i) => fetchApiPage(i + 2)),
  );
  return [first, ...remaining].flatMap(apiPageToRows);
}

// ── Worldwide (static CSV) ─────────────────────────────────────────────────────

async function fetchWorldwide(): Promise<ContactRow[]> {
  const res = await fetch('https://radioid.net/static/user.csv');
  if (!res.ok) throw new Error(`RadioID CSV error ${res.status}`);
  const text = await res.text();

  const contacts: ContactRow[] = [];
  const lines = text.split('\n');

  // Skip header row (RADIO_ID,CALLSIGN,FIRST_NAME,LAST_NAME,CITY,STATE,COUNTRY)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [radioIdStr, callsign, firstName, lastName, city, state, country] =
      line.split(',');
    const radioId = parseInt(radioIdStr, 10);
    if (isNaN(radioId)) continue;
    contacts.push({
      radioId,
      callsign,
      name: [firstName, lastName].filter(Boolean).join(' '),
      city: city ?? '',
      state: state ?? '',
      country: country?.trim() ?? '',  // trim trailing \r from CRLF
    });
  }

  return contacts;
}

// ── CSV builder ────────────────────────────────────────────────────────────────

const HEADER = [
  'No.', 'Radio ID', 'Callsign', 'Name', 'City', 'State', 'Country',
  'Remarks', 'Call Type', 'Call Alert',
];

function toRows(contacts: ContactRow[]): (string | number)[][] {
  return contacts.map((c, i) => [
    i + 1, c.radioId, c.callsign, c.name,
    c.city, c.state, c.country, '', 'Private Call', 'None',
  ]);
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function buildContactListCsv(
  scope: 'bulgaria' | 'worldwide',
): Promise<string> {
  const contacts = scope === 'bulgaria'
    ? await fetchBulgaria()
    : await fetchWorldwide();
  return buildCsv(HEADER, toRows(contacts));
}
