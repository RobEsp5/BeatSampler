import { describe, expect, it } from "vitest";
import { PAD_COUNT } from "./kit";
import { MIDI_NOTE_FOR_PAD_1, padForNote, velocityToLevel } from "./midiNotes";

describe("MIDI note map (MPK Mini default bank)", () => {
  it("maps note 36 to Pad 1 (index 0)", () => {
    expect(MIDI_NOTE_FOR_PAD_1).toBe(36);
    expect(padForNote(36)).toBe(0);
  });

  it("maps note 51 to Pad 16 (index 15)", () => {
    expect(padForNote(51)).toBe(15);
  });

  it("covers every Pad index across notes 36-51", () => {
    for (let i = 0; i < PAD_COUNT; i++) {
      expect(padForNote(36 + i)).toBe(i);
    }
  });

  it("returns null for notes below the bank", () => {
    expect(padForNote(35)).toBeNull();
    expect(padForNote(20)).toBeNull();
    expect(padForNote(0)).toBeNull();
  });

  it("returns null for notes above the bank", () => {
    expect(padForNote(52)).toBeNull();
    expect(padForNote(127)).toBeNull();
  });

  it("returns null for non-integer notes", () => {
    expect(padForNote(36.5)).toBeNull();
  });
});

describe("velocity scaling", () => {
  it("maps full velocity 127 to level 1", () => {
    expect(velocityToLevel(127)).toBe(1);
  });

  it("scales mid velocities linearly (64 → 64/127)", () => {
    expect(velocityToLevel(64)).toBeCloseTo(64 / 127, 10);
  });

  it("maps velocity 1 to a small but nonzero level", () => {
    expect(velocityToLevel(1)).toBeCloseTo(1 / 127, 10);
    expect(velocityToLevel(1)).toBeGreaterThan(0);
  });

  it("maps velocity 0 to level 0", () => {
    expect(velocityToLevel(0)).toBe(0);
  });

  it("clamps out-of-range velocities into 0..1", () => {
    expect(velocityToLevel(-5)).toBe(0);
    expect(velocityToLevel(200)).toBe(1);
  });
});
