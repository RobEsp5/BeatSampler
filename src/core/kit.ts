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
}

export interface KitState {
  readonly samples: readonly Sample[];
  readonly pads: readonly Pad[];
}

const emptyPad: Pad = { sampleId: null, volume: 1 };

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
  const clamped = Math.min(1, Math.max(0, volume));
  return updatePad(kit, padIndex, (pad) => ({ ...pad, volume: clamped }));
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
