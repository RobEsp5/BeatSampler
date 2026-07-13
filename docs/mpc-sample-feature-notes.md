# Akai MPC Sample — Feature & Workflow Reference

*Research notes for the BeatSampler team, compiled from the official Akai MPC Sample User Guide.*

- **Primary source:** [MPC Sample User Guide](https://www.akaipro.com/guides/mpc-sample/introduction.htm) — Manual Version 1.3.0, RevA (footer copyright 2026, inMusic Brands, Inc.)
- **Coverage:** All 28 content pages of the guide were crawled (full list in the [Appendix](#appendix-manual-pages-crawled)).
- **Compiled:** 2026-07-12
- **Hardware referenced:** Akai MPC Sample, Model AC50

## Purpose of this document

This is a feature inventory of the Akai MPC Sample hardware sampler, compiled as build-reference research for **BeatSampler**, a software (web/desktop) sample-based beat maker *inspired by* the MPC Sample — not a clone or 1:1 emulation of it. The goal is to document the MPC Sample's workflows, terminology, and technical behavior closely enough that the team can make deliberate decisions: what to adopt outright (e.g. chop-to-pad sampling, the sequence/song hierarchy, quantize+swing as separate live/committed states), what to adapt for a mouse/keyboard/touch/MIDI-controller environment (e.g. physical velocity pads, absolute knobs with "soft takeover"), and what to skip entirely because it's inherent to standalone battery-powered hardware (e.g. internal microphone/speaker, CV/Gate sync, battery life). Wherever a feature is clearly hardware-specific it's flagged inline; everything else should be assumed portable to software unless noted. A dedicated roundup is at the end in [Notable Hardware-Only Features](#9-notable-hardware-only-features-adapt--skip--reinterpret).

Every section cites the specific manual page(s) it draws from via a *Source* line. A small number of secondary-source or inference notes are explicitly labeled as such — everything else is sourced directly from the manual.

## Contents

1. [Device Overview & Control Surface](#1-device-overview--control-surface)
2. [Sampling, Chopping & Sample Editing](#2-sampling-chopping--sample-editing)
3. [Pads & Programs (Kits)](#3-pads--programs-kits)
4. [Sequencer](#4-sequencer)
5. [Mixer & Effects](#5-mixer--effects)
6. [Project & File Management](#6-project--file-management)
7. [MIDI & Hardware I/O](#7-midi--hardware-io)
8. [Standalone / Portable Operation](#8-standalone--portable-operation)
9. [Notable Hardware-Only Features (adapt / skip / reinterpret)](#9-notable-hardware-only-features-adapt--skip--reinterpret)
- [Appendix: Manual pages crawled](#appendix-manual-pages-crawled)

---

## 1. Device Overview & Control Surface

MPC Sample is described as "a portable sampler, sequencer, and effects processor" inspired by the classic MPC60, designed for hands-on beatmaking without a computer or DAW. It ships with over 100 kits, pad and knob effects, and "intuitive chopping capabilities." Box contents: the unit itself, a USB-C cable, a Quickstart Guide, and a Safety & Warranty Manual — everything else (speakers, mixer, MIDI gear) is sold separately.

*Source: [Introduction](https://www.akaipro.com/guides/mpc-sample/introduction.htm)*

### 1.1 Control inventory

| Control | Description |
|---|---|
| Display | 2.4" (6.1 cm) full-color LCD with "high-resolution waveform editing" |
| Pads | 16 RGB-lit, velocity-sensitive pads with poly-aftertouch, organized into 8 banks (A–H) |
| Knobs | Three 270° knobs (**K1–K3**), context-sensitive per mode/page |
| Encoder | One 360° push-encoder for menu navigation and value entry |
| Nav buttons | **-/+** to decrement/increment a value or move through a list |
| Function buttons | **B1, B2, B3** — cycle display pages or trigger page-specific actions (by convention B1 is often "Cancel/Back" and B3 is often "Do It!"/confirm) |
| Fader | One 30 mm touch fader, assignable to pad/kit parameters |
| Modifier | **SHIFT** — held to access a secondary function printed beneath each control |
| Transport | **PLAY** (+ SHIFT for Continue-from-playhead), **STOP** (double-press = stop all audio) |
| Buttons (electrical) | 11 bi-color LED buttons, 8 single-color LED buttons, 4 unlit buttons |

*Source: [Features](https://www.akaipro.com/guides/mpc-sample/features.htm), [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm)*

### 1.2 Mode buttons

| Button | Primary function | SHIFT (secondary) function |
|---|---|---|
| **SAMPLE** | Sample Mode — trigger/edit samples | **INPUT CONFIG** — audio input source setup |
| **SEQ** | Sequence Mode — record/edit sequences | **STEP EDIT** — per-event step editing |
| **PAD FX** | Trigger effects on the whole sequence via pads | **FLEX BEAT** — time-based pitch/time/volume warp effects |
| **KNOB FX** | Control one effect via K1–K3, applied per pad | **FX SELECT** — choose the active Knob FX and its target pads |

*Source: [Features](https://www.akaipro.com/guides/mpc-sample/features.htm)*

### 1.3 Global SHIFT+Pad shortcuts

The 16 pads double as a shortcut layer to every major menu/toggle when held with SHIFT — effectively a modifier-key command palette mapped onto the pad grid:

| Pad | Shortcut | Function |
|---|---|---|
| 1 | Full Level | All pads play at full velocity regardless of hit strength |
| 2 | Half Seq | Halves the current sequence length |
| 3 | Double Seq | Doubles the current sequence length, duplicating events |
| 4 | Count-In | Toggles a 1-bar recording count-in |
| 5 | Compressor | Opens the Compressor effect menu |
| 6 | Half Speed | Current sequence's events play at half speed |
| 7 | Double Speed | Current sequence's events play at double speed |
| 8 | MIDI Config | Opens MIDI/CV configuration and factory reset menu |
| 9 | Fader | Opens the Fader-assignment menu |
| 10 | Rec Quantize | Toggles record-quantize on/off |
| 11 | Resample | Bounces (renders) the current sequence's audio to a new sample on a chosen pad |
| 12 | Song | Opens Song Mode |
| 13 | Trim Sample | Destructively trims the sample to its Start/End points |
| 14 | Time Correct | Opens the quantize/shift/swing menu |
| 15 | Warp | Toggles Warp mode between Time Stretch and Pitch |
| 16 | Project | Opens the Project menu (load/save/new/SD access) |

**LED feedback language** (worth emulating as a visual-state system in software): a button/pad is **brightly lit** when its function is active, **dimly lit** when available but inactive, and **off** when unavailable in the current mode. Under SHIFT, buttons with a secondary function glow dim red (inactive) or bright red (active).

*Source: [Features](https://www.akaipro.com/guides/mpc-sample/features.htm), [Editing Sequences](https://www.akaipro.com/guides/mpc-sample/editing_sequences.htm)*

---

## 2. Sampling, Chopping & Sample Editing

### 2.1 Recording samples (Sample Record Mode)

Opened with the **SAMPLE RECORD** button. Key parameters (also mirrored in the Input Configuration menu, §2.2):

- **Source (K1):** Mic (built-in mic) · Rear (stereo, both rear TRS inputs) · Rear L · Rear R · Resample (re-records MPC Sample's own output — see note below) · USB (stereo) · USB L · USB R.
- **Monitor (B1 cycles):** Off (never monitored) · Auto (monitored only while Sample Record Mode is in focus) · On (always monitored).
- **Rec Length (K2):** Free (unlimited) or Seq (locked to the current sequence length; if playback is active, recording begins at the end of the current loop — a "record into the pocket" workflow).
- **Threshold (K3):** **-96 to 0 dB.** Minimum input level required to auto-trigger recording; a waveform icon lights when input crosses it.
- **Rec Input Effects:** whether Knob FX active during recording get printed into the captured audio (On) or excluded (Off).

**Workflow:** tap a pad to arm+start recording from the selected source; you can tap *additional* pads mid-take to start new samples without stopping (chopping while recording); stop via the same pad, **STOP**, or **SAMPLE RECORD**.

**Recall (safety net):** SHIFT+**SAMPLE RECORD** retrieves the last **25 seconds** of audio from the currently selected source into the next available pad — i.e. the input source is always being captured into a rolling buffer, so a missed "record" press isn't fatal. (The Technical Specifications page separately describes "Recall Recording" as "30 seconds of audio or pad performance to sequence," bundling this with the Sequence Recall feature in §4.2 — the two dedicated feature pages are more precise and specific about the 25-second sample buffer; this is a minor inconsistency within the manual itself worth noting.)

*Source: [Sample Record Mode](https://www.akaipro.com/guides/mpc-sample/sample_record_mode.htm), [Features](https://www.akaipro.com/guides/mpc-sample/features.htm), [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm)*

### 2.2 Input Configuration menu

Opened with SHIFT+**SAMPLE**. Same Source/Monitor/Threshold/Rec Length parameters as §2.1 (they're two views onto the same state), plus **Rec Input Effects** (On/Off), which is *only* configurable here. Closed via **B3**.

*Source: [Input Configuration](https://www.akaipro.com/guides/mpc-sample/input_configuration.htm)*

### 2.3 Loading and saving samples

- **Browse:** **SAMPLE SELECT** opens the Sample Browser. Encoder/±  navigates categories and (after opening a folder) samples; **B3** toggles auto-preview (plays the highlighted sample); **B1** goes back; **B2** switches between the Internal drive and an External microSD card. User samples default to an auto-created `MPC-Sample/Samples` directory, but any directory on the card is browsable.
- **Save:** SHIFT+**SAMPLE SELECT** opens a name-entry screen using the classic hardware-sampler "scroll-to-spell" pattern: encoder scrolls through characters and confirms one at a time, SHIFT for capitals, ± moves the cursor, **B2**/SHIFT+**B2** erase one/all characters, **B3** ("Do It!") saves, **B1** ("Cancel") exits. (This name-entry pattern recurs identically for saving projects and songs — see §4.6, §6.2 — and is a good candidate to build once as a shared component, or simply replace with a normal text field in software.)

*Source: [Loading and Saving Samples](https://www.akaipro.com/guides/mpc-sample/loading_and_saving_samples.htm)*

### 2.4 File formats & audio engine specs

> **Import formats:** `.wav` `.mp3` `.aif`/`.aiff` `.snd` `.s1s` `.s3s` `.flac` `.ogg`
> **Internal processing:** 44.1 kHz, 32-bit float
> **Import support:** 16- or 24-bit files at 44.1, 48, or 96 kHz (implies internal sample-rate conversion down to the fixed 44.1 kHz engine rate)
> **Recording (sampling):** fixed at 24-bit, 44.1 kHz
> **Polyphony:** 32 stereo voices, with "fast onboard disk streaming (up to 32 voices)" — i.e. samples are streamed rather than fully preloaded into RAM (2 GB RAM alongside an 8 GB internal drive)
> **Max sample length:** 20 minutes per sample

This is arguably the most load-bearing paragraph in this document for an audio-engine design decision: MPC Sample runs a **fixed internal sample rate** (44.1 kHz) with import-time conversion, rather than a session/project sample rate that varies — worth deciding explicitly whether BeatSampler does the same or supports multiple project sample rates. The disk-streaming architecture (vs. fully in-memory sample playback) is also a deliberate tradeoff for a device with limited RAM that BeatSampler, running on a modern desktop/browser, likely doesn't need to replicate.

*Source: [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm)*

### 2.5 Sample editing parameters (Sample Mode)

Sample Mode (**SAMPLE** button) is described as the device's "main" mode. Tap a pad to trigger it and view its waveform; hold **SAMPLE** and tap a pad to view without triggering. Parameters are organized into four banks cycled via **B1/B2/B3**, each controlling K1–K3 (plus SHIFT-layered extras):

**B1 — Trim / Mix / Amp Env** *(Trim is replaced by Chop controls when Chop Mode is active — see §2.6)*
- **Trim:** K1 Start (0–100%), K2 End (0–100%), K3 Loop point (0–100%); SHIFT+K1/K2/K3 zoom the waveform at each respective point.
- **Mix:** K1 Volume (-INF, -74.00 to +6.00 dB), SHIFT+K2 Kit Volume (same range, applies to the whole kit), K3 Pan (50L–C–50R).
- **Amp Env** (amplitude envelope): K1 Attack (0–127, fade-in speed), K2 Decay *(One Shot playback)* or Release *(Note On playback)* (0–127), SHIFT+K2 Decay From (Start or End — see §2.7), K3 Vel Sens (0–127; at 127 pad velocity fully controls level, at 0 every hit is full-level regardless of force).

**B2 — Tune / Play**
- **Tune:** K1 Semi Tune (-24 to +24 semitones), K2 Fine Tune (-90 to +90 cents), K3 Warp (Off, 50–200%, Seq), SHIFT+K3 # Beats (declares the sample's length in beats, used to compute the Warp ratio against the sequence tempo). Warp *mode* itself (Time Stretch vs. Pitch) is a separate toggle — SHIFT+**PAD 15**:
  - **Time Stretch:** changes length/tempo while preserving pitch (a phase-vocoder/elastic-audio style algorithm). At 50% the sample is twice as fast/half as long; at 200% twice as slow/long; "Seq" locks the sample's tempo to the sequence tempo.
  - **Pitch:** changes length, tempo, *and* pitch together (simple varispeed/resampling-style algorithm) — and when this mode is active, Semi Tune/Fine Tune become unavailable, since pitch is now a function of the Warp amount.
- **Play:** K1 Polyphony (Mono — retriggers/cuts off previous playback — or Poly — overlaps full-length playback), K2 Mute Group (Off, 1–16; last-played pad in a group silences others in the group, e.g. open/closed hi-hat), SHIFT+K2 Pad Link (Off, 1–16; links a second pad *in the same bank* to trigger simultaneously), K3 Offset (0–100%, delays the sample start after the pad is hit).

**B3 — Filter / Filt Env**
- **Filter:** K1 Cutoff (0–127), K2 Reso (0–127), K3 Type — **Off, Classic** (modeled on the MPC3000's filter), **LPF2/LPF4, HPF2/HPF4, BPF2/BPF4** (2 vs. 4 = poles/steepness of low-pass, high-pass, band-pass).
- **Filt Env** (filter envelope, modulates Cutoff): K1 Attack (0–127), K2 Decay/Release (0–127, same One Shot/Note On split as Amp Env), SHIFT+K2 Decay From, K3 Depth (0–127, how far the envelope swings the cutoff).

**Shared/global (SHIFT layer):** SHIFT+**B1** Loop Lock toggle, SHIFT+**B2** Normalize (scales the sample so its peak between Start/End hits 0 dB).

> **Architecture note:** this per-voice synthesis filter (Cutoff/Reso/Type/Filt Env) is a *separate* signal-chain element from the HP/LP/BP **insert effects** available in Pad FX and Knob FX (§5.3–5.4) — the manual documents them as independent filter implementations serving different roles (always-on voice shaping vs. optional insert effect). Worth replicating as two distinct filter stages in the audio engine rather than one shared filter object.

*Source: [Sample Mode](https://www.akaipro.com/guides/mpc-sample/sample_mode.htm)*

### 2.6 Chop Mode

Activated with the **CHOP** button (Sample Mode only); replaces the Trim controls contextually. The sample (between its Start/End points) is automatically sliced by the current **Chop Type**, and slices map onto pads — e.g. an 8-slice chop puts Slice 5 on Pad 5. This is the classic "chop a break to pads" MPC workflow.

- **K3 — Chop Type:**
  - **Threshold** — slices are placed automatically wherever the signal crosses the Threshold value (SHIFT+K3, 0–100%; higher threshold → fewer slices). This is the *default* chop type.
  - **Regions 4/8/16** — evenly divides the sample into exactly 4, 8, or 16 equal slices.
  - **Manual** — tap Pad 1 to start playback and place the first slice boundary, then tap pads during playback to drop further boundaries; up to **16 slices** per sample.
- **K1 Start / K2 End** — adjust the selected slice's boundaries (0–100% of slice length), with SHIFT+K1/K2 zoom.
- **Slice editing:** SHIFT+**B1** Extract (non-destructively exports the selected slice as a brand-new sample on the next free pad — original stays intact), SHIFT+**B2** Split (cuts the slice in half, renumbering subsequent slices), SHIFT+**B3** Merge (combines with the previous slice, renumbering down), **ERASE**+pad (removes a slice, merging it into the previous one).
- Editing any slice automatically flips Chop Type to **Manual**, and slice edits are **not** covered by Undo/Redo.
- Exit Chop Mode by pressing **CHOP** again.

The Technical Specifications page's marketing bullet list additionally mentions "lazy-chopping" and "auto-snapping" under Advanced Sample Editing without further elaboration elsewhere in the guide — these most likely just describe the Threshold-based auto-chop behavior above, but the manual doesn't define them as separate mechanisms, so treat this as an unconfirmed inference rather than a distinct feature.

*Source: [Pad Play](https://www.akaipro.com/guides/mpc-sample/pad_play.htm), [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm) (marketing-bullet terms only)*

### 2.7 Playback behavior modifiers

These live in the **Pad Play** control row (Sample Mode only, except Mute which works globally):

- **Note On** (SHIFT+**CHOP**): sample plays only while the pad is held (like a synth's "gate" mode) instead of the default **One Shot** behavior (plays in full once triggered). Switches the Amp/Filter envelopes from Decay to Release parameters. Shown by a note icon.
- **Loop** (**LOOP** button): loops playback between **Loop Start** and **Sample End**. **Loop Lock** (default **on**) ties Loop Start to Sample Start; disengage via SHIFT+**B1** in Sample Mode to set them independently. Interacts with the Amp Envelope's Decay-From setting: if Decay From = End (default), the loop plays indefinitely until toggled off; if Decay From = Start, it plays until manually stopped *or* until the Decay stage completes and mutes it. Shown by a loop icon.
- **Reverse** (SHIFT+**LOOP**): plays backward from Sample End to Sample Start (or Loop Start, if looping). Shown by an arrow icon.
- **Mute** (**MUTE** button, available in *any* mode): pads become mute/unmute toggles instead of triggers — muted pads glow red, unmuted yellow. Muting silences a pad without deleting its recorded sequence events, which is explicitly framed as a live-arrangement/performance tool. **Unmute All** via SHIFT+**MUTE**.
- **16 Levels** (**16 LEVELS** button): copies the current pad's sample across all 16 pads of the bank, with one parameter ramping across them (**Type**, via SHIFT+**16 LEVELS**):
  - **Velocity** — increasing velocity pad-to-pad.
  - **Filter** — cutoff ramps: pads 1–8 go from minimum up to the current Cutoff value, pads 9–16 go from the current value up to maximum.
  - **Tune** — pitch ramps around Pad 4 (= original/unshifted pitch), lower pads pitch down, higher pads pitch up.
- **Trim Sample** (SHIFT+**PAD 13**): destructively discards audio outside the current Start/End points (permanent, unlike the non-destructive Start/End trim parameters themselves).

*Source: [Pad Play](https://www.akaipro.com/guides/mpc-sample/pad_play.htm)*

### 2.8 Resampling — two distinct meanings

The manual uses "Resample" for two different features, worth keeping conceptually separate in BeatSampler's design:

1. **Resample as an input Source** (§2.1) — manually record the unit's own audio output back into a new sample via Sample Record Mode (e.g. to freeze a sequence with live knob tweaks onto one pad).
2. **Resample as a one-tap sequence bounce** — the SHIFT+**PAD 11** shortcut (§4.3) instantly renders the *entire current sequence's* audio to a new sample on a chosen pad, no manual arm/record/stop needed.

*Source: [Sample Record Mode](https://www.akaipro.com/guides/mpc-sample/sample_record_mode.htm), [Editing Sequences](https://www.akaipro.com/guides/mpc-sample/editing_sequences.htm)*

---

## 3. Pads & Programs (Kits)

**Terminology note:** the MPC Sample manual does not use the classic MPC term "Program." The closest analogous concept is a **Kit** — a saved set of 16×8 pad/sample assignments and their parameters, loadable from the Project menu either *with* four default sequences or as samples-only (§6.1). Worth deciding early whether BeatSampler adopts "Kit," reintroduces "Program," or picks its own term — this is exactly the kind of naming decision worth pinning down in a shared domain-model doc.

- **16 velocity-sensitive, poly-aftertouch, RGB-backlit pads**, organized into **8 banks (A–H)** via the **PAD BANK** button (tap to cycle; hold + tap Pad 1–8 to jump directly to a bank; SHIFT+**PAD BANK** goes to the previous bank). The active bank is shown on the top panel next to Main Volume. This gives **128 addressable pad/sample slots per project** (16 samples × 8 banks), matching the Technical Specifications' "16 samples x 8 banks, per project... 16 sequences x 8 banks, per project... No project limit." *(The manual's description of PAD BANK doesn't explicitly say whether Sample Mode and Sequence Mode track independent bank pointers or share one global pointer — read together with the single on-screen bank indicator, it reads as one shared global pointer, but this isn't stated outright.)*
- **Aftertouch** is explicitly tied to at least one modulation destination in the crawled pages: Pad FX intensity is pressure-sensitive ("the more pressure you apply to the pad, the more the effect is applied," §5.3). No other aftertouch-modulation routing is documented in the pages crawled.
- **Per-pad performance parameters** (see §2.5 for full detail): Polyphony (Mono/Poly), Mute Group (Off, 1–16), Pad Link (Off, 1–16, same-bank only), Offset (0–100%), Velocity Sensitivity (0–127).
- **Mute Groups** are the documented mechanism for realistic choke behavior (open/closed hi-hat being the manual's own example) — a good reference for implementing "choke groups" in software.
- **Pad Link** lets two pads in the same bank fire together (e.g. a melodic layer stacked on a drum break) — notably *does not* carry across banks.

*Source: [Features](https://www.akaipro.com/guides/mpc-sample/features.htm), [Sample Mode](https://www.akaipro.com/guides/mpc-sample/sample_mode.htm), [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm), [Project](https://www.akaipro.com/guides/mpc-sample/project.htm)*

---

## 4. Sequencer

### 4.1 Sequence fundamentals

A **sequence** is "a pattern of notes over a set length of time" — the building block of songs. The manual's own framing: use separate sequences for song sections (verse/chorus), or several interchangeable variations of the same section. Opened with the **SEQ** button.

- **Length:** 1, 2, 4, 8, 16, 32, 64, or 128 bars via **K1**; SHIFT+**K1** allows *any* value from 1–128 bars.
- **Q (Quantize) value (K2):** the grid resolution that bar subdivides into and that recorded notes snap to (e.g. Q=1/16 snaps to sixteenth notes). **Global** — shared across Sequence Mode, Step Edit, Time Correct, and Note Repeat.
- **RT Swing (K3):** described as a "live" parameter — it does **not** alter the actual stored position of note events, only applies a real-time percentage shift relative to the Q grid at playback, as "a performative tool to adjust your beat's rhythms on the fly." **This is the same underlying global Swing value surfaced in the Time Correct menu** (§4.5) — Sequence Mode lets you *feel* it live without committing it, while Time Correct's "Do It!" *writes* it permanently into selected recorded events. This live/committed duality is a genuinely distinctive workflow detail worth reproducing deliberately.
- **Tempo:** hold **B1** to open the BPM window and dial via encoder, or use **TAP TEMPO**. **B2** toggles each sequence between **SEQ** (independent per-sequence BPM) and **GBL** (all sequences share one global BPM).
- **Record Quantization (B3):** on/off toggle — when on, notes recorded live snap to the current Q grid as they're played (as distinct from Time Correct, which quantizes *after* the fact).
- **Time signature:** SHIFT+**K2** — a single **project-wide** setting; all sequences share it.
- **Metronome:** SHIFT+**K3** sets click volume; SHIFT+**TAP TEMPO** cycles Off / On (always audible during playback+recording) / Record (audible only while recording).
- **Count-In:** SHIFT+**PAD 4** toggles a one-bar pre-roll at the current tempo/time-signature before recording starts.
- **Sample/Seq combo mode:** holding **SEQ** and pressing **SAMPLE** (or vice versa) keeps the Sequence Mode display up while pads stay in sample-triggering mode — lets you watch sequence data while performing samples. Both buttons flash to indicate this combined state.

**Selecting/triggering sequences:** pads with recorded content glow light green; empty ones are dim. Pressing a pad selects/queues it (flashes bright green if nothing is playing yet). **PLAY** launches the queued sequence. While something is playing, pressing another pad **queues** it to start the instant the current one finishes (its pad flashes until the handoff) — classic live pattern-chaining performance behavior, not immediate cut.

*Source: [Sequence Mode](https://www.akaipro.com/guides/mpc-sample/sequence_mode.htm)*

### 4.2 Recording sequences

**Workflow:** select an empty (dim) pad/sequence slot → adjust BPM/Length/Record-Quantize as desired → press **SEQ RECORD** (flashes = armed) → press **PLAY** to start recording, tapping pads to add events → on reaching the end of the sequence, MPC Sample **automatically drops into overdub** and keeps layering further takes → stop with **SEQ RECORD** (keeps playing) or **STOP** (halts everything).

- **Undo:** SHIFT+**-/UNDO** undoes all events recorded *since recording began* (a session-scoped undo, not a single-event undo).
- **Erase while armed:** hold **ERASE** + tap a pad to wipe that pad's events.
- **Recall / "Sequence Recall" (MIDI Retrospective Record):** SHIFT+**SEQ RECORD** retrieves whatever was played during the *last loop* of playback, even if you weren't recording — another rolling-buffer safety net, conceptually identical to Sample Recall (§2.1). The Technical Specifications page's marketing name for this is "Sequence Recall (MIDI Retrospective Record)."
- **Parameter automation recording:** select a pad, arm+start recording, then move **K1–K3** or the **FADER** — this records live knob/fader moves as automation directly into the sequence timeline. Automatable parameters: Volume, Tuning, Pan, Amp Envelope, Filter Envelope (**except** Decay From), Velocity Sensitivity, and Offset. To erase automation: select the pad, hold **ERASE**, and move the specific knob/fader that has recorded data; confirm via **B3** or cancel via **B1**.

*Source: [Recording Sequences](https://www.akaipro.com/guides/mpc-sample/recording_sequences.htm)*

### 4.3 Editing sequences (SHIFT+Pad shortcuts)

| Pad | Action | Effect |
|---|---|---|
| 2 | Half Seq | Halves sequence length (a 4-bar sequence → 2-bar) |
| 3 | Double Seq | Doubles sequence length, duplicating all events (4-bar → 8-bar) |
| 6 | Half Speed | All events play at half speed / take twice the space (1/8 notes → 1/4 notes) |
| 7 | Double Speed | All events play at double speed / take half the space (1/8 notes → 1/16 notes) |
| 10 | Rec Quantize | Toggles record-quantize |
| 11 | Resample | Bounces the sequence to a new sample on a chosen pad |
| 12 | Song | Opens Song Mode |
| 14 | Time Correct | Opens the quantize/shift/swing menu |

*Source: [Editing Sequences](https://www.akaipro.com/guides/mpc-sample/editing_sequences.htm)*

### 4.4 Step Edit

Opened with SHIFT+**SEQ**. Granular, per-event editing distinct from live recording:

- **ENCODER** — moves between sequence *steps* at the current Q resolution.
- **-/+** or tapping a pad — move between/select individual *events* on the current step (a step can hold multiple simultaneous events across pads).
- **FADER** — nudges the selected event's timing forward (up) or backward (down) from its current position.
- **K1** sequence length, **K2** Q value (also sets ENCODER's step size), SHIFT+**K2** time signature.
- **K3** — velocity of the selected event.
- SHIFT+**B1** — adjust tempo via encoder (press encoder to toggle whole-number vs. decimal BPM entry).
- **B3** — erase the selected event; **ERASE**+pad erases *all* events for that pad (with B1 Cancel / B3 "Do It!" confirmation).

*Source: [Step Edit](https://www.akaipro.com/guides/mpc-sample/step_edit.htm)*

### 4.5 Time Correct (quantize engine)

Opened with SHIFT+**PAD 14**. This is the "commit" counterpart to the live Q/Swing parameters in Sequence Mode:

- Select target pad(s) individually, or **B2** to select all.
- **K1 — Q:** same global time-division grid as Sequence Mode.
- **K2 — Shift:** nudges *all selected events* forward/backward by a small amount for a "humanized" feel. This parameter is **not** exposed anywhere else (unlike Q/Swing) — it's a one-shot, apply-once operation, not a persistent live parameter.
- **K3 — Swing:** the same global Swing/shuffle value as Sequence Mode's "RT Swing" (§4.1) — shifts alternating grid subdivisions toward a triplet feel.
- **B3 "Do It!"** writes/bakes the Q+Shift+Swing settings into the selected events' actual stored positions (undoable via SHIFT+**-/UNDO**). **B1 "Cancel"** exits without applying.
- Explicitly documented: Q and Swing are **global** state — changing either here also changes it in Sequence Mode, and the current Swing value also affects how **Note Repeat** behaves.

> **Quantization model summary for reimplementation:** there are effectively three timing concepts, not one — (1) a **global live Q+Swing** pair that's always influencing *playback* in real time and can be toggled per-recording via Record Quantize, (2) a one-time **Shift** nudge, and (3) an explicit **commit** action (Time Correct's "Do It!") that bakes the live grid/swing into stored note data for chosen pads. This is meaningfully different from a simple "quantize on record" or "quantize selection" model and is worth designing for deliberately.

*Source: [Time Correct](https://www.akaipro.com/guides/mpc-sample/time_correct.htm)*

### 4.6 Song Mode

Opened with SHIFT+**PAD 12**. Chains sequences into an ordered list ("song") for linear playback or export.

- Pads select a sequence (filled = bright, empty = dim); **B3** inserts the highlighted sequence at the current position in the song (after whatever's already there); **B2** removes the highlighted song entry.
- Browse the inserted list via **ENCODER**/±.
- **PLAY** plays the song from the top; SHIFT+**PLAY/CONTINUE** starts from whichever song-entry is highlighted.
- **Export (B1 opens the export menu):**
  - **B2 — Audio mixdown:** renders the song to an audio file, using the same scroll-to-spell name-entry UI as sample/project saving (§2.3); **B3** "Do It!" starts the export, **B1** "Cancel" exits. *(The manual doesn't specify the exported file's format/sample-rate/bit-depth in the pages crawled — worth flagging as an open question rather than assuming WAV.)*
  - **B3 — New sequence:** renders the song into a new sequence, auto-placed in the next open sequence slot. If the result exceeds 128 bars, its length can no longer be edited afterward.

*Source: [Song Mode](https://www.akaipro.com/guides/mpc-sample/song_mode.htm)*

---

## 5. Mixer & Effects

### 5.1 Signal & mix model

- **Per-pad:** Volume (-INF, -74.00 to +6.00 dB) and Pan (50L–C–50R) — see §2.5.
- **Kit Volume:** a master level for the whole loaded kit (SHIFT+K2 in Sample Mode's Mix page) — distinct from the physical **Main Volume** knob, which is a hardware output trim covering the speaker/headphones/AUDIO OUT and isn't part of the saved project data.
- **Effects routing** (per Technical Specifications): **Main Output, Input, and Per-Pad** are the three effect-application points — "Internal" routing covers Main Out and per-pad Knob FX, plus real-time processing of *external* inputs, and the ability to record Knob FX processing directly into a captured sample (Rec Input Effects, §2.1).
- Overall: **"60+ different FX spread across four effect engines"** — Pad FX, Knob FX, Flex Beat, and Color-Compressor.

*Source: [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm), [Effects](https://www.akaipro.com/guides/mpc-sample/effects.htm)*

### 5.2 The four effect engines — overview

| Engine | Trigger model | Scope |
|---|---|---|
| **Pad FX** | Pads 1–16 trigger one effect each; hold to sustain, pressure/aftertouch controls intensity | Applied to the whole sequence during playback |
| **Flex Beat** | Pads 1–16 trigger one time-warp effect each (Pad 1 = baseline "Empty") | Applied to the whole sequence during playback |
| **Knob FX** | K1–K3 (+SHIFT layer) control **one** selected effect at a time, chosen from a browsable list | Applied per-pad (a chosen subset of pads, or all) — frees the pads themselves for triggering |
| **Compressor** | Dedicated always-available effect, not pad-triggered | Described as a "pumping"/ducking compressor with an optional "Color" saturation stage |

*Source: [Effects](https://www.akaipro.com/guides/mpc-sample/effects.htm)*

### 5.3 Pad FX — full effect list

Opened with the **PAD FX** button. Press pads 1–16 to trigger the matching effect (harder pressure = more effect, i.e. aftertouch-controlled depth); **up to 4 effects simultaneously** — triggering a 5th bypasses the *oldest* still-engaged effect (FIFO), and turning effects back off past four re-engages the bypassed one. **K1–K3** edit the active effect's parameters. **B1** "Latches" an effect at its current amount (toggle).

| Pad | Effect | Description | Parameters |
|---|---|---|---|
| 1 | Half Speed | Plays audio back at reduced speed | K1 Speed: x1.5, x2, x4 · K2 Mix: 0–100% |
| 2 | Chorus | LFO pitch modulation + delay, "watery" sound | K1 Rate: 0.40–3.20 Hz · K2 Depth: 0–100% · K3 Feedback: 0–100% |
| 3 | Flanger | Short modulating delay, "whooshing" sound | K1 Rate: 0.02–10.00 Hz · K2 Depth: 0–100% · K3 Feedback: 0–100% |
| 4 | Phaser | Modulated filters, sharp "sweeping" sound | K1 Feedback: 0–100% · K2 Speed: 2 bars…1/64 (tempo-synced) · K3 Range: 0–100% |
| 5 | Comb Filter | Frequency-spectrum notches via delayed signal added to itself | K1 Speed: 2 bars…1/64 (tempo-synced) |
| 6 | LP Filter | Suppresses frequencies above cutoff | K1 Resonance: 0–100% · K2 Speed: 2 bars…1/64 · K3 Range: 0–100% |
| 7 | HP Filter | Suppresses frequencies below cutoff | K1 Resonance: 0–100% · K2 Speed: 2 bars…1/64 · K3 Range: 0–100% |
| 8 | BP Filter | Suppresses frequencies above & below cutoff | K1 Resonance: 0–100% · K2 Speed: 2 bars…1/64 · K3 Range: 0–100% |
| 9 | Ring Mod | Metallic pulsing/ringing; slow speeds create a "ducking" sound | K1 Max Freq: 40.00–400.00 Hz |
| 10 | LoFi | Reduces audio quality, subtle to mangled distortion | K1 Bitcrush: 24.00–2.00 (bit depth) · K2 Decimator: 0–100% |
| 11 | Color | EQ + noise + modulation emulating vintage gear | K1 Mode: Cassette, Flutter, Tube Amp, Vinyl, Saturation, Radio |
| 12 | Granulator | Converts audio into manipulable grains | K1 Density: 1.0–300.0/s · K2 Feedback: 0–100% · K3 Grain Len: 10.0–200.0 ms |
| 13 | Beat Repeat | Stutter/loop-repeats the source audio | K1 Division: 1/4…1/64 · K2 Reverse: Off/On · K3 Resonance: 0–100% |
| 14 | Rev Stepper | Slices audio by Delay Time, plays forward/reverse per Repeats count | K1 Delay Time: 1/4…1/64 · K2 Repeats: 2–8 |
| 15 | Delay | Echo repeats | K1 Time: 1/1…1/64t (17 tempo-synced note values incl. dotted/triplet) · K2 Feedback: 0–100% · K3 Range: Normal, X-Feedback, Ping-Pong |
| 16 | Reverb | Spatial "room" emulation | K1 Pre-Delay: 0–250 ms · K2 Decay: 0–100% · K3 Diffusion: 0–100% |

*Note (per manual): each of the filter effects (pads 6–8) has an internal LFO controlled by its Speed and Range parameters.*

*Source: [Pad FX](https://www.akaipro.com/guides/mpc-sample/pad_fx.htm)*

### 5.4 Flex Beat — time-based warp effects

Opened with SHIFT+**PAD FX**. Behaves like Pad FX (pads trigger effects) but the effects are described as "time-based effects that warp the pitch, time, and volume of your sequence for beat chops, DJ-style scratches, and trance gate effects," applied to the whole sequence during playback (press **PLAY** first). Pad 1 is always the baseline **Empty** effect (no change).

- **K1 — One Shot vs. Loop:** One Shot auto-returns to Empty once the triggered effect finishes; Loop repeats the effect indefinitely until another pad (or Empty) is pressed.
- **B3 — Quantize:** toggles whether a triggered effect starts exactly on press or snaps to the nearest time division.
- **K3 — Mix:** 0–100% dry/wet.

**Gap in the manual:** unlike Pad FX and Knob FX, **the manual never names or enumerates the 16 individual Flex Beat effects** — only the shared mode behavior above is documented across every Flex Beat-related page (Effects, Flex Beat, Tutorial, Features). A quick check of Akai's MPC Sample product marketing page turned up no further detail either. Treat the specific 16 Flex Beat effect identities as an open item — likely enumerable only by using the physical/simulated hardware, or from a future manual revision.

*Source: [Flex Beat](https://www.akaipro.com/guides/mpc-sample/flex_beat.htm), [Effects](https://www.akaipro.com/guides/mpc-sample/effects.htm), [Tutorial](https://www.akaipro.com/guides/mpc-sample/tutorial.htm)*

### 5.5 Knob FX — full effect list

Opened with the **KNOB FX** button; K1–K3 control the *currently selected* single effect (SHIFT unlocks 3 more parameters on the same knobs). Effects apply per-pad: tap pads to enable/disable them individually (lit = affected), **B2** enables all pads at once, **B3** bypasses all. Browse/select the active effect via **ENCODER**/±. While engaged, K1–K3 are unavailable for anything else (e.g. Sample Mode Start/End or Pad FX parameters) — a hardware limitation from having only 3 physical knobs, not necessarily one to replicate in software where more simultaneous controls are cheap to render.

**Delays & time-based**
- **Delay** — echo repeats. K1 Time (synced: note values 1/32–8/4; unsynced: 1 ms–2.00 s) · K2 Feedback 0–100% · K3 Mix 0–100% · Shift+K1 Sync Off/On · Shift+K2 Damping 1.00–20.0 kHz · Shift+K3 Width 0–100%
- **Diff Delay** — delay with adjustable diffusion, emulating reverberant echo decay. K1 Time (synced 1/64–4/4; unsynced 1–1000 ms) · K2 Feedback 0–100% · K3 Mix 0–100% · Shift+K1 Sync · Shift+K2 Diffusion 0–100% · Shift+K3 High Damp 0–100%
- **Tape Delay** — analog tape-loop/tape-head delay emulation. K1 Time (note values: 1, 1/2, 1/2., 1/4, 1/4., 1/8, 1/8., 1/16, 1/16.) · K2 Feedback 0–100 · K3 Mix 0–100 · Shift+K1 Wow/Flut 0–100 · Shift+K2 Ramp 0–100 · Shift+K3 Spread 0–100
- **Sample Delay** — utility micro-delay, independent per channel, for stereo widening / loosening percussion. K1 Left 0.0–250.0 ms · K2 Right 0.0–250.0 ms

**Reverbs**
- **Reverb Small / Medium / Large** — identical parameter set, three room-size presets. K1 Pre-Delay 0–250 ms · K2 Time 0.4–71.5 s (up to +inf) · K3 Mix 0–100% · Shift+K1 ER/Tail Mix 0–100% · Shift+K2 Density 0–100% · Shift+K3 Low Cut 1–1000 Hz
- **Spring Reverb** — spring-tank emulation. K1 Pre-Delay 0–250 ms · K2 Time 1.0–10.0 s · K3 Mix 0–100% · Shift+K1 Width 0–100% · Shift+K2 Diffusion 0–100% · Shift+K3 Low Cut 20.0 Hz–1.00 kHz

**Filters**
- **HP Filter** — K1 Frequency 10–19999 Hz · K2 Resonance 0–100
- **LP Filter** — K1 Frequency 22–19999 Hz · K2 Resonance 0–100
- **BP Filter** — K1 Frequency 55.0 Hz–20.0 kHz · K2 Resonance 0.7–20.0

**Dynamics**
- **Bus Compressor** — "transparent," large-gain-reduction-without-artifacts compressor. K1 Attack 0–100 · K2 Release 0–100 · K3 Threshold -50–0 · Shift+K1 Ratio 1–20 · Shift+K2 Output -6–24 · Shift+K3 Mix 0–100
- **Limiter** — boosts overall signal while capping peaks. K1 Gain -12.0–36.0 dB · K2 Ceiling -24.0–0.0 dB · K3 Release 10.0 ms–10.0 s
- **Pumper** — rhythmic sidechain-style ducking. K1 Speed (Bar…1/32T, tempo-synced) · K2 Shape 0–100% · K3 Depth 0–100% · Shift+K1 Attack 0–100% · Shift+K2 Hold 0–100% · Shift+K3 Release 0–100%
- **Transient** (shaper) — K1 Attack -100–+100% · K2 Shape 0–100% · K3 Sustain -100–+100%
- **Noise Gate** — attenuates signal *below* a threshold (inverse of a compressor). K1 Threshold -120.0–0.0 dB · K2 Depth 0 to -120 dB · Shift+K1 Attack 0.01–1000.00 ms · Shift+K2 Hold 0–1000 ms · Shift+K3 Release 1.00–3000.00 ms

**Distortion / amp / saturation**
- **Amp Sim** — guitar/bass amp+cabinet simulation. K1 Cab Model: D.I., Brit, 1x8", 1x12", 2x10", 2x12, 4x10", 4x12", 1x15" Bass, 4x10" Bass, Radio · K2 Drive 0.0–11.0 · K3 Soft Clip 0–100% · Shift+K1 Bass ±12 dB · Shift+K2 Mid ±12 dB · Shift+K3 Treble ±12 dB
- **Tube Drive** — overdriven tube-amp emulation. K1 Drive 0–100% · K2 Headroom -30.0–0.0 dB · K3 Saturation 0–100%
- **Soft Clipper** — saturation/distortion, subtle to harsh. K1 Drive 1.0–10000.0% · K2 Shape: Tanh, Sine, Parabolic · K3 Mix 0–100% · Shift+K1 True Peak Off/On · Shift+K2 Rel Time 0.1–100.0 ms · Shift+K3 Post Lvl -Inf, -80.0–0.0 dB

**Modulation**
- **Ensemble** — shimmering modulation. K1 Rate 0.1–10.0 Hz · K2 Depth 0.00–24.00 ms · K3 Mix 0–100% · Shift+K1 Delay 0.00–24.00 ms · Shift+K2 Shimmer 0–100% · Shift+K3 Width 0–100%
- **Multi-Chorus** — thick, complex chorus. K1 Rate 0.1–10.0 Hz · K2 Depth 0.00–24.00 ms · K3 Mix 0–100% · Shift+K1 Voices: 3, 4, 6 · Shift+K2 Delay 0.00–24.00 ms
- **Phaser** — K1 Rate 0.10–10.00 Hz · K2 Depth 0–100% · K3 Mix 0–100% · Shift+K1 Model: Vibe, Stone, Ninety, Tron · Shift+K2 Feedback 0–100%
- **Flanger** — K1 Rate 0.02–10.00 Hz · K2 Depth 0–100% · K3 Mix 0–100% · Shift+K1 Feedback 0–100%
- **Auto-Wah** — envelope-triggered low-pass "wah," driven by input amplitude. K1 Sens 0–100 · K2 Resonance 0–100 · K3 Mix 0–100% · Shift+K1 Center 0–100 · Shift+K2 Attack 0–100 · Shift+K3 Release 0–100
- **Auto-Pan** — LFO-driven stereo panning. K1 Rate 0–100 · K3 Mix 0–100%

**Emulation**
- **Vintage Emulator** — K1 Type: MPC3000, MPC60, SP1200, SP1200Ring
- **Vinyl Emulator** — K1 Tone 0–100 · K2 Crackle 0–100% · K3 Pitch 10–100%
- **Tape Emulator** — K1 Wow 10–100% · K2 Noise 10–100% · K3 Pitch 20–100%

That's **28 named Knob FX effects** + **16 Pad FX effects** + Compressor ≈ the "60+" figure quoted in Technical Specifications (Flex Beat's 16 unnamed effects would put the true total meaningfully higher still).

*Source: [Knob FX](https://www.akaipro.com/guides/mpc-sample/knob_fx.htm)*

### 5.6 Compressor

A dedicated, always-reachable effect (SHIFT+**PAD 5**) — explicitly described as "primarily a 'pumping' compressor, designed to apply sharp ducking, but can also be used for more subtle peak-limiting."

- **K1 — Attack:** 0.100–150 ms
- **K2 — Release:** 3.0–300 ms
- **K3 — Amount:** 0.00–100.00% (a single combined knob standing in for the traditional threshold+ratio pair)
- **SHIFT+K3 — In Boost:** increases the signal feeding the compressor for more aggressive ducking
- **B1 — Color:** toggles a parallel bass-boost + slight pitch instability + harmonic saturation layer for "tape warmth"
- **B3 — Bypass** toggle
- Makeup gain is **automatically calculated** from input level and the other settings (not a manual parameter)

*Source: [Compressor](https://www.akaipro.com/guides/mpc-sample/compressor.htm)*

### 5.7 Fader assignment

Opened with SHIFT+**PAD 9**. The physical fader defaults to Pad Volume but can be reassigned via the encoder to:

- Pad Volume · Pad Pan · Pad Tune (Semi Tune) · Pad Amp Attack · Pad Amp Decay/Release (whichever applies per One Shot/Note On) · Pad Filter Cutoff · Kit Volume

**B3** toggles the fader on/off; **B1** returns to the previous page. In Step Edit mode the fader is repurposed entirely to nudge event timing (§4.4) rather than any of the above.

*Source: [Fader](https://www.akaipro.com/guides/mpc-sample/fader.htm), [Features](https://www.akaipro.com/guides/mpc-sample/features.htm)*

---

## 6. Project & File Management

### 6.1 Project menu

Opened with SHIFT+**PAD 16**.

- **Load Project** — three categories: **Demos** (bundled demo projects incl. the auto-loading startup project), **Kits** (load a kit + its 4 default sequences via the encoder, or **B3** "Load Kit" for samples-only with no sequence data), **User** (your own saved projects on the internal drive).
- **Save Project** — same scroll-to-spell name entry as saving samples (§2.3); **B3** "Do It!" to export/save, **B1** "Cancel."
- **New Project** — clears the current project after a **B3** confirm (**B1** cancels).
- **SD Card Access** — mounts an inserted microSD card as a USB mass-storage drive on a connected computer for file transfer; **blocks all other modes** while active; requires safe-ejecting from the computer before exiting (**B1**) back to normal operation.
- **Autosave:** MPC Sample "contains an automatic saving system" — work is continuously saved in the background to internal storage, so power-cycling resumes at the last state. The explicit **Save Project** action is a distinct step that *copies* the working files to a new named location (internal or external) — i.e. autosave ≠ a save slot. The manual notes that chopping/extracting/copying long samples can take a moment because of this underlying file-copy system.

*Source: [Project](https://www.akaipro.com/guides/mpc-sample/project.htm)*

### 6.2 Storage & data limits

| Spec | Value |
|---|---|
| Internal storage | 8 GB internal drive, of which ~2 GB is factory content |
| RAM | 2 GB |
| Expansion | microSD card slot |
| Samples per project | 16 pads × 8 banks = 128, "no project limit" (i.e. no cap on number of *projects*) |
| Sequences per project | 16 pads × 8 banks = 128 |
| Max single sample length | 20 minutes |
| Max single sequence length | 128 bars |

*Source: [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm)*

### 6.3 Interoperability & firmware

- **MPC3 (desktop/hardware) compatibility:** project import/export is explicitly **not supported yet**. The manual states a future firmware update will let MPC Sample projects be opened in MPC hardware/software running **v3.8+**, to continue production in standalone mode or on MPC3 desktop software — a one-directional, forward-looking compatibility promise, not a currently-shipping file format. Worth monitoring if BeatSampler ever wants MPC-project-file interop.
- **Firmware updates:** connect via USB-C, power on, then browse to **`mpc-sample.local`** (or `192.168.155.1` if local-hostname resolution fails) — **the device runs its own local web server** for the update UI, which auto-detects the current firmware version and walks through updating, or accepts a manually-uploaded firmware file. Windows 10 requires installing a dedicated driver/updater app from akaipro.com rather than using the web flow. The inMusic Software Center app is an alternative updater.
- **Factory resets** (via MIDI Configuration menu, §7.2): **Reset Factory Settings** (settings only, device restarts) vs. **Reset Factory Data** (irreversibly wipes all user content back to factory defaults, including the current unsaved project) — both gated behind a B3=Yes/B1=No confirmation.

*Source: [Firmware Updates](https://www.akaipro.com/guides/mpc-sample/firmware_updates.htm), [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm), [MIDI Configuration](https://www.akaipro.com/guides/mpc-sample/midi_configuration.htm)*

---

## 7. MIDI & Hardware I/O

### 7.1 Physical connections

| Port | Spec | Notes |
|---|---|---|
| AUDIO IN ×2 | 1/4" (6.35 mm) TRS | Mic/line-level; level set via **REC GAIN** knob |
| AUDIO OUT ×2 | 1/4" (6.35 mm) TRS | Line-level, feeds speakers/mixer |
| PHONES | 1/8" (3.5 mm) TRS | Auto-disables the built-in speaker when connected |
| MIDI IN / OUT | 1/8" (3.5 mm) TRS "Type A" | Needs a TRS-to-5-pin-DIN adapter cable (not included) |
| SYNC OUT | 1/8" (3.5 mm) TS | 5V CV/Gate clock pulse output, configurable rate, for modular gear |
| USB-C ×1 | — | Multiplexed: power/charging, audio I/O, MIDI I/O, and microSD mass-storage access, all over one port |
| microSD slot | — | Storage expansion, on the left side of the unit |

*Source: [Features](https://www.akaipro.com/guides/mpc-sample/features.htm), [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm)*

### 7.2 MIDI Configuration menu

Opened with SHIFT+**PAD 8**.

| Setting | Values | Notes |
|---|---|---|
| MIDI Port | External, USB | Which physical/virtual port is active |
| MIDI In Channel | All, 1–16 | |
| MIDI Out Channel | 1–16 | |
| Pad MIDI In | Off, On | Whether incoming MIDI can trigger pads |
| Pad MIDI Out | Never, Always, Empty | Whether/when pad hits emit MIDI out |
| MIDI Sync In | Off, MIDI Clock, MTC | |
| MIDI Sync Out | Off, MIDI Clock, MTC | |
| MIDI Thru | Off, On | Echoes MIDI IN data out of MIDI OUT |
| Receive Program Change | Off, Sequence | Incoming Program Change messages can trigger sequences |
| CV/Sync Out | Off, On | Enables the SYNC OUT jack |
| CV/Sync Base | 1–8 | Base clock resolution; 1 = one pulse per quarter note |
| CV/Sync Division | 1–24 | Multiplies the Base value |

**Takeover behavior** (applies separately to Parameter Takeover, Knob FX Takeover, and Fader Takeover):
- **Pickup** (default for Fader) — a control is inert until its physical position passes through the parameter's current value.
- **Scaled** (default for Parameter/Knob FX) — the parameter moves proportionally as the physical control moves, converging on the actual value over the course of the movement.
- **Instant** — the parameter jumps immediately to match the physical control's raw position.

This "takeover" problem — reconciling a fixed-position physical knob with a stored parameter value that may not match it (e.g. after switching pages or loading a project) — is fundamentally a **hardware absolute-control problem**. It's not relevant to on-screen mouse/touch controls (which always show/match the true value), but the *concept* directly reapplies if BeatSampler supports external MIDI hardware controllers with non-motorized knobs — worth keeping the Pickup/Scaled/Instant vocabulary in mind for that feature if/when it's built.

*Source: [MIDI Configuration](https://www.akaipro.com/guides/mpc-sample/midi_configuration.htm)*

---

## 8. Standalone / Portable Operation

- Runs **fully standalone** — no computer or DAW required for any core workflow (sampling, chopping, sequencing, effects, mixdown export). A demo project auto-loads on power-up so the device is playable immediately.
- **Battery:** Lithium-Ion, ~5 hours of continuous playback (varies by feature usage); charges via USB-C (bus power, wall adapter, or power bank, recommended minimum 5V/2A). Battery level shown via a 4-stage icon: green (100–30%), amber (29–15%), red (14–5%), blinking red (<5%, charge immediately).
- **Built-in condenser microphone**, positioned next to the encoder, for grab-and-go sampling with no external gear.
- **Built-in 3-watt speaker** for monitoring without headphones/external speakers — automatically deactivated when headphones or AUDIO OUT are connected, or while recording from the internal mic (feedback prevention).
- **Self-hosted firmware updater:** the device serves its own update web page (`mpc-sample.local`) rather than requiring a separate desktop application (Windows 10 being the one documented exception).
- Physical dimensions/weight: 7.6" × 9.3" × 2.0" (19.4 × 23.6 × 5.0 cm), 2.03 lbs (0.92 kg).

*Source: [Introduction](https://www.akaipro.com/guides/mpc-sample/introduction.htm), [Features](https://www.akaipro.com/guides/mpc-sample/features.htm), [Technical Specifications](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm), [Tutorial](https://www.akaipro.com/guides/mpc-sample/tutorial.htm)*

---

## 9. Notable Hardware-Only Features (adapt / skip / reinterpret)

A consolidated list of everything in the manual that is inherently tied to standalone hardware, with a suggested software treatment for each:

| Hardware feature | Suggested software treatment |
|---|---|
| 16 physical velocity + poly-aftertouch RGB pads | **Adapt.** Support MIDI pad controllers (velocity + aftertouch where available) *and* on-screen/mouse pads *and* computer-keyboard-triggered pads as three parallel input methods; reproduce the bright/dim/off/color LED-state language as on-screen visual feedback. |
| Internal condenser microphone | **Adapt or skip.** Could map to the system/browser microphone (e.g. `getUserMedia` in a web build) as one input-source option; not meaningful in a purely in-the-box desktop build. |
| Built-in 3 W speaker (+ auto-mute on headphone/mic-record) | **Skip.** The OS/browser owns audio output already; the auto-disable-to-prevent-feedback logic is a hardware-specific workaround that doesn't apply. |
| Li-ion battery, battery-level icon, USB-C charging | **Skip entirely** for desktop/web. Not applicable. |
| Absolute-position K1–K3 knobs & fader with "soft takeover" / Pickup-Scaled-Instant behavior | **Skip for on-screen controls** (mouse/touch elements always reflect the true value — no positional mismatch is possible). **Reinterpret** only if/when mapping physical MIDI controllers with non-motorized knobs, where the same takeover problem re-emerges. |
| Fixed 2.4" physical LCD + B1/B3 "cycle through pages" paradigm for parameter banks | **Skip the paging constraint.** A software UI has effectively unlimited screen space (or at least far more than 2.4"), so related parameters (e.g. all of Trim/Mix/Amp-Env, or all of Tune/Play) can likely be shown simultaneously rather than paged through — though the manual's *grouping* of parameters into logical pages is still a useful organizing scheme to borrow. |
| Physical SHIFT-layered secondary functions (silkscreened under each control) | **Reinterpret** as keyboard-modifier shortcuts (e.g. a software "Shift" held-key layer) and/or a visible menu — the underlying idea (a compact primary layer + modifier-revealed secondary layer) is a good UX pattern to keep, just not the specific pad-printed-labels implementation. |
| microSD card slot + dedicated "SD Card Access" mass-storage mode | **Reinterpret** as a normal OS/browser file-system import/export dialog; no need for an exclusive "mode" since desktop/web file access doesn't block other app functions. |
| Physical 1/4" TRS audio jacks, 1/8" TRS-MIDI jacks, CV/Gate Sync Out jack | **Skip / reinterpret via OS APIs.** Audio I/O and MIDI I/O map to standard OS audio drivers and Web MIDI / native MIDI APIs respectively. **CV/Gate has no software equivalent** and should simply be skipped unless BeatSampler specifically targets modular/hardware-synced setups through an audio interface. |
| USB-C single-port multiplexing power + audio + MIDI + storage | **Skip.** An artifact of minimizing hardware connectors; irrelevant to software. |
| Self-hosted local web server for firmware updates (`mpc-sample.local`) | **Skip.** Software ships updates through its normal app-store/installer/update-checker channel instead. |
| Physical POWER button, on-device charge indicator | **Skip.** Not applicable. |
| Fixed internal processing sample rate (44.1 kHz) driven by limited onboard RAM/DSP, plus disk-streamed (rather than fully in-memory) sample playback | **Reconsider deliberately, don't just copy.** A desktop/web app has much more RAM and CPU headroom than the hardware; BeatSampler could reasonably support higher/variable project sample rates and fully in-memory sample playback rather than inheriting this hardware constraint — call this out explicitly as a place where "inspired by" should diverge from the source rather than mirror it. |

---

## Appendix: Manual pages crawled

All under `https://www.akaipro.com/guides/mpc-sample/`:

- [index.htm](https://www.akaipro.com/guides/mpc-sample/index.htm) — landing/TOC frame
- [introduction.htm](https://www.akaipro.com/guides/mpc-sample/introduction.htm)
- [setup.htm](https://www.akaipro.com/guides/mpc-sample/setup.htm)
- [firmware_updates.htm](https://www.akaipro.com/guides/mpc-sample/firmware_updates.htm)
- [connection_diagram.htm](https://www.akaipro.com/guides/mpc-sample/connection_diagram.htm)
- [tutorial.htm](https://www.akaipro.com/guides/mpc-sample/tutorial.htm)
- [features.htm](https://www.akaipro.com/guides/mpc-sample/features.htm)
- [operation.htm](https://www.akaipro.com/guides/mpc-sample/operation.htm) — chapter hub
- [sample_mode.htm](https://www.akaipro.com/guides/mpc-sample/sample_mode.htm)
- [pad_play.htm](https://www.akaipro.com/guides/mpc-sample/pad_play.htm)
- [loading_and_saving_samples.htm](https://www.akaipro.com/guides/mpc-sample/loading_and_saving_samples.htm)
- [sample_record_mode.htm](https://www.akaipro.com/guides/mpc-sample/sample_record_mode.htm)
- [sequence_mode.htm](https://www.akaipro.com/guides/mpc-sample/sequence_mode.htm)
- [recording_sequences.htm](https://www.akaipro.com/guides/mpc-sample/recording_sequences.htm)
- [editing_sequences.htm](https://www.akaipro.com/guides/mpc-sample/editing_sequences.htm)
- [step_edit.htm](https://www.akaipro.com/guides/mpc-sample/step_edit.htm)
- [song_mode.htm](https://www.akaipro.com/guides/mpc-sample/song_mode.htm)
- [effects.htm](https://www.akaipro.com/guides/mpc-sample/effects.htm) — chapter hub
- [pad_fx.htm](https://www.akaipro.com/guides/mpc-sample/pad_fx.htm)
- [flex_beat.htm](https://www.akaipro.com/guides/mpc-sample/flex_beat.htm)
- [knob_fx.htm](https://www.akaipro.com/guides/mpc-sample/knob_fx.htm)
- [compressor.htm](https://www.akaipro.com/guides/mpc-sample/compressor.htm)
- [menus.htm](https://www.akaipro.com/guides/mpc-sample/menus.htm) — chapter hub
- [input_configuration.htm](https://www.akaipro.com/guides/mpc-sample/input_configuration.htm)
- [fader.htm](https://www.akaipro.com/guides/mpc-sample/fader.htm)
- [time_correct.htm](https://www.akaipro.com/guides/mpc-sample/time_correct.htm)
- [midi_configuration.htm](https://www.akaipro.com/guides/mpc-sample/midi_configuration.htm)
- [project.htm](https://www.akaipro.com/guides/mpc-sample/project.htm)
- [technical_specifications.htm](https://www.akaipro.com/guides/mpc-sample/technical_specifications.htm)
- [trademarks___licenses.htm](https://www.akaipro.com/guides/mpc-sample/trademarks___licenses.htm) — legal, no technical content

One secondary source was consulted for a single gap and is labeled where used: the general MPC Sample product page at `akaipro.com/mpc-sample` (checked for named Flex Beat effects, §5.4 — no additional information was found there).
