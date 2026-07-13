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
