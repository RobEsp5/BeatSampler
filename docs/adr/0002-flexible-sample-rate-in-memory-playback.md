# Flexible sample rate + in-memory playback, not fixed 44.1kHz / disk-streaming

BeatSampler treats the MPC Sample manual as a source of feature and workflow ideas, not a technical spec to replicate. Its fixed 44.1kHz engine and disk-streamed playback are workarounds for the hardware's 2GB RAM budget — a constraint that doesn't exist on a desktop/browser. BeatSampler instead uses the Web Audio API's native context sample rate (whatever the OS/browser provides, with the browser's built-in decoder handling conversion on import) and decodes samples fully into memory rather than streaming from disk.

**Consequences:** very long recordings (tens of minutes) would need revisiting if that ever becomes a real use case, since full in-memory decoding doesn't scale indefinitely — not a v1 concern.
