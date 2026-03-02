# Antigravity Project Rules

## Tech Stack
- React 19 (Vite)
- TypeScript
- Tailwind CSS
- JSZip (for AnyTone exports)

## Core Logic & Utilities
- **Frequency Formatting**: Always use `formatMhz(hz)` from `src/utils/freq.ts`.
- **National Channels**: Use `isNational(repeater)` and `getNationalNum(repeater)` from `src/utils/national.ts`.
- **Type Guards**: Use `isRepeater(entry)` from `src/types/repeater.ts`.
- **CSV Generation**: Use `buildCsv(header, rows)` from `src/utils/csv.ts`. It ensures CRLF line endings.

## Programming Commands
- `npm run dev`: Start development server
- `npm run build`: Build production bundle
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript compiler check
- `npm run format`: Format code with Prettier

## Architectural Patterns
- **Services**: Keep CSV building logic in `src/services/` (e.g., `chirpBuilder.ts`, `anytoneBuilder.ts`).
- **Hooks**: Use custom hooks for data fetching and state management (e.g., `useRepeaters.ts`).
- **Constants**: Store static frequency lists (Simplex, PMR) in `src/constants/`.

## CSV Requirements
- **CHIRP**: Standard CSV format. Tone freq defaults to 88.5 if not specified but enabled.
- **AnyTone**: Requires a ZIP containing 4 CSVs: `Channel`, `TalkGroups`, `Zone`, `ScanList`. Use pipe (`|`) as a separator for internal lists in Zone/ScanList CSVs.
- **Line Endings**: Always use `\r\n` (CRLF) for compatibility with Windows-based radio software.
