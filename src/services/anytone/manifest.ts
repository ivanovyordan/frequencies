// ── anytone.LST ────────────────────────────────────────────────────────────────

// Ordered list of all CPS-known files; indices are stable identifiers used by the radio.
export const CPS_FILE_INDEX: readonly string[] = [
  'Channel.CSV', // 0
  'RadioIDList.CSV', // 1
  'Zone.CSV', // 2
  'ScanList.CSV', // 3
  'AnalogAddressBook.CSV', // 4
  'TalkGroups.CSV', // 5
  'PrefabricatedSMS.CSV', // 6
  'FM.CSV', // 7
  'ReceiveGroupCallList.CSV', // 8
  '5ToneEncode.CSV', // 9
  '2ToneEncode.CSV', // 10
  'DTMFEncode.CSV', // 11
  'HotKey_QuickCall.CSV', // 12
  'HotKey_State.CSV', // 13
  'HotKey_HotKey.CSV', // 14
  'DigitalContactList.CSV', // 15
  'AutoRepeaterOffsetFrequencys.CSV', // 16
  'RoamingChannel.CSV', // 17
  'RoamingZone.CSV', // 18
  'APRS.CSV', // 19
  'GPSRoaming.CSV', // 20
  'OptionalSetting.CSV', // 21
  'AlertTone.CSV', // 22
  'AESEncryptionCode.CSV', // 23
  'ARC4EncryptionCode.CSV', // 24
];

/** Build the LST manifest listing only files that are actually present in the zip. */
export function buildLst(presentFiles: Set<string>): string {
  const entries = CPS_FILE_INDEX.map((f, i) => [i, f] as const).filter(([, f]) =>
    presentFiles.has(f),
  );
  return `${entries.length}\r\n${entries.map(([n, f]) => `${n},"${f}"`).join('\r\n')}\r\n`;
}
