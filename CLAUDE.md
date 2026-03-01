# Frequencies — Ham Radio Programming App

A static web app that fetches Bulgarian ham radio repeaters and generates
programming files for amateur radio CPS (Customer Programming Software).

## Commands

- `npm run dev` — dev server (localhost:3000)
- `npm run build` — production build → dist/
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint (typescript-eslint flat config)
- `npm run type-check` — TypeScript check without emit
- `npm run format` — Prettier (write in-place)
- `npm run format:check` — Prettier (check only, used in CI/hooks)

## Tech Stack

Vite + React + TypeScript · ESLint (typescript-eslint flat config) · Prettier · lefthook

## Architecture

```
src/
  types/repeater.ts      — single source of truth for ALL TypeScript interfaces
  services/              — pure functions (no React imports), independently testable
    api.ts               — fetchRepeaters(): Promise<Repeater[]>
    filter.ts            — applyFilters(repeaters, filters) → channel list
    chirpBuilder.ts      — buildChirpCsv() + downloadCsv()
  hooks/                 — React state wrappers over services
    useRepeaters.ts      — data fetch + loading/error state
    useFilters.ts        — toggle state + Chirp software interlock
    useGeolocation.ts    — navigator.geolocation wrapper
  constants/             — hardcoded static frequency lists
    simplex.ts           — IARU simplex channels for Bulgaria
    pmr.ts               — EU PMR446 channels
  components/            — presentational, receive typed props
    FilterPanel/         — toggle switches (left panel)
    ControlPanel/        — coordinates + software select (right panel)
    RepeaterTable/       — filtered repeater list
    DownloadBar/         — download button (sticky footer)
```

State is owned by `App.tsx` via hooks and passed down as props — no Context needed.

## API

`GET https://api.varna.radio/v1/` → JSON array of Repeater objects

Key notes:

- Frequencies are Hz integers (e.g. `145600000` = 145.6 MHz)
- CTCSS tone is a float already in Hz (e.g. `88.5`) — no conversion needed
- `tone: 0` means no CTCSS tone
- Skip repeaters with `disabled: true`

## Filter Logic

Filters are **OR-based**: a repeater is included if it matches ANY active toggle.

| Toggle   | BG Label   | Condition                                           |
| -------- | ---------- | --------------------------------------------------- |
| national | Национални | `freq.channel` matches `/^R(\d+)$/` AND number ≤ 12 |
| analog   | Аналогови  | `modes.fm.enabled === true`                         |
| dmr      | DMR        | `modes.dmr.enabled === true`                        |
| dstar    | D-Star     | `modes.dstar.enabled === true`                      |
| fusion   | Fusion     | `modes.fusion.enabled === true`                     |
| parrot   | Папагали   | `modes.parrot.enabled === true`                     |
| simplex  | Симплекс   | Append hardcoded IARU simplex channels              |
| pmr      | PMR        | Append hardcoded EU PMR446 channels                 |

**Chirp interlock**: selecting Chirp software deselects and disables: `dmr`, `dstar`, `fusion`, `parrot`.

## Chirp CSV

18-column format per the CHIRP wiki (MemoryEditorColumns):
`Location, Name, Frequency, Duplex, Offset, Tone, rToneFreq, cToneFreq, DtcsCode, DtcsPolarity, Mode, TStep, Skip, Comment, URCALL, RPT1CALL, RPT2CALL, DVCODE`

- `Frequency` = receive frequency in MHz
- `Duplex` = `"+"` if TX > RX, `"-"` if TX < RX, `""` for simplex
- Only `fm.enabled === true` entries produce a Chirp row

## Adding New CPS Software

1. Add value to `SoftwareOption` union in `src/types/repeater.ts`
2. Add `<option>` to `SoftwareSelect.tsx`
3. Create `src/services/{name}Builder.ts` with a builder function
4. Add download case to `DownloadBar.tsx`
5. Update the interlock in `useFilters.ts` if the new software has mode restrictions
