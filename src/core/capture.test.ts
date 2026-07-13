import { describe, expect, it } from "vitest";
import { captureFileName, levelFromByteTimeDomain } from "./capture";

describe("captureFileName", () => {
  it("names the take capture-YYYY-MM-DD-HHMMSS.webm from the local time", () => {
    const date = new Date(2026, 6, 13, 8, 15, 0); // 2026-07-13 08:15:00 local
    expect(captureFileName(date)).toBe("capture-2026-07-13-081500.webm");
  });

  it("zero-pads every component", () => {
    const date = new Date(2026, 0, 5, 3, 7, 9); // 2026-01-05 03:07:09 local
    expect(captureFileName(date)).toBe("capture-2026-01-05-030709.webm");
  });

  it("distinguishes takes a second apart", () => {
    const first = captureFileName(new Date(2026, 6, 13, 23, 59, 58));
    const second = captureFileName(new Date(2026, 6, 13, 23, 59, 59));
    expect(first).not.toBe(second);
  });
});

describe("levelFromByteTimeDomain", () => {
  // AnalyserNode.getByteTimeDomainData centers silence at 128 and swings
  // 0..255 at full scale; the level is the normalized peak deviation, 0..1.

  it("is 0 for silence (all samples at the 128 midpoint)", () => {
    expect(levelFromByteTimeDomain(new Uint8Array([128, 128, 128]))).toBe(0);
  });

  it("is 1 for a full positive swing (255)", () => {
    expect(levelFromByteTimeDomain(new Uint8Array([128, 255, 128]))).toBe(1);
  });

  it("is 1 for a full negative swing (0)", () => {
    expect(levelFromByteTimeDomain(new Uint8Array([128, 0, 128]))).toBe(1);
  });

  it("scales linearly with the peak deviation", () => {
    // 192 deviates 64 from 128: half of the 127-step positive range, ~0.5.
    const level = levelFromByteTimeDomain(new Uint8Array([128, 192, 130]));
    expect(level).toBeCloseTo(64 / 127, 5);
  });

  it("uses the loudest sample, wherever it sits", () => {
    const level = levelFromByteTimeDomain(new Uint8Array([128, 140, 96, 129]));
    expect(level).toBeCloseTo(32 / 127, 5);
  });

  it("is 0 for an empty buffer", () => {
    expect(levelFromByteTimeDomain(new Uint8Array([]))).toBe(0);
  });

  it("never exceeds 1", () => {
    const extremes = new Uint8Array([0, 255, 0, 255]);
    expect(levelFromByteTimeDomain(extremes)).toBeLessThanOrEqual(1);
  });
});
