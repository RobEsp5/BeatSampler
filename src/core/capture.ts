/**
 * Pure domain core for Live Capture — the honestly pure sliver of the
 * pipeline: naming a finished take and normalizing input-activity levels.
 * The stream/MediaRecorder machinery lives behind the thin adapter in
 * src/capture/captureAdapter.ts (no unit tests by policy); this module has
 * no browser imports and is TDD'd.
 */

/**
 * File name for a finished take, from the local wall-clock time:
 * "capture-YYYY-MM-DD-HHMMSS.webm". Second-resolution keeps successive
 * takes distinct while staying readable in the Library list.
 */
export function captureFileName(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const ymd = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
  const hms = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(pad)
    .join("");
  return `capture-${ymd}-${hms}.webm`;
}

/**
 * Input-activity level (0..1) from one AnalyserNode byte time-domain frame,
 * where silence sits at 128 and full scale swings 0..255: the peak deviation
 * from the midpoint, normalized and clamped so both extremes read as 1.
 */
export function levelFromByteTimeDomain(samples: Uint8Array): number {
  let peak = 0;
  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample - 128));
  }
  return Math.min(1, peak / 127);
}
