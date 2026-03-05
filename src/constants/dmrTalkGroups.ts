/**
 * Known DMR talk group IDs for the Bulgarian network (country code 284).
 * Used to produce human-readable names in Anytone CSV output.
 * Fall-back for unknown IDs: "TG{id}" (see tgLabel() in anytoneBuilder.ts).
 */
export const BG_DMR_TALKGROUPS: ReadonlyMap<number, string> = new Map([
  // Global / regional (standard BrandMeister)
  [9, 'Local'],
  [8, 'Regional'],
  [91, 'Worldwide'],
  [913, 'N.America'],
  // Bulgaria — source: https://wiki.brandmeister.network/index.php/Bulgaria
  [284, 'BG-National'],
  [2840, 'BG-Test'],
  [2842, 'BG-Sofia'],
  [2843, 'BG-Plovdiv'],
  [28430, 'BG-LZ0PLD'],
  [284112, 'BG-Emergency'],
  [284359, 'BG-XLX359B'],
  [284997, 'BG-Parrot'],
  [284999, 'BG-APRS'],
]);
