import { describe, it, expect } from 'vitest';
import { buildChirpCsv } from '../services/chirpBuilder';
import { mapChannels } from '../services/channelMapper';
import { makeRepeater, makeDmrRepeater, makeMixedRepeater } from './fixtures';

function csvLines(csv: string): string[] {
  return csv.trim().split('\n');
}

function dataRows(csv: string): string[] {
  return csvLines(csv).slice(1); // skip header
}

describe('buildChirpCsv', () => {
  it('includes the header row', () => {
    const csv = buildChirpCsv([]);
    expect(csvLines(csv)[0]).toContain('Location');
    expect(csvLines(csv)[0]).toContain('Frequency');
  });

  it('includes FM channels', () => {
    const channels = mapChannels([makeRepeater({ callsign: 'LZ0ASG' })]);
    const rows = dataRows(buildChirpCsv(channels));
    expect(rows).toHaveLength(1);
  });

  it('skips pure-DMR channels', () => {
    const channels = mapChannels([makeDmrRepeater({ callsign: 'LZ0ZAF' })]);
    expect(dataRows(buildChirpCsv(channels))).toHaveLength(0);
  });

  it('includes mixed-mode (FM+DMR) channels as analog', () => {
    const channels = mapChannels([makeMixedRepeater({ callsign: 'LZ0ZAF' })]);
    expect(dataRows(buildChirpCsv(channels))).toHaveLength(1);
  });

  it('truncates name to 8 chars and uppercases', () => {
    const repeater = makeRepeater({
      callsign: 'TOOLONGCALLSIGN',
      freq: { rx: 145_000_000, tx: 145_600_000, tone: 88.5, channel: 'R2' },
    });
    const channels = mapChannels([repeater]);
    const row = dataRows(buildChirpCsv(channels))[0];
    const name = row.split(',')[1];
    expect(name.length).toBeLessThanOrEqual(8);
    expect(name).toBe(name.toUpperCase());
  });

  it('uses Tone when ctcss > 0', () => {
    const channels = mapChannels([
      makeRepeater({
        callsign: 'LZ0ASG',
        freq: { rx: 145_000_000, tx: 145_600_000, tone: 88.5, channel: 'R2' },
      }),
    ]);
    const row = dataRows(buildChirpCsv(channels))[0];
    expect(row).toContain('Tone');
  });

  it('leaves Tone blank when ctcss = 0', () => {
    const channels = mapChannels([
      makeRepeater({
        callsign: 'LZ0ASG',
        freq: { rx: 145_000_000, tx: 145_600_000, tone: 0, channel: 'R2' },
      }),
    ]);
    const row = dataRows(buildChirpCsv(channels))[0];
    const fields = row.split(',');
    expect(fields[5]).toBe(''); // Tone column
  });

  it('sets duplex + for standard 600 kHz offset', () => {
    // rx=145.6, tx=145.0 → user RX > user TX → duplex '-'
    const channels = mapChannels([
      makeRepeater({
        callsign: 'LZ0ASG',
        freq: { rx: 145_000_000, tx: 145_600_000, tone: 0, channel: 'R2' },
      }),
    ]);
    const row = dataRows(buildChirpCsv(channels))[0];
    const duplex = row.split(',')[3];
    expect(duplex).toBe('-');
  });

  it('assigns sequential location numbers', () => {
    const channels = mapChannels([
      makeRepeater({ callsign: 'LZ0A' }),
      makeRepeater({ callsign: 'LZ0B' }),
    ]);
    const rows = dataRows(buildChirpCsv(channels));
    expect(rows[0].split(',')[0]).toBe('0');
    expect(rows[1].split(',')[0]).toBe('1');
  });
});
