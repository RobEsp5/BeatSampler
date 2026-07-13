# Sample Library is separate from Projects, referenced not copied

BeatSampler Samples live in a single, shared Library folder the user picks once, independent of any individual Project — Projects reference Library samples by path rather than embedding copies. This mirrors how desktop DAWs handle external sample folders, avoids duplicating audio into every new beat, and directly serves the goal of building one growing collection — pulled from files, live capture, turntable, and tab audio — that any Project can draw from. Library and Projects are both plain files/folders (ADR 0003), so this needs no new storage infrastructure, just two separate folder handles instead of one.

**Consequences:** if a file in the Library is renamed, moved, or deleted from outside the app, any Project referencing it ends up with a dangling reference that the app needs to handle gracefully (e.g. a "missing sample" state on the affected Pad) rather than failing silently.
