import { useEffect, useRef, useState } from "react";
import { WebAudioEngine } from "./audio/webAudioEngine";
import {
  CaptureSection,
  type CaptureSaved,
} from "./components/CaptureSection";
import { LibrarySection, type LibraryState } from "./components/LibrarySection";
import { PadGrid } from "./components/PadGrid";
import { SampleEditor } from "./components/SampleEditor";
import { SamplesSection } from "./components/SamplesSection";
import {
  addSample,
  assignSampleToPad,
  emptyKit,
  PAD_COUNT,
  padVolume,
  playbackWindow,
  sampleForPad,
  setSampleTrim,
  type KitState,
  type Sample,
  type SampleId,
} from "./core/kit";
import { captureFileName } from "./core/capture";
import { padForKey } from "./core/padKeys";
import {
  FileSystemLibrary,
  librarySampleId,
} from "./library/fileSystemLibrary";
import {
  loadLibraryHandle,
  queryHandlePermission,
  requestHandlePermission,
  saveLibraryHandle,
} from "./library/handleStore";
import { connectWebMidi, type MidiStatus } from "./midi/webMidiAdapter";

export function App() {
  const engineRef = useRef<WebAudioEngine | null>(null);
  const libraryRef = useRef<FileSystemLibrary | null>(null);
  /** Remembered folder handle awaiting a permission re-grant. */
  const pendingHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const [kit, setKit] = useState(emptyKit);
  const [library, setLibrary] = useState<LibraryState>({ status: "none" });
  const [importError, setImportError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<SampleId | null>(null);
  const [selectedId, setSelectedId] = useState<SampleId | null>(null);
  const [midiStatus, setMidiStatus] = useState<MidiStatus | null>(null);
  const [flashes, setFlashes] = useState<readonly number[]>(() =>
    new Array<number>(PAD_COUNT).fill(0),
  );

  function engine(): WebAudioEngine {
    engineRef.current ??= new WebAudioEngine();
    return engineRef.current;
  }

  function fileSystemLibrary(): FileSystemLibrary {
    libraryRef.current ??= new FileSystemLibrary(engine());
    return libraryRef.current;
  }

  async function openLibraryFolder(dir: FileSystemDirectoryHandle) {
    const entries = await fileSystemLibrary().open(dir);
    pendingHandleRef.current = null;
    setLibrary({ status: "open", folderName: dir.name, entries });
  }

  // On load, restore the remembered Library folder: reload silently when
  // permission persists, otherwise offer a one-click re-grant — never re-pick.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const handle = await loadLibraryHandle();
      if (handle === null || cancelled) {
        return;
      }
      const permission = await queryHandlePermission(handle);
      if (cancelled) {
        return;
      }
      if (permission === "granted") {
        await openLibraryFolder(handle);
      } else {
        pendingHandleRef.current = handle;
        setLibrary({ status: "needs-permission", folderName: handle.name });
      }
    })().catch((error: unknown) => {
      console.error("Couldn't restore the Library folder.", error);
    });
    return () => {
      cancelled = true;
    };
    // Mount-only: the refs and setters it uses are stable.
  }, []);

  async function onPickLibraryFolder() {
    try {
      const dir = await window.showDirectoryPicker({ mode: "readwrite" });
      await saveLibraryHandle(dir);
      await openLibraryFolder(dir);
    } catch (error) {
      // Cancelling the picker is not an error.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("Couldn't open the Library folder.", error);
    }
  }

  async function onReopenLibrary() {
    const handle = pendingHandleRef.current;
    if (handle === null) {
      return;
    }
    try {
      if ((await requestHandlePermission(handle)) === "granted") {
        await openLibraryFolder(handle);
      }
    } catch (error) {
      console.error("Couldn't re-open the Library folder.", error);
    }
  }

  async function onPreviewLibrarySample(name: string) {
    try {
      await fileSystemLibrary().ensureDecoded(name);
      engine().play(librarySampleId(name));
    } catch (error) {
      console.error(`Couldn't preview "${name}".`, error);
    }
  }

  /** Drag-and-drop from the Library list: decode, add to the Kit, assign. */
  async function onLibrarySampleDropped(padIndex: number, name: string) {
    if (library.status !== "open") {
      return;
    }
    const entry = library.entries.find((candidate) => candidate.name === name);
    if (entry === undefined) {
      return;
    }
    try {
      await fileSystemLibrary().ensureDecoded(name);
    } catch (error) {
      console.error(`Couldn't load "${name}" from the Library.`, error);
      return;
    }
    const id = librarySampleId(name);
    setKit((current) => {
      const withSample = current.samples.some((sample) => sample.id === id)
        ? current
        : addSample(current, {
            id,
            name: entry.name,
            durationSeconds: entry.durationSeconds,
          });
      return assignSampleToPad(withSample, padIndex, id);
    });
    // Audible + visual ack, mirroring assign mode.
    engine().play(id, { volume: padVolume(kit, padIndex) });
    flashPad(padIndex);
  }

  async function onFileChosen(file: File) {
    setImportError(null);
    try {
      if (library.status === "open") {
        // File Import lands in the Library folder, not just this session.
        const entries = await fileSystemLibrary().importFile(file);
        setLibrary({ ...library, entries });
        return;
      }
      const id = crypto.randomUUID();
      const { durationSeconds } = await engine().decode(
        id,
        await file.arrayBuffer(),
      );
      setKit((current) =>
        addSample(current, { id, name: file.name, durationSeconds }),
      );
    } catch {
      setImportError(`Couldn't decode "${file.name}" as audio.`);
    }
  }

  /**
   * A finished Live Capture take becomes a Sample exactly like a File
   * Import: into the Library folder when one is open, otherwise a
   * session-only Kit Sample.
   */
  async function onCaptured(blob: Blob): Promise<CaptureSaved> {
    const name = captureFileName(new Date());
    if (library.status === "open") {
      const entries = await fileSystemLibrary().importBlob(
        name,
        blob,
        "Live Capture",
      );
      setLibrary({ ...library, entries });
      return { name, savedTo: "library" };
    }
    const id = crypto.randomUUID();
    const { durationSeconds } = await engine().decode(
      id,
      await blob.arrayBuffer(),
    );
    setKit((current) => addSample(current, { id, name, durationSeconds }));
    return { name, savedTo: "session" };
  }

  function flashPad(padIndex: number) {
    setFlashes((current) =>
      current.map((count, i) => (i === padIndex ? count + 1 : count)),
    );
  }

  /** Plays a Sample's trimmed region (Start/End respected everywhere). */
  function playSample(sample: Sample, volume = 1) {
    const region = playbackWindow(sample);
    engine().play(sample.id, { volume, ...region });
  }

  /** One shared trigger path for mouse, keyboard, and MIDI (velocity 0..1). */
  function triggerPad(padIndex: number, velocity01 = 1) {
    const sample = sampleForPad(kit, padIndex);
    if (sample === null) {
      return;
    }
    playSample(sample, padVolume(kit, padIndex) * velocity01);
    flashPad(padIndex);
  }

  // MIDI events arrive outside React, so the adapter (connected once) calls
  // through a ref that always points at the latest triggerPad closure.
  const triggerPadRef = useRef(triggerPad);
  triggerPadRef.current = triggerPad;

  /** Pressing a Pad directly (click / Enter): assigns in assign mode, else triggers. */
  function onPadPressed(padIndex: number) {
    if (assigningId !== null) {
      const sample = kit.samples.find((s) => s.id === assigningId);
      setKit((current) => assignSampleToPad(current, padIndex, assigningId));
      setAssigningId(null);
      // Audible + visual ack: the Pad plays its newly assigned Sample.
      if (sample !== undefined) {
        playSample(sample, padVolume(kit, padIndex));
        flashPad(padIndex);
      }
      return;
    }
    triggerPad(padIndex);
  }

  function onKitChange(update: (kit: KitState) => KitState) {
    setKit(update);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && target.matches("input, select")) {
        return;
      }
      const padIndex = padForKey(event.key);
      if (padIndex !== null) {
        // Keys always play — assignment needs a deliberate press on the Pad itself.
        triggerPad(padIndex);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // No dependency array on purpose: re-subscribing every render keeps the
    // handler's closure over `kit` fresh.
  });

  useEffect(() => {
    return connectWebMidi(
      (padIndex, velocity01) => triggerPadRef.current(padIndex, velocity01),
      setMidiStatus,
    );
  }, []);

  const selectedSample =
    kit.samples.find((sample) => sample.id === selectedId) ?? null;

  return (
    <main className="app">
      <h1>BeatSampler</h1>
      <LibrarySection
        library={library}
        onPickFolder={() => void onPickLibraryFolder()}
        onReopen={() => void onReopenLibrary()}
        onPreview={(name) => void onPreviewLibrarySample(name)}
      />
      <CaptureSection onCaptured={onCaptured} />
      <SamplesSection
        samples={kit.samples}
        importError={importError}
        assigningId={assigningId}
        selectedId={selectedId}
        onFileChosen={(file) => void onFileChosen(file)}
        onToggleAssign={(sampleId) =>
          setAssigningId((current) => (current === sampleId ? null : sampleId))
        }
        onSelect={(sampleId) =>
          setSelectedId((current) => (current === sampleId ? null : sampleId))
        }
      />
      {selectedSample !== null && (
        <SampleEditor
          sample={selectedSample}
          channelData={engine().channelData(selectedSample.id)}
          onTrimChange={(startSeconds, endSeconds) =>
            setKit((current) =>
              setSampleTrim(current, selectedSample.id, startSeconds, endSeconds),
            )
          }
          onPreview={() => playSample(selectedSample)}
        />
      )}
      <PadGrid
        kit={kit}
        flashes={flashes}
        assigning={assigningId !== null}
        onPadPressed={onPadPressed}
        onKitChange={onKitChange}
        onLibrarySampleDropped={(padIndex, name) =>
          void onLibrarySampleDropped(padIndex, name)
        }
      />
      {kit.samples.length === 0 && (
        <p className="hint">Import a file, then assign it to a Pad.</p>
      )}
      {midiStatus !== null && (
        <p className="hint midi-status" data-status={midiStatus}>
          MIDI: {midiStatus}
        </p>
      )}
    </main>
  );
}
