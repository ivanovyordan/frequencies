# AnyTone RadioSetting.CSV — Design Spec

**Date:** 2026-03-17
**Status:** Approved

## Overview

Generate a `RadioSetting.CSV` file in the AnyTone ZIP export that configures the welcome screen, sets the radio to amateur band mode, and sets default TX power to medium. The operator's name (a new optional field on `RadioId`) is used as the first welcome screen line; the callsign is the second.

---

## 1. Type Changes

### `RadioId` (`src/types/repeater.ts`)

Add an optional `name` field:

```ts
export interface RadioId {
  name?: string;    // operator's personal name, e.g. "John"
  callsign: string;
  dmrId: string;
}
```

`name` is optional so existing serialised localStorage values remain valid without migration.

---

## 2. Settings Modal (`src/components/Settings/SettingsModal.tsx`)

Add a "Name" text input directly above the existing Callsign input in the operator identity section. It reads/writes `radioId.name` via the existing `onRadioIdChange` callback. Max length: 14 characters (AnyTone welcome screen limit). Placeholder: "Operator name".

---

## 3. Persistence (`src/hooks/useRadioId.ts`)

No structural changes needed. `RadioId` is stored as JSON in localStorage; the new optional `name` field deserialises cleanly from existing stored values (missing key → `undefined`).

---

## 4. New Builder (`src/services/anytone/radioSettings.ts`)

```ts
export function buildRadioSettingCsv(name: string, callsign: string): string
```

Produces `RadioSetting.CSV` with:

| Setting | Value |
|---|---|
| Welcome Line 1 | operator name (or callsign if name absent) |
| Welcome Line 2 | callsign (or empty if no callsign) |
| Band mode | Amateur |
| Default TX power | Medium |
| All other fields | radio factory defaults |

The CSV follows the same fully-quoted format (`buildCsv`) used by other AnyTone builders.

---

## 5. ZIP Assembly (`src/services/anytone/index.ts`)

`RadioSetting.CSV` is always included in the ZIP (no optional guard — band mode and power defaults apply regardless of whether the operator has a callsign).

`buildLst` already handles the manifest dynamically via the `files` Map, so no manifest changes are needed beyond adding the file.

---

## 6. Testing

- Unit test `buildRadioSettingCsv` in `src/__tests__/`:
  - Name + callsign → correct welcome lines
  - No name → callsign used for line 1, line 2 empty or callsign
  - Amateur mode field present
  - Medium power field present
- Existing ZIP/integration tests should continue to pass

---

## Out of Scope

- CHIRP (no device settings in its CSV format)
- Other radio settings (squelch, scan, etc.) — deferred to future iterations
