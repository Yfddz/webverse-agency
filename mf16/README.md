# Mutual Fund — Chapter 16, in 3D

ASSEB / AHSEC Class XII Finance, Unit IV, Chapter 16. Four narrated WebGL scenes
added to the working 2D masterclass, with a full flat equivalent for every one
of them.

**The deliverable is one file:** [`dist/mutual-fund-ch16-3d.html`](dist/mutual-fund-ch16-3d.html)
— 622 KB, no network at runtime, opens by double-click in aeroplane mode with
3D, voice and the flat fallback all working.

---

## The four scenes

| Scene | Where | What it fixes |
|---|---|---|
| **A · The pooling engine** | Part 1 | "A mutual fund is a share." Forty unequal contributions become one corpus, the corpus divides into identical units, the AMC spreads it over three kinds of security, returns flow back in proportion. A **Shock one sector −40%** control drops the equity cluster and compares the pool against an undiversified holding. |
| **B · The NAV vessel** | Part 2 | Dividing before subtracting. A transparent vessel fills to the total value, the liabilities lift out of the pool, the remainder slices into equal slabs of units, and a separate per-unit rule reads the NAV. Three live sliders, the three verified presets, and a **Wrong order** toggle that slices the liabilities into every unit and flags the result in `--warn`. |
| **C · Open vs closed corpus** | Part 5 | Swapping the listing row. A closed pool with a lid that seals, a stock-exchange side door and a maturity gate; an open pool that breathes at a permanent AMC counter; an interval pool whose lid opens on a schedule. A timeline scrubber answers "can I buy right now, can I sell right now" for all three, and the six differences rows light the scene both ways — row to feature, feature to row. |
| **D · Risk / return / lock-in** | Part 6 | Nine types held as a flat list. All nine placed in a real three-axis space, each one showing its verbatim textbook definition on tap, a **collapse to the flat map** toggle that reconnects with Fig 6.1, and a scored placement quiz. |

Every scene carries its pedagogy gate as a comment at the top of its source
file, per `brief/CLAUDE.md` RULE 2.

## Running it

```bash
node build.mjs                      # → dist/mutual-fund-ch16-3d.html
node fetch-fonts.mjs                # only when the font set changes (needs network)
node test/drive.mjs                 # drives the built file in a real browser
node test/drive.mjs --shots ./shots # …and writes screenshots of each scene
```

`build.mjs` has no dependencies and never touches the network. `test/drive.mjs`
needs `playwright` and is a development check only — nothing in `dist/` depends
on it.

The URL takes `?3d=on` and `?3d=off` to override the automatic Lite decision,
which is useful for testing.

## Controls

`Space` play/pause the focused scene · `←` `→` step · `L` Lite mode ·
`V` narration · drag to orbit · pinch to zoom · **Recentre** restores the
framing for the current step.

## Lite mode is not a stub

`brief/CLAUDE.md` RULE 4. Lite mode turns itself on without asking when WebGL
is missing, the renderer is software, the device reports four cores or fewer,
or the system asks for reduced motion — and the header toggle overrides that
either way and remembers the choice in `mf16.lite`.

In Lite mode every scene shows a purpose-built SVG, and **the interactions keep
working**: the NAV sliders and the full step-by-step arithmetic, the
diversification shock with its comparison bars, the timeline scrubber with the
buy/sell verdicts, the six-row table linked to the flat diagram, and the nine
types with a separate liquidity strip carrying the axis a flat map has to drop.

## Accuracy

`src/facts.ts` is the accuracy firewall, unchanged from the file Kapil
transcribed. `build.mjs` transforms it mechanically into the runtime object, so
the shipped facts are the same bytes, and then asserts what the exam turns on
before it will emit anything:

```
content lock: 18 checks passed
```

That includes each `navWorked` preset actually computing its expected NAV, six
differences rows each linked to a 3D feature, nine types by yield with real
estate present, eight benefits, the paper pattern totalling 80, and the 1963 Act
sitting alongside the 1964 institution. If any of those drift, the build fails.

Anything not from the textbook — the positions in Scene D, the shock
demonstration in Scene A — renders with a visible `Illustrative` chip.

## Where this departs from the brief

1. **Stack.** The brief specifies Vite + React + `@react-three/fiber`. This is
   built as a ~40 KB hand-written WebGL2 renderer added to the existing
   single-file masterclass instead. The reason is RULE 3 and RULE 8 together:
   the artifact has to be interactive in under 2.5 s on a mid-tier Android over
   mobile data, and three + drei + react is most of a megabyte of parse before
   the first triangle. Building on the working file also means feature parity
   with the 2D masterclass is structural rather than something to re-verify.
2. **"The height of one slab = NAV."** The brief also sets one slab to 1,000
   units, and both cannot be true — a slab of 1,000 units is 1,000 NAVs tall.
   Scene B therefore carries two labelled rules, a pool scale in rupees and a
   per-unit scale in rupees per unit, and only the per-unit height is ever
   called NAV.
3. **500 slabs.** At a phone's stage height that is a quarter of a pixel each.
   The slab count is driven by what is legible and the label always states the
   mapping: *31 slabs · 1 slab = 16,000 units · 5,00,000 units in total*.
4. **Preset A in the original NAV calculator** passed `52000000 / 2000000 /
   5000000` — ten times the worked example printed directly above it, and ten
   times `facts.navWorked`. It still returned ₹10, so nothing looked wrong. It
   now matches the worked example.

## Not built

- **Phase 7, the learning engine** (spaced repetition, answer-structure trainer,
  exam simulator, mistake ledger, dashboard). That is the other half of the
  brief and the half that carries marks; it is not part of "add the 3D".
- **`/` search** from the Phase 8 list — the masterclass has nothing to search
  yet.

## Layout

```
brief/            CLAUDE.md, BUILD-BRIEF.md, KICKOFF.md — the constitution
legacy/           the original 2D masterclass, untouched, for diffing
src/facts.ts      the accuracy firewall
src/page.html     the masterclass with scene mount points and build markers
src/scenes.css    scene styles — tokens only
src/engine/       10-gl · 20-frame · 25-util · 30-A · 40-B · 50-C · 60-D · 90-boot
src/assets/fonts/ latin woff2 subsets, inlined at build time
build.mjs         content lock + assembly → one offline file
test/drive.mjs    42 browser checks
dist/             the file to put on the phone
```
