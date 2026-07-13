/**
 * Pure domain core: Sample metadata and the (single, for now) Pad. No browser
 * or Web Audio imports — decoded audio lives behind the audio adapter, keyed
 * by SampleId.
 */

export type SampleId = string;

export interface Sample {
  readonly id: SampleId;
  readonly name: string;
  readonly durationSeconds: number;
}

export interface Pad {
  readonly sampleId: SampleId | null;
}

export interface KitState {
  readonly samples: readonly Sample[];
  readonly pad: Pad;
}

export const emptyKit: KitState = {
  samples: [],
  pad: { sampleId: null },
};

/** Adds the Sample to the Kit and puts it on the Pad (latest import wins). */
export function importSample(kit: KitState, sample: Sample): KitState {
  return {
    samples: [...kit.samples, sample],
    pad: { sampleId: sample.id },
  };
}

export function sampleForPad(kit: KitState): Sample | null {
  return kit.samples.find((sample) => sample.id === kit.pad.sampleId) ?? null;
}
