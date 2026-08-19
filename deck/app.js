/* =============================================================================
   XII COMMAND DECK
   Board-prep command centre for the AHSEC Class 12 Commerce boards.
   No build step, no dependencies, no network. All state lives in localStorage.
   ============================================================================= */
'use strict';

/* =============================================================================
   1. SYLLABUS
   Chapter titles, group names and subject ids are load-bearing: progress is
   keyed on `subjectId|groupName|chapterTitle`, so renaming any of them orphans
   the ticks attached to it. Backups exported by the previous deck import
   cleanly for exactly this reason — don't "tidy" these strings.
   ============================================================================= */
const KILL = { stages: ['S', 'P', 'K', 'R'], names: ['Studied', '2 PYQs done', 'Kill sheet made', 'Revised cold'] };
const DRILL = { stages: ['C', 'P', 'D', 'R'], names: ['Concept clear', 'PYQs solved', 'Speed drill', 'Revised cold'] };

const SUBJECTS = [
  { id: 'acc', name: 'Accountancy', short: 'Acc', mode: DRILL, note: 'Problem practice only — no kill sheets. Marks live in your hands, not your notes.', groups: [
    { g: 'Partnership & Not-for-Profit', ch: [
      { t: 'Not-for-Profit Organisations' }, { t: 'Partnership Fundamentals' }, { t: 'Goodwill — Nature & Valuation' },
      { t: 'Change in Profit-Sharing Ratio' }, { t: 'Admission of a Partner', a: 1 }, { t: 'Retirement / Death of a Partner', a: 1 },
      { t: 'Dissolution of Partnership Firm', a: 1 } ] },
    { g: 'Company Accounts', ch: [
      { t: 'Accounting for Share Capital', a: 1 }, { t: 'Accounting for Debentures', a: 1 },
      { t: 'Financial Statements of a Company (Schedule III)' } ] },
    { g: 'Financial Statement Analysis', ch: [
      { t: 'Comparative & Common-size Statements' }, { t: 'Accounting Ratios', a: 1 }, { t: 'Cash Flow Statement', a: 1 } ] },
    { g: 'Computerised Accounting', ch: [
      { t: 'Computerised Accounting — Overview' }, { t: 'Spreadsheets & Graphs' } ] },
  ] },

  { id: 'bst', name: 'Business Studies', short: 'BSt', mode: KILL, note: 'Point → Explain → Example, every long answer. Headings visible.', groups: [
    { g: 'Part A — Principles & Functions of Management', ch: [
      { t: 'Nature and Significance of Management' }, { t: 'Principles of Management (Fayol + Taylor)', a: 1 },
      { t: 'Business Environment' }, { t: 'Planning' }, { t: 'Organising' }, { t: 'Staffing' }, { t: 'Directing' }, { t: 'Controlling' } ] },
    { g: 'Part B — Business Finance & Marketing', ch: [
      { t: 'Financial Management', a: 1 }, { t: 'Financial Markets', a: 1 }, { t: 'Marketing Management', a: 1 },
      { t: 'Consumer Protection (Act 2019)', a: 1 }, { t: 'Entrepreneurship Development' } ] },
  ] },

  { id: 'eco', name: 'Economics', short: 'Eco', mode: KILL, note: 'Part A is Macro. Part B is Indian Economic Development. Label every diagram.', groups: [
    { g: 'Part A — Introductory Macroeconomics', ch: [
      { t: 'National Income & Related Aggregates', a: 1 }, { t: 'Money and Banking', a: 1 },
      { t: 'Determination of Income and Employment', a: 1 }, { t: 'Government Budget and the Economy' }, { t: 'Balance of Payments' } ] },
    { g: 'Part B — Indian Economic Development', ch: [
      { t: 'Indian Economy on the Eve of Independence' }, { t: 'Indian Economy 1950–1990' },
      { t: 'Liberalisation, Privatisation, Globalisation', a: 1 }, { t: 'Poverty' }, { t: 'Human Capital Formation' },
      { t: 'Rural Development' }, { t: 'Employment — Growth & Informalisation' }, { t: 'Infrastructure' },
      { t: 'Environment & Sustainable Development' }, { t: 'Comparative Development — India / Pakistan / China', a: 1 } ] },
  ] },

  { id: 'fin', name: 'Finance', short: 'Fin', mode: KILL, note: 'A theory paper despite the name. Treat it like Business Studies.', groups: [
    { g: 'Full syllabus', ch: [
      { t: 'Nature and Scope of Finance' }, { t: 'Financial Planning' }, { t: 'Capital Structure' },
      { t: 'Sources of Finance', a: 1 }, { t: 'Cost of Capital' }, { t: 'Capital Budgeting — Basics' },
      { t: 'Working Capital Management' }, { t: 'Financial Institutions (IFCI / IDBI / SFCs / NBFCs)', a: 1 },
      { t: 'Stock Exchanges and SEBI', a: 1 }, { t: 'Mutual Funds' } ] },
  ] },

  { id: 'eng', name: 'English (Core)', short: 'Eng', mode: KILL, note: 'Format is a hard gate. Flamingo + Vistas.', groups: [
    { g: 'Skills', ch: [
      { t: 'Reading Comprehension (unseen passage)' }, { t: 'Grammar' }, { t: 'Notice' }, { t: 'Formal Letter' },
      { t: 'Informal Letter' }, { t: 'Report' }, { t: 'Article' }, { t: 'Advertisement' } ] },
    { g: 'Flamingo — Prose', ch: [
      { t: 'The Last Lesson', a: 1 }, { t: 'Lost Spring' }, { t: 'Deep Water' }, { t: 'The Rattrap' }, { t: 'Indigo', a: 1 },
      { t: 'Poets and Pancakes' }, { t: 'The Interview' }, { t: 'Going Places', a: 1 } ] },
    { g: 'Flamingo — Poetry', ch: [
      { t: 'My Mother at Sixty-six' }, { t: 'An Elementary School Classroom in a Slum' }, { t: 'Keeping Quiet' },
      { t: 'A Thing of Beauty' }, { t: 'A Roadside Stand', a: 1 }, { t: "Aunt Jennifer's Tigers" } ] },
    { g: 'Vistas', ch: [
      { t: 'The Third Level' }, { t: 'The Tiger King', a: 1 }, { t: 'Journey to the End of the Earth' }, { t: 'The Enemy', a: 1 },
      { t: 'Should Wizard Hit Mommy' }, { t: 'On the Face of It' }, { t: 'Evans Tries an O-Level' }, { t: 'Memories of Childhood' } ] },
    { g: 'Assam-specific', ch: [ { t: 'Magh Bihu or Maghar Domahi — P. Goswami', a: 1 } ] },
  ] },

  { id: 'alt', name: 'Alternative English', short: 'AltEng', mode: KILL, note: 'Harmony. Prose 40 · Poetry 30 · Grammar 10 · Comprehension 10 · Essay 10.', groups: [
    { g: 'Prose (40 marks)', ch: [
      { t: 'A Cup of Tea — Katherine Mansfield' }, { t: 'The Voyage — Bhupen Hazarika', a: 1 },
      { t: 'The Verger — W. Somerset Maugham' }, { t: "The Martyr's Corner" }, { t: 'Bina Kutir — S.K. Chaliha', a: 1 } ] },
    { g: 'Poetry (30 marks)', ch: [
      { t: 'Ozymandias of Egypt — Shelley' }, { t: 'Because I Could Not Stop for Death — Dickinson' },
      { t: 'Strange Meeting — Wilfred Owen' }, { t: 'The Solitude of Alexander Selkirk — Cowper' },
      { t: 'The Lake Isle of Innisfree — Yeats' }, { t: 'Night of the Scorpion — Nissim Ezekiel', a: 1 } ] },
    { g: 'Skills (30 marks)', ch: [ { t: 'Grammar' }, { t: 'Comprehension (unseen passage)' }, { t: 'Essay Writing' } ] },
  ] },

  { id: 'gs', name: 'General Studies', short: 'GS', mode: KILL, editable: 1, note: 'PROVISIONAL — no published ASSEB syllabus yet. Rename these before you start ticking.', groups: [
    { g: 'Provisional units — edit these', ch: [
      { t: 'Unit 1 — awaiting syllabus' }, { t: 'Unit 2 — awaiting syllabus' }, { t: 'Unit 3 — awaiting syllabus' },
      { t: 'Unit 4 — awaiting syllabus' }, { t: 'Unit 5 — awaiting syllabus' }, { t: 'Unit 6 — awaiting syllabus' } ] },
  ] },
];

/* The EVS spine, offered as a one-click preset for the editable 7th slot. */
const EVS_PRESET = [
  'Environment and Ecology', 'Environmental Pollution', 'Natural Resources and Conservation',
  'Environmental Issues — Climate Change & Ozone', 'Environmental Laws and Policies (India)', 'Sustainable Development',
];

/* Day rotation. Index = Date#getDay(), so 0 is Sunday. */
const ROTATION = [
  { id: null,  s: 'Weak-area review + rest', d: 'No new chapters. Blank-page the week, redo whatever you got wrong, then actually rest.' },
  { id: 'acc', s: 'Accountancy',             d: 'Three Pomodoros, one problem each. Format first, speed second.' },
  { id: 'bst', s: 'Business Studies',        d: 'One chapter. Point → Explain → Example on every answer you write.' },
  { id: 'eco', s: 'Economics',               d: 'One chapter. If it has a diagram, draw it labelled from memory before you finish.' },
  { id: 'acc', s: 'Accountancy',             d: "Three Pomodoros. Interleave — don't repeat the same problem type back to back." },
  { id: 'eng', s: 'English',                 d: 'One literature chapter or one writing format. Written out full, not skimmed.' },
  { id: 'acc', s: 'Accountancy — full PYQ paper', d: 'Timed. Closed book. Sitting properly. Two minutes per mark, hard stop.' },
];

const RANKS = [
  [0, 'RECRUIT'], [10, 'OPERATOR'], [25, 'TACTICIAN'], [40, 'STRATEGIST'],
  [55, 'VETERAN'], [70, 'ELITE'], [85, 'APEX'], [95, 'NEAR-INVINCIBLE'], [100, 'INVINCIBLE'],
];

/* =============================================================================
   2. SENTINEL — the voice
   Six tiers, picked from real state. `{tokens}` are filled at render time.
   Disappointment is aimed at the behaviour and its consequences, never at him.
   ============================================================================= */
