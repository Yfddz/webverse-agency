# BUILD BRIEF — Mutual Fund 3D Masterclass

Read `CLAUDE.md` first. Build in phases. **Do not start a phase until the previous phase's acceptance criteria pass.** Report test results at each gate.

Source material: `legacy/mutual-fund-ch16-masterclass.html` — the current working 2D masterclass. It contains all chapter content, 6 SVG diagrams, a NAV calculator, flip cards, a 12-question quiz, and Web Speech narration. **It is the content spec.** Port it; do not rewrite its facts.

---

## Stack

```
Vite + React 18 + TypeScript
@react-three/fiber  @react-three/drei  three
zustand                  (app state: progress, mode, scheme settings)
framer-motion            (2D UI transitions only — never for 3D)
vite-plugin-singlefile   (offline single-file build)
```

No Tailwind. Use CSS Modules + the token file, so the existing aesthetic ports cleanly and the single-file build stays small.

**Do not add:** analytics, fonts loaded at runtime (self-host and inline Fraunces + IBM Plex subsets), any network dependency.

---

## Phase 0 — Scaffold and content lock

1. `npm create vite@latest . -- --template react-ts`, install the stack above.
2. Create `src/data/facts.ts` from the provided seed file. **This is the accuracy firewall.**
3. Port `src/styles/tokens.css` from the legacy file's `:root` block, verbatim.
4. Self-host font subsets in `src/assets/fonts/` (Fraunces italic 300/400, IBM Plex Sans 300/400/600, IBM Plex Mono 400/500). Latin subset only.
5. Set up `vite.config.ts` with `viteSingleFile()` on a `build:single` script.

**Acceptance:** `npm run dev` serves a page rendering the masthead in correct typography. `npm run build:single` emits one `.html` under 6 MB that opens offline.

---

## Phase 1 — Port the 2D masterclass to components

Rebuild the ten parts as components driven by `facts.ts`. No content may be typed inline.

```
src/parts/Part01Meaning.tsx      … Part10ExamStrategy.tsx
src/components/Callout.tsx       (trap | exam | insight | example)
src/components/Formula.tsx
src/components/CompareTable.tsx  (renders facts.differences)
src/components/FlipCard.tsx
src/components/RecallStrip.tsx
src/components/Sidebar.tsx  ProgressDots.tsx  VoiceBar.tsx
```

Preserve every existing feature: sticky sidebar with active-section highlight, progress dots, per-part mark-complete, flip cards, sorting drill, benefits timer, 12-question quiz with explanations, and the voice bar with per-part Listen.

**Acceptance:** feature parity with the legacy file, verified item by item. Mobile `document.documentElement.scrollWidth === clientWidth` at 390px. Zero console errors.

---

## Phase 2 — 3D engine core

```
src/three/SceneFrame.tsx    — Canvas wrapper: lazy mount via IntersectionObserver,
                              unmount at 2 viewports, dpr cap, Suspense, WebGL
                              capability check, automatic Lite fallback
src/three/useSceneSteps.ts  — step machine shared with the voice engine:
                              play / pause / restart / step index / progress,
                              advance on speech end with minimum dwell + watchdog
src/three/materials.ts      — shared materials built from the token palette
src/three/Label3D.tsx       — drei <Html> billboard label, readable at all zooms
```

Every scene is a `<SceneFrame>` with: title, step counter, progress rail, play/pause, restart, live caption, **and a "Show flat version" button** that swaps in the 2D SVG.

Camera: `CameraControls` from drei, damped. Each step defines a camera target; the user can drag freely and a "recentre" control restores the step framing.

**Acceptance:** an empty scene mounts on scroll, unmounts when scrolled away (verify with `renderer.info`), holds 60fps desktop / 30fps on a throttled 4× CPU profile, and falls back to Lite on a simulated software renderer.

---

## Phase 3 — Scene A: The Pooling Engine (Part 1)

```
// PEDAGOGY GATE
// Misconception targeted: students think a mutual fund "is a share" or that the
//   fund manager holds their money personally. They cannot picture aggregation.
// Why 3D beats a static diagram: aggregation and diversification are volumetric —
//   many small quantities becoming one, then one becoming many again. Flow over
//   time in space is exactly what a flat arrow diagram cannot show.
// After this the student can: explain, unprompted, why diversification reduces
//   risk and why the unit is a proportionate slice rather than a share certificate.
```

