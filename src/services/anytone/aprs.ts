import { buildCsv } from '../../utils/csv';

// ── APRS.CSV ───────────────────────────────────────────────────────────────────

export function buildAprsCsv(callsign: string, autoTxInterval = 180): string {
  const header: string[] = [
    'Manual TX Interval[s]',
    'APRS Auto TX Interval[s]',
    'Support For Roaming',
    'Fixed Location Beacon',
    'LatiDegree',
    'LatiMinInt',
    'LatiMinMark',
    'North or South',
    'LongtiDegree',
    'LongtiMinInt',
    'LongtiMinMark',
    'East or West Hemisphere',
  ];

  for (let i = 1; i <= 8; i++) {
    header.push(`channel${i}`, `slot${i}`, `Aprs Tg${i}`, `Call Type${i}`);
  }

  header.push(
    'APRS TG',
    'Call Type',
    'Repeater Activation Delay[ms]',
    'APRS TX Tone',
    'TOCALL',
    'TOCALL SSID',
    'Your Call Sign',
    'Your SSID',
    'APRS Symbol Table',
    'APRS Map Icon',
    'Digipeater Path',
    'Enter Your Sending Text',
    'Transmission Frequency [MHz]',
    'Transmit Delay[ms]',
    'Send Sub Tone',
    'CTCSS',
    'DCS',
    'Prewave Time[ms]',
    'Transmit Power',
  );

  for (let i = 1; i <= 32; i++) {
    header.push(`Receive Filter${i}`, `Call Sign${i}`, `SSID${i}`);
  }

  header.push(
    'POSITION',
    'MIC-E',
    'OBJECT',
    'ITEM',
    'MESSAGE',
    'WX REPORT',
    'NMEA REPORT',
    'STATUS REPORT',
    'OTHER',
  );

  for (let i = 0; i <= 7; i++) {
    header.push(`Transmission Frequency${i}`);
  }

  // Fix1–Fix4 use numeric suffixes; Fix5–Fix7 use _21–_23 (AnyTone CPS naming)
  for (const s of ['1', '2', '3', '4', '_21', '_22', '_23']) {
    header.push(
      `LatiDegree${s}`,
      `LatiMinInt${s}`,
      `LatiMinMark${s}`,
      `North or South${s}`,
      `LongtiDegree${s}`,
      `LongtiMinInt${s}`,
      `LongtiMinMark${s}`,
      `East or West Hemisphere${s}`,
    );
  }

  const row: (string | number)[] = [
    40,
    autoTxInterval,
    0,
    0, // Manual TX Interval, Auto TX Interval, Roaming, Fixed Beacon (off — no coords)
    0,
    0,
    0,
    0, // Lat (disabled)
    0,
    0,
    0,
    0, // Lon (disabled)
  ];

  // 8 digital APRS report channels (Channel VFO A / Channel Slot / TG 5057 / Private Call)
  for (let i = 0; i < 8; i++) row.push(4001, 0, 5057, 0);

  row.push(
    1,
    0,
    0, // APRS TG, Call Type, Repeater Activation Delay
    1, // APRS TX Tone
    'APAT81',
    1, // TOCALL, TOCALL SSID (−1)
    callsign,
    7, // Your Call Sign, Your SSID (−7)
    '/',
    '&', // Symbol Table, Map Icon (balloon)
    'WIDE1-1,WIDE2-2', // Digipeater Path
    `73 ${callsign}`, // Sending Text
    144, // Transmission Frequency [MHz]
    1200,
    0,
    0,
    19,
    1500,
    2, // Delay, Sub Tone, CTCSS, DCS, Prewave, Power (Mid)
  );

  for (let i = 0; i < 32; i++) row.push(0, '', 0); // Receive filters (all Off)

  // Message type receive flags
  row.push(1, 1, 1, 1, 1, 1, 0, 0, 0); // POS, MIC-E, OBJ, ITEM, MSG, WX, NMEA, STATUS, OTHER

  for (let i = 0; i < 8; i++) row.push('144.80000'); // Analog TX frequencies (APRS standard)

  for (let i = 0; i < 7 * 8; i++) row.push(0); // Fix location coordinates (all zero)

  return buildCsv(header, [row]);
}