const VOICE = {
  hype: [
    "Logged. {streak} days unbroken — that chain is doing more work than any revision plan.",
    "{mins} minutes down today. That's the version of you that walks into February calm.",
    "Ticked and moving. {left} ticks between you and a finished syllabus.",
    "You showed up again. Most people are still planning to start.",
    "Nothing you tick ever comes back. That is the entire point of ticking it.",
    "Streak at {streak}. Protect it tomorrow — that's the only instruction.",
    "Good session. Now write the three lines before you close the book.",
    "This is what {daysd} out is supposed to look like. Keep the shape.",
    "You beat the version of you that wanted to skip tonight. Again.",
    "Ahead of pace and it isn't luck — it's {streak} days of not negotiating with yourself.",
    "Chapter cleared. That's a slot on the paper you no longer have to be afraid of.",
    "Momentum is expensive to build and cheap to keep. You've built it. Keep it.",
  ],
  steady: [
    "On pace. {need} ticks a week keeps it that way — no heroics needed.",
    "{daysd} to Board Day 1. Nothing's on fire. Don't let that become nothing's moving.",
    "{pct}% done, {left} ticks left. Steady is winning right now.",
    "Today is {subject}. That's the whole decision — the rest is just starting.",
    "You're where you should be. The gap between here and 100% is attendance, not talent.",
    "Anchors are at {anchorPct}%. Those are the near-certain slots — clear them before anything clever.",
    "Nothing dramatic to report. That's a good report at {daysd} out.",
    "The paper doesn't know how you felt while preparing for it. Keep feeding it ticks.",
    "Fine. Now do one more chapter than the plan asked for and bank the buffer.",
  ],
  nudge: [
    "Nothing logged today. It's {clock} — still plenty of runway. {subject} is waiting.",
    "Zero minutes so far. One Pomodoro is a real day. Zero is not.",
    "{subject} tonight. Get the book on the desk now and the starting gets much easier.",
    "You haven't opened anything today. That's fixable in the next twenty-five minutes.",
    "{daysd} left and today is still blank. Start the timer, the mood catches up.",
    "The slot opens at {slot}. Decide now, not at {slot}.",
    "No ticks today. The chapter you keep skipping is the one the paper is built around.",
    "Reading is comfort. Writing is study. Neither has happened yet today.",
    "Still nothing on the board. Twenty-five minutes and you're back in it.",
    "Your streak is at {streak}. Today decides whether it stays a streak.",
  ],
  warn: [
    "It's {clock} and today is still empty. The slot is closing, not opening.",
    "Zero minutes, {daysd} out. This is the kind of evening that quietly costs marks in February.",
    "The night slot is going by while you decide whether to use it. Twenty-five minutes. Floor rule. Go.",
    "Nothing logged and the window is narrowing. Take the floor — one Pomodoro — and stop the day being a write-off.",
    "{streak}-day streak, about to become zero. That's the actual stake tonight.",
    "You're behind on pace and today isn't helping. {need} ticks a week is the number, and it grows every day you skip.",
    "Late, and still blank. A short session now beats the story you'll tell yourself tomorrow.",
    "The slot doesn't extend because you started late. It just gets shorter.",
    "Anchors sitting at {anchorPct}%. Those are guaranteed questions and they're still unfinished.",
  ],
  disappoint: [
    "Yesterday went unlogged. The chain broke — not fatally, but it broke. Restart it today.",
    "{gapd} without a tick. You didn't lose motivation, you lost the habit. Those need different fixes.",
    "The slot came and went with nothing in it. That's a whole evening you don't get back, with {daysd} to go.",
    "You're behind pace now, and the number needed per week has gone up to {need}. It only goes up.",
    "No session again. Nobody's coming to make you do this — that's not despair, that's permission.",
    "The syllabus didn't move today. February did.",
    "Feeling behind isn't information. {pct}% and {left} ticks left is information.",
    "You planned a lot today and finished none of it. Pick one chapter. Just one.",
    "A hard chapter avoided for a week becomes a hard chapter with a week less to fix it.",
    "This is the second night in a row the deck has had nothing to record.",
  ],
  brutal: [
    "{gapd}. Nothing. At {daysd} out that is no longer a slow week — it's a decision you're making by default.",
    "The deck is empty and the countdown isn't. {daysd}. {left} ticks. Do the division yourself.",
    "You set the target at 100% and you haven't opened a book in {gapd}. One of those has to change.",
    "Pace needed has climbed to {need} ticks a week because of days exactly like the last {gapd}.",
    "Nothing logged, streak gone, anchors at {anchorPct}%. This is the part where it either turns or it doesn't.",
    "Your competition isn't more talented. They're just still going. That's the entire gap right now.",
    "You do not rise to the standard. You fall to the format you practised — and lately you haven't practised.",
    "{gapd} off. Not a crisis yet. It becomes one silently, and you won't notice the day it does.",
    "Twenty-five minutes. That's the whole ask. Refusing that is refusing the target.",
    "Stop reading the deck. Open the book.",
  ],
};

/* Shown under the main line — steadier, less reactive. */
const CREED = [
  ['You have power over your mind — not outside events.', 'Marcus Aurelius'],
  ['We suffer more often in imagination than in reality.', 'Seneca'],
  ['First say to yourself what you would be; then do what you have to do.', 'Epictetus'],
  ['It is not that we have a short time to live, but that we waste much of it.', 'Seneca'],
  ['The impediment to action advances action. What stands in the way becomes the way.', 'Marcus Aurelius'],
  ['Difficulties strengthen the mind, as labour does the body.', 'Seneca'],
  ['Confine yourself to the present.', 'Marcus Aurelius'],
  ['No man is free who is not master of himself.', 'Epictetus'],
  ['Talent sets the ceiling. Completion sets the score.', 'Doctrine'],
  ['Every mark you lose to format is a mark you knew and gave away.', 'Doctrine'],
  ['You cannot practise casually and perform formally.', 'Doctrine'],
  ['The examiner rewards the visible answer, not the impressive one.', 'Doctrine'],
  ['A blank answer is the only guaranteed zero on the paper.', 'Doctrine'],
  ['Consistency is just what discipline looks like from far away.', 'Doctrine'],
  ['Do the anchors first. Everything else is optimisation.', 'Doctrine'],
  ['Start the timer. The mood will catch up.', 'Doctrine'],
  ['Two hours today beats eight hours you keep planning for Sunday.', 'Doctrine'],
  ['Confidence is memory of preparation. Build the memory.', 'Doctrine'],
];

const TIERS = ['hype', 'steady', 'nudge', 'warn', 'disappoint', 'brutal'];

/* Shown on a deck with no history at all. Being told off before you have done
   anything is the fastest way to make someone close a study app. */
const FIRST_RUN = 'Deck is live. {daysd} to Board Day 1, {ticks} ticks to place. ' +
                  'Open Syllabus and tick the first thing you already know — the number has to start moving somewhere.';

/* =============================================================================
   3. STATE
   ============================================================================= */
const KEY = 'xii-command-deck-v1';   // unchanged so old backups drop straight in
const DEFAULT_CFG = {
  exam: '2027-02-10',
  slotStart: '20:30',
  slotEnd: '22:45',
  poms: [25, 5, 25, 10, 25, 5],
  nudges: ['07:15', '12:30', '16:30', '19:45', '20:30', '22:50'],
  tone: 'standard',
  alwaysNudge: true,
  quietFrom: '23:30',
  quietTo: '06:30',
  notif: false,
};

let state = {
  prog: {},            // v1: chapterKey -> [0|1 x4]
  notes: {},           // v1: chapterKey -> weak-point text
  streak: { dates: [] },// v1: ISO date strings
  gs: null,            // v1: editable subject chapter titles
  qi: 0,               // v1: creed index
  v: 2,
  log: {},             // 'YYYY-MM-DD' -> { min, poms, subj, consol }
  plan: {},            // 'YYYY-MM-DD' -> [3 deliverable strings]
  cfg: { ...DEFAULT_CFG },
  coach: { history: [], seen: {} },
};

let saveTimer = null;
let view = 'deck';
let curSub = null;
let filters = { anchor: false, todo: false, notes: false };
let openNote = null;
let deferredInstall = null;

/* ---------- helpers ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);
const pad2 = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function fromISO(s) { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function hm2min(s) { const [h, m] = String(s).split(':').map(Number); return (h || 0) * 60 + (m || 0); }
function min2hm(m) { return pad2(Math.floor(m / 60) % 24) + ':' + pad2(m % 60); }
function nowMin(d) { d = d || new Date(); return d.getHours() * 60 + d.getMinutes(); }

/* ---------- storage ---------- */
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
  if (raw) {
    try { merge(JSON.parse(raw)); } catch (e) { console.warn('Saved state was unreadable; starting fresh.', e); }
  }
}
function merge(p) {
  if (!p || typeof p !== 'object') return;
  state.prog = Object.assign({}, p.prog || {});
  state.notes = Object.assign({}, p.notes || {});
  state.streak = { dates: (p.streak && Array.isArray(p.streak.dates)) ? p.streak.dates.slice() : [] };
  state.qi = Number(p.qi) || 0;
  state.log = Object.assign({}, p.log || {});
  state.plan = Object.assign({}, p.plan || {});
  state.cfg = Object.assign({}, DEFAULT_CFG, p.cfg || {});
  if (!Array.isArray(state.cfg.nudges) || !state.cfg.nudges.length) state.cfg.nudges = DEFAULT_CFG.nudges.slice();
  if (!Array.isArray(state.cfg.poms) || state.cfg.poms.length !== 6) state.cfg.poms = DEFAULT_CFG.poms.slice();
  state.coach = Object.assign({ history: [], seen: {} }, p.coach || {});
  if (!Array.isArray(state.coach.history)) state.coach.history = [];
  state.gs = Array.isArray(p.gs) ? p.gs.slice() : null;
  if (state.gs && state.gs.length) {
    const gs = SUBJECTS.find((s) => s.id === 'gs');
    gs.groups[0].ch = state.gs.map((t) => ({ t: String(t) }));
  }
}
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    state.gs = SUBJECTS.find((s) => s.id === 'gs').groups[0].ch.map((c) => c.t);
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      writeSummary();
    } catch (e) {
      toast('Could not save — storage is full or blocked. Export a backup.', 'disappoint');
    }
    pushToWorker();
  }, 300);
}

/**
 * A flat glance-summary for surfaces that shouldn't have to load the whole
 * syllabus to render — widget.html, and anything else bolted on later.
 */
const SUMMARY_KEY = 'xii-deck-summary';
function writeSummary() {
  try {
    const T = totals(), A = anchorStats(), P = pace();
    const say = sentinelSay(false);
    const st = say.st;
    localStorage.setItem(SUMMARY_KEY, JSON.stringify({
      ts: Date.now(),
      pct: T.pct, done: T.done, ticks: T.ticks, full: T.full, n: T.n, left: T.left,
      streak: st.streak, minsToday: st.mins, days: P.dl, exam: state.cfg.exam,
      need: Math.ceil(P.need), paceStatus: P.status, anchorPct: A.pct,
      subject: todayRotation().s, slot: state.cfg.slotStart + '–' + state.cfg.slotEnd,
      tier: say.tier, line: say.text,
    }));
  } catch (e) { /* summary is a convenience, never a requirement */ }
}

