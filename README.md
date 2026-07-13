# BeatSampler

App that helps make sample based music.

**Live app:** https://robesp5.github.io/BeatSampler/ (deployed from `main` via GitHub Actions)

**Controls:** the 16 Pads map to the keyboard MPC-style — bottom row `Z X C V` = Pads 1–4, then `A S D F`, `Q W E R`, and `1 2 3 4` = Pads 13–16 (each Pad shows its key).

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # unit tests (watch mode; `npx vitest run` for one-shot)
npm run typecheck  # TypeScript
npm run build      # production build to dist/
```

The domain core (`src/core/`) is pure and unit-tested; browser APIs (Web Audio, etc.) live behind thin adapters (`src/audio/`) that the core never imports. See [CONTEXT.md](CONTEXT.md) for the domain glossary and [docs/adr/](docs/adr/) for architecture decisions.
