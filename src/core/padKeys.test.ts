import { describe, expect, it } from "vitest";
import { PAD_COUNT } from "./kit";
import { keyForPad, padForKey } from "./padKeys";

describe("pad key map", () => {
  it("maps ZXCV to the bottom row, Pads 1-4 (indexes 0-3)", () => {
    expect(padForKey("z")).toBe(0);
    expect(padForKey("v")).toBe(3);
  });

  it("maps 1234 to the top row, Pads 13-16 (indexes 12-15)", () => {
    expect(padForKey("1")).toBe(12);
    expect(padForKey("4")).toBe(15);
  });

  it("is case-insensitive and returns null for unmapped keys", () => {
    expect(padForKey("Q")).toBe(8);
    expect(padForKey("p")).toBeNull();
  });

  it("round-trips every Pad index", () => {
    for (let i = 0; i < PAD_COUNT; i++) {
      expect(padForKey(keyForPad(i))).toBe(i);
    }
  });
});