**Steps (narrated, synced to `facts.narration.pool`):**

1. ~40 instanced rupee tokens scattered at varying sizes = small savers of unequal means. Camera wide.
2. Tokens travel along curved paths into a translucent gold cylinder — the corpus. Camera pushes in.
3. The cylinder subdivides into a visible lattice of identical small cubes = **units**. A label ruler shows the initial offer price ₹10. *Emphasis: the units are identical even though the contributions were not.*
4. A beam runs corpus → AMC node. Camera orbits to show the AMC is separate from the pool.
5. The beam splits into three coloured streams into three clusters — equity shares, debentures & bonds, money-market instruments. Cluster spheres jitter independently: **the visual proof that they do not fall together**.
6. Return particles flow back along a torus path to the original investors, scaled to unit holdings.

**Interaction after playback:** a "Shock one sector" button drops the equity cluster 40%. The pool value dips slightly; a comparison ghost shows what an undiversified holding would have done. This is the risk-diversification benefit made physical.

**Acceptance:** all six steps narrate and animate in sync; the shock interaction is reversible; Lite mode shows the existing Fig 1.1 SVG explainer.

---

## Phase 4 — Scene B: The NAV Vessel (Part 2) — highest value, build carefully

```
// PEDAGOGY GATE
// Misconception targeted: dividing before subtracting, and treating ₹10 as a
//   permanent price. Students memorise the formula without understanding that
//   liabilities are a claim on the pool, not on each unit.
// Why 3D beats a static diagram: NAV is a quantity-per-slice. Volume divided into
//   slabs makes "subtract first, divide second" spatially obvious and wrong order
//   visibly absurd.
// After this the student can: predict the direction NAV moves when any input
//   changes, and explain why, without recomputing.
```

**Build:** a transparent tank. Fill volume = total value of the scheme. A red sub-volume carves out = liabilities. The remaining gold volume = net assets. That volume then slices into slabs (instanced, 500 slabs shown with the label "1 slab = 1,000 units"). A measuring rule on the side reads the height of one slab = **NAV**.

**The killer feature — live sliders.** Three sliders: total value, liabilities, units. Dragging any of them re-renders the tank and the NAV readout in real time with the step-by-step arithmetic printed alongside. Seed from `facts.navWorked` (₹52,00,000 − ₹2,00,000 ÷ 5,00,000 = ₹10).

Add a **"wrong order" toggle** that shows what happens if you divide before subtracting — the geometry visibly breaks and the readout is flagged in `--warn`. Kapil then never makes that mistake.

**Acceptance:** arithmetic in the readout matches the formula to 2 decimals at every slider position; the three legacy presets reproduce ₹10.00 / ₹20.00 / ₹15.00 exactly; the wrong-order toggle is clearly marked as an error state and cannot be mistaken for the correct method.

---

## Phase 5 — Scene C: Open vs Closed corpus (Parts 4–5)

```
// PEDAGOGY GATE
// Misconception targeted: swapping the listing row — students write that
//   open-ended units are listed. They also write that a closed-ended investor
//   "cannot sell at all" before maturity.
// Why 3D beats a static diagram: the six differences are six consequences of one
//   structural fact. Seeing the containers behave over a scrubbable timeline makes
//   the table derivable instead of memorised.
// After this the student can: rebuild all six rows of the differences table from
//   the single sentence "open = permanent AMC counter, closed = sealed pool with
//   an exchange side-door".
```

Two containers on a time rail, plus an interval container.

- **Closed:** fixed size, sealed lid after the offer period, a glowing **stock-exchange side door** an investor can exit through, and a maturity gate at the end of the rail.
- **Open:** no lid, container visibly expands and contracts as investors enter and leave, transacting at an **AMC counter**, no exchange present.
- **Interval:** lid that opens and closes on a schedule.

**The pedagogical centrepiece — bidirectional linking.** Render the six-row differences table beside the scene. Hovering or tapping a table row highlights the corresponding 3D feature and pushes the camera to it. Conversely, clicking a 3D feature highlights its table row. **Build this linkage; it is the reason this scene exists.**

A timeline scrubber lets the student park at any moment and ask "can I buy right now? can I sell right now?" — with a live yes/no chip for each container.

