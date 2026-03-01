# Честотен програматор

A static web app for Bulgarian ham radio operators. Fetches live repeater data, lets you filter by mode and category, and downloads ready-to-import programming files for CPS software.

Currently supports **Chirp**.

## Features

- Live repeater data from [api.varna.radio](https://api.varna.radio/v1/)
- Filter by mode: FM (Analog), DMR, D-Star, Fusion, Parrot
- Filter by category: National (R0–R12), Simplex, PMR446
- Sort by distance using browser geolocation or manual coordinates
- Export to Chirp CSV — FM channels only, sequential channel numbers

## Usage

Open the app, enable the filters you need, optionally select **Chirp** as the target software, then click **Изтегли файлове** to download the programming file.

Import the downloaded `.csv` into Chirp via **File → Import**.

## Development

```
npm install
npm run dev        # dev server at localhost:3000
npm run build      # production build → dist/
npm run lint       # ESLint
npm run type-check # TypeScript (no emit)
npm run format     # Prettier (write)
```

## Adding CPS Software

1. Add a value to `SoftwareOption` in `src/types/repeater.ts`
2. Add an `<option>` to `src/components/ControlPanel/SoftwareSelect.tsx`
3. Create `src/services/{name}Builder.ts`
4. Handle the download case in `src/components/DownloadBar/DownloadBar.tsx`
5. Update the mode interlock in `src/hooks/useFilters.ts` if the software has restrictions

## License

MIT
