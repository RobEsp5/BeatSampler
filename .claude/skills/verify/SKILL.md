---
name: verify
description: "Build/launch/drive recipe for verifying BeatSampler changes in a real browser."
---

# Verifying BeatSampler

## Launch

- Dev: `npm run dev` → http://localhost:5173/BeatSampler/ (note the `/BeatSampler/` base path — the bare root 404s)
- Prod: `npm run build` then `npm run preview` → http://localhost:4173/BeatSampler/

## Drive (headless, no extension needed)

The Claude-in-Chrome extension may not be connected; `playwright-core` with
`channel: "chrome"` (system Chrome, no browser download) works headlessly:

```js
import { chromium } from "playwright-core";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"], // lets AudioContext run without a gesture
});
```

Install `playwright-core` in the scratchpad, not the repo.

- File Import: `page.setInputFiles('input[type="file"]', path)` — never click the input (native picker hangs headless).
- Generate a test WAV with a tiny Node script (RIFF header + sine PCM) rather than shipping fixtures.
- Observe playback from outside by monkeypatching `AudioBufferSourceNode.prototype.start` in `page.evaluate` and counting calls; buffer `sampleRate` should equal the context's native rate (ADR 0002), not the file's.
- Pads respond to `pointerdown` (not click): `locator.dispatchEvent("pointerdown")`.
- Collect `page.on("console")` errors + `pageerror` as evidence; expect zero.

## Flows worth driving

- Import WAV → Pad shows name + duration → trigger → buffer source starts.
- Import a non-audio file → `.error` element appears, Pad state unchanged.
- Second import → newest Sample takes the Pad.

## Gotchas

- Audible output can't be asserted headless; the buffer-source-start count is the proxy. A human should occasionally confirm real sound in Chrome.
