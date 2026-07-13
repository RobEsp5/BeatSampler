/**
 * MIDI note layout for the 16-Pad bank, matching the MPK Mini's default pad
 * bank: note 36 is Pad 1 (index 0), rising chromatically to note 51 for
 * Pad 16. Pure core — the Web MIDI adapter translates hardware events into
 * these terms.
 */

import { PAD_COUNT } from "./kit";

/** The MPK Mini's default note for Pad 1 (bank A, pad 1). */
export const MIDI_NOTE_FOR_PAD_1 = 36;

/** The Pad index a MIDI note triggers, or null if the note is unmapped. */
export function padForNote(note: number): number | null {
  if (!Number.isInteger(note)) {
    return null;
  }
  const padIndex = note - MIDI_NOTE_FOR_PAD_1;
  return padIndex >= 0 && padIndex < PAD_COUNT ? padIndex : null;
}

/** MIDI velocity (0-127) as a linear playback-level multiplier, 0..1. */
export function velocityToLevel(velocity: number): number {
  return Math.min(1, Math.max(0, velocity / 127));
}
