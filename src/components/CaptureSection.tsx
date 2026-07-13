import { useEffect, useRef, useState } from "react";
import {
  getMicrophoneStream,
  listAudioInputs,
  startCapture,
  type AudioInputDevice,
  type CaptureHandle,
} from "../capture/captureAdapter";

/** Where a finished take ended up, so the status line can say so. */
export interface CaptureSaved {
  readonly name: string;
  readonly savedTo: "library" | "session";
}

interface CaptureSectionProps {
  /** Saves the finished take as a Sample and reports where it landed. */
  onCaptured: (blob: Blob) => Promise<CaptureSaved>;
}

type Phase = "idle" | "recording" | "saving";

/**
 * Live Capture: pick a Source (Microphone by default; Line-In is just a
 * selected input device), record a take with a live input-activity meter,
 * and hand the finished audio to the App to save as a Sample.
 */
export function CaptureSection({ onCaptured }: CaptureSectionProps) {
  const [devices, setDevices] = useState<readonly AudioInputDevice[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const captureRef = useRef<CaptureHandle | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function refreshDevices() {
    try {
      setDevices(await listAudioInputs());
    } catch {
      // Enumeration unavailable (no mediaDevices) — the default stays usable.
    }
  }

  useEffect(() => {
    void refreshDevices();
  }, []);

  async function onRecord() {
    setError(null);
    setStatus(null);
    try {
      const stream = await getMicrophoneStream(
        deviceId === "" ? undefined : deviceId,
      );
      streamRef.current = stream;
      captureRef.current = startCapture(stream, setLevel);
      setPhase("recording");
      // Permission is granted now, so device labels become available.
      void refreshDevices();
    } catch {
      setError(
        "Couldn't open the selected input device — check microphone permission.",
      );
    }
  }

  async function onStop() {
    const capture = captureRef.current;
    if (capture === null) {
      return;
    }
    captureRef.current = null;
    setPhase("saving");
    try {
      const blob = await capture.stop();
      const saved = await onCaptured(blob);
      setStatus(
        saved.savedTo === "library"
          ? `Saved "${saved.name}" to the Library.`
          : `Added "${saved.name}" to this session — pick a Library folder to keep captures on disk.`,
      );
    } catch {
      setError("Couldn't save the capture as a Sample.");
    } finally {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setLevel(0);
      setPhase("idle");
    }
  }

  const recording = phase === "recording";
  return (
    <section className="capture">
      <header className="capture-header">
        <h2>Live Capture</h2>
      </header>
      <div className="capture-controls">
        <label className="capture-source">
          Source
          <select
            value={deviceId}
            disabled={recording}
            onChange={(event) => setDeviceId(event.target.value)}
          >
            <option value="">Microphone (default)</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={recording ? "capture-record recording" : "capture-record"}
          disabled={phase === "saving"}
          onClick={() => void (recording ? onStop() : onRecord())}
        >
          {recording ? "Stop" : "Record"}
        </button>
      </div>
      {recording && (
        <progress
          className="capture-level"
          aria-label="Input level"
          max={1}
          value={level}
        />
      )}
      {recording && <p className="hint capture-status">Recording…</p>}
      {phase === "saving" && <p className="hint capture-status">Saving…</p>}
      {status !== null && phase === "idle" && (
        <p className="hint capture-status">{status}</p>
      )}
      {error !== null && <p className="error">{error}</p>}
    </section>
  );
}
