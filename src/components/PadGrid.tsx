import {
  PAD_COUNT,
  padVolume,
  sampleForPad,
  setPadVolume,
  type KitState,
} from "../core/kit";
import { keyForPad } from "../core/padKeys";
import { LIBRARY_SAMPLE_MIME } from "./LibrarySection";

/**
 * Display order mirrors the MPC: Pad 1 bottom-left, Pad 16 top-right, so the
 * top display row holds Pad indexes 12-15.
 */
const displayOrder = Array.from(
  { length: PAD_COUNT },
  (_, i) => (3 - Math.floor(i / 4)) * 4 + (i % 4),
);

interface PadGridProps {
  kit: KitState;
  flashes: readonly number[];
  assigning: boolean;
  onPadPressed: (padIndex: number) => void;
  onKitChange: (update: (kit: KitState) => KitState) => void;
  /** A Library Sample (identified by name) was dropped onto the Pad. */
  onLibrarySampleDropped: (padIndex: number, name: string) => void;
}

export function PadGrid({
  kit,
  flashes,
  assigning,
  onPadPressed,
  onKitChange,
  onLibrarySampleDropped,
}: PadGridProps) {
  return (
    <section className={assigning ? "pad-grid assigning" : "pad-grid"}>
      {displayOrder.map((padIndex) => {
        const sample = sampleForPad(kit, padIndex);
        return (
          <div className="pad-slot" key={padIndex}>
            <button
              type="button"
              className="pad"
              data-empty={sample === null}
              onPointerDown={(event) => {
                if (event.button === 0) {
                  onPadPressed(padIndex);
                }
              }}
              onKeyDown={(event) => {
                if (
                  (event.key === "Enter" || event.key === " ") &&
                  !event.repeat
                ) {
                  onPadPressed(padIndex);
                }
              }}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes(LIBRARY_SAMPLE_MIME)) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                }
              }}
              onDrop={(event) => {
                const name = event.dataTransfer.getData(LIBRARY_SAMPLE_MIME);
                if (name !== "") {
                  event.preventDefault();
                  onLibrarySampleDropped(padIndex, name);
                }
              }}
            >
              {(flashes[padIndex] ?? 0) > 0 && (
                <span className="pad-flash" key={flashes[padIndex]} />
              )}
              <span className="pad-corner">
                <span className="pad-number">{padIndex + 1}</span>
                <kbd>{keyForPad(padIndex).toUpperCase()}</kbd>
              </span>
              <span className="pad-name">{sample?.name ?? ""}</span>
            </button>
            <input
              className="pad-volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={padVolume(kit, padIndex)}
              aria-label={`Pad ${padIndex + 1} volume`}
              onChange={(event) =>
                onKitChange((current) =>
                  setPadVolume(current, padIndex, event.target.valueAsNumber),
                )
              }
            />
          </div>
        );
      })}
    </section>
  );
}
