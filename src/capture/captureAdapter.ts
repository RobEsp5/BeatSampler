/**
 * Thin adapter for the Live Capture pipeline (no unit tests by policy:
 * browser adapter). ONE pipeline — startCapture(stream, onLevel) — records
 * whatever MediaStream it's handed via MediaRecorder (audio/webm) and reports
 * input activity from an AnalyserNode polled on requestAnimationFrame. The
 * pipeline never cares where the stream came from: Microphone/Line-In today
 * (getMicrophoneStream below), Tab/System Audio (getDisplayMedia) and
 * Resample (a master-bus tap) in later tickets. The level math itself is
 * pure core (src/core/capture.ts).
 */

import { levelFromByteTimeDomain } from "../core/capture";

export interface AudioInputDevice {
  readonly deviceId: string;
  readonly label: string;
}

/**
 * The audio-input devices the browser will enumerate. Labels are only
 * populated once the user has granted microphone permission; blank ones get
 * a positional stand-in so the dropdown stays usable pre-permission.
 */
export async function listAudioInputs(): Promise<readonly AudioInputDevice[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((device) => device.kind === "audioinput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label !== "" ? device.label : `Audio input ${index + 1}`,
    }));
}

/**
 * Opens a microphone (or any selected input device — Line-In is just a
 * picked audioinput, no special casing). Omitting deviceId asks for the
 * default microphone. The caller owns the stream and stops its tracks.
 */
export function getMicrophoneStream(deviceId?: string): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: deviceId === undefined ? true : { deviceId: { exact: deviceId } },
  });
}

export interface CaptureHandle {
  /** Ends the take and resolves with the recorded audio (audio/webm). */
  stop(): Promise<Blob>;
}

/**
 * The single Live Capture pipeline. Records the stream with MediaRecorder
 * and calls onLevel (0..1) every animation frame while recording, driven by
 * an AnalyserNode. Does not own the stream — the caller acquires it (from
 * any Source) and releases it after stop().
 */
export function startCapture(
  stream: MediaStream,
  onLevel: (level01: number) => void,
): CaptureHandle {
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/webm";
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  // Input-activity metering: a throwaway AudioContext taps the stream into
  // an AnalyserNode; requestAnimationFrame polls it while recording.
  const meterCtx = new AudioContext();
  const analyser = meterCtx.createAnalyser();
  analyser.fftSize = 2048;
  meterCtx.createMediaStreamSource(stream).connect(analyser);
  const frame = new Uint8Array(analyser.fftSize);
  let rafId = 0;
  const poll = () => {
    analyser.getByteTimeDomainData(frame);
    onLevel(levelFromByteTimeDomain(frame));
    rafId = requestAnimationFrame(poll);
  };
  rafId = requestAnimationFrame(poll);

  recorder.start();

  return {
    stop(): Promise<Blob> {
      cancelAnimationFrame(rafId);
      return new Promise((resolve, reject) => {
        recorder.onstop = () => {
          void meterCtx.close();
          resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = () => {
          void meterCtx.close();
          reject(new Error("Recording failed."));
        };
        recorder.stop();
      });
    },
  };
}
