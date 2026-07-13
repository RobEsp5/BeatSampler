/**
 * Pure Chop computation: dividing a Sample's playable region into Slices and
 * mapping them onto Pads. A Slice is realized as a derived Sample that shares
 * the source's decoded audio (bufferId) with its trim set to the Slice
 * bounds, so the ordinary playback path plays exactly the Slice.
 */

import {
  assignSampleToPad,
  audioBufferIdOf,
  PAD_COUNT,
  playbackWindow,
  type KitState,
  type Sample,
  type SampleId,
} from "./kit";

export interface SliceBounds {
  readonly startSeconds: number;
  readonly endSeconds: number;
}

export const MIN_REGIONS = 2;
export const MAX_REGIONS = PAD_COUNT;

/** Divides the Sample's trimmed region into N equal Slices (2..16). */
export function chopIntoRegions(
  sample: Sample,
  regions: number,
): SliceBounds[] {
  if (
    !Number.isInteger(regions) ||
    regions < MIN_REGIONS ||
    regions > MAX_REGIONS
  ) {
    return [];
  }
  const { offsetSeconds, durationSeconds } = playbackWindow(sample);
  const step = durationSeconds / regions;
  return Array.from({ length: regions }, (_, i) => ({
    startSeconds: offsetSeconds + i * step,
    endSeconds: offsetSeconds + (i + 1) * step,
  }));
}

const slicePrefix = (sourceId: SampleId) => `${sourceId}#slice-`;

/** True when the Sample is a Slice derived from the given source Sample. */
export function isSliceOf(sample: Sample, sourceId: SampleId): boolean {
  return sample.id.startsWith(slicePrefix(sourceId));
}

/**
 * Chops the Sample into N even Regions and maps the resulting Slices onto
 * Pads 1..N. Previous Slices of the same source are replaced (re-chop), the
 * source Sample itself is untouched, and Pad parameters are kept.
 */
export function chopSampleToPads(
  kit: KitState,
  sampleId: SampleId,
  regions: number,
): KitState {
  const source = kit.samples.find((sample) => sample.id === sampleId);
  if (source === undefined) {
    return kit;
  }
  const bounds = chopIntoRegions(source, regions);
  if (bounds.length === 0) {
    return kit;
  }
  const slices: Sample[] = bounds.map((slice, i) => ({
    id: `${slicePrefix(sampleId)}${i + 1}-of-${regions}`,
    name: `${source.name} · Slice ${i + 1}/${regions}`,
    durationSeconds: source.durationSeconds,
    trimStartSeconds: slice.startSeconds,
    trimEndSeconds: slice.endSeconds,
    bufferId: audioBufferIdOf(source),
  }));
  const keptSamples = kit.samples.filter(
    (sample) => !isSliceOf(sample, sampleId),
  );
  // Unassign Pads that held now-removed Slices, then place the new ones.
  const keptIds = new Set(keptSamples.map((sample) => sample.id));
  let next: KitState = {
    samples: [...keptSamples, ...slices],
    pads: kit.pads.map((pad) => ({
      ...pad,
      sampleId:
        pad.sampleId !== null && keptIds.has(pad.sampleId)
          ? pad.sampleId
          : null,
    })),
  };
  slices.forEach((slice, i) => {
    next = assignSampleToPad(next, i, slice.id);
  });
  return next;
}
