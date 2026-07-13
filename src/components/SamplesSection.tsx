import type { Sample, SampleId } from "../core/kit";

interface SamplesSectionProps {
  samples: readonly Sample[];
  importError: string | null;
  assigningId: SampleId | null;
  onFileChosen: (file: File) => void;
  onToggleAssign: (sampleId: SampleId) => void;
}

export function SamplesSection({
  samples,
  importError,
  assigningId,
  onFileChosen,
  onToggleAssign,
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
            <li key={sample.id}>
              <span className="sample-name">{sample.name}</span>
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
