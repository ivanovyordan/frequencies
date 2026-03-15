# Service Layer Refactor — Design Spec

**Date:** 2026-03-15
**Scope:** Service layer only (`src/services/`, `src/types/`, `src/constants/`)
**Goal:** Extract a shared `RadioChannel` intermediate type, define a `Builder` contract, split `anytoneBuilder.ts` into focused sub-modules, and eliminate duplicated TG data.

---

## Motivation

`anytoneBuilder.ts` (473 lines) currently owns the Repeater→channel mapping, the AnyTone-specific DMR expansion, zone building, talk group data, APRS config, the ZIP manifest, and the final ZIP assembly — all in one file. There is no shared contract between Chirp and AnyTone builders, and talk group data is duplicated between `anytoneBuilder.ts` and `dmrTalkGroups.ts`.

---

## Pipeline

```
Repeater[] + StaticChannel[]
        ↓  applyFilters()          (unchanged — filter.ts)
(Repeater | StaticChannel)[]
        ↓  channelMapper.ts        (NEW)
     RadioChannel[]
        ↓
  ┌─────┴──────┐
chirp       anytone
builder     builder
  ↓             ↓
string        Blob (ZIP)
```

---

## 1. Shared Types

### `src/types/channel.ts` (NEW)

```typescript
export type ChannelCategory = 'national' | 'local' | 'simplex' | 'pmr' | 'custom' | 'aprs';

export interface RadioChannel {
  name: string;
  rx: number;          // Hz
  tx: number;          // Hz
  ctcss: number;       // Hz, 0 = off
  category: ChannelCategory;
  place: string;
  pttProhibit?: boolean;
  dmr?: {
    colorCode: number;   // from API color_code field
    ts1Groups: string;   // raw API string, e.g. "284"
    ts2Groups: string;   // raw API string, e.g. "2840,2843"
  };
}
```

`ChannelCategory` moves here from `anytoneBuilder.ts` (currently a private type).

### `src/types/repeater.ts` (unchanged)

No changes needed — `Repeater`, `StaticChannel`, and related types stay as-is.

---

## 2. Builder Contract

### `src/services/builders.ts` (NEW)

```typescript
import type { RadioChannel } from '../types/channel';
import type { RadioId } from '../types/repeater';

export interface BuilderOptions {
  radioId?: RadioId;
  contactListCsv?: string;
}

export type Builder = (
  channels: RadioChannel[],
  options?: BuilderOptions,
) => Promise<Blob> | Blob | string;
```

Both existing builders are plain functions — this formalises the shared contract without requiring classes.

---

## 3. Channel Mapper

### `src/services/channelMapper.ts` (NEW)

Responsibilities:
- Convert `(Repeater | StaticChannel)[]` to `RadioChannel[]`
- Apply name deduplication (first occurrence wins)
- Assign `category` and `name` fields
- Expose raw DMR metadata from the API (`colorCode`, `ts1Groups`, `ts2Groups`) — no format-specific expansion

```typescript
export function mapChannels(entries: (Repeater | StaticChannel)[]): RadioChannel[]
```

The DMR triple-entry expansion (BG / REG / LOC rows) moves **out** of channelMapper and **into** the AnyTone builder, because it is an AnyTone CPS concept.

`channelMapper.ts` absorbs the `categoryOf()`, `channelName()` usage, and the `fromEntry()` / `collectChannels()` logic currently in `anytoneBuilder.ts` — with DMR expansion removed.

---

## 4. AnyTone Builder Split

`src/services/anytoneBuilder.ts` becomes `src/services/anytone/`:

### `src/services/anytone/index.ts`
Orchestrator. Implements `Builder`. Calls sub-modules and assembles the ZIP.

```typescript
export async function buildAnytoneZip(
  channels: RadioChannel[],
  options?: BuilderOptions,
): Promise<Blob>
```

