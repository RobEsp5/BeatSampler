/**
 * Pure domain core: the in-memory Kit — Sample metadata plus the single bank
 * of 16 Pads and their assignments/parameters. No browser or Web Audio
 * imports — decoded audio lives behind the audio adapter, keyed by SampleId.
 *
 * Samples currently live on the Kit; they migrate to the shared Library when
 * the Library ticket (#8) lands (ADR 0004).
 */

export const PAD_COUNT = 16;

export type SampleId = string;

export interface Sample {
  readonly id: SampleId;
  readonly name: string;
  readonly durationSeconds: number;
  /** Trim Start, seconds; absent means 0 (play from the beginning). */
  readonly trimStartSeconds?: number;
  /** Trim End, seconds; absent means durationSeconds (play to the end). */
  readonly trimEndSeconds?: number;
}

/** The region of the Sample that playback should cover (Start/End trim). */
export function playbackWindow(sample: Sample): {
  offsetSeconds: number;
  durationSeconds: number;
} {
  const start = sample.trimStartSeconds ?? 0;
  const end = sample.trimEndSeconds ?? sample.durationSeconds;
  return { offsetSeconds: start, durationSeconds: end - start };
}

export interface Pad {
  readonly sampleId: SampleId | null;
  /** Playback level, 0..1. */
  readonly volume: number;
  /** Stereo position, -1 (left) .. 1 (right); 0 is center. */
  readonly pan: number;
  /** Pitch shift in semitones, -12 .. +12; 0 is unshifted. */
  readonly pitchSemitones: number;
}

export interface KitState {
  readonly samples: readonly Sample[];
  readonly pads: readonly Pad[];
}

const emptyPad: Pad = { sampleId: null, volume: 1, pan: 0, pitchSemitones: 0 };

const clampTo = (min: number, max: number, value: number) =>
  Math.min(max, Math.max(min, value));

export const emptyKit: KitState = {
  samples: [],
  pads: Array.from({ length: PAD_COUNT }, () => emptyPad),
};

export function addSample(kit: KitState, sample: Sample): KitState {
  return { ...kit, samples: [...kit.samples, sample] };
}

/** Puts the Sample on the chosen Pad, keeping the Pad's other parameters. */
export function assignSampleToPad(
  kit: KitState,
  padIndex: number,
  sampleId: SampleId,
): KitState {
  if (!kit.samples.some((sample) => sample.id === sampleId)) {
    return kit;
  }
  return updatePad(kit, padIndex, (pad) => ({ ...pad, sampleId }));
}

export function setPadVolume(
  kit: KitState,
  padIndex: number,
  volume: number,
): KitState {
  const clamped = clampTo(0, 1, volume);
  return updatePad(kit, padIndex, (pad) => ({ ...pad, volume: clamped }));
}

export function setPadPan(
  kit: KitState,
  padIndex: number,
  pan: number,
): KitState {
  const clamped = clampTo(-1, 1, pan);
  return updatePad(kit, padIndex, (pad) => ({ ...pad, pan: clamped }));
}

export function setPadPitch(
  kit: KitState,
  padIndex: number,
  semitones: number,
): KitState {
  const clamped = clampTo(-12, 12, semitones);
  return updatePad(kit, padIndex, (pad) => ({
    ...pad,
    pitchSemitones: clamped,
  }));
}

/** Equal-temperament pitch shift: +12 semitones doubles the playback rate. */
export function pitchToPlaybackRate(semitones: number): number {
  return 2 ** (semitones / 12);
}

/** Sets a Sample's Start/End trim, clamped to its duration. Start must precede End. */
export function setSampleTrim(
  kit: KitState,
  sampleId: SampleId,
  startSeconds: number,
  endSeconds: number,
): KitState {
  const clamp = (v: number, max: number) => Math.min(max, Math.max(0, v));
  return updateSample(kit, sampleId, (sample) => {
    const start = clamp(startSeconds, sample.durationSeconds);
    const end = clamp(endSeconds, sample.durationSeconds);
    if (start >= end) {
      return sample;
    }
    return { ...sample, trimStartSeconds: start, trimEndSeconds: end };
  });
}

function updateSample(
  kit: KitState,
  sampleId: SampleId,
  update: (sample: Sample) => Sample,
): KitState {
  const index = kit.samples.findIndex((sample) => sample.id === sampleId);
  const sample = kit.samples[index];
  if (sample === undefined) {
    return kit;
  }
  const samples = [...kit.samples];
  samples[index] = update(sample);
  return { ...kit, samples };
}

export function padVolume(kit: KitState, padIndex: number): number {
  return kit.pads[padIndex]?.volume ?? 1;
}

/** The Pad's playback parameters, ready for the audio adapter. */
export function padPlayback(
  kit: KitState,
  padIndex: number,
): { volume: number; pan: number; playbackRate: number } {
  const pad = kit.pads[padIndex];
  return {
    volume: pad?.volume ?? 1,
    pan: pad?.pan ?? 0,
    playbackRate: pitchToPlaybackRate(pad?.pitchSemitones ?? 0),
  };
}

export function sampleForPad(kit: KitState, padIndex: number): Sample | null {
  const sampleId = kit.pads[padIndex]?.sampleId;
  return kit.samples.find((sample) => sample.id === sampleId) ?? null;
}

function updatePad(
  kit: KitState,
  padIndex: number,
  update: (pad: Pad) => Pad,
): KitState {
  const pad = kit.pads[padIndex];
  if (pad === undefined) {
    return kit;
  }
  const pads = [...kit.pads];
  pads[padIndex] = update(pad);
  return { ...kit, pads };
}
