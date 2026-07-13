import { useEffect, useRef, useState } from "react";
import { WebAudioEngine } from "./audio/webAudioEngine";
import {
  addSample,
  assignSampleToPad,
  emptyKit,
  PAD_COUNT,
  padVolume,
  sampleForPad,
  setPadVolume,
  type SampleId,
} from "./core/kit";
import { keyForPad, padForKey } from "./core/padKeys";

/**
 * Display order mirrors the MPC: Pad 1 bottom-left, Pad 16 top-right, so the
 * top display row holds Pad indexes 12-15.
 */
const displayOrder = Array.from(
  { length: PAD_COUNT },
  (_, i) => (3 - Math.floor(i / 4)) * 4 + (i % 4),
);

export function App() {
  const engineRef = useRef<WebAudioEngine | null>(null);
  const [kit, setKit] = useState(emptyKit);
  const [importError, setImportError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<SampleId | null>(null);
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

  function triggerPad(padIndex: number) {
    const sample = sampleForPad(kit, padIndex);
    if (sample === null) {
      return;
    }
    engine().play(sample.id, padVolume(kit, padIndex));
    flashPad(padIndex);
  }

  /** Pressing a Pad directly (click / Enter): assigns in assign mode, else triggers. */
  function onPadPressed(padIndex: number) {
    if (assigningId !== null) {
      setKit((current) => assignSampleToPad(current, padIndex, assigningId));
      setAssigningId(null);
      // Audible + visual ack: the Pad plays its newly assigned Sample.
      engine().play(assigningId, padVolume(kit, padIndex));
      flashPad(padIndex);
      return;
    }
    triggerPad(padIndex);
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

  return (
    <main className="app">
      <h1>BeatSampler</h1>

      <section className="samples">
        <label className="import">
          Import a Sample
          <input
            type="file"
            accept="audio/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file !== undefined) {
                void onFileChosen(file);
              }
              event.target.value = "";
            }}
          />
        </label>
        {importError !== null && <p className="error">{importError}</p>}
        {kit.samples.length > 0 && (
          <ul className="sample-list">
            {kit.samples.map((sample) => (
              <li key={sample.id}>
                <span className="sample-name">{sample.name}</span>
                <span className="sample-duration">
                  {sample.durationSeconds.toFixed(2)}s
                </span>
                <button
                  type="button"
                  className={
                    assigningId === sample.id ? "assign assigning" : "assign"
                  }
                  onClick={() =>
                    setAssigningId((current) =>
                      current === sample.id ? null : sample.id,
                    )
                  }
                >
                  {assigningId === sample.id ? "Pick a Pad…" : "Assign"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {assigningId !== null && (
          <p className="hint">Click a Pad to place the Sample.</p>
        )}
      </section>

      <section
        className={assigningId !== null ? "pad-grid assigning" : "pad-grid"}
      >
        {displayOrder.map((padIndex) => {
          const sample = sampleForPad(kit, padIndex);
          return (
            <div className="pad-slot" key={padIndex}>
              <button
                type="button"
                className="pad"
                data-empty={sample === null}
                onPointerDown={(event) => {
                  if (event.button === 0) {
                    onPadPressed(padIndex);
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    (event.key === "Enter" || event.key === " ") &&
                    !event.repeat
                  ) {
                    onPadPressed(padIndex);
                  }
                }}
              >
                {(flashes[padIndex] ?? 0) > 0 && (
                  <span className="pad-flash" key={flashes[padIndex]} />
                )}
                <span className="pad-corner">
                  <span className="pad-number">{padIndex + 1}</span>
                  <kbd>{keyForPad(padIndex).toUpperCase()}</kbd>
                </span>
                <span className="pad-name">{sample?.name ?? ""}</span>
              </button>
              <input
                className="pad-volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={padVolume(kit, padIndex)}
                aria-label={`Pad ${padIndex + 1} volume`}
                onChange={(event) =>
                  setKit((current) =>
                    setPadVolume(
                      current,
                      padIndex,
                      event.target.valueAsNumber,
                    ),
                  )
                }
              />
            </div>
          );
        })}
      </section>

      {kit.samples.length === 0 && (
        <p className="hint">Import a file, then assign it to a Pad.</p>
      )}
    </main>
  );
}
