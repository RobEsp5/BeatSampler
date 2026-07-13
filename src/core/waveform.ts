/**
 * Pure waveform peak computation: reduces raw channel data to one
 * max-absolute-value per display bucket. The audio adapter supplies the
 * channel data; rendering happens in the UI.
 */
export function computePeaks(
  data: ArrayLike<number>,
  buckets: number,
): number[] {
  if (data.length === 0 || buckets <= 0) {
    return [];
  }
  const peaks = new Array<number>(buckets).fill(0);
  for (let i = 0; i < data.length; i++) {
    const bucket = Math.floor((i * buckets) / data.length);
    const value = Math.abs(data[i] ?? 0);
    if (value > (peaks[bucket] ?? 0)) {
      peaks[bucket] = value;
    }
  }
  return peaks;
}