/* =============================================================================
   4. STATS
   ============================================================================= */
const chKey = (s, g, c) => s.id + '|' + g.g + '|' + c.t;
const chGet = (s, g, c) => state.prog[chKey(s, g, c)] || [0, 0, 0, 0];

function chToggle(s, g, c, i) {
  const k = chKey(s, g, c);
  const v = (state.prog[k] || [0, 0, 0, 0]).slice();
  v[i] = v[i] ? 0 : 1;
  state.prog[k] = v;
  save();
  return v;
}
function eachChapter(fn) {
  SUBJECTS.forEach((s) => s.groups.forEach((g) => g.ch.forEach((c, i) => fn(s, g, c, i))));
}
function subStats(s) {
  let n = 0, ticks = 0, done = 0, full = 0;
  s.groups.forEach((g) => g.ch.forEach((c) => {
    const v = chGet(s, g, c);
    n++; ticks += 4;
    done += v[0] + v[1] + v[2] + v[3];
    if (v[0] && v[1] && v[2] && v[3]) full++;
  }));
  return {
    n, ticks, done, full,
    pct: ticks ? Math.round((done / ticks) * 100) : 0,      // ticks placed
    cpct: n ? Math.round((full / n) * 100) : 0,             // chapters fully cleared
  };
}

/**
 * Two-layer progress bar. The solid fill is chapters *fully cleared* — the
 * number that actually means a chapter is done — and the faint fill behind it
 * is ticks placed, so partly-worked chapters still show as movement.
 * cpct is always <= tpct, since a cleared chapter contributes all four ticks.
 */
function barHTML(cpct, tpct, cls) {
  return '<div class="bar' + (cls ? ' ' + cls : '') + '">' +
    '<i class="part" style="width:' + clamp(tpct, 0, 100) + '%"></i>' +
    '<i style="width:' + clamp(cpct, 0, 100) + '%"></i></div>';
}
function totals() {
  let n = 0, ticks = 0, done = 0, full = 0;
  SUBJECTS.forEach((s) => { const x = subStats(s); n += x.n; ticks += x.ticks; done += x.done; full += x.full; });
  return { n, ticks, done, full, left: ticks - done, pct: ticks ? Math.round((done / ticks) * 100) : 0 };
}
function anchorStats() {
  let n = 0, full = 0;
  eachChapter((s, g, c) => { if (c.a) { n++; const v = chGet(s, g, c); if (v[0] && v[1] && v[2] && v[3]) full++; } });
  return { n, full, pct: n ? Math.round((full / n) * 100) : 0 };
}
function openAnchors() {
  const out = [];
  eachChapter((s, g, c) => {
    if (!c.a) return;
    const v = chGet(s, g, c);
    if (!(v[0] && v[1] && v[2] && v[3])) out.push({ s, g, c, done: v[0] + v[1] + v[2] + v[3] });
  });
  return out.sort((a, b) => b.done - a.done);
}
function rankFor(pct) {
  let cur = RANKS[0], next = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (pct >= RANKS[i][0]) { cur = RANKS[i]; next = RANKS[i + 1] || null; }
  }
  return { name: cur[1], next: next ? { name: next[1], at: next[0] } : null };
}
const dayLog = (d) => state.log[d || iso()] || { min: 0, poms: 0 };
function minutesInLast(days) {
  let sum = 0;
  for (let i = 0; i < days; i++) sum += (state.log[iso(addDays(new Date(), -i))] || {}).min || 0;
  return sum;
}
function studiedOn(d) { const l = state.log[d]; return !!((l && l.min > 0) || state.streak.dates.includes(d)); }

function streakLen() {
  let n = 0;
  const cur = new Date();
  if (!studiedOn(iso(cur))) cur.setDate(cur.getDate() - 1);
  while (studiedOn(iso(cur))) { n++; cur.setDate(cur.getDate() - 1); }
  return n;
}
function daysSinceStudy() {
  for (let i = 0; i <= 60; i++) if (studiedOn(iso(addDays(new Date(), -i)))) return i;
  return 99;
}
function daysLeft() {
  const ms = fromISO(state.cfg.exam).setHours(9, 0, 0, 0) - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}
function pace() {
  const T = totals(), dl = daysLeft();
  const weeks = Math.max(0.2, dl / 7);
  const perWeek = T.left / weeks;
  const perDay = T.left / Math.max(1, dl);
  const need = perWeek;
  const status = T.left === 0 ? 'done' : need <= 14 ? 'ok' : need <= 26 ? 'tight' : 'behind';
  return { need, perDay, weeks, left: T.left, pct: T.pct, status, dl };
}

/* =============================================================================
   5. TIME ENGINE
   Everything the deck says about "now" comes from here.
   ============================================================================= */
function todayRotation(d) { return ROTATION[(d || new Date()).getDay()]; }
function rotationSubject(d) {
  const r = todayRotation(d);
  return r.id ? SUBJECTS.find((s) => s.id === r.id) : null;
}
function slotBounds() {
  let a = hm2min(state.cfg.slotStart), b = hm2min(state.cfg.slotEnd);
  if (b <= a) b = a + 135;                       // guard against an inverted slot
  return { a, b, len: b - a };
}
/**
 * Where we are in the day, as one block with a headline and a progress figure.
 * Returns { key, title, body, pct, meta, tone }.
 */
function timeBlock() {
  const now = nowMin();
  const { a, b, len } = slotBounds();
  const r = todayRotation();
  const l = dayLog();
  const studied = l.min > 0;
  const subj = r.s;

  const untilSlot = a - now;
  const fmtGap = (m) => (m >= 60 ? Math.floor(m / 60) + 'h ' + (m % 60) + 'm' : m + 'm');

  if (now >= a && now < b) {
    const into = now - a;
    return {
      key: 'slot', tone: studied ? 'hype' : 'warn',
      title: 'Night slot is open — ' + subj,
      body: studied
        ? 'You\'re ' + fmtGap(into) + ' in with ' + l.min + ' minutes logged. Keep the timer running.'
        : 'You\'re ' + fmtGap(into) + ' into the slot with nothing logged. ' + fmtGap(b - now) + ' still on the clock.',
      pct: Math.round((into / len) * 100),
      meta: state.cfg.slotStart + '–' + state.cfg.slotEnd + ' · ' + fmtGap(b - now) + ' left',
    };
  }
  if (untilSlot > 0 && untilSlot <= 210) {
    return {
      key: 'pre', tone: 'nudge',
      title: 'Slot opens in ' + fmtGap(untilSlot),
      body: subj + ' tonight. ' + r.d,
      pct: Math.round(clamp((210 - untilSlot) / 210, 0, 1) * 100),
      meta: 'Opens ' + state.cfg.slotStart + ' · get the book on the desk now',
    };
  }
  if (now >= b && now < 24 * 60) {
    const late = now - b;
    return {
      key: 'post', tone: studied ? 'hype' : 'disappoint',
      title: studied ? 'Slot closed — ' + l.min + ' minutes banked' : 'Slot closed with nothing in it',
      body: studied
        ? 'Write the three consolidation lines if you haven\'t, then shut it down.'
        : 'It closed ' + fmtGap(late) + ' ago. A short session now still counts for today — the floor is one Pomodoro.',
      pct: 100,
      meta: studied ? (l.poms || 0) + ' Pomodoros · ' + l.min + ' min' : '0 minutes today',
    };
  }
  if (now < 300) {
    return {
      key: 'dead', tone: 'steady',
      title: 'Past midnight — go to sleep',
      body: 'Sleep is when today\'s revision actually gets filed. Studying now costs you tomorrow\'s slot.',
      pct: 0, meta: 'Next slot ' + state.cfg.slotStart,
    };
  }
  if (now < 480) {
    return {
      key: 'dawn', tone: 'steady',
      title: 'Early block',
      body: 'Twenty-five minutes before the day starts is free real estate — nothing competes with it yet.',
      pct: 0, meta: 'Night slot ' + state.cfg.slotStart + ' · ' + subj,
    };
  }
  if (now < 840) {
    return {
      key: 'day', tone: 'steady',
      title: 'Day block',
      body: 'Tonight is ' + subj + '. Decide the three deliverables now so the slot starts instantly.',
      pct: 0, meta: 'Slot opens ' + state.cfg.slotStart + ' · in ' + fmtGap(untilSlot),
    };
  }
  return {
    key: 'eve', tone: studied ? 'steady' : 'nudge',
    title: 'Warm-up window',
    body: studied
      ? l.min + ' minutes already logged today. Anything more is buffer.'
      : 'Slot in ' + fmtGap(untilSlot) + '. Clear the desk, close the tabs, put the phone across the room.',
    pct: 0, meta: subj + ' · ' + state.cfg.slotStart,
  };
}

/* =============================================================================
   6. SENTINEL — tier selection + message rendering
   ============================================================================= */
function coachStatus() {
  const T = totals(), P = pace(), A = anchorStats();
  const l = dayLog();
  const gap = daysSinceStudy();
  const { a, b } = slotBounds();
  const now = nowMin();
  return {
    fresh: !T.done && !state.streak.dates.length && !Object.keys(state.log).length,
    studiedToday: l.min > 0 || state.streak.dates.includes(iso()),
    mins: l.min || 0,
    streak: streakLen(),
    gap,
    pct: T.pct, left: T.left, ticks: T.ticks, done: T.done,
    need: Math.ceil(P.need), paceStatus: P.status,
    anchorPct: A.pct, days: P.dl,
    subject: todayRotation().s,
    beforeSlot: now < a, inSlot: now >= a && now < b, afterSlot: now >= b,
    now,
  };
}
function pickTier(st) {
  let tier;
  if (st.studiedToday) tier = st.streak >= 3 ? 'hype' : 'steady';
  else if (st.gap >= 3) tier = 'brutal';
  else if (st.gap === 2) tier = 'disappoint';
  else if (st.afterSlot) tier = 'disappoint';
  else if (st.inSlot || st.now >= hm2min(state.cfg.slotStart) - 120) tier = 'warn';
  else tier = 'nudge';

  // Pace pressure escalates one step; a gentle/brutal preference shifts it too.
  let i = TIERS.indexOf(tier);
  if (!st.studiedToday && st.paceStatus === 'behind') i = Math.min(TIERS.length - 1, i + 1);
  if (state.cfg.tone === 'gentle') i = Math.max(1, i - 1);
  if (state.cfg.tone === 'brutal' && !st.studiedToday) i = Math.min(TIERS.length - 1, i + 1);
  return TIERS[i];
}
function fillTokens(tpl, st) {
  const n = (v, w) => v + ' ' + w + (v === 1 ? '' : 's');
  const map = {
    streak: st.streak, mins: st.mins, left: st.left, pct: st.pct, days: st.days, ticks: st.ticks,
    daysd: n(st.days, 'day'),
    gapd: st.gap === 99 ? 'Days' : n(st.gap, 'day'),
    need: st.need, gap: st.gap === 99 ? 'Many' : st.gap, subject: st.subject,
    anchorPct: st.anchorPct, slot: state.cfg.slotStart,
    clock: pad2(new Date().getHours()) + ':' + pad2(new Date().getMinutes()),
  };
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in map ? String(map[k]) : m));
}
/** Rotate through a tier's lines so the same one doesn't come up twice running. */
function pickLine(tier, advance) {
  const bank = VOICE[tier];
  const seen = state.coach.seen || (state.coach.seen = {});
  let i = Number.isInteger(seen[tier]) ? seen[tier] : Math.floor(Math.random() * bank.length);
  if (advance) i = (i + 1) % bank.length;
  seen[tier] = i;
  return bank[i % bank.length];
}
function sentinelSay(advance) {
  const st = coachStatus();
  if (st.fresh) return { tier: 'steady', text: fillTokens(FIRST_RUN, st), st };
  const tier = pickTier(st);
  return { tier, text: fillTokens(pickLine(tier, advance), st), st };
}

