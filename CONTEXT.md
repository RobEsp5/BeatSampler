# BeatSampler

A browser-based, sample-based beat-making app inspired by the Akai MPC Sample — import, capture, chop, and sequence audio samples into beats.

## Language

**Sample**:
A discrete audio asset in BeatSampler, created via File Import or Live Capture and assignable to a Pad.

**Source**:
Where a Sample's audio originates when it's created — either a File Import or a Live Capture.
_Avoid_: Input (too generic)

**File Import**:
Creating a Sample from an existing audio file already on disk (drag-and-drop or file picker).
_Avoid_: Upload, Load

**Live Capture**:
Creating a Sample by recording a real-time audio stream, from one of four Source flavors: Microphone, Line-In (an external device such as a turntable/mixer, reaching the computer via a USB audio interface), Tab/System Audio (whatever is currently playing on the machine, captured via the browser's own share-audio picker — e.g. a YouTube tab), or Resample (BeatSampler's own audio output, captured back in as a new Sample — e.g. freezing a live Pad performance). All four share one recording pipeline and differ only in which stream the browser hands to it.
_Avoid_: Recording (ambiguous with sequence recording), Sampling
_Note_: Resample here means capturing live output as a new Sample. A future, distinct concept — bouncing an entire recorded Sequence to a new Sample in one step — uses the same name in the MPC manual; keep these conceptually separate if/when Sequences exist.

**Kit**:
A saved set of Pad/Sample assignments and their parameters.
_Avoid_: Program, Preset

**Pad**:
A triggerable slot holding one Sample and its playback parameters (volume, pitch, envelope, etc.), played via mouse, keyboard, or a MIDI controller such as the MPK Mini.
_Avoid_: Cell

**Chop**:
The act of slicing a Sample into pieces — by threshold, even regions, or manual placement — so each piece can be assigned to its own Pad.

**Slice**:
One piece of a Chopped Sample; can be extracted into its own standalone Sample.

**Sequence**:
A pattern of Pad-trigger events (and automation) over a set length of time — the building block a Kit gets played into.
_Avoid_: Pattern
_Note_: not to be confused with Loop, a per-Sample playback mode.

**Library**:
A single, shared collection of Samples stored in a user-chosen folder on disk, independent of any one Project. Projects reference Samples in the Library rather than copying them in.

**Project**:
A saved BeatSampler workspace — its Kits and Sequences — stored as files at a user-chosen location. References Samples from the Library rather than embedding copies of them.
