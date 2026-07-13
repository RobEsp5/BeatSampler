import type { SampleId } from "../core/kit";

/**
 * Thin adapter over the Web Audio API (the one seam from the PRD — the core
 * never imports this). Samples are decoded fully into memory at the
 * AudioContext's native sample rate (ADR 0002); the engine holds the decoded
 * AudioBuffers keyed by SampleId, while the core holds only Sample metadata.
 */
export class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private buffers = new Map<SampleId, AudioBuffer>();

  /** Lazily created so the AudioContext starts from a user gesture. */
  private context(): AudioContext {
    if (this.ctx === null) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async decode(
    id: SampleId,
    data: ArrayBuffer,
  ): Promise<{ durationSeconds: number }> {
    const buffer = await this.context().decodeAudioData(data);
    this.buffers.set(id, buffer);
    return { durationSeconds: buffer.duration };
  }

  play(
    id: SampleId,
    options: {
      volume?: number;
      offsetSeconds?: number;
      durationSeconds?: number;
    } = {},
  ): void {
    const buffer = this.buffers.get(id);
    if (buffer === undefined) {
      return;
    }
    const ctx = this.context();
    void ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = options.volume ?? 1;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0, options.offsetSeconds ?? 0, options.durationSeconds);
  }

  /** First-channel PCM data for waveform display, or null if not decoded. */
  channelData(id: SampleId): Float32Array | null {
    return this.buffers.get(id)?.getChannelData(0) ?? null;
  }
}
