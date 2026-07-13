import { padForNote, velocityToLevel } from "../core/midiNotes";

/**
 * Thin adapter over the Web MIDI API (mirrors the audio adapter — the core
 * never imports this). Subscribes to every MIDI input, translates note-on
 * messages into Pad triggers via the pure note map, and hands them to the
 * injected callback so MIDI shares the one Pad-trigger path with mouse and
 * keyboard. No-ops gracefully where Web MIDI is unavailable.
 */

export type MidiStatus = "connected" | "unavailable";

const NOTE_ON = 0x90;

/**
 * Requests MIDI access and starts listening on all inputs (re-subscribing on
 * statechange so hot-plugged devices work). Returns a disconnect function.
 */
export function connectWebMidi(
  onPadTrigger: (padIndex: number, velocity01: number) => void,
  onStatus?: (status: MidiStatus) => void,
): () => void {
  let disconnected = false;
  let access: MIDIAccess | null = null;

  function onMessage(event: Event) {
    const data = (event as MIDIMessageEvent).data;
    if (data === null || data.length < 3) {
      return;
    }
    const [status, note, velocity] = data as unknown as [
      number,
      number,
      number,
    ];
    // Note-on only; a note-on with velocity 0 is a note-off by convention.
    if ((status & 0xf0) !== NOTE_ON || velocity === 0) {
      return;
    }
    const padIndex = padForNote(note);
    if (padIndex === null) {
      return;
    }
    onPadTrigger(padIndex, velocityToLevel(velocity));
  }

  // addEventListener is idempotent per listener, so re-subscribing every
  // input on each statechange is safe and picks up hot-plugged devices.
  function subscribeAllInputs() {
    access?.inputs.forEach((input) => {
      input.addEventListener("midimessage", onMessage);
    });
  }

  if (
    typeof navigator === "undefined" ||
    navigator.requestMIDIAccess === undefined
  ) {
    onStatus?.("unavailable");
    return () => {};
  }

  navigator
    .requestMIDIAccess()
    .then((midiAccess) => {
      if (disconnected) {
        return;
      }
      access = midiAccess;
      access.addEventListener("statechange", subscribeAllInputs);
      subscribeAllInputs();
      onStatus?.("connected");
    })
    .catch(() => {
      onStatus?.("unavailable");
    });

  return () => {
    disconnected = true;
    if (access !== null) {
      access.removeEventListener("statechange", subscribeAllInputs);
      access.inputs.forEach((input) => {
        input.removeEventListener("midimessage", onMessage);
      });
      access = null;
    }
  };
}
