# How to run this in Claude Code

## Step 1 — Set up the folder

```bash
mkdir mf16-3d && cd mf16-3d
mkdir -p legacy src/data
# put the three brief files at the repo root:
#   CLAUDE.md   BUILD-BRIEF.md   KICKOFF.md
# put the facts module at:
#   src/data/facts.ts
# put the current masterclass at:
#   legacy/mutual-fund-ch16-masterclass.html
git init && git add -A && git commit -m "brief + content lock"
claude
```

Commit before you start. Every phase gets its own commit so you can roll back a bad 3D scene without losing the learning engine.

---

## Step 2 — Paste this as your first message

> Read `CLAUDE.md` and `BUILD-BRIEF.md` in full before doing anything. They are the project constitution and the phased spec — treat them as binding.
>
> Context: I'm Kapil, Class XII Commerce under ASSEB/AHSEC in Assam, sitting the Finance board paper in February 2027, targeting 100/100. `legacy/mutual-fund-ch16-masterclass.html` is my current working 2D study app for Chapter 16 (Mutual Fund). It works and I use it. We are rebuilding it as a 3D-enhanced learning application without losing a single feature or fact.
>
> `src/data/facts.ts` is the accuracy firewall — every fact is transcribed from my ASSEB textbook and the arithmetic is already verified. Import from it. Never inline chapter content in a component, never paraphrase a textbook definition, and if you think a fact is wrong, stop and tell me rather than editing it.
>
> The purpose of this app is that I *understand and retain* Chapter 16 well enough to score full marks. 3D is a means, not the goal. Every scene must pass the pedagogy gate in `CLAUDE.md` — if you can't name the specific misconception it fixes and why 3D beats a flat diagram there, build it in 2D instead and tell me why.
>
> I revise on a mid-range Android phone on mobile data. Phone performance and the Lite-mode fallback are hard requirements, not polish.
>
> Start with **Phase 0** only. Before you write code, show me: your read of the phase, the file tree you intend to create, and anything in the brief you think is wrong or under-specified. Then stop and wait for me to say go. After that, one phase per turn — build it, run it, test it, report actual results against the acceptance criteria, commit, and stop.

---

## Step 3 — The rhythm

One phase per turn. At each gate, say `go` or push back. Useful mid-build commands:

| Say this | When |
|---|---|
| `Show me the pedagogy gate comment for this scene before you build it.` | Any new 3D work |
| `Run the build, open it, and tell me what you actually tested.` | Before accepting any "done" |
| `This looks impressive but I didn't learn anything from it. Rework or drop it.` | Whenever a scene is decorative |
| `Check this against facts.ts and quote the source line.` | Any doubt about a fact |
| `Throttle to 4x CPU and a 390px viewport and report the frame rate.` | Every phase after Phase 2 |
| `What did you delete or change that I didn't ask for?` | End of each phase |

---

## Step 4 — Phase order, and where to stop if time runs short

| Phase | What you get | Skippable? |
|---|---|---|
| 0 — Scaffold + content lock | Project boots, facts locked | No |
| 1 — Port 2D to components | Feature parity with today's file | No |
| 2 — 3D engine core | Lazy scenes, step machine, Lite fallback | No |
| 3 — Scene A: Pooling engine | The "what is a mutual fund" scene | No |
| 4 — **Scene B: NAV vessel** | Live sliders + wrong-order toggle | **No — highest value** |
| 5 — Scene C: Open vs Closed corpus | Table rows linked to 3D features | No |
| 6 — Scene D: Risk/Return/Liquidity | 9 types in space + drag quiz | Yes |
| 7 — **Learning engine** | Spaced repetition, answer trainer, exam sim | **No — this is the marks** |
| 8 — Polish | Keyboard, print, a11y, Lighthouse | Yes |

If you only get through Phase 4 and Phase 7, you still have something better than what exists today. If you build 3, 5, 6 and skip 7, you have a demo, not a study tool.

---

## Step 5 — Ship

```bash
npm run build:single   # → dist/index.html, one offline file
```

Rename it `mutual-fund-ch16-3d.html`, put it on your phone, and open it in aeroplane mode to prove it works with no internet. If it doesn't, that is a Phase 0 failure, not a nice-to-have.

---

## Guardrails worth repeating

**The failure mode to watch for is a beautiful app you don't learn from.** 3D has a real cost — load time, battery, attention, and the temptation to watch instead of recall. The brief is written to force every scene to earn its place, but you are the check. If a scene is fun and you can't say what it taught you, kill it.

**The second failure mode is fact drift.** Long refactors are where a paraphrase quietly replaces a textbook definition. That is why `facts.ts` exists and why nothing may inline content. Ask for the source line whenever a definition looks different from your book.

**The third is scope creep away from the exam.** Every feature should be traceable to a mark on the February 2027 paper. Spaced repetition, the answer-structure trainer and the exam simulator are marks. A particle system is not.