**Acceptance:** all six rows link both directions; the scrubber updates all three containers; table content comes from `facts.differences` with no duplication.

---

## Phase 6 — Scene D: Risk / Return / Liquidity space (Part 6)

```
// PEDAGOGY GATE
// Misconception targeted: students memorise nine fund types as an undifferentiated
//   list and cannot say which investor each suits — which is exactly what the
//   8-mark question rewards.
// Why 3D beats a static diagram: there are genuinely three variables (risk, return
//   potential, liquidity/lock-in). The 2D scatter had to drop one.
// After this the student can: place any named fund type in the space and justify
//   the placement from its textbook definition.
```

Nine labelled spheres in a 3D space. X = risk borne, Y = return potential, Z = liquidity / lock-in. Hovering a sphere shows the **verbatim textbook definition** from `facts.typesByYield`.

- Toggle to collapse Z and rotate to the flat 2D view, reconnecting with the legacy figure.
- **Quiz mode:** spheres unlabelled; the student drags each name onto the right sphere and gets scored. This turns a memory list into spatial reasoning.
- Mandatory visible disclaimer chip: *positioning is illustrative, not textbook data* (`provenance: 'illustrative'`).

**Acceptance:** all nine types present and matching `facts.typesByYield`, including real estate fund; the "Summary omits real estate" trap is surfaced as a `trap` callout beside the scene.

---

## Phase 7 — The learning engine (this is what makes it best-in-class)

3D is the hook. This is the substance. Persist everything in `localStorage` under `mf16.*`.

**7a — Spaced repetition.** SM-2-lite over every atomic fact in `facts.ts` (each definition, each benefit, each difference row, each date). Rate recall Again / Hard / Good / Easy. A "Due today" count in the header. This is the single highest-value feature for a February 2027 exam — it turns one reading into durable retention across ten months.

**7b — Answer-structure trainer.** Student picks a question and a mark band, types an answer in a textarea. The app checks structure, not prose quality:
- point count vs mark band (5 marks → 5 points)
- intro + conclusion present for 8-mark answers, absent for 3-mark
- **if the question is a "distinguish" type and the answer is not a table → hard fail with the reason**
- word count against the ~300-word target at 8 marks
Then reveal the model answer from `facts.modelAnswers` side by side.

**7c — Exam simulator.** Generates a paper in the real ASSEB shape (1×6, 2×4, 3×4, 5×6, 8×3) drawing Chapter 16 questions plus placeholders for other chapters. Countdown timer, section navigation, self-scoring rubric per question at the end, results written to the mistake ledger.

**7d — Mistake ledger.** Auto-populated from wrong quiz answers, failed structure checks, and Again-rated cards. Groups by misconception, links back to the exact part and 3D scene that fixes it. Surfaces "your top 3 leaks" on the dashboard.

**7e — Dashboard.** Parts complete, cards due, quiz accuracy trend, time-in-app, and a readiness estimate for this chapter with the reasoning shown (never a bare number).

**Acceptance:** progress survives a full page reload and a browser restart; the distinguish-must-be-a-table rule fires correctly on a prose answer to "Distinguish between open-ended and closed-ended mutual fund"; exam simulator totals 80 marks.

---

## Phase 8 — Polish and hardening

- Keyboard: `Space` play/pause scene, `←/→` step, `L` Lite mode, `V` voice, `/` search.
- `prefers-reduced-motion`: scenes render final state per step with no tweening.
- Screen readers: every scene has an `aria-label` and its narration text is available as readable prose.
- Print stylesheet: the whole masterclass prints as clean revision notes, scenes replaced by their 2D SVGs.
- Error boundary per scene — a WebGL crash degrades that one scene to Lite, never white-screens the page.
- Lighthouse: Performance ≥ 90 mobile, Accessibility ≥ 95.

---

## Definition of done

1. One `.html` file, opens offline by double-click, 3D and voice and saved progress all working.
2. Every fact traceable to `facts.ts`; nothing invented.
3. Lite mode is a complete revision experience on its own.
4. 30fps floor on a 4× throttled mobile profile.
5. Every 3D scene has a filled-in pedagogy gate comment.
6. A student who works through it can, cold: state the definition, compute NAV, name the five parties, give six differences as a table, name all nine types, list eight benefits, and give the Indian timeline dates.

Criterion 6 is the only one that actually matters. The rest exist to serve it.
