import { describe, expect, it } from "vitest";
import {
  addSample,
  assignSampleToPad,
  emptyKit,
  PAD_COUNT,
  padPlayback,
  padVolume,
  pitchToPlaybackRate,
  playbackWindow,
  sampleForPad,
  setPadPan,
  setPadPitch,
  setPadVolume,
  setSampleTrim,
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
      expect(pad).toEqual({
        sampleId: null,
        volume: 1,
        pan: 0,
        pitchSemitones: 0,
      });
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

describe("setSampleTrim", () => {
  it("sets Start and End on the Sample", () => {
    const kit = setSampleTrim(kitWithKick, kick.id, 0.1, 0.3);
    const trimmed = kit.samples[0];
    expect(trimmed?.trimStartSeconds).toBe(0.1);
    expect(trimmed?.trimEndSeconds).toBe(0.3);
  });

  it("clamps Start and End to the Sample's duration", () => {
    const kit = setSampleTrim(kitWithKick, kick.id, -1, 99);
    expect(kit.samples[0]?.trimStartSeconds).toBe(0);
    expect(kit.samples[0]?.trimEndSeconds).toBe(kick.durationSeconds);
  });

  it("ignores a trim where Start is not before End", () => {
    expect(setSampleTrim(kitWithKick, kick.id, 0.3, 0.3)).toEqual(kitWithKick);
    expect(setSampleTrim(kitWithKick, kick.id, 0.3, 0.1)).toEqual(kitWithKick);
  });

  it("ignores an unknown Sample id", () => {
    expect(setSampleTrim(kitWithKick, "s-ghost", 0, 0.1)).toEqual(kitWithKick);
  });
});

describe("playbackWindow", () => {
  it("spans the whole Sample when untrimmed", () => {
    expect(playbackWindow(kick)).toEqual({
      offsetSeconds: 0,
      durationSeconds: kick.durationSeconds,
    });
  });

  it("spans only the trimmed region", () => {
    const kit = setSampleTrim(kitWithKick, kick.id, 0.1, 0.3);
    const trimmed = kit.samples[0];
    expect(trimmed && playbackWindow(trimmed)).toEqual({
      offsetSeconds: 0.1,
      durationSeconds: expect.closeTo(0.2, 10) as number,
    });
  });
});

describe("emptyKit pad params", () => {
  it("defaults every Pad to center pan and zero pitch", () => {
    for (const pad of emptyKit.pads) {
      expect(pad.pan).toBe(0);
      expect(pad.pitchSemitones).toBe(0);
    }
  });
});

describe("setPadPan", () => {
  it("sets the Pad's pan", () => {
    expect(setPadPan(emptyKit, 3, -0.5).pads[3]?.pan).toBe(-0.5);
  });

  it("clamps pan to -1..1 and ignores out-of-range Pads", () => {
    expect(setPadPan(emptyKit, 0, 2).pads[0]?.pan).toBe(1);
    expect(setPadPan(emptyKit, 0, -2).pads[0]?.pan).toBe(-1);
    expect(setPadPan(emptyKit, 16, 0.5)).toEqual(emptyKit);
  });
});

describe("setPadPitch", () => {
  it("sets the Pad's pitch in semitones", () => {
    expect(setPadPitch(emptyKit, 3, 7).pads[3]?.pitchSemitones).toBe(7);
  });

  it("clamps pitch to -12..+12 and ignores out-of-range Pads", () => {
    expect(setPadPitch(emptyKit, 0, 30).pads[0]?.pitchSemitones).toBe(12);
    expect(setPadPitch(emptyKit, 0, -30).pads[0]?.pitchSemitones).toBe(-12);
    expect(setPadPitch(emptyKit, 16, 5)).toEqual(emptyKit);
  });
});

describe("padPlayback", () => {
  it("bundles the Pad's volume, pan, and playback rate", () => {
    let kit = setPadVolume(emptyKit, 2, 0.5);
    kit = setPadPan(kit, 2, -0.25);
    kit = setPadPitch(kit, 2, 12);
    expect(padPlayback(kit, 2)).toEqual({
      volume: 0.5,
      pan: -0.25,
      playbackRate: 2,
    });
  });

  it("returns neutral params for an out-of-range Pad", () => {
    expect(padPlayback(emptyKit, 99)).toEqual({
      volume: 1,
      pan: 0,
      playbackRate: 1,
    });
  });
});

describe("pitchToPlaybackRate", () => {
  it("maps semitones to a playback-rate multiplier", () => {
    expect(pitchToPlaybackRate(0)).toBe(1);
    expect(pitchToPlaybackRate(12)).toBeCloseTo(2, 10);
    expect(pitchToPlaybackRate(-12)).toBeCloseTo(0.5, 10);
    expect(pitchToPlaybackRate(7)).toBeCloseTo(1.4983070768766815, 10);
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
