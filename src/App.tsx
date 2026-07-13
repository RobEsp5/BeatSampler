import { useEffect, useRef, useState } from "react";
import { WebAudioEngine } from "./audio/webAudioEngine";
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
import { padForKey } from "./core/padKeys";
import { connectWebMidi, type MidiStatus } from "./midi/webMidiAdapter";

export function App() {
  const engineRef = useRef<WebAudioEngine | null>(null);
  const [kit, setKit] = useState(emptyKit);
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

  async function onFileChosen(file: File) {
    setImportError(null);
    try {
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
