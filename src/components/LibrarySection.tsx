import { useState } from "react";
import { searchLibrary, type LibraryEntry } from "../core/library";

/** dataTransfer type used to drag a Library Sample onto a Pad. */
export const LIBRARY_SAMPLE_MIME = "application/x-beatsampler-library-sample";

/** What the App knows about the Library folder right now. */
export type LibraryState =
  | { status: "none" }
  | { status: "needs-permission"; folderName: string }
  | { status: "open"; folderName: string; entries: readonly LibraryEntry[] };

interface LibrarySectionProps {
  library: LibraryState;
  /** Pick (or change) the Library folder — user gesture required. */
  onPickFolder: () => void;
  /** Re-grant access to the remembered folder — user gesture required. */
  onReopen: () => void;
  /** Play the Sample without assigning it to any Pad. */
  onPreview: (name: string) => void;
}

export function LibrarySection({
  library,
  onPickFolder,
  onReopen,
  onPreview,
}: LibrarySectionProps) {
  const [query, setQuery] = useState("");

  return (
    <section className="library">
      <header className="library-header">
        <h2>Library</h2>
        {library.status === "open" && (
          <span className="library-folder" title="Library folder">
            {library.folderName}
          </span>
        )}
        <button type="button" className="library-pick" onClick={onPickFolder}>
          {library.status === "open"
            ? "Change Library folder"
            : "Pick Library folder"}
        </button>
      </header>
      {library.status === "needs-permission" && (
        <button type="button" className="library-reopen" onClick={onReopen}>
          Re-open Library “{library.folderName}”
        </button>
      )}
      {library.status === "none" && (
        <p className="hint">
          Pick a folder to keep your Samples in — it stays your Library across
          sessions and Projects.
        </p>
      )}
      {library.status === "open" && (
        <>
          <input
            className="library-search"
            type="search"
            placeholder="Search Samples by name"
            aria-label="Search Library"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <LibraryList
            entries={searchLibrary(library.entries, query)}
            emptyBecauseOfQuery={library.entries.length > 0}
            onPreview={onPreview}
          />
        </>
      )}
    </section>
  );
}

function LibraryList({
  entries,
  emptyBecauseOfQuery,
  onPreview,
}: {
  entries: readonly LibraryEntry[];
  emptyBecauseOfQuery: boolean;
  onPreview: (name: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="hint">
        {emptyBecauseOfQuery
          ? "No Samples match the search."
          : "No Samples in this folder yet — import one below."}
      </p>
    );
  }
  return (
    <ul className="sample-list library-list">
      {entries.map((entry) => (
        <li
          key={entry.name}
          className="library-row"
          draggable
          title="Click to preview; drag onto a Pad to assign"
          onClick={() => onPreview(entry.name)}
          onDragStart={(event) => {
            event.dataTransfer.setData(LIBRARY_SAMPLE_MIME, entry.name);
            event.dataTransfer.effectAllowed = "copy";
          }}
        >
          <span className="sample-name">{entry.name}</span>
          <span className="library-source">{entry.source}</span>
          <span className="sample-duration">
            {entry.durationSeconds.toFixed(2)}s
          </span>
        </li>
      ))}
    </ul>
  );
}
