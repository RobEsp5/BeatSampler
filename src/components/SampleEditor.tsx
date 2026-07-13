import { useEffect, useMemo, useRef } from "react";
import { playbackWindow, type Sample } from "../core/kit";
import { computePeaks } from "../core/waveform";

const WIDTH = 480;
const HEIGHT = 96;
const BUCKETS = 240;

interface SampleEditorProps {
  sample: Sample;
  /** First-channel PCM data, from the audio adapter. */
  channelData: Float32Array | null;
  onTrimChange: (startSeconds: number, endSeconds: number) => void;
  onPreview: () => void;
}

/** Waveform view with Start/End trim controls for the selected Sample. */
export function SampleEditor({
  sample,
  channelData,
  onTrimChange,
  onPreview,
}: SampleEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { offsetSeconds, durationSeconds } = playbackWindow(sample);
  const start = offsetSeconds;
  const end = offsetSeconds + durationSeconds;

  const peaks = useMemo(
    () => (channelData ? computePeaks(channelData, BUCKETS) : []),
    [channelData],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    const barWidth = WIDTH / BUCKETS;
    const startX = (start / sample.durationSeconds) * WIDTH;
    const endX = (end / sample.durationSeconds) * WIDTH;
    peaks.forEach((peak, i) => {
      const x = i * barWidth;
      const inTrim = x + barWidth > startX && x < endX;
      ctx.fillStyle = inTrim ? "#8ab4f8" : "#3c4043";
      const barHeight = Math.max(1, peak * HEIGHT);
      ctx.fillRect(x, (HEIGHT - barHeight) / 2, Math.ceil(barWidth), barHeight);
    });
    // Start/End markers
    ctx.fillStyle = "#e8eaed";
    ctx.fillRect(startX, 0, 1.5, HEIGHT);
    ctx.fillRect(endX - 1.5, 0, 1.5, HEIGHT);
  }, [peaks, start, end, sample.durationSeconds]);

  const step = Math.max(0.001, sample.durationSeconds / 1000);

  return (
    <section className="sample-editor" aria-label={`Edit ${sample.name}`}>
      <header className="editor-header">
        <span className="sample-name">{sample.name}</span>
        <button type="button" className="assign" onClick={onPreview}>
          Preview
        </button>
      </header>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="waveform"
      />
      <div className="trim-controls">
        <label>
          Start {start.toFixed(3)}s
          <input
            type="range"
            min={0}
            max={sample.durationSeconds}
            step={step}
            value={start}
            aria-label="Trim Start"
            onChange={(event) =>
              onTrimChange(event.target.valueAsNumber, end)
            }
          />
        </label>
        <label>
          End {end.toFixed(3)}s
          <input
            type="range"
            min={0}
            max={sample.durationSeconds}
            step={step}
            value={end}
            aria-label="Trim End"
            onChange={(event) => onTrimChange(start, event.target.valueAsNumber)}
          />
        </label>
      </div>
    </section>
  );
}
