import { describe, expect, it } from "vitest";
import { computePeaks } from "./waveform";

describe("computePeaks", () => {
  it("takes the max absolute value in each bucket", () => {
    expect(computePeaks([0.1, -0.5, 0.2, 0.4], 2)).toEqual([0.5, 0.4]);
  });

  it("handles a sample count that does not divide evenly", () => {
    expect(computePeaks([0.1, 0.2, 0.3, 0.4, -0.9], 2)).toEqual([0.3, 0.9]);
  });

  it("returns zeros for buckets beyond the data", () => {
    expect(computePeaks([0.5], 3)).toEqual([0.5, 0, 0]);
  });

  it("returns an empty array for zero buckets or empty data", () => {
    expect(computePeaks([], 4)).toEqual([]);
    expect(computePeaks([0.1], 0)).toEqual([]);
  });
});
