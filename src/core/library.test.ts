import { describe, expect, it } from "vitest";
import {
  DEFAULT_SOURCE,
  deserializeLibraryIndex,
  indexRecordFor,
  searchLibrary,
  serializeLibraryIndex,
  type LibraryEntry,
} from "./library";

const kick: LibraryEntry = {
  name: "Kick-808.wav",
  source: "File Import",
  durationSeconds: 0.42,
};
const snare: LibraryEntry = {
  name: "snare.wav",
  source: "Live Capture",
  durationSeconds: 0.31,
};
const hat: LibraryEntry = {
  name: "closed-hat.flac",
  source: "File Import",
  durationSeconds: 0.12,
};

const entries = [kick, snare, hat];

describe("searchLibrary", () => {
  it("returns everything for an empty query", () => {
    expect(searchLibrary(entries, "")).toEqual(entries);
    expect(searchLibrary(entries, "   ")).toEqual(entries);
  });

  it("filters by case-insensitive substring on the name", () => {
    expect(searchLibrary(entries, "KICK")).toEqual([kick]);
    expect(searchLibrary(entries, "hat")).toEqual([hat]);
    expect(searchLibrary(entries, ".wav")).toEqual([kick, snare]);
  });

  it("returns no entries when nothing matches", () => {
    expect(searchLibrary(entries, "tom")).toEqual([]);
  });
});

describe("serializeLibraryIndex / deserializeLibraryIndex", () => {
  it("round-trips Source and duration keyed by name", () => {
    const index = deserializeLibraryIndex(serializeLibraryIndex(entries));
    expect(indexRecordFor(index, "snare.wav")).toEqual({
      source: "Live Capture",
      durationSeconds: 0.31,
    });
    expect(indexRecordFor(index, "Kick-808.wav")).toEqual({
      source: "File Import",
      durationSeconds: 0.42,
    });
  });

  it("serializes to JSON that survives JSON.parse", () => {
    const parsed: unknown = JSON.parse(serializeLibraryIndex(entries));
    expect(parsed).toBeTypeOf("object");
  });

  it("defaults a name missing from the index to File Import with no cached duration", () => {
    const index = deserializeLibraryIndex(serializeLibraryIndex(entries));
    expect(indexRecordFor(index, "unknown.mp3")).toEqual({
      source: DEFAULT_SOURCE,
      durationSeconds: null,
    });
    expect(DEFAULT_SOURCE).toBe("File Import");
  });

  it("falls back to an empty index for corrupt JSON without throwing", () => {
    for (const bad of ["", "not json {", "42", '"a string"', "null", "[]"]) {
      const index = deserializeLibraryIndex(bad);
      expect(indexRecordFor(index, "kick.wav")).toEqual({
        source: DEFAULT_SOURCE,
        durationSeconds: null,
      });
    }
  });

  it("tolerates malformed records inside otherwise valid JSON", () => {
    const json = JSON.stringify({
      version: 1,
      entries: {
        "good.wav": { source: "Live Capture", durationSeconds: 1.5 },
        "bad-source.wav": { source: "Download", durationSeconds: 2 },
        "bad-duration.wav": { source: "File Import", durationSeconds: "long" },
        "negative.wav": { source: "File Import", durationSeconds: -3 },
        "not-a-record.wav": "nope",
      },
    });
    const index = deserializeLibraryIndex(json);
    expect(indexRecordFor(index, "good.wav")).toEqual({
      source: "Live Capture",
      durationSeconds: 1.5,
    });
    // Unknown Source falls back to the default; the cached duration survives.
    expect(indexRecordFor(index, "bad-source.wav")).toEqual({
      source: DEFAULT_SOURCE,
      durationSeconds: 2,
    });
    expect(indexRecordFor(index, "bad-duration.wav")).toEqual({
      source: "File Import",
      durationSeconds: null,
    });
    expect(indexRecordFor(index, "negative.wav")).toEqual({
      source: "File Import",
      durationSeconds: null,
    });
    expect(indexRecordFor(index, "not-a-record.wav")).toEqual({
      source: DEFAULT_SOURCE,
      durationSeconds: null,
    });
  });
});
