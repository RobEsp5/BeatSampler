import {
  sampleForPad,
  setPadPan,
  setPadPitch,
  type KitState,
} from "../core/kit";

interface PadParamsProps {
  kit: KitState;
  /** The Pad the panel edits — the one most recently pressed. */
  padIndex: number;
  onKitChange: (update: (kit: KitState) => KitState) => void;
}

/** Pan + pitch controls for the last-pressed Pad (volume lives under each Pad). */
export function PadParams({ kit, padIndex, onKitChange }: PadParamsProps) {
  const pad = kit.pads[padIndex];
  if (pad === undefined) {
    return null;
  }
  const sample = sampleForPad(kit, padIndex);
  return (
    <section className="pad-params">
      <span className="pad-params-title">
        Pad {padIndex + 1}
        {sample !== null && <small> · {sample.name}</small>}
      </span>
      <label>
        Pan {pad.pan === 0 ? "C" : pad.pan < 0 ? `L${Math.round(-pad.pan * 100)}` : `R${Math.round(pad.pan * 100)}`}
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={pad.pan}
          aria-label={`Pad ${padIndex + 1} pan`}
          onChange={(event) =>
            onKitChange((current) =>
              setPadPan(current, padIndex, event.target.valueAsNumber),
            )
          }
        />
      </label>
      <label>
        Pitch {pad.pitchSemitones > 0 ? "+" : ""}
        {pad.pitchSemitones} st
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={pad.pitchSemitones}
          aria-label={`Pad ${padIndex + 1} pitch`}
          onChange={(event) =>
            onKitChange((current) =>
              setPadPitch(current, padIndex, event.target.valueAsNumber),
            )
          }
        />
      </label>
    </section>
  );
}
