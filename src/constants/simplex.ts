import type { StaticChannel, RepeaterModes } from '../types/repeater';

const SIMPLEX_MODES: RepeaterModes = {
  fm: { enabled: true },
  dmr: { enabled: false, ts1_groups: '', ts2_groups: '', color_code: '', callid: '' },
  dstar: { enabled: false },
  fusion: { enabled: false },
  nxdn: { enabled: false },
  parrot: { enabled: false },
  beacon: { enabled: false },
};

function makeSimplex(name: string, freqMhz: number): StaticChannel {
  const hz = Math.round(freqMhz * 1_000_000);
  return {
    callsign: name,
    place: 'Симплекс',
    freq: { rx: hz, tx: hz, tone: 0, channel: name },
    modes: SIMPLEX_MODES,
  };
}

// Standard VHF/UHF FM simplex channels used in Bulgaria (IARU Region 1)
// Names match Chirp convention: frequency in kHz without decimal point
export const SIMPLEX_CHANNELS: StaticChannel[] = [
  // 2m band
  makeSimplex('145300', 145.3),
  makeSimplex('145400', 145.4),
  makeSimplex('145450', 145.45),
  makeSimplex('145500', 145.5),
  makeSimplex('145550', 145.55),
  // 70cm band
  makeSimplex('433300', 433.3),
  makeSimplex('433400', 433.4),
  makeSimplex('433450', 433.45),
  makeSimplex('433500', 433.5),
  makeSimplex('433550', 433.55),
];