### `src/services/anytone/channels.ts`
- Expands each DMR `RadioChannel` into up to 3 AnyTone rows (BG / REG / LOC)
- Handles mixed-mode (`D+A TX D`) vs digital-only (`D-Digital`)
- Owns the `OBLAST_TO_REGIONAL_TG` map and DMR row building logic
- Exports: `buildChannelCsv(channels: RadioChannel[], radioName: string): string`

### `src/services/anytone/zones.ts`
- Groups channels by category and oblast into AnyTone zones
- Exports: `buildZoneCsv(channels: RadioChannel[]): string`

### `src/services/anytone/talkGroups.ts`
- Owns the canonical BG DMR talk group list (absorbing `dmrTalkGroups.ts`)
- Builds `TalkGroups.CSV` and `ReceiveGroupCallList.CSV`
- Exports: `buildTalkGroupCsv(): string`, `buildReceiveGroupListCsv(): string`

### `src/services/anytone/aprs.ts`
- Builds `APRS.CSV` (the complex ~100-column APRS configuration row)
- Exports: `buildAprsCsv(callsign: string): string`

### `src/services/anytone/manifest.ts`
- Builds `anytone.LST` manifest from the set of present files
- Exports: `buildLst(presentFiles: Set<string>): string`

---

## 5. Chirp Builder Update

### `src/services/chirpBuilder.ts` (updated, stays single file)

Signature changes from:
```typescript
export function buildChirpCsv(entries: (Repeater | StaticChannel)[]): string
```
to:
```typescript
export function buildChirpCsv(channels: RadioChannel[]): string
```

Internally, it filters out channels with `dmr` set (Chirp is FM-only) and maps the rest to its CSV format. No other logic changes.

---

## 6. Constants Consolidation

### `src/constants/dmrTalkGroups.ts` (REMOVED)

Talk group data currently split between `dmrTalkGroups.ts` and `anytoneBuilder.ts` is consolidated into `src/services/anytone/talkGroups.ts`. The `dmrTalkGroups.ts` constants file is deleted.

---

## 7. File Inventory After Refactor

| Before | After | Change |
|--------|-------|--------|
| `src/types/repeater.ts` | `src/types/repeater.ts` | Remove `ChannelCategory` (moves to channel.ts) |
| _(none)_ | `src/types/channel.ts` | **New** — `RadioChannel`, `ChannelCategory` |
| _(none)_ | `src/services/builders.ts` | **New** — `Builder` type, `BuilderOptions` |
| _(none)_ | `src/services/channelMapper.ts` | **New** — `mapChannels()` |
| `src/services/anytoneBuilder.ts` | `src/services/anytone/index.ts` | Split into folder |
| _(none)_ | `src/services/anytone/channels.ts` | **New** — channel CSV + DMR expansion |
| _(none)_ | `src/services/anytone/zones.ts` | **New** — zone CSV |
| _(none)_ | `src/services/anytone/talkGroups.ts` | **New** — TG + receive group CSVs |
| _(none)_ | `src/services/anytone/aprs.ts` | **New** — APRS CSV |
| _(none)_ | `src/services/anytone/manifest.ts` | **New** — LST manifest |
| `src/services/chirpBuilder.ts` | `src/services/chirpBuilder.ts` | Updated signature only |
| `src/constants/dmrTalkGroups.ts` | _(deleted)_ | Absorbed into talkGroups.ts |

---

## 8. Out of Scope

- Component layer refactor (separate effort, to follow)
- `filter.ts` — no changes
- `contactListBuilder.ts` — no changes
- All hooks — no changes
- All utils — no changes
- All other constants — no changes

---

## Success Criteria

1. `npm run type-check` passes with zero errors
2. `npm run lint` passes
3. No file in `src/services/` exceeds 150 lines
4. Each file has a single clear responsibility answerable in one sentence
5. Adding a new radio format requires creating one new file implementing `Builder` — no changes to existing builders
