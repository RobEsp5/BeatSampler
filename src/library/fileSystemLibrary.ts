/**
 * Thin adapter between the Library folder on disk (File System Access API)
 * and the pure Library core. Owns the folder handle, scans it for audio
 * files, decodes them through the audio engine to learn durations, and reads/
 * writes the sidecar metadata index — the (de)serialization itself is pure
 * core (src/core/library.ts). No unit tests by policy: browser adapter.
 */

import type { WebAudioEngine } from "../audio/webAudioEngine";
import type { SampleId } from "../core/kit";
import {
  DEFAULT_SOURCE,
  deserializeLibraryIndex,
  indexRecordFor,
  serializeLibraryIndex,
  type LibraryEntry,
} from "../core/library";

/** Sidecar metadata index kept inside the Library folder itself. */
export const SIDECAR_FILE_NAME = "beatsampler-library.json";

const AUDIO_EXTENSIONS = new Set(["wav", "mp3", "ogg", "flac", "m4a", "webm"]);

/**
 * Stable SampleId for a Library file, so previewing and Pad drops share one
 * decoded buffer and re-dropping the same file never duplicates it.
 */
export function librarySampleId(name: string): SampleId {
  return `library:${name}`;
}

export function isAudioFileName(name: string): boolean {
  const dot = name.lastIndexOf(".");
  return dot >= 0 && AUDIO_EXTENSIONS.has(name.slice(dot + 1).toLowerCase());
}

export class FileSystemLibrary {
  private dir: FileSystemDirectoryHandle | null = null;
  private entries: readonly LibraryEntry[] = [];
  private decoded = new Set<string>();

  constructor(private readonly engine: WebAudioEngine) {}

  /**
   * Points the Library at a folder and scans it. Durations cached in the
   * sidecar are trusted (no decode); files the sidecar doesn't know are
   * decoded to learn their duration, defaulted to Source "File Import", and
   * cached back. Undecodable audio-extension files are skipped.
   */
  async open(dir: FileSystemDirectoryHandle): Promise<readonly LibraryEntry[]> {
    this.dir = dir;
    this.decoded.clear();
    const index = deserializeLibraryIndex(await this.readSidecar(dir));
    const entries: LibraryEntry[] = [];
    let sidecarStale = false;
    for await (const handle of dir.values()) {
      if (handle.kind !== "file" || !isAudioFileName(handle.name)) {
        continue;
      }
      const record = indexRecordFor(index, handle.name);
      if (record.durationSeconds !== null) {
        entries.push({
          name: handle.name,
          source: record.source,
          durationSeconds: record.durationSeconds,
        });
        continue;
      }
      try {
        const durationSeconds = await this.decodeFile(
          handle as FileSystemFileHandle,
        );
        entries.push({ name: handle.name, source: record.source, durationSeconds });
        sidecarStale = true;
      } catch {
        // Not decodable despite the audio extension — leave it out.
      }
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    this.entries = entries;
    if (sidecarStale) {
      await this.writeSidecar();
    }
    return this.entries;
  }

  /**
   * Makes sure the file's audio is decoded and ready to play under
   * librarySampleId(name) — previews and Pad drops call this lazily.
   */
  async ensureDecoded(name: string): Promise<void> {
    const dir = this.requireDir();
    if (this.decoded.has(name)) {
      return;
    }
    await this.decodeFile(await dir.getFileHandle(name));
  }

  /**
   * File Import into the Library: decode first (rejecting non-audio before
   * anything touches the folder), then write the file and update the sidecar.
   */
  async importFile(file: File): Promise<readonly LibraryEntry[]> {
    const dir = this.requireDir();
    const data = await file.arrayBuffer();
    // decodeAudioData consumes its input, so hand it a copy.
    const { durationSeconds } = await this.engine.decode(
      librarySampleId(file.name),
      data.slice(0),
    );
    this.decoded.add(file.name);
    const fileHandle = await dir.getFileHandle(file.name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
    const entry: LibraryEntry = {
      name: file.name,
      source: DEFAULT_SOURCE,
      durationSeconds,
    };
    this.entries = [
      ...this.entries.filter((existing) => existing.name !== entry.name),
      entry,
    ].sort((a, b) => a.name.localeCompare(b.name));
    await this.writeSidecar();
    return this.entries;
  }

  private requireDir(): FileSystemDirectoryHandle {
    if (this.dir === null) {
      throw new Error("No Library folder is open.");
    }
    return this.dir;
  }

  private async decodeFile(handle: FileSystemFileHandle): Promise<number> {
    const file = await handle.getFile();
    const { durationSeconds } = await this.engine.decode(
      librarySampleId(handle.name),
      await file.arrayBuffer(),
    );
    this.decoded.add(handle.name);
    return durationSeconds;
  }

  private async readSidecar(dir: FileSystemDirectoryHandle): Promise<string> {
    try {
      const handle = await dir.getFileHandle(SIDECAR_FILE_NAME);
      return await (await handle.getFile()).text();
    } catch {
      return "";
    }
  }

  private async writeSidecar(): Promise<void> {
    const dir = this.requireDir();
    try {
      const handle = await dir.getFileHandle(SIDECAR_FILE_NAME, {
        create: true,
      });
      const writable = await handle.createWritable();
      await writable.write(serializeLibraryIndex(this.entries));
      await writable.close();
    } catch {
      // A read-only folder still browses fine; durations just re-decode.
    }
  }
}
