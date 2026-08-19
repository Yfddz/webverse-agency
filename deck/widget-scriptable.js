// =============================================================================
// XII Command Deck — iOS home-screen widget (Scriptable)
//
// iOS does not let a website draw a home-screen widget, so this is the real
// one: paste it into the free Scriptable app as a new script named
// "XII Deck", then add a Scriptable widget to your home screen and point it
// at this script.
//
// It runs entirely offline and derives everything from the date, so it needs
// no network and no access to the deck's saved progress. Tapping it opens the
// full deck, which is where the ticks and minutes live.
// =============================================================================

const EXAM = new Date(2027, 1, 10, 9, 0, 0);          // 10 Feb 2027, Board Day 1
const DECK_URL = 'https://webversejandk.in/deck/';

const ROTATION = [
  ['Weak-area review + rest', 'No new chapters. Blank-page the week, then rest.'],
  ['Accountancy', 'Three Pomodoros, one problem each. Format first.'],
  ['Business Studies', 'Point → Explain → Example on every answer.'],
  ['Economics', 'Draw every diagram labelled, from memory.'],
  ['Accountancy', 'Interleave. Don’t repeat one problem type.'],
  ['English', 'One literature chapter or one writing format, written full.'],
  ['Accountancy — full PYQ paper', 'Timed. Closed book. Two minutes per mark.'],
];

const LINES = [
  'Start the timer. The mood will catch up.',
  'One Pomodoro is a real day. Zero is not.',
  'Talent sets the ceiling. Completion sets the score.',
  'You cannot practise casually and perform formally.',
  'The paper does not know how you felt while preparing for it.',
  'A blank answer is the only guaranteed zero on the paper.',
  'Do the anchors first. Everything else is optimisation.',
  'Two hours today beats eight hours you keep planning for Sunday.',
  'The chapter you keep skipping is the one the paper is built around.',
  'Reading is comfort. Writing is study. Pick correctly.',
  'Consistency is just what discipline looks like from far away.',
  'Confidence is memory of preparation. Build the memory.',
];

const now = new Date();
const days = Math.max(0, Math.ceil((EXAM - now) / 86400000));
const [subject, detail] = ROTATION[now.getDay()];
const line = LINES[Math.floor(now.getTime() / 86400000) % LINES.length];

const CYAN = new Color('#3DDCFF');
const VIOLET = new Color('#B45CFF');
const INK = new Color('#EDF0F8');
const DIM = new Color('#98A2BE');
const FAINT = new Color('#5D6784');

const w = new ListWidget();
w.url = DECK_URL;
w.setPadding(14, 15, 14, 15);

const bg = new LinearGradient();
bg.colors = [new Color('#11141F'), new Color('#06070B')];
bg.locations = [0, 1];
w.backgroundGradient = bg;

// header
const head = w.addStack();
head.centerAlignContent();
const tag = head.addText('XII COMMAND DECK');
tag.font = Font.mediumSystemFont(8);
tag.textColor = FAINT;
head.addSpacer();
const dot = head.addText('●');
dot.font = Font.systemFont(7);
dot.textColor = days <= 30 ? new Color('#FB7185') : CYAN;

w.addSpacer(8);

// countdown
const row = w.addStack();
row.bottomAlignContent();
const n = row.addText(String(days));
n.font = Font.boldRoundedSystemFont(38);
n.textColor = INK;
row.addSpacer(6);
const unit = row.addText('days to boards');
unit.font = Font.mediumSystemFont(10);
unit.textColor = FAINT;

w.addSpacer(6);

// today's subject
const s = w.addText(subject);
s.font = Font.semiboldSystemFont(14);
s.textColor = days <= 60 ? VIOLET : CYAN;
s.lineLimit = 2;

const d = w.addText(detail);
d.font = Font.systemFont(10);
d.textColor = DIM;
d.lineLimit = 2;

w.addSpacer();

const q = w.addText(line);
q.font = Font.italicSystemFont(10);
q.textColor = FAINT;
q.lineLimit = 2;

if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  w.presentMedium();
}
Script.complete();
