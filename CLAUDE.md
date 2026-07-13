# BeatSampler

A browser-based, sample-based beat-making app inspired by the Akai MPC Sample — import or capture audio, chop it, map it to pads, jam, and freeze the performance to a new sample. See [CONTEXT.md](CONTEXT.md) for the domain glossary.

## Key docs

- **[CONTEXT.md](CONTEXT.md)** — domain glossary (Sample, Kit, Pad, Chop, Slice, Sequence, Library, Project, Live Capture, File Import). Use these terms; avoid the listed synonyms.
- **[docs/adr/](docs/adr/)** — architectural decisions (web-app-over-Electron, flexible sample rate + in-memory playback, local file-based storage, shared Library referenced-not-copied).
- **[docs/mpc-sample-feature-notes.md](docs/mpc-sample-feature-notes.md)** — feature/workflow reference distilled from the MPC Sample manual. Reference for ideas, **not** a spec to match 1:1.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues on `RobEsp5/BeatSampler`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
