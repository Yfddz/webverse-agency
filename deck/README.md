# XII Command Deck

Private board-prep command centre for the AHSEC / ASSEB Class 12 Commerce boards,
targeting **Board Day 1 on 10 February 2027**.

Lives at `/deck/` on the Webverse domain. It is excluded from `robots.txt` and
carries `noindex`, so it is not part of the public agency site.

---

## What it does

| Surface | What it's for |
|---|---|
| **Deck** | Live clock, board countdown, what to do *right now*, tonight's three deliverables, completion ring, pace forecast, 18-week consistency heatmap, anchor topics, weakest papers |
| **Syllabus** | All 104 chapters across seven papers, four stages each, with weak-point notes and anchor/unfinished/notes filters. Every subject and every group carries a two-layer progress bar: solid = chapters fully cleared, faint = ticks placed |
| **Focus** | The night-slot Pomodoro protocol — 25/5, 25/10, 25/5 — with one concrete deliverable per Pomodoro and a written consolidation step |
| **Sentinel** | The coach: notification scheduling, tone, quiet hours, and the calendar export |
| **Arsenal** | Method doctrine, per-paper trap atlas, exam-hall protocol, weekly operating rules |

Keyboard: `1`–`5` switch views, `f` starts the timer, `⌘K` / `Ctrl+K` / `/` opens
the command palette, `Esc` closes anything open.

---

## The four stages

Every chapter carries four ticks, and the order is the point:

**Study → PYQ → Kill Sheet → Revise**

The kill sheet is built *after* two PYQs, so the past papers decide what belongs
on the page rather than the textbook. Accountancy runs a different ladder —
**Concept → PYQ → Drill → Revise** — because its marks live in your hands, not
your notes.

---

## SENTINEL

The coach reads real state — ticks, logged minutes, streak, days since you last
studied, pace against the countdown — and picks one of six tiers:

`hype` → `steady` → `nudge` → `warn` → `disappoint` → `brutal`

Tone (Gentle / Standard / Brutal) shifts that by a step, but **only when you're
slipping**. On a day you've actually studied, all three tones say the same thing.
A brand-new deck with no history gets a welcome, not a telling-off.

### Getting the nudges to actually reach you

A website can only push notifications on its own under specific conditions. The
honest matrix:

| Delivery | Android / Chrome | iPhone / Safari | Laptop |
|---|---|---|---|
| Deck open in a tab | Works | Works | Works |
| Installed to home screen | Works | Needs install | Works |
| Browser fully closed | Best effort | No | Best effort |
| **Calendar alarms** | **Always** | **Always** | **Always** |

So the reliable path is the last row: **Sentinel → Download calendar alarms**
writes an `.ics` with a recurring alarm at every nudge time plus the weekly
subject rotation, running until Board Day 1. Your phone's own calendar fires
those — no browser, no permission prompt, no battery saver killing it.

Everything else is a bonus on top: in-page nudges while the deck is open,
Web Notifications where permitted, and `periodicsync` in an installed Chrome PWA.

---

## Widgets

- **`widget.html`** — a compact glance view. The countdown, tonight's subject
  and the slot times are derived from the date alone, so they render anywhere,
  including inside an Android widget app's own WebView, which cannot see the
  deck's `localStorage`. Completion, streak, minutes and the live coach line
  appear only when it's opened in the same browser as the deck; without them it
  falls back to a doctrine line. Degrades in stages by tile height.
- **`widget-scriptable.js`** — a *real* iOS home-screen widget. iOS won't let a
  website draw one, so paste this into the free [Scriptable](https://scriptable.app)
  app as a script named `XII Deck` and add a Scriptable widget pointing at it.
  It runs fully offline and derives everything from the date. Tapping it opens
  the deck.

---

## Data

Everything is in `localStorage` on the device. No account, no server, no
tracking, and it works offline after the first load.

- **Export / Import** live in Settings. Export occasionally — it's one JSON file.
- Backups from the **previous deck import cleanly**: progress is keyed on
  `subjectId|groupName|chapterTitle`, and those strings are unchanged.

> ⚠️ Because of that keying, renaming a chapter title, a group name or a subject
> id in `app.js` orphans every tick attached to it. The editable seventh paper
> warns about the same thing in the UI.

---

## Files

```
index.html              app shell + Arsenal long-form content
app.css                 "Reactor" design system
app.js                  syllabus data, state, time engine, coach, all views
sw.js                   offline shell + notifications while the page is closed
manifest.webmanifest    PWA install metadata
widget.html             compact glance view
widget-scriptable.js    iOS home-screen widget (Scriptable)
logo.svg                the mark
icon-*.png              PWA / Apple touch / favicon rasters
```

Icons are generated from the same geometry as `logo.svg` — see the SDF
rasteriser referenced in the PR that introduced them if they ever need redoing
at a new size.

---

## Open question

The seventh paper is a placeholder. ASSEB hasn't published a **General Studies**
syllabus, and the AHSEC subject reference lists **EVS (Environmental Studies)**
in that slot instead. The deck keeps it editable and offers a one-click *Load the
EVS spine* preset. Once the real syllabus lands, rename the units **before**
ticking anything.
