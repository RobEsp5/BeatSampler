import type { Sample, SampleId } from "../core/kit";

interface SamplesSectionProps {
  samples: readonly Sample[];
  importError: string | null;
  assigningId: SampleId | null;
  selectedId: SampleId | null;
  onFileChosen: (file: File) => void;
  onToggleAssign: (sampleId: SampleId) => void;
  onSelect: (sampleId: SampleId) => void;
}

export function SamplesSection({
  samples,
  importError,
  assigningId,
  selectedId,
  onFileChosen,
  onToggleAssign,
  onSelect,
}: SamplesSectionProps) {
  return (
    <section className="samples">
      <label className="import">
        Import a Sample
        <input
          type="file"
          accept="audio/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file !== undefined) {
              onFileChosen(file);
            }
            event.target.value = "";
          }}
        />
      </label>
      {importError !== null && <p className="error">{importError}</p>}
      {samples.length > 0 && (
        <ul className="sample-list">
          {samples.map((sample) => (
            <li
              key={sample.id}
              className={selectedId === sample.id ? "selected" : undefined}
            >
              <button
                type="button"
                className="sample-name select-sample"
                title="Edit this Sample"
                onClick={() => onSelect(sample.id)}
              >
                {sample.name}
              </button>
              <span className="sample-duration">
                {sample.durationSeconds.toFixed(2)}s
              </span>
              <button
                type="button"
                className={
                  assigningId === sample.id ? "assign assigning" : "assign"
                }
                onClick={() => onToggleAssign(sample.id)}
              >
                {assigningId === sample.id ? "Pick a Pad…" : "Assign"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {assigningId !== null && (
        <p className="hint">Click a Pad to place the Sample.</p>
      )}
    </section>
  );
}