/**
 * What SENTINEL would say on a day you skipped — which is the only situation
 * the tone setting actually changes. The live line is useless as a tone
 * preview when you are on track, because every tone says the same thing.
 */
function tonePreview(advance) {
  const st = Object.assign(coachStatus(), {
    fresh: false, studiedToday: false, mins: 0, gap: 1,
    beforeSlot: false, inSlot: false, afterSlot: true,
  });
  const tier = pickTier(st);
  return { tier, text: fillTokens(pickLine(tier, advance), st) };
}
function logTransmission(tier, text, channel) {
  state.coach.history.unshift({ ts: Date.now(), tier, text, channel: channel || 'deck' });
  state.coach.history = state.coach.history.slice(0, 40);
  save();
}

/* =============================================================================
   7. TONIGHT'S PLAN
   Three concrete deliverables, generated from the next unticked stage of the
   first unfinished chapters in today's rotation subject.
   ============================================================================= */
function nextStageLabel(sub, v) {
  for (let i = 0; i < 4; i++) if (!v[i]) return sub.mode.names[i];
  return null;
}
function generatePlan(d) {
  const date = d || new Date();
  let sub = rotationSubject(date);
  if (!sub) {                                   // Sunday: review the weakest paper
    sub = SUBJECTS.slice().sort((a, b) => subStats(a).pct - subStats(b).pct)[0];
  }
  const out = [];
  sub.groups.forEach((g) => g.ch.forEach((c) => {
    if (out.length >= 3) return;
    const v = chGet(sub, g, c);
    const stage = nextStageLabel(sub, v);
    if (stage) out.push(stage + ' — ' + c.t);
  }));
  while (out.length < 3) out.push('Free Pomodoro — pick the thing you keep avoiding');
  return out;
}
function planFor(d) {
  const k = iso(d || new Date());
  if (!state.plan[k] || !Array.isArray(state.plan[k]) || state.plan[k].length !== 3) {
    state.plan[k] = generatePlan(d);
    save();
  }
  return state.plan[k];
}

/* =============================================================================
   8. RENDER — DECK
   ============================================================================= */
function renderClock() {
  const d = new Date();
  const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  $('#tb-time').innerHTML = h12 + ':' + pad2(m) + '<span class="s">:' + pad2(s) + ' ' + ampm + '</span>';
  $('#tb-date').textContent = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });

  const dl = daysLeft();
  const exam = fromISO(state.cfg.exam); exam.setHours(9, 0, 0, 0);
  const ms = exam - d;
  if (ms > 0 && dl <= 2) {
    const hh = Math.floor(ms / 3600000), mm = Math.floor((ms % 3600000) / 60000);
    $('#tb-tminus').innerHTML = 'T–<b>' + hh + 'h ' + pad2(mm) + 'm</b>';
  } else {
    $('#tb-tminus').innerHTML = 'T–<b>' + dl + '</b> days';
  }
}

function renderSentinel(advance) {
  const { tier, text, st } = sentinelSay(advance);
  const el = $('#sentinel');
  el.dataset.tone = tier;
  $('#sent-msg').textContent = text;
  const creed = CREED[state.qi % CREED.length];
  $('#sent-why').innerHTML = '<em style="color:var(--ink-3);font-style:normal">“' + esc(creed[0]) + '” — ' + esc(creed[1]) + '</em>';
  const label = { hype: 'On it', steady: 'Steady', nudge: 'Waiting', warn: 'Slipping', disappoint: 'Behind', brutal: 'Critical' }[tier];
  const cls = { hype: 'ok', steady: 'info', nudge: 'info', warn: 'warn', disappoint: 'bad', brutal: 'bad' }[tier];
  const p = $('#sent-state'); p.className = 'pill ' + cls; p.textContent = label;
  if (advance) { state.qi = (state.qi + 1) % CREED.length; logTransmission(tier, text, 'deck'); }
  return { tier, text, st };
}

function renderNow() {
  const b = timeBlock();
  const card = $('#now-card');
  card.dataset.tone = b.tone;
  $('#now-title').textContent = b.title;
  $('#now-body').textContent = b.body;
  $('#now-bar').style.width = clamp(b.pct, 0, 100) + '%';
  $('#now-meta').textContent = b.meta;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  $('#now-next').innerHTML = [1, 2, 3].map((n) => {
    const d = addDays(new Date(), n);
    const r = todayRotation(d);
    return '<div class="u"><div class="ud">' + (n === 1 ? 'Tomorrow' : days[d.getDay()]) + '</div>' +
           '<div class="un">' + esc(r.s.replace(' — full PYQ paper', ' PYQ')) + '</div></div>';
  }).join('');
}

function renderMission() {
  const r = todayRotation();
  const sub = rotationSubject();
  $('#mission-subj').textContent = r.s;
  $('#mission-slot').textContent = state.cfg.slotStart + '–' + state.cfg.slotEnd + ' · ' + (sub ? subStats(sub).pct + '% cleared' : 'review + rest');
  const plan = planFor();
  const l = dayLog();
  $('#mission-plan').innerHTML = plan.map((p, i) =>
    '<div class="planrow' + (i < (l.poms || 0) ? ' did' : '') + '">' +
      '<div class="pn">' + (i + 1) + '</div><div class="pt">' + esc(p) + '</div>' +
      '<div class="pd">25m</div></div>').join('');
}

function renderStats() {
  const T = totals(), A = anchorStats(), P = pace();
  const streak = streakLen();
  const l = dayLog();

  $('#st-pct').innerHTML = T.pct + '<small>%</small>';
  $('#st-pct-sub').textContent = T.done + ' of ' + T.ticks + ' ticks';
  $('#st-streak').innerHTML = streak + '<small>d</small>';
  $('#st-streak-sub').textContent = l.min > 0 ? l.min + ' min logged today' : (streak ? 'Today not logged yet' : 'Start one tonight');
  const wk = minutesInLast(7);
  $('#st-week').innerHTML = (wk >= 120 ? (wk / 60).toFixed(1) : wk) + '<small>' + (wk >= 120 ? 'h' : 'm') + '</small>';
  $('#st-week-sub').textContent = 'Last 7 days';
  $('#st-ch').textContent = T.full;
  $('#st-ch-sub').textContent = 'of ' + T.n + ' chapters';

  const C = 2 * Math.PI * 51;
  $('#ring-fill').style.strokeDasharray = C.toFixed(1);
  $('#ring-fill').style.strokeDashoffset = (C * (1 - T.pct / 100)).toFixed(1);
  $('#ring-pct').textContent = T.pct + '%';
  const rk = rankFor(T.pct);
  $('#rank-name').textContent = rk.name;
  $('#rank-next').textContent = rk.next ? (rk.next.at - T.pct) + '% to ' + rk.next.name : 'Top rank held';
  $('#rank-bar').style.width = T.pct + '%';
  $('#ring-ticks').textContent = T.left + ' ticks remaining';

  const pill = { done: ['ok', 'Syllabus complete'], ok: ['ok', 'On pace'], tight: ['warn', 'Tight'], behind: ['bad', 'Behind — push'] }[P.status];
  $('#pace-pill').innerHTML = '<span class="pill ' + pill[0] + '">' + pill[1] + '</span>';
  if (P.status === 'done') {
    $('#pace-line').textContent = 'Everything is ticked. From here it is mocks and maintenance only.';
    $('#pace-sub').textContent = '';
    $('#pace-bar').style.width = '100%';
  } else {
    // Projected finish, using the last 30 days of actual ticking as the rate.
    const rate = recentTickRate();
    let proj = 'not enough history yet';
    if (rate > 0) {
      const daysNeeded = Math.ceil(P.left / rate);
      const finish = addDays(new Date(), daysNeeded);
      proj = finish.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
             (daysNeeded > P.dl ? ' — after the boards' : ' — with ' + (P.dl - daysNeeded) + ' days spare');
    }
    $('#pace-line').innerHTML =
      '<b style="color:var(--ink)">' + Math.ceil(P.need) + '</b> ticks/week needed &nbsp;·&nbsp; ' + P.perDay.toFixed(1) + '/day<br>' +
      P.left + ' ticks left over ' + P.dl + ' days<br>' +
      '<span style="color:var(--ink-3)">At your current rate: ' + esc(proj) + '</span>';
    $('#pace-bar').style.width = clamp(T.pct, 0, 100) + '%';
    $('#pace-sub').textContent = 'Board Day 1 · ' + fromISO(state.cfg.exam).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  $('#anchor-bar').style.width = A.pct + '%';
  $('#anchor-txt').textContent = A.full + ' / ' + A.n + ' — ' + A.pct + '%';
  $('#anchor-count').textContent = A.n + ' anchors across seven papers.';

  $('#nav-syl').textContent = T.pct + '%';
  $('#nav-foc').textContent = (l.min || 0) + 'm';
}

/** Ticks per day over the last 30 days, inferred from logged study days. */
function recentTickRate() {
  const T = totals();
  if (!T.done) return 0;
  const marks = Object.keys(state.log)
    .filter((d) => (state.log[d].min || 0) > 0)
    .concat(state.streak.dates);
  if (!marks.length) return 0;
  const first = marks.reduce((a, b) => (a < b ? a : b));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const span = Math.round((today - fromISO(first)) / 86400000) + 1;
  if (span < 5) return 0;                       // too little history to project from
  return T.done / span;
}

function renderHeat() {
  const WEEKS = 18, today = new Date();
  const end = new Date(today); end.setHours(0, 0, 0, 0);
  const start = addDays(end, -(WEEKS * 7 - 1));
  start.setDate(start.getDate() - start.getDay());          // back up to a Sunday
  let html = '', total = 0, days = 0;
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const k = iso(d);
    const mins = (state.log[k] || {}).min || (state.streak.dates.includes(k) ? 25 : 0);
    const lvl = mins === 0 ? 0 : mins < 30 ? 1 : mins < 60 ? 2 : mins < 120 ? 3 : 4;
    if (mins > 0) { total += mins; days++; }
    html += '<i data-l="' + lvl + '"' + (k === iso(today) ? ' data-today="1"' : '') +
            ' title="' + k + ' · ' + mins + ' min"></i>';
  }
  $('#heat').innerHTML = html;
  $('#heat-sum').textContent = days + ' active days · ' + (total / 60).toFixed(1) + 'h total';
}

