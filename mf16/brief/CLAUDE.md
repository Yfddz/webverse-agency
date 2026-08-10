# CLAUDE.md — Project Constitution

**Project:** ASSEB / AHSEC Class XII Finance — Chapter 16 "Mutual Fund" 3D Masterclass
**Owner:** Kapil, Bhawanipur (Bajali), Assam. Board exam February 2027. Target 100/100.
**Purpose, in one line:** make a student *understand and retain* Chapter 16 well enough to score full marks. Everything else is subordinate to that.

These rules are permanent. Read this file before every task. Do not violate a rule to make something look better.

---

## RULE 1 — Accuracy is sacred, and it lives in one file

All chapter content comes from `src/data/facts.ts`. That file is the single source of truth, transcribed from the ASSEB Finance textbook (1st Edition 2023, reprint 2025), Chapter 16, pages 188–196.

- **Never** hard-code chapter text into a component. Import it from `facts.ts`.
- **Never** paraphrase, "improve", modernise, or expand a textbook definition. The examiner marks against the book.
- **Never** add a fund type, benefit, party, or difference row that is not in `facts.ts`.
- If you believe a fact in `facts.ts` is wrong, **stop and flag it in your response**. Do not silently edit it.
- Anything you add that is *not* from the textbook (illustrative positioning, real-world examples, current AMC names) must be tagged `provenance: 'illustrative'` and rendered with a visible disclaimer chip.

Fabricating a fact costs Kapil real board marks. This is the one failure mode that matters more than all others.

## RULE 2 — The pedagogy gate

Before you build any 3D scene, animation, or interaction, answer this in a comment at the top of the component:

```
// PEDAGOGY GATE
// Misconception targeted:
// Why 3D beats a static diagram here:
// What the student can do after this that they couldn't before:
```

If you cannot fill all three lines with something specific, **do not build it in 3D**. Build it as the existing 2D SVG instead. A spinning object that teaches nothing is a net negative — it costs load time, battery, and attention, and it trains the student to skim.

Approved 3D scenes are listed in `BUILD-BRIEF.md`. Do not invent new ones without passing the gate.

## RULE 3 — Phone-first performance

Kapil revises on an Android phone on mobile data. This is not a desktop showcase.

- Time to interactive on a mid-tier Android: **under 2.5s**
- Frame rate floor: **30fps mobile / 60fps desktop**
- `dpr={[1, isMobile ? 1.5 : 2]}` — never uncapped
- Every 3D scene mounts only when it enters the viewport and **unmounts when two viewports away**
- Use `InstancedMesh` for anything repeated more than 20 times
- No external model files, no CDN textures, no network calls at runtime. The built artifact must work fully offline in aeroplane mode.
- Auto-detect weak devices (`navigator.hardwareConcurrency <= 4`, software WebGL renderer, `prefers-reduced-motion`) and fall back to Lite mode without asking.

## RULE 4 — Lite mode is a first-class citizen, not a stub

Every 3D scene ships with a 2D SVG equivalent that teaches the same point. A global **Lite mode** toggle in the header switches all scenes at once and persists in `localStorage`.

Lite mode must be genuinely usable for full revision. If Lite mode is worse than the current 2D masterclass, you have regressed.

## RULE 5 — Design system is fixed

Tokens live in `src/styles/tokens.css`. Do not introduce new colours, fonts, or radii.

```
--bg #0b0a08   --bg-2 #131110   --bg-3 #1a1712   --bg-4 #221d17
--border #2a2520   --border-strong #3a342c
--text #e8e3db   --text-dim #a8a196   --text-dimmer #6b6560
--gold #c9a961   --gold-bright #e5c88a   --gold-deep #8a7340
--warn #d08770   --info #7ca69a   --success #9cb37a
serif: Fraunces   sans: IBM Plex Sans   mono: IBM Plex Mono
```

3D materials use the same palette. Gold is emphasis, never decoration. No emoji anywhere in content — the permitted glyph set is ✓ ◆ ⚠ ▸ ✎ ▶ ■ ↺.

## RULE 6 — Exam conventions are non-negotiable

- A "distinguish / differentiate" question is **always** answered as a table with the basis of difference in column one. Never prose. The app must enforce this in the answer trainer.
- Mark-band answer shapes:
  - **1 mark** — single fact or term
  - **2 marks** — point + a few words of explanation
  - **3 marks** — three points, one short line each, no intro, no conclusion
  - **5 marks** — five points, one tight explanatory line each, no padding
  - **8 marks** — two-line intro → 8 numbered points with 2–3 lines each → one-line conclusion (~300 words)
- Paper pattern (ASSEB 2025): Q1 1×6=6 · Q2 2×4=8 · Q3 3×4=12 · Q4 5×6=30 · Q5 8×3=24 · **Total 80** · 3 hours · pass 24.
- Board is **AHSEC/ASSEB only**. Never reference CBSE or ISC patterns.

## RULE 7 — Voice narration stays

The existing Web Speech API narration is a core feature, not a nice-to-have — it lets Kapil revise hands-free. Preserve it, and extend it so every 3D scene step is narrated in sync. It must degrade gracefully when a device has no installed voice (minimum step dwell + watchdog timer; never hang, never fast-forward).

## RULE 8 — Ship a single offline file

Final build output is **one self-contained `.html`** via `vite-plugin-singlefile`, plus a normal `dist/` for hosting. Kapil must be able to download one file, open it by double-clicking with no internet, and have everything work including 3D, voice, and saved progress.

## RULE 9 — Tone

Peer voice. Direct, no filler, no "Great question!", no lecturing. `<strong>` reserved for the single key takeaway. Italics for lighter emphasis.

## RULE 10 — Verify before you claim

Before saying a phase is done: run the build, open the artifact, exercise the feature, and check the acceptance criteria in `BUILD-BRIEF.md`. Report what you actually tested. "Should work" is not a test result.
