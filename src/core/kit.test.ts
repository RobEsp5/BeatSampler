import { describe, expect, it } from "vitest";
import {
  addSample,
  assignSampleToPad,
  emptyKit,
  PAD_COUNT,
  padVolume,
  sampleForPad,
  setPadVolume,
  type Sample,
} from "./kit";

const kick: Sample = { id: "s-kick", name: "kick.wav", durationSeconds: 0.4 };
const snare: Sample = { id: "s-snare", name: "snare.wav", durationSeconds: 0.3 };

const kitWithKick = addSample(emptyKit, kick);

describe("emptyKit", () => {
  it("has 16 unassigned Pads at full volume", () => {
    expect(PAD_COUNT).toBe(16);
    expect(emptyKit.pads).toHaveLength(16);
    for (const pad of emptyKit.pads) {
      expect(pad).toEqual({ sampleId: null, volume: 1 });
    }
  });
});

describe("addSample", () => {
  it("adds the Sample to the Kit without assigning it to a Pad", () => {
    expect(kitWithKick.samples).toEqual([kick]);
    expect(kitWithKick.pads.every((pad) => pad.sampleId === null)).toBe(true);
  });

  it("does not mutate the previous Kit state", () => {
    const before = addSample(emptyKit, kick);
    addSample(before, snare);
    expect(before.samples).toEqual([kick]);
  });
});

describe("assignSampleToPad", () => {
  it("assigns the Sample to the chosen Pad", () => {
    const kit = assignSampleToPad(kitWithKick, 5, kick.id);
    expect(sampleForPad(kit, 5)).toEqual(kick);
    expect(sampleForPad(kit, 4)).toBeNull();
  });

  it("replaces an existing assignment on that Pad", () => {
    let kit = addSample(kitWithKick, snare);
    kit = assignSampleToPad(kit, 0, kick.id);
    kit = assignSampleToPad(kit, 0, snare.id);
    expect(sampleForPad(kit, 0)).toEqual(snare);
  });

  it("allows the same Sample on several Pads", () => {
    let kit = assignSampleToPad(kitWithKick, 0, kick.id);
    kit = assignSampleToPad(kit, 15, kick.id);
    expect(sampleForPad(kit, 0)).toEqual(kick);
    expect(sampleForPad(kit, 15)).toEqual(kick);
  });

  it("keeps the Pad's volume when reassigning", () => {
    let kit = setPadVolume(kitWithKick, 3, 0.5);
    kit = assignSampleToPad(kit, 3, kick.id);
    expect(kit.pads[3]?.volume).toBe(0.5);
  });

  it("ignores a Sample id that is not in the Kit", () => {
    expect(assignSampleToPad(kitWithKick, 0, "s-ghost")).toEqual(kitWithKick);
  });

  it("ignores an out-of-range Pad index", () => {
    expect(assignSampleToPad(kitWithKick, 16, kick.id)).toEqual(kitWithKick);
    expect(assignSampleToPad(kitWithKick, -1, kick.id)).toEqual(kitWithKick);
  });
});

describe("setPadVolume", () => {
  it("sets the Pad's volume", () => {
    const kit = setPadVolume(emptyKit, 2, 0.25);
    expect(kit.pads[2]?.volume).toBe(0.25);
    expect(kit.pads[1]?.volume).toBe(1);
  });

  it("clamps volume to the 0..1 range", () => {
    expect(setPadVolume(emptyKit, 0, 1.7).pads[0]?.volume).toBe(1);
    expect(setPadVolume(emptyKit, 0, -0.3).pads[0]?.volume).toBe(0);
  });

  it("ignores an out-of-range Pad index", () => {
    expect(setPadVolume(emptyKit, 16, 0.5)).toEqual(emptyKit);
  });
});

describe("padVolume", () => {
  it("returns the Pad's volume", () => {
    expect(padVolume(setPadVolume(emptyKit, 4, 0.6), 4)).toBe(0.6);
  });

  it("returns full volume for an out-of-range Pad index", () => {
    expect(padVolume(emptyKit, 99)).toBe(1);
  });
});

describe("sampleForPad", () => {
  it("returns null for an unassigned Pad", () => {
    expect(sampleForPad(emptyKit, 0)).toBeNull();
  });

  it("returns null for an out-of-range Pad index", () => {
    expect(sampleForPad(emptyKit, 99)).toBeNull();
  });
});