function renderWeak() {
  const ranked = SUBJECTS.map((s) => ({ s, x: subStats(s) })).sort((a, b) => a.x.pct - b.x.pct).slice(0, 3);
  $('#weak-grid').innerHTML = ranked.map(({ s, x }) =>
    '<button class="subcard" data-open-sub="' + s.id + '">' +
      '<div class="nm">' + esc(s.name) + '</div>' +
      '<div class="mt">' + x.full + ' of ' + x.n + ' chapters cleared</div>' +
      '<div class="pctrow"><span class="pv">' + x.cpct + '%</span>' +
        '<span class="pc">' + (x.ticks - x.done) + ' ticks left</span></div>' +
      barHTML(x.cpct, x.pct, 'thin') +
    '</button>').join('');
}

function renderDeck() {
  renderClock(); renderSentinel(false); renderNow(); renderMission();
  renderStats(); renderHeat(); renderWeak();
}

/* =============================================================================
   9. RENDER — SYLLABUS
   ============================================================================= */
function renderSyllabusIndex() {
  const T = totals();
  $('#syl-total').textContent = T.n;
  $('#syl-cards').innerHTML = SUBJECTS.map((s) => {
    const x = subStats(s);
    return '<button class="subcard" data-open-sub="' + s.id + '">' +
      '<div class="nm">' + esc(s.name) + '</div>' +
      '<div class="mt">' + x.n + ' chapters · ' + s.mode.stages.join(' / ') + '</div>' +
      '<div class="pctrow"><span class="pv">' + x.cpct + '%</span>' +
        '<span class="pc">' + x.full + ' / ' + x.n + ' chapters</span></div>' +
      barHTML(x.cpct, x.pct, 'thin') +
      '<div class="barnote">' + x.pct + '% of ticks placed</div>' +
    '</button>';
  }).join('');
}

function openSubject(id) {
  curSub = SUBJECTS.find((s) => s.id === id);
  if (!curSub) return;
  go('syllabus');
  $('#syl-index').hidden = true;
  $('#syl-detail').hidden = false;
  filters = { anchor: false, todo: false, notes: false };
  openNote = null;
  $$('[data-filt]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  $('#sd-title').innerHTML = esc(curSub.name).replace(/^(\S+)/, '<em>$1</em>');
  $('#sd-note').textContent = curSub.note;
  $('#sd-kicker').textContent = subStats(curSub).n + ' chapters · four stages each';
  $('#sd-key').innerHTML = curSub.mode.stages
    .map((st, i) => '<b style="color:var(--cyan)">' + st + '</b> ' + curSub.mode.names[i]).join(' &nbsp;·&nbsp; ') +
    ' &nbsp;·&nbsp; <b style="color:var(--amber)">★</b> anchor topic';
  renderRows();
  window.scrollTo(0, 0);
}

function renderRows() {
  const s = curSub;
  if (!s) return;
  const x = subStats(s);
  $('#sd-pct').textContent = x.cpct + '%';
  $('#sd-barwrap').innerHTML = barHTML(x.cpct, x.pct);
  $('#sd-count').textContent = x.full + ' / ' + x.n + ' chapters cleared · ' + x.done + '/' + x.ticks + ' ticks';

  let n = 0, html = '';
  s.groups.forEach((g, gi) => {
    let rows = '', gDone = 0, gTot = 0, gTicks = 0;
    g.ch.forEach((c, ci) => {
      n++;
      const v = chGet(s, g, c);
      const done = v[0] && v[1] && v[2] && v[3];
      const key = chKey(s, g, c);
      const note = (state.notes[key] || '').trim();
      gTot++; if (done) gDone++;
      gTicks += v[0] + v[1] + v[2] + v[3];
      if (filters.anchor && !c.a) return;
      if (filters.todo && done) return;
      if (filters.notes && !note) return;
      const nid = gi + '.' + ci;
      rows += '<div class="chrow' + (done ? ' done' : '') + '">' +
        '<div class="n">' + n + '</div>' +
        '<div class="ct">' + esc(c.t) + (c.a ? '<span class="anchor">★</span>' : '') +
          (note && openNote !== nid ? '<span class="nb">⚠ ' + esc(note) + '</span>' : '') + '</div>' +
        '<div class="stages">' + s.mode.stages.map((st, i) =>
          '<button class="stg' + (i === 3 ? ' fin' : '') + '" aria-pressed="' + (v[i] ? 'true' : 'false') +
          '" data-g="' + gi + '" data-c="' + ci + '" data-i="' + i + '" title="' + esc(s.mode.names[i]) + '">' + st + '</button>').join('') +
        '</div>' +
        '<button class="rowbtn' + (note ? ' has' : '') + '" data-note="' + nid + '" title="Weak point" aria-label="Weak point note"><svg><use href="#i-note"/></svg></button>' +
        (s.editable ? '<button class="rowbtn" data-del="' + gi + '.' + ci + '" title="Delete unit" aria-label="Delete unit"><svg><use href="#i-trash"/></svg></button>' : '') +
      '</div>' +
      (openNote === nid
        ? '<div class="noteedit"><div class="nl">⚠ Your weak point — this goes straight onto the kill sheet</div>' +
          '<textarea class="inp" data-nk="' + esc(key) + '" placeholder="What keeps catching you out here?">' + esc(state.notes[key] || '') + '</textarea></div>'
        : '');
    });
    if (rows) {
      const gc = gTot ? Math.round((gDone / gTot) * 100) : 0;
      const gt = gTot ? Math.round((gTicks / (gTot * 4)) * 100) : 0;
      html += '<div class="grp"><span>' + esc(g.g) + '</span>' +
              '<b>' + gDone + ' / ' + gTot + ' chapters</b></div>' +
              barHTML(gc, gt, 'thin grpbar') + rows;
    }
  });
  $('#sd-rows').innerHTML = html || '<p class="dim" style="padding:26px 0;text-align:center">Nothing matches those filters.</p>';
  renderEditor();
}

function renderEditor() {
  const box = $('#sd-editor');
  if (!curSub || !curSub.editable) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML =
    '<div class="callout" style="margin-top:22px"><div class="co-lab">◆ This subject is editable</div>' +
    '<p>There is no published ASSEB syllabus for this paper yet, so these units are placeholders. Ticks attach to the unit <em>name</em>, so rename before you start ticking or the progress orphans.</p></div>' +
    '<div class="btnrow" style="margin-bottom:12px"><button class="btn ghost sm" data-act="load-evs">Load the EVS spine instead</button></div>' +
    '<div class="btnrow"><input class="inp" id="unit-new" placeholder="Add a real unit name…" maxlength="90" style="flex:1;min-width:190px">' +
    '<button class="btn prime" data-act="add-unit"><svg><use href="#i-plus"/></svg>Add</button></div>';
}

/* =============================================================================
   10. FOCUS — Pomodoro engine
   Phases alternate focus/break using cfg.poms = [25,5,25,10,25,5].
   ============================================================================= */
const focus = { phase: 0, left: 0, running: false, tick: null, startedAt: 0 };

const phaseIsBreak = (i) => i % 2 === 1;
const phaseMins = (i) => state.cfg.poms[i] || 25;
const pomIndex = (i) => Math.floor(i / 2);

function focusReset(phase) {
  focus.phase = phase || 0;
  focus.left = phaseMins(focus.phase) * 60;
  focus.running = false;
  clearInterval(focus.tick);
  renderFocus();
}
function focusToggle() {
  if (focus.running) {
    focus.running = false;
    clearInterval(focus.tick);
  } else {
    if (focus.left <= 0) focus.left = phaseMins(focus.phase) * 60;
    focus.running = true;
    focus.startedAt = Date.now();
    focus.tick = setInterval(() => {
      focus.left--;
      if (focus.left <= 0) focusComplete();
      renderFocusDial();
    }, 1000);
  }
  renderFocus();
}
function focusComplete() {
  clearInterval(focus.tick);
  focus.running = false;
  const wasFocus = !phaseIsBreak(focus.phase);
  const mins = phaseMins(focus.phase);
  if (wasFocus) {
    logMinutes(mins, 1);
    const n = pomIndex(focus.phase) + 1;
    ping();
    notify('Pomodoro ' + n + ' done', mins + ' minutes banked. Take the break — properly, away from the screen.', 'hype');
    toast('Pomodoro ' + n + ' complete · ' + mins + ' min logged', 'hype');
  } else {
    ping();
    notify('Break over', 'Back to it. ' + (planFor()[pomIndex(focus.phase + 1)] || 'Next deliverable.'), 'nudge');
  }
  if (focus.phase < state.cfg.poms.length - 1) {
    focusReset(focus.phase + 1);
  } else {
    focusReset(0);
    toast('Full night protocol complete. Write the three lines.', 'hype');
  }
  renderDeck();
}
function focusSkip() {
  clearInterval(focus.tick);
  focus.running = false;
  focusReset(focus.phase < state.cfg.poms.length - 1 ? focus.phase + 1 : 0);
}
function logMinutes(mins, poms) {
  const k = iso();
  const l = state.log[k] || { min: 0, poms: 0 };
  l.min = (l.min || 0) + mins;
  l.poms = (l.poms || 0) + (poms || 0);
  l.subj = todayRotation().s;
  state.log[k] = l;
  if (!state.streak.dates.includes(k)) state.streak.dates.push(k);
  save();
}

function renderFocusDial() {
  const total = phaseMins(focus.phase) * 60;
  const frac = clamp(focus.left / total, 0, 1);
  const C = 2 * Math.PI * 52;
  const fill = $('#dial-fill');
  fill.style.strokeDasharray = C.toFixed(1);
  fill.style.strokeDashoffset = (C * (1 - frac)).toFixed(1);
  const m = Math.floor(focus.left / 60), s = focus.left % 60;
  $('#dial-time').textContent = pad2(m) + ':' + pad2(s);
  document.title = focus.running ? pad2(m) + ':' + pad2(s) + ' · ' + (phaseIsBreak(focus.phase) ? 'Break' : 'Focus') : 'XII Command Deck';
}
function renderFocus() {
  const brk = phaseIsBreak(focus.phase);
  $('#dial').classList.toggle('brk', brk);
  $('#dial-phase').textContent = brk ? 'Break ' + pomIndex(focus.phase + 1) : 'Pomodoro ' + (pomIndex(focus.phase) + 1);
  const plan = planFor();
  $('#dial-task').textContent = brk ? 'Stand up. Leave the screen.' : (plan[pomIndex(focus.phase)] || 'Pick a deliverable');
  $('#f-toggle').innerHTML = focus.running
    ? '<svg><use href="#i-pause"/></svg>Pause'
    : '<svg><use href="#i-play"/></svg>' + (focus.left < phaseMins(focus.phase) * 60 ? 'Resume' : 'Start');
  renderFocusDial();

  const nPoms = state.cfg.poms.filter((_, i) => !phaseIsBreak(i)).length;
  const doneP = dayLog().poms || 0;
  let dots = '';
  for (let i = 0; i < nPoms; i++) {
    dots += '<i class="' + (i < doneP ? 'on' : '') + (i === pomIndex(focus.phase) && !brk ? ' now' : '') + '"></i>';
  }
  $('#pomdots').innerHTML = dots;

  $('#focus-plan').innerHTML = plan.map((p, i) =>
    '<div class="planrow' + (i < doneP ? ' did' : (i === pomIndex(focus.phase) ? ' active' : '')) + '">' +
      '<div class="pn">' + (i + 1) + '</div><div class="pt">' + esc(p) + '</div><div class="pd">' +
      phaseMins(i * 2) + 'm</div></div>').join('');

  const l = dayLog();
  const rows = [];
  if (l.min) rows.push('<div class="logitem"><span class="lt">Today</span><span>' + (l.poms || 0) + ' Pomodoros · ' + esc(l.subj || '') + '</span><span class="lm">' + l.min + 'm</span></div>');
  for (let i = 1; i <= 6; i++) {
    const k = iso(addDays(new Date(), -i));
    const d = state.log[k];
    if (d && d.min) {
      rows.push('<div class="logitem"><span class="lt">' + fromISO(k).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }) +
        '</span><span>' + (d.poms || 0) + ' Pomodoros · ' + esc(d.subj || '') + '</span><span class="lm">' + d.min + 'm</span></div>');
    }
  }
  $('#focus-log').innerHTML = rows.join('') || '<p class="dimmer" style="font-size:13px">Nothing logged in the last week.</p>';
  $('#consolidate').value = (l.consol || '');
}

