/**
 * Known DMR talk group IDs for the Bulgarian network (country code 284).
 * Used to produce human-readable names in Anytone CSV output.
 * Fall-back for unknown IDs: "TG{id}" (see tgLabel() in anytoneBuilder.ts).
 */
export const BG_DMR_TALKGROUPS: ReadonlyMap<number, string> = new Map([
  // Global / regional
  [9, 'Local'],
  [8, 'Regional'],
  [91, 'Worldwide'],
  [913, 'N.America'],
  // Bulgaria (284 = country code)
  [284, 'BG-National'],
  [2840, 'BG-Sofia'],
  [2841, 'BG-Plovdiv'],
  [2842, 'BG-Varna'],
  [2843, 'BG-Burgas'],
  [2844, 'BG-Stara Zagora'],
  [2845, 'BG-Ruse'],
  [2846, 'BG-Pleven'],
  [2847, 'BG-Varna 2'],
  [28499, 'BG-Parrot'],
]);
