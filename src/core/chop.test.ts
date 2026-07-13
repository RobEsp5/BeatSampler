import { describe, expect, it } from "vitest";
import {
  chopIntoRegions,
  chopSampleToPads,
  isSliceOf,
} from "./chop";
import {
  addSample,
  emptyKit,
  playbackWindow,
  sampleForPad,
  setPadVolume,
  setSampleTrim,
  type Sample,
} from "./kit";

const loop: Sample = { id: "s-loop", name: "loop.wav", durationSeconds: 2 };
const kitWithLoop = addSample(emptyKit, loop);

describe("chopIntoRegions", () => {
  it("divides the Sample evenly into N Slices", () => {
    expect(chopIntoRegions(loop, 4)).toEqual([
      { startSeconds: 0, endSeconds: 0.5 },
      { startSeconds: 0.5, endSeconds: 1 },
      { startSeconds: 1, endSeconds: 1.5 },
      { startSeconds: 1.5, endSeconds: 2 },
    ]);
  });

  it("respects the Sample's Start/End trim", () => {
    const trimmed = { ...loop, trimStartSeconds: 0.5, trimEndSeconds: 1.5 };
    expect(chopIntoRegions(trimmed, 2)).toEqual([
      { startSeconds: 0.5, endSeconds: 1 },
      { startSeconds: 1, endSeconds: 1.5 },
    ]);
  });

  it("rejects fewer than 2 or more than 16 Regions", () => {
    expect(chopIntoRegions(loop, 1)).toEqual([]);
    expect(chopIntoRegions(loop, 17)).toEqual([]);
  });
});

describe("chopSampleToPads", () => {
  const chopped = chopSampleToPads(kitWithLoop, loop.id, 4);

  it("creates one Slice Sample per Region, sharing the source's audio buffer", () => {
    const slices = chopped.samples.filter((s) => isSliceOf(s, loop.id));
    expect(slices).toHaveLength(4);
    for (const slice of slices) {
      expect(slice.bufferId).toBe(loop.id);
      expect(slice.durationSeconds).toBe(loop.durationSeconds);
    }
  });

  it("maps each Slice onto its own Pad, in order", () => {
    for (let i = 0; i < 4; i++) {
      const padSample = sampleForPad(chopped, i);
      expect(padSample !== null && isSliceOf(padSample, loop.id)).toBe(true);
      expect(playbackWindow(padSample!)).toEqual({
        offsetSeconds: i * 0.5,
        durationSeconds: 0.5,
      });
    }
    expect(sampleForPad(chopped, 4)).toBeNull();
  });

  it("names Slices after the source with their position", () => {
    expect(sampleForPad(chopped, 0)?.name).toBe("loop.wav · Slice 1/4");
  });

  it("leaves the source Sample intact", () => {
    expect(chopped.samples.find((s) => s.id === loop.id)).toEqual(loop);
  });

  it("keeps each Pad's own parameters", () => {
    const kit = setPadVolume(kitWithLoop, 0, 0.3);
    expect(chopSampleToPads(kit, loop.id, 4).pads[0]?.volume).toBe(0.3);
  });

  it("re-chopping replaces the previous Slices of that Sample", () => {
    const rechopped = chopSampleToPads(chopped, loop.id, 2);
    const slices = rechopped.samples.filter((s) => isSliceOf(s, loop.id));
    expect(slices).toHaveLength(2);
    expect(sampleForPad(rechopped, 2)).toBeNull();
  });

  it("chops within the source's trim", () => {
    const kit = setSampleTrim(kitWithLoop, loop.id, 1, 2);
    const result = chopSampleToPads(kit, loop.id, 2);
    expect(playbackWindow(sampleForPad(result, 0)!)).toEqual({
      offsetSeconds: 1,
      durationSeconds: 0.5,
    });
  });

  it("ignores an unknown Sample id or invalid Region count", () => {
    expect(chopSampleToPads(kitWithLoop, "s-ghost", 4)).toEqual(kitWithLoop);
    expect(chopSampleToPads(kitWithLoop, loop.id, 1)).toEqual(kitWithLoop);
  });
});