/** Short two-tone chime via WebAudio — no asset to load or fail. */
function ping() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.start(t); o.stop(t + 0.34);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch (e) { /* audio blocked until first gesture — not worth reporting */ }
}

/* =============================================================================
   11. NOTIFICATIONS + SERVICE WORKER
   ============================================================================= */
let swReg = null;

function canNotify() { return 'Notification' in window && Notification.permission === 'granted'; }
function inQuietHours(d) {
  const n = nowMin(d), from = hm2min(state.cfg.quietFrom), to = hm2min(state.cfg.quietTo);
  return from > to ? (n >= from || n < to) : (n >= from && n < to);
}
function notify(title, body, tier) {
  logTransmission(tier || 'steady', body, 'push');
  if (!canNotify() || inQuietHours()) return;
  const opts = {
    body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'sentinel',
    renotify: true, data: { url: location.pathname },
  };
  try {
    if (swReg && swReg.showNotification) swReg.showNotification(title, opts);
    else new Notification(title, opts);
  } catch (e) { /* some browsers reject direct construction; SW path covers it */ }
}
async function requestPerm() {
  if (!('Notification' in window)) {
    toast('This browser has no notification support. Use the calendar export instead.', 'warn');
    return;
  }
  const res = await Notification.requestPermission();
  state.cfg.notif = res === 'granted';
  save();
  renderCoach();
  if (res === 'granted') {
    notify('SENTINEL online', 'Nudges armed. Next check-in at ' + nextNudgeTime() + '.', 'steady');
    toast('SENTINEL armed', 'hype');
    registerPeriodicSync();
  } else {
    toast('Permission denied — the calendar export still works everywhere.', 'warn');
  }
}
function nextNudgeTime() {
  const n = nowMin();
  const list = state.cfg.nudges.map(hm2min).sort((a, b) => a - b);
  const nxt = list.find((t) => t > n);
  return nxt != null ? min2hm(nxt) : min2hm(list[0]) + ' tomorrow';
}

/* Page-side scheduler: fires while the deck is open in any tab. */
let nudgeTimers = [];
function scheduleNudges() {
  nudgeTimers.forEach(clearTimeout);
  nudgeTimers = [];
  const now = new Date();
  state.cfg.nudges.forEach((hhmm) => {
    const t = new Date(now); const [h, m] = hhmm.split(':').map(Number);
    t.setHours(h, m, 0, 0);
    let delay = t - now;
    if (delay < 0) delay += 86400000;            // roll to tomorrow
    if (delay > 6 * 3600000) return;             // only arm the next six hours
    nudgeTimers.push(setTimeout(() => { fireNudge(); scheduleNudges(); }, delay));
  });
}
function fireNudge() {
  const st = coachStatus();
  if (st.studiedToday && !state.cfg.alwaysNudge) return;
  if (inQuietHours()) return;
  const { tier, text } = sentinelSay(true);
  const title = { hype: 'Good.', steady: 'Check-in', nudge: 'Nothing logged yet', warn: 'The slot is closing', disappoint: 'Day missed', brutal: 'This has gone on long enough' }[tier];
  notify(title, text, tier);
}

async function initSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    swReg = await navigator.serviceWorker.register('sw.js');
    pushToWorker();
  } catch (e) { console.warn('Service worker registration failed', e); }
}
/** Give the worker a snapshot it can build a notification from while we're closed. */
function pushToWorker() {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
  try {
    const st = coachStatus();
    const tier = pickTier(st);
    navigator.serviceWorker.controller.postMessage({
      type: 'snapshot',
      payload: {
        tier,
        line: fillTokens(VOICE[tier][0], st),
        quiet: [state.cfg.quietFrom, state.cfg.quietTo],
        nudges: state.cfg.nudges,
        alwaysNudge: state.cfg.alwaysNudge,
        studiedToday: st.studiedToday,
        ts: Date.now(),
      },
    });
  } catch (e) { /* snapshot is best-effort */ }
}
async function registerPeriodicSync() {
  try {
    if (!swReg || !('periodicSync' in swReg)) return;
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (status.state !== 'granted') return;
    await swReg.periodicSync.register('sentinel-check', { minInterval: 4 * 60 * 60 * 1000 });
  } catch (e) { /* unsupported outside installed Chrome PWAs */ }
}

/* =============================================================================
   12. CALENDAR EXPORT — the delivery path that works on every phone
   ============================================================================= */
function icsEscape(s) { return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
function icsStamp(d) {
  return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' +
         pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + '00Z';
}
function buildICS() {
  const exam = fromISO(state.cfg.exam);
  const until = icsStamp(new Date(exam.getTime() + 86400000));
  const L = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//XII Command Deck//SENTINEL//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:XII Command Deck — SENTINEL',
  ];
  const start = new Date(); start.setSeconds(0, 0);
  let uid = 0;

  // Daily check-ins at each nudge time, each carrying a line from the bank.
  state.cfg.nudges.forEach((hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(start); d.setHours(h, m, 0, 0);
    if (d < start) d.setDate(d.getDate() + 1);
    const isSlot = hhmm === state.cfg.slotStart;
    // Only lines with no {tokens} — a calendar entry is written once and read
    // months later, so anything interpolated from today's state would be a lie.
    const bank = (isSlot ? VOICE.warn : VOICE.nudge).filter((l) => l.indexOf('{') === -1);
    const line = bank[uid % bank.length];
    L.push(
      'BEGIN:VEVENT',
      'UID:sentinel-' + (uid++) + '-' + hhmm.replace(':', '') + '@xii-deck',
      'DTSTAMP:' + icsStamp(new Date()),
      'DTSTART:' + icsStamp(d),
      'DURATION:PT10M',
      'RRULE:FREQ=DAILY;UNTIL=' + until,
      'SUMMARY:' + icsEscape(isSlot ? '▶ Night slot opens — start the timer' : 'SENTINEL check-in'),
      'DESCRIPTION:' + icsEscape(line),
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEscape(isSlot ? 'Night slot. One Pomodoro is the floor.' : line),
      'END:VALARM', 'END:VEVENT'
    );
  });

  // The weekly rotation, so the calendar itself names the subject each night.
  const { a, b } = slotBounds();
  const DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  ROTATION.forEach((r, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + ((i - d.getDay() + 7) % 7));
    d.setHours(Math.floor(a / 60), a % 60, 0, 0);
    L.push(
      'BEGIN:VEVENT',
      'UID:rotation-' + i + '@xii-deck',
      'DTSTAMP:' + icsStamp(new Date()),
      'DTSTART:' + icsStamp(d),
      'DURATION:PT' + (b - a) + 'M',
      'RRULE:FREQ=WEEKLY;BYDAY=' + DAYS[i] + ';UNTIL=' + until,
      'SUMMARY:' + icsEscape('XII · ' + r.s),
      'DESCRIPTION:' + icsEscape(r.d),
      'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEscape(r.s + ' in 10 minutes. Book on the desk.'),
      'END:VALARM', 'END:VEVENT'
    );
  });

  L.push('END:VCALENDAR');
  return L.join('\r\n');
}
function download(name, text, mime) {
  const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* =============================================================================
   13. RENDER — SENTINEL view
   ============================================================================= */
function renderCoach() {
  const granted = ('Notification' in window) && Notification.permission === 'granted';
  const denied = ('Notification' in window) && Notification.permission === 'denied';
  const btn = $('#perm-btn');
  btn.className = 'btn sm' + (granted ? ' ok' : '');
  btn.innerHTML = '<svg><use href="#i-bell"/></svg>' + (granted ? 'Armed' : denied ? 'Blocked' : 'Enable');
  btn.disabled = granted || denied;
  $('#perm-note').textContent = granted
    ? 'Armed. Next check-in at ' + nextNudgeTime() + '. Nothing leaves this device.'
    : denied
      ? 'Blocked in browser settings. Unblock notifications for this site, or use the calendar export below.'
      : 'Browser permission required. Nothing leaves this device — it all runs locally.';

  $('#tg-always').setAttribute('aria-checked', state.cfg.alwaysNudge ? 'true' : 'false');
  $('#quiet-from').value = state.cfg.quietFrom;
  $('#quiet-to').value = state.cfg.quietTo;
  $$('#tone-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.toneSet === state.cfg.tone)));

  $('#tone-preview').textContent = tonePreview(false).text;

  $('#nudge-times').innerHTML = state.cfg.nudges.slice().sort().map((t) =>
    '<span class="timechip">' + t + (t === state.cfg.slotStart ? ' <span style="color:var(--cyan)">▶ slot</span>' : '') +
    '<button data-del-nudge="' + t + '" aria-label="Remove ' + t + '">×</button></span>').join('');

  const h = state.coach.history;
  $('#coach-history').innerHTML = h.length
    ? h.slice(0, 12).map((e) => {
        const d = new Date(e.ts);
        return '<div class="logitem"><span class="lt">' +
          d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) +
          '</span><span style="flex:1;min-width:0">' + esc(e.text) + '</span>' +
          '<span class="lm" style="color:var(--ink-3)">' + esc(e.channel) + '</span></div>';
      }).join('')
    : '<p class="dimmer" style="font-size:13px">Nothing yet. SENTINEL logs every line it sends you here.</p>';

  $('#install-btn').hidden = !deferredInstall;
}

/* =============================================================================
   14. MODALS, TOASTS, COMMAND PALETTE
   ============================================================================= */
function toast(msg, tone) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.setProperty('--tone', 'var(--' + ({ hype: 'mint', warn: 'amber', disappoint: 'coral', brutal: 'coral' }[tone] || 'cyan') + ')');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, 3200);
}
function closeModal() {
  const m = $('#modals');
  m.innerHTML = '';
  document.body.style.overflow = '';
}
function openModal(html, onMount) {
  const m = $('#modals');
  m.innerHTML = '<div class="scrim" data-close="1"></div>' + html;
  document.body.style.overflow = 'hidden';
  if (onMount) onMount(m);
}

