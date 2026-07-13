# Local-only, file-based storage with user-chosen save location

BeatSampler projects save as real files at a location the user picks, via the File System Access API, rather than living inside opaque browser-internal storage (IndexedDB/OPFS) with no user visibility. This trades a slightly more involved implementation (Chromium-only API, permission re-grants across sessions) for full transparency and portability — the user can see, back up, and manually move project files (e.g. via Dropbox or a USB drive) between the PC and the MacBook without BeatSampler needing to build any sync feature itself. No backend, accounts, or sync infrastructure for v1.

**Consequences:** the File System Access API is Chromium-only, consistent with the existing browser-target decision (ADR 0001) — Safari/Firefox users would need a fallback (e.g. plain download/upload) if those browsers are ever supported.
