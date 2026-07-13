import { useRef, useState } from "react";
import { WebAudioEngine } from "./audio/webAudioEngine";
import { emptyKit, importSample, sampleForPad } from "./core/model";

export function App() {
  const engineRef = useRef<WebAudioEngine | null>(null);
  const [kit, setKit] = useState(emptyKit);
  const [importError, setImportError] = useState<string | null>(null);

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
        importSample(current, { id, name: file.name, durationSeconds }),
      );
    } catch {
      setImportError(`Couldn't decode "${file.name}" as audio.`);
    }
  }

  const padSample = sampleForPad(kit);

  return (
    <main className="app">
      <h1>BeatSampler</h1>
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
      <button
        type="button"
        className="pad"
        disabled={padSample === null}
        onPointerDown={() => {
          if (padSample !== null) {
            engine().play(padSample.id);
          }
        }}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
            if (padSample !== null) {
              engine().play(padSample.id);
            }
          }
        }}
      >
        {padSample === null ? (
          <span className="pad-empty">Import a file to fill the Pad</span>
        ) : (
          <span className="pad-label">
            {padSample.name}
            <small>{padSample.durationSeconds.toFixed(2)}s</small>
          </span>
        )}
      </button>
    </main>
  );
}