function openSettings() {
  openModal(
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="Settings">' +
      '<div class="sheet-head"><h3>Settings</h3><button class="iconbtn" data-close="1" style="margin-left:auto" aria-label="Close"><svg><use href="#i-x"/></svg></button></div>' +
      '<div class="sheet-body">' +
        '<h2 class="sh">The target</h2>' +
        '<div class="field" style="margin-bottom:18px"><label>Board Day 1</label>' +
          '<input type="date" class="inp" id="cfg-exam" value="' + state.cfg.exam + '"></div>' +
        '<h2 class="sh">Night slot</h2>' +
        '<div class="grid g2" style="margin-bottom:18px">' +
          '<div class="field"><label>Opens</label><input type="time" class="inp" id="cfg-slot-a" value="' + state.cfg.slotStart + '"></div>' +
          '<div class="field"><label>Closes</label><input type="time" class="inp" id="cfg-slot-b" value="' + state.cfg.slotEnd + '"></div>' +
        '</div>' +
        '<h2 class="sh">Pomodoro lengths (minutes)</h2>' +
        '<div class="grid g3" style="margin-bottom:8px">' +
          ['Pom 1', 'Break 1', 'Pom 2', 'Break 2', 'Pom 3', 'Break 3'].map((lab, i) =>
            '<div class="field"><label>' + lab + '</label><input type="number" min="1" max="120" class="inp" data-pom="' + i + '" value="' + state.cfg.poms[i] + '"></div>').join('') +
        '</div>' +
        '<h2 class="sh" style="margin-top:24px">Data</h2>' +
        '<p class="dim" style="font-size:13px;margin-bottom:14px">Everything is stored in this browser only. Export a backup now and then — one file, and it drops straight back in. Backups from the old deck import fine.</p>' +
        '<div class="btnrow">' +
          '<button class="btn sm" data-act="export"><svg><use href="#i-down"/></svg>Export backup</button>' +
          '<button class="btn sm" data-act="import"><svg><use href="#i-up"/></svg>Import backup</button>' +
          '<button class="btn sm danger" data-act="reset"><svg><use href="#i-trash"/></svg>Reset everything</button>' +
        '</div>' +
        '<p class="dimmer" style="font-size:12px;margin-top:20px">XII Command Deck · offline-first · no account, no server, no tracking.</p>' +
      '</div>' +
      '<div class="sheet-foot"><button class="btn ghost" data-close="1">Close</button><button class="btn prime" data-act="save-cfg"><svg><use href="#i-check"/></svg>Save</button></div>' +
    '</div>'
  );
}

const COMMANDS = [
  { k: 'Go to Deck', i: '◧', run: () => go('deck') },
  { k: 'Go to Syllabus', i: '❑', run: () => go('syllabus') },
  { k: 'Go to Focus timer', i: '◷', run: () => go('focus') },
  { k: 'Go to SENTINEL', i: '◈', run: () => go('coach') },
  { k: 'Go to Arsenal', i: '◎', run: () => go('arsenal') },
  { k: 'Start the focus timer', i: '▶', run: () => { go('focus'); if (!focus.running) focusToggle(); } },
  { k: 'Log 25 minutes', i: '+', run: () => { logMinutes(25, 1); renderAll(); toast('25 minutes logged', 'hype'); } },
  { k: 'Regenerate tonight\'s plan', i: '↻', run: () => { delete state.plan[iso()]; planFor(); renderAll(); toast('Plan regenerated'); } },
  { k: 'What\'s left in the anchors', i: '★', run: showAnchors },
  { k: 'Download calendar alarms', i: '⌚', run: () => { download('xii-sentinel.ics', buildICS(), 'text/calendar;charset=utf-8'); toast('Calendar file downloaded — open it on your phone'); } },
  { k: 'Export backup', i: '↓', run: doExport },
  { k: 'Settings', i: '⚙', run: openSettings },
];
function openPalette() {
  const subs = SUBJECTS.map((s) => ({ k: 'Open ' + s.name, i: '❑', run: () => openSubject(s.id) }));
  const all = COMMANDS.concat(subs);
  openModal(
    '<div class="sheet pal" role="dialog" aria-modal="true" aria-label="Command palette">' +
      '<input id="pal-q" placeholder="Jump to a subject, or run a command…" autocomplete="off" spellcheck="false">' +
      '<div class="pal-list" id="pal-list"></div>' +
    '</div>',
    () => {
      const q = $('#pal-q'), list = $('#pal-list');
      let sel = 0, shown = all;
      const draw = () => {
        const term = q.value.trim().toLowerCase();
        shown = term ? all.filter((c) => c.k.toLowerCase().includes(term)) : all;
        sel = clamp(sel, 0, Math.max(0, shown.length - 1));
        list.innerHTML = shown.length
          ? shown.map((c, i) => '<button class="pal-item" data-i="' + i + '" data-sel="' + (i === sel ? 1 : 0) + '"><span class="pi">' + c.i + '</span>' + esc(c.k) + '</button>').join('')
          : '<div class="pal-empty">Nothing matches that.</div>';
      };
      draw();
      q.focus();
      q.oninput = () => { sel = 0; draw(); };
      q.onkeydown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); draw(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); draw(); }
        else if (e.key === 'Enter') { e.preventDefault(); const c = shown[sel]; if (c) { closeModal(); c.run(); } }
      };
      list.onclick = (e) => {
        const b = e.target.closest('.pal-item');
        if (!b) return;
        const c = shown[+b.dataset.i];
        closeModal(); if (c) c.run();
      };
    }
  );
}
function showAnchors() {
  const open = openAnchors();
  const A = anchorStats();
  openModal(
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="Anchor topics">' +
      '<div class="sheet-head"><h3>Anchors still open</h3><button class="iconbtn" data-close="1" style="margin-left:auto" aria-label="Close"><svg><use href="#i-x"/></svg></button></div>' +
      '<div class="sheet-body">' +
        '<p class="dim" style="font-size:13.5px;margin-bottom:16px">' + A.full + ' of ' + A.n + ' anchors are fully cleared. These are the near-certain slots — they come before anything clever.</p>' +
        (open.length
          ? open.map((o) => '<button class="chrow" data-open-sub="' + o.s.id + '" style="width:100%;text-align:left">' +
              '<div class="ct">' + esc(o.c.t) + '<span class="nb" style="color:var(--ink-3)">' + esc(o.s.name) + '</span></div>' +
              '<span class="pill ' + (o.done >= 2 ? 'warn' : 'bad') + '">' + o.done + '/4</span></button>').join('')
          : '<p class="dim">Every anchor is cleared. That is the single best sentence this deck can show you.</p>') +
      '</div>' +
    '</div>'
  );
}

/* =============================================================================
   15. DATA IN / OUT
   ============================================================================= */
function doExport() {
  state.gs = SUBJECTS.find((s) => s.id === 'gs').groups[0].ch.map((c) => c.t);
  download('xii-progress-' + iso() + '.json', JSON.stringify(state, null, 2), 'application/json');
  toast('Backup downloaded');
}
function doImport(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const parsed = JSON.parse(r.result);
      merge(parsed);
      save();
      renderAll();
      closeModal();
      toast('Backup restored', 'hype');
    } catch (e) {
      toast('That file could not be read', 'disappoint');
    }
  };
  r.readAsText(file);
}
function doReset() {
  if (!confirm('Wipe every tick, note, session and streak? This cannot be undone.')) return;
  if (!confirm('Last check — export a backup first if you are not certain.')) return;
  state.prog = {}; state.notes = {}; state.streak = { dates: [] };
  state.log = {}; state.plan = {}; state.coach = { history: [], seen: {} }; state.qi = 0;
  SUBJECTS.find((s) => s.id === 'gs').groups[0].ch =
    [1, 2, 3, 4, 5, 6].map((i) => ({ t: 'Unit ' + i + ' — awaiting syllabus' }));
  state.gs = null;
  save();
  renderAll();
  closeModal();
  toast('Reset complete');
}

/* =============================================================================
   16. NAVIGATION
   ============================================================================= */
