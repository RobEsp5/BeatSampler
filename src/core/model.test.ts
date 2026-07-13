import { describe, expect, it } from "vitest";
import { emptyKit, importSample, sampleForPad, type Sample } from "./model";

const kick: Sample = { id: "s-kick", name: "kick.wav", durationSeconds: 0.4 };
const snare: Sample = { id: "s-snare", name: "snare.wav", durationSeconds: 0.3 };

describe("importSample", () => {
  it("adds the Sample to the Kit", () => {
    const kit = importSample(emptyKit, kick);
    expect(kit.samples).toEqual([kick]);
  });

  it("assigns the imported Sample to the Pad", () => {
    const kit = importSample(emptyKit, kick);
    expect(sampleForPad(kit)).toEqual(kick);
  });

  it("puts the most recent import on the Pad, keeping earlier Samples in the Kit", () => {
    const kit = importSample(importSample(emptyKit, kick), snare);
    expect(sampleForPad(kit)).toEqual(snare);
    expect(kit.samples).toEqual([kick, snare]);
  });

  it("does not mutate the previous Kit state", () => {
    const before = importSample(emptyKit, kick);
    importSample(before, snare);
    expect(before.samples).toEqual([kick]);
    expect(sampleForPad(before)).toEqual(kick);
  });
});

describe("sampleForPad", () => {
  it("returns null when nothing has been imported", () => {
    expect(sampleForPad(emptyKit)).toBeNull();
  });
});
