/**
 * Pure domain core for the Library — the shared, on-disk Sample catalog
 * (ADR 0004), independent of any single Project. This module knows nothing
 * about the File System Access API or IndexedDB; those live behind the
 * adapters in src/library/. Here: the LibraryEntry shape, name search, and
 * (de)serialization of the sidecar metadata index that caches each file's
 * Source and duration.
 */

export const SOURCES = ["File Import", "Live Capture"] as const;

/** Where a Sample's audio originated (see CONTEXT.md). */
export type Source = (typeof SOURCES)[number];

/** Files with no recorded Source are assumed to be File Imports. */
export const DEFAULT_SOURCE: Source = "File Import";

export interface LibraryEntry {
  /** The audio file's name within the Library folder (unique key). */
  readonly name: string;
  readonly source: Source;
  readonly durationSeconds: number;
}

/** Case-insensitive substring match on the entry name. */
export function searchLibrary(
  entries: readonly LibraryEntry[],
  query: string,
): readonly LibraryEntry[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") {
    return entries;
  }
  return entries.filter((entry) => entry.name.toLowerCase().includes(needle));
}

/**
 * What the sidecar index remembers about one file. `durationSeconds` is null
 * when no valid cached duration exists — the adapter then decodes the file to
 * learn it.
 */
export interface LibraryIndexRecord {
  readonly source: Source;
  readonly durationSeconds: number | null;
}

/** Parsed sidecar index: file name → cached metadata. */
export type LibraryIndex = ReadonlyMap<string, LibraryIndexRecord>;

const DEFAULT_RECORD: LibraryIndexRecord = {
  source: DEFAULT_SOURCE,
  durationSeconds: null,
};

/**
 * The sidecar file format ("beatsampler-library.json"):
 * { "version": 1, "entries": { "<name>": { "source", "durationSeconds" } } }
 */
export function serializeLibraryIndex(
  entries: readonly LibraryEntry[],
): string {
  const records: Record<
    string,
    { source: Source; durationSeconds: number }
  > = {};
  for (const entry of entries) {
    records[entry.name] = {
      source: entry.source,
      durationSeconds: entry.durationSeconds,
    };
  }
  return JSON.stringify({ version: 1, entries: records }, null, 2);
}

/**
 * Tolerant parse of the sidecar JSON: missing, corrupt, or partially invalid
 * content degrades to defaults per record — never throws. A file the index
 * doesn't know keeps the default Source and gets its duration re-decoded.
 */
export function deserializeLibraryIndex(json: string): LibraryIndex {
  const index = new Map<string, LibraryIndexRecord>();
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return index;
  }
  if (!isPlainObject(parsed) || !isPlainObject(parsed["entries"])) {
    return index;
  }
  for (const [name, record] of Object.entries(parsed["entries"])) {
    index.set(name, recordFromUnknown(record));
  }
  return index;
}

/** Look up a file in the index, defaulting when it (or a field) is missing. */
export function indexRecordFor(
  index: LibraryIndex,
  name: string,
): LibraryIndexRecord {
  return index.get(name) ?? DEFAULT_RECORD;
}

function recordFromUnknown(record: unknown): LibraryIndexRecord {
  if (!isPlainObject(record)) {
    return DEFAULT_RECORD;
  }
  const source = record["source"];
  const duration = record["durationSeconds"];
  return {
    source: isSource(source) ? source : DEFAULT_SOURCE,
    durationSeconds:
      typeof duration === "number" && Number.isFinite(duration) && duration >= 0
        ? duration
        : null,
  };
}

function isSource(value: unknown): value is Source {
  return SOURCES.includes(value as Source);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