const VIEWS = ['deck', 'syllabus', 'focus', 'coach', 'arsenal'];
function go(v) {
  if (!VIEWS.includes(v)) v = 'deck';
  view = v;
  VIEWS.forEach((x) => { $('#v-' + x).hidden = x !== v; });
  $$('[data-nav]').forEach((b) => {
    if (b.dataset.nav === v) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (v === 'syllabus' && $('#syl-detail').hidden) renderSyllabusIndex();
  if (v === 'focus') renderFocus();
  if (v === 'coach') renderCoach();
  if (v === 'deck') renderDeck();
  try { history.replaceState(null, '', '#' + v); } catch (e) { /* file:// */ }
  window.scrollTo(0, 0);
}
function renderAll() {
  renderDeck();
  if (curSub && !$('#syl-detail').hidden) renderRows();
  renderSyllabusIndex();
  renderFocus();
  renderCoach();
}

/* =============================================================================
   17. EVENTS
   ============================================================================= */
document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) { go(nav.dataset.nav); return; }

  if (e.target.closest('[data-close]')) { closeModal(); return; }

  const openSub = e.target.closest('[data-open-sub]');
  if (openSub) { closeModal(); openSubject(openSub.dataset.openSub); return; }

  const stg = e.target.closest('.stg');
  if (stg && curSub) {
    const g = curSub.groups[+stg.dataset.g], c = g.ch[+stg.dataset.c], i = +stg.dataset.i;
    const v = chToggle(curSub, g, c, i);
    if (v[0] && v[1] && v[2] && v[3]) { toast('✓ ' + c.t + ' — fully cleared', 'hype'); ping(); }
    renderRows(); renderDeck();
    return;
  }
  const nb = e.target.closest('[data-note]');
  if (nb) {
    openNote = openNote === nb.dataset.note ? null : nb.dataset.note;
    renderRows();
    const ta = $('#sd-rows textarea');
    if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    return;
  }
  const del = e.target.closest('[data-del]');
  if (del && curSub && curSub.editable) {
    const [gi, ci] = del.dataset.del.split('.').map(Number);
    const c = curSub.groups[gi].ch[ci];
    if (confirm('Delete "' + c.t + '"? Any ticks on it are lost.')) {
      delete state.prog[chKey(curSub, curSub.groups[gi], c)];
      curSub.groups[gi].ch.splice(ci, 1);
      save(); renderRows(); renderDeck();
    }
    return;
  }
  const filt = e.target.closest('[data-filt]');
  if (filt) {
    const k = filt.dataset.filt;
    filters[k] = !filters[k];
    filt.setAttribute('aria-pressed', String(filters[k]));
    renderRows();
    return;
  }
  const toneSet = e.target.closest('[data-tone-set]');
  if (toneSet) { state.cfg.tone = toneSet.dataset.toneSet; save(); renderCoach(); renderDeck(); return; }

  const delN = e.target.closest('[data-del-nudge]');
  if (delN) {
    state.cfg.nudges = state.cfg.nudges.filter((t) => t !== delN.dataset.delNudge);
    save(); renderCoach(); scheduleNudges();
    return;
  }

  const act = e.target.closest('[data-act]');
  if (!act) return;
  switch (act.dataset.act) {
    case 'palette': openPalette(); break;
    case 'settings': openSettings(); break;
    case 'syl-back':
      $('#syl-detail').hidden = true; $('#syl-index').hidden = false;
      curSub = null; renderSyllabusIndex(); window.scrollTo(0, 0); break;
    case 'reroll': renderSentinel(true); break;
    case 'start-focus': go('focus'); if (!focus.running) focusToggle(); break;
    case 'show-anchors': showAnchors(); break;
    case 'regen-plan': delete state.plan[iso()]; planFor(); renderFocus(); renderMission(); toast('Plan regenerated'); break;
    case 'edit-plan': editPlan(); break;
    case 'log-manual': manualLog(); break;
    case 'save-consol': {
      const k = iso();
      state.log[k] = Object.assign({ min: 0, poms: 0 }, state.log[k], { consol: $('#consolidate').value });
      save(); toast('Saved to today\'s log', 'hype'); break;
    }
    case 'tone-sample': $('#tone-preview').textContent = tonePreview(true).text; break;
    case 'test-notif': {
      const { tier, text } = sentinelSay(true);
      if (!canNotify()) { toast('Enable notifications first', 'warn'); break; }
      notify('SENTINEL', text, tier); toast('Sent'); break;
    }
    case 'add-nudge': {
      const v = $('#nudge-new').value;
      if (!v) break;
      if (!state.cfg.nudges.includes(v)) state.cfg.nudges.push(v);
      state.cfg.nudges.sort();
      save(); renderCoach(); scheduleNudges(); break;
    }
    case 'reset-nudges': state.cfg.nudges = DEFAULT_CFG.nudges.slice(); save(); renderCoach(); scheduleNudges(); break;
    case 'export-ics':
      download('xii-sentinel.ics', buildICS(), 'text/calendar;charset=utf-8');
      toast('Calendar downloaded — open it on your phone to install the alarms');
      break;
    case 'install-pwa':
      if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; $('#install-btn').hidden = true; }
      break;
    case 'export': doExport(); break;
    case 'import': $('#file-import').click(); break;
    case 'reset': doReset(); break;
    case 'save-cfg': saveSettings(); break;
    case 'add-unit': {
      const inp = $('#unit-new'), v = (inp.value || '').trim();
      if (!v) break;
      curSub.groups[0].ch.push({ t: v });
      inp.value = ''; save(); renderRows(); renderDeck(); toast('Unit added'); break;
    }
    case 'load-evs': {
      if (!confirm('Replace the placeholder units with the EVS spine? Ticks on the placeholders are lost.')) break;
      curSub.groups[0].ch.forEach((c) => { delete state.prog[chKey(curSub, curSub.groups[0], c)]; });
      curSub.groups[0].ch = EVS_PRESET.map((t) => ({ t }));
      save(); renderRows(); renderDeck(); toast('EVS spine loaded'); break;
    }
  }
});

document.addEventListener('input', (e) => {
  const ta = e.target.closest('textarea[data-nk]');
  if (ta) { state.notes[ta.dataset.nk] = ta.value; save(); return; }
  if (e.target.id === 'quiet-from') { state.cfg.quietFrom = e.target.value; save(); }
  if (e.target.id === 'quiet-to') { state.cfg.quietTo = e.target.value; save(); }
});
document.addEventListener('click', (e) => {
  const tg = e.target.closest('#tg-always');
  if (!tg) return;
  state.cfg.alwaysNudge = tg.getAttribute('aria-checked') !== 'true';
  tg.setAttribute('aria-checked', String(state.cfg.alwaysNudge));
  save();
});
$('#file-import').addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) doImport(f);
  e.target.value = '';
});
$('#f-toggle').addEventListener('click', focusToggle);
$('#f-skip').addEventListener('click', focusSkip);
$('#f-reset').addEventListener('click', () => focusReset(0));
$('#perm-btn').addEventListener('click', requestPerm);

document.addEventListener('keydown', (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
  if (e.key === 'Escape') { closeModal(); return; }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key >= '1' && e.key <= '5') { go(VIEWS[+e.key - 1]); return; }
  if (e.key === '/') { e.preventDefault(); openPalette(); return; }
  if (e.key.toLowerCase() === 'f') { go('focus'); focusToggle(); }
});

function editPlan() {
  const plan = planFor();
  openModal(
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="Edit tonight\'s plan">' +
      '<div class="sheet-head"><h3>Tonight\'s three deliverables</h3><button class="iconbtn" data-close="1" style="margin-left:auto" aria-label="Close"><svg><use href="#i-x"/></svg></button></div>' +
      '<div class="sheet-body"><p class="dim" style="font-size:13.5px;margin-bottom:16px">One concrete thing per Pomodoro. "Finish one Cash Flow problem", not "study Cash Flow".</p>' +
        plan.map((p, i) => '<div class="field" style="margin-bottom:14px"><label>Pomodoro ' + (i + 1) + '</label>' +
          '<input class="inp" data-plan="' + i + '" value="' + esc(p) + '"></div>').join('') +
      '</div>' +
      '<div class="sheet-foot"><button class="btn ghost" data-close="1">Cancel</button>' +
      '<button class="btn prime" id="plan-save"><svg><use href="#i-check"/></svg>Save</button></div>' +
    '</div>',
    (m) => {
      $('#plan-save', m).onclick = () => {
        state.plan[iso()] = $$('[data-plan]', m).map((i) => i.value.trim() || 'Free Pomodoro');
        save(); closeModal(); renderFocus(); renderMission(); toast('Plan saved');
      };
    }
  );
}
function manualLog() {
  openModal(
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="Log minutes">' +
      '<div class="sheet-head"><h3>Log minutes by hand</h3><button class="iconbtn" data-close="1" style="margin-left:auto" aria-label="Close"><svg><use href="#i-x"/></svg></button></div>' +
      '<div class="sheet-body"><p class="dim" style="font-size:13.5px;margin-bottom:16px">For sessions you did away from the deck. It counts the same — toward the streak, the heatmap and the week.</p>' +
        '<div class="field"><label>Minutes studied</label><input type="number" class="inp" id="man-min" value="25" min="1" max="600"></div>' +
      '</div>' +
      '<div class="sheet-foot"><button class="btn ghost" data-close="1">Cancel</button>' +
      '<button class="btn prime" id="man-save"><svg><use href="#i-check"/></svg>Log it</button></div>' +
    '</div>',
    (m) => {
      $('#man-save', m).onclick = () => {
        const v = clamp(parseInt($('#man-min', m).value, 10) || 0, 1, 600);
        logMinutes(v, Math.round(v / 25));
        closeModal(); renderAll(); toast(v + ' minutes logged', 'hype');
      };
    }
  );
}
function saveSettings() {
  const exam = $('#cfg-exam').value;
  if (exam) state.cfg.exam = exam;
  const a = $('#cfg-slot-a').value, b = $('#cfg-slot-b').value;
  if (a) state.cfg.slotStart = a;
  if (b) state.cfg.slotEnd = b;
  $$('[data-pom]').forEach((i) => {
    state.cfg.poms[+i.dataset.pom] = clamp(parseInt(i.value, 10) || 25, 1, 120);
  });
  if (!state.cfg.nudges.includes(state.cfg.slotStart)) {
    state.cfg.nudges.push(state.cfg.slotStart);
    state.cfg.nudges.sort();
  }
  save();
  focusReset(0);
  closeModal();
  renderAll();
  scheduleNudges();
  toast('Settings saved');
}

/* =============================================================================
   18. BOOT
   ============================================================================= */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  const b = $('#install-btn');
  if (b) b.hidden = false;
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { renderDeck(); scheduleNudges(); }
});

(function boot() {
  load();
  planFor();
  focusReset(0);

  const hash = (location.hash || '').replace('#', '');
  go(VIEWS.includes(hash) ? hash : 'deck');

  $('#boot').hidden = true;
  $('#shell').hidden = false;
  renderAll();

  writeSummary();
  setInterval(renderClock, 1000);
  setInterval(() => { renderNow(); renderStats(); }, 60000);
  scheduleNudges();
  initSW();
  if (canNotify()) registerPeriodicSync();
})();
