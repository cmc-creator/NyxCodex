'use strict';
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'trainer_pro.html');
let html = fs.readFileSync(FILE, 'utf8');
const FFFD = '\uFFFD';

let total = 0;
function rep(from, to) {
  let count = 0;
  let s = html;
  while (s.includes(from)) {
    s = s.replace(from, to);
    count++;
  }
  if (count > 0) {
    html = s;
    total += count;
    console.log(`  [${count}x] ${JSON.stringify(from).slice(0,60)} → ${JSON.stringify(to).slice(0,40)}`);
  }
}
function repRe(re, fn, label) {
  let count = 0;
  html = html.replace(re, (m, ...args) => { count++; return fn(m, ...args); });
  if (count > 0) {
    total += count;
    console.log(`  [${count}x] REGEX ${label}`);
  }
}

const before = (html.match(/\uFFFD/g) || []).length;
console.log(`U+FFFD instances before: ${before}`);

// =============================================================
// PASS 1: TRADEMARK / COPYRIGHT (must come before generic ©/® fallbacks)
// =============================================================
console.log('\n-- Trademark & Copyright --');
rep(`NyxLab${FFFD}\u2019`, 'NyxLab®\u2019');    // in JS strings like 'NyxLab®'
rep(`NyxLab${FFFD}\u2018`, 'NyxLab®\u2018');
rep(`NyxLab${FFFD}'`, "NyxLab®'");
rep(`NyxLab${FFFD} `, 'NyxLab® ');               // NyxLab® followed by space
rep(`NyxLab${FFFD}<`, 'NyxLab®<');               // NyxLab® before tag
rep(`NyxLab${FFFD},`, 'NyxLab®,');
rep(`${FFFD} 2026 NyxLab`, '\u00A9 2026 NyxLab');  // © 2026 NyxLab
rep(`${FFFD} 2026 was`, '\u00A9 2026 was');

// =============================================================
// PASS 2: LOADING / STATUS ELLIPSIS (very specific suffixes)
// =============================================================
console.log('\n-- Ellipsis states --');
const ellipsisWords = [
  'Loading','Verifying','Back','Scoring','Analyzing','Building',
  'Processing','Generating','Reviewing','Checking','Saving','Sending',
  'Connecting','Fetching','Uploading','Downloading','Preparing',
  'Initializing','Calculating','Rendering','Syncing','Refreshing',
  'Validating','Submitting','Searching','Registering','Logging',
  'Signing','Resetting','Exporting','Importing','Generating script',
  'Reviewing your incident','Reviewing your response','Loading reports',
  'Loading audit events','Loading scenarios','Loading settings',
];
for (const w of ellipsisWords) {
  rep(`${w}${FFFD}`, `${w}\u2026`);    // word + FFFD → word + …
}

// =============================================================
// PASS 3: APOSTROPHES IN CONTRACTIONS / POSSESSIVES
//   Pattern: letter + FFFD + letter
// =============================================================
console.log('\n-- Apostrophes --');
const contractions = [
  // Common in training text
  ["Don't", "Don\uFFFDt"], ["don't", "don\uFFFDt"],
  ["won't", "won\uFFFDt"], ["can't", "can\uFFFDt"],
  ["didn't", "didn\uFFFDt"], ["doesn't", "doesn\uFFFDt"],
  ["isn't", "isn\uFFFDt"], ["aren't", "aren\uFFFDt"],
  ["wasn't", "wasn\uFFFDt"], ["weren't", "weren\uFFFDt"],
  ["shouldn't", "shouldn\uFFFDt"], ["wouldn't", "wouldn\uFFFDt"],
  ["couldn't", "couldn\uFFFDt"], ["hasn't", "hasn\uFFFDt"],
  ["haven't", "haven\uFFFDt"], ["hadn't", "hadn\uFFFDt"],
  ["it's", "it\uFFFDs"], ["It's", "It\uFFFDs"],
  ["that's", "that\uFFFDs"], ["That's", "That\uFFFDs"],
  ["what's", "what\uFFFDs"], ["What's", "What\uFFFDs"],
  ["there's", "there\uFFFDs"], ["There's", "There\uFFFDs"],
  ["here's", "here\uFFFDs"], ["Here's", "Here\uFFFDs"],
  ["let's", "let\uFFFDs"], ["Let's", "Let\uFFFDs"],
  ["who's", "who\uFFFDs"], ["Who's", "Who\uFFFDs"],
  ["he's", "he\uFFFDs"], ["she's", "she\uFFFDs"],
  ["you're", "you\uFFFDre"], ["You're", "You\uFFFDre"],
  ["they're", "they\uFFFDre"], ["They're", "They\uFFFDre"],
  ["we're", "we\uFFFDre"], ["We're", "We\uFFFDre"],
  ["I'm", "I\uFFFDm"], ["i'm", "i\uFFFDm"],
  ["you'll", "you\uFFFDll"], ["You'll", "You\uFFFDll"],
  ["we'll", "we\uFFFDll"], ["We'll", "We\uFFFDll"],
  ["they'll", "they\uFFFDll"], ["I'll", "I\uFFFDll"],
  ["I've", "I\uFFFDve"], ["you've", "you\uFFFDve"],
  ["we've", "we\uFFFDve"], ["they've", "they\uFFFDve"],
  ["I'd", "I\uFFFDd"], ["you'd", "you\uFFFDd"],
  ["he'd", "he\uFFFDd"], ["she'd", "she\uFFFDd"],
  ["we'd", "we\uFFFDd"], ["they'd", "they\uFFFDd"],
  // Possessives
  ["patient's", "patient\uFFFDs"],
  ["person's", "person\uFFFDs"],
  ["patient's", "patient\uFFFDs"],
  ["someone's", "someone\uFFFDs"],
  ["staff's", "staff\uFFFDs"],
  ["colleague's", "colleague\uFFFDs"],
  ["doctor's", "doctor\uFFFDs"],
  ["diagnosis's", "diagnosis\uFFFDs"],
];
for (const [to, from] of contractions) {
  rep(from, to);
}

// Catch-all: letter + FFFD + letter → apostrophe
repRe(/([a-zA-Z])\uFFFD([a-zA-Zr])/g, (m, a, b) => `${a}'${b}`, 'letter+FFFD+letter → apostrophe');
// Handle closing single quote: word+FFFD+) or word+FFFD end-of-string-delimeter
repRe(/([a-zA-Z.,!?])\uFFFD([)\].`])/g, (m, a, b) => `${a}'${b}`, "word+FFFD+)] → closing '");

// =============================================================
// PASS 4: CURLY DOUBLE QUOTES
// =============================================================
console.log('\n-- Curly double quotes --');
// Opening curly quote: space/( + FFFD + Capital → "Capital
repRe(/([ (])\uFFFD([A-Z\u201C\u2018])/g, (m, pre, after) => `${pre}\u201C${after}`, '( +FFFD+Capital → open "');
// Also: >FFFD+Capital inside HTML
repRe(/(>)\uFFFD([A-Z])/g, (m, pre, after) => `${pre}\u201C${after}`, '>FFFD+Capital → open "');
// Closing curly quote: !/")/. + FFFD + space/</
repRe(/([!?.,])\uFFFD([ <\r\n)])/g, (m, pre, after) => `${pre}\u201D${after}`, 'punct+FFFD+space → close "');
// Closing: word + FFFD + space where previous context suggests quoted phrase
repRe(/(\w)\uFFFD( as )/g, (m, a, b) => `${a}\u201D${b}`, 'word+FFFD+" as " → close "');

// =============================================================
// PASS 5: NUMERIC RANGES (en-dash)
// =============================================================
console.log('\n-- Numeric ranges --');
repRe(/(\d)\uFFFD(\d)/g, (m, a, b) => `${a}\u2013${b}`, 'digit+FFFD+digit → en-dash');
// Decimal ranges: 1.5FFFD4
repRe(/(\d\.?\d?)\uFFFD(\d)/g, (m, a, b) => `${a}\u2013${b}`, 'decimal+FFFD+digit → en-dash');

// =============================================================
// PASS 6: DEGREE SYMBOL
// =============================================================
console.log('\n-- Degree symbol --');
rep(`45${FFFD} angle`, '45° angle');
rep(`45${FFFD}, not head-on`, '45°, not head-on');
rep(`45${FFFD} `, '45° ');
rep(`360${FFFD}`, '360°');

// =============================================================
// PASS 7: ARROWS
// =============================================================
console.log('\n-- Arrows --');
rep(`300 ${FFFD} 600 ${FFFD} 1000 ${FFFD} 1800`, '300 \u2192 600 \u2192 1000 \u2192 1800');

// =============================================================
// PASS 8: NAV / BADGE SEPARATORS (middle dot)
// =============================================================
console.log('\n-- Middle-dot separators --');
rep(`${FFFD}</span>`, '\u00B7</span>');
rep(`content:"${FFFD}"`, 'content:"\u00B7"');
rep(`${FFFD} Est.`, '\u00B7 Est.');
rep(`2026 ${FFFD} Nyx`, '2026 \u00B7 Nyx');
rep(`${FFFD} Nyx Collective`, '\u00B7 Nyx Collective');
// List bullet at start of <li>
rep(`<li>${FFFD} `, '<li>\u00B7 ');
rep(`<li>${FFFD}`, '<li>');   // bare bullet with no space — just strip

// =============================================================
// PASS 9: EM-DASH COMMENTARY (space–FFFD–space or specific HTML contexts)
// =============================================================
console.log('\n-- Em-dash commentary --');
// Space + FFFD + space (most common inline separator)
rep(` ${FFFD} `, ' \u2014 ');
// HTML comment markers: <!-- SLIDE N FFFD TITLE -->
repRe(/<!--\s*(SLIDE\s+\d+)\s*\uFFFD\s*([^-]+)-->/g,
  (m, slide, title) => `<!-- ${slide} \u2014 ${title.trim()} -->`,
  'HTML comment em-dash');
// Module N FFFD Topic
repRe(/(Module\s+\d+)\s*\uFFFD\s*/g,
  (m, mod) => `${mod} \u2013 `,
  'Module N FFFD');
// Step N FFFD Name
repRe(/(Step\s+\d+)\s*\uFFFD\s*/g,
  (m, step) => `${step} \u2013 `,
  'Step N FFFD');
// Low / Moderate / High FFFD
repRe(/(Low|Moderate|High)\s*\uFFFD\s*/g,
  (m, lvl) => `${lvl} \u2013 `,
  'Risk level FFFD');
// FFFD before a closing span/div (standalone separator)
rep(`${FFFD}</`, '\u2014</');

// =============================================================
// PASS 10: JS STRING FALLBACK PLACEHOLDERS  (fname || 'FFFD')
// =============================================================
console.log('\n-- JS string placeholders --');
// Single-quoted string with just FFFD
repRe(/'(\s*)\uFFFD(\s*)'/g,
  (m, a, b) => `'\u2014'`,
  "JS '\\uFFFD' placeholder → '—'");
// Template literal: `…${FFFD}…`  inside JS
repRe(/`([^`]*)\uFFFD([^`]*)`/g,
  (m, a, b) => `\`${a}\u2014${b}\``,
  'template literal FFFD → —');
// Not-generated placeholders: like '— not generated —'
rep(`${FFFD} not generated ${FFFD}`, '\u2014 not generated \u2014');

// =============================================================
// PASS 11: CATCH-ALL (anything left)
// =============================================================
console.log('\n-- Catch-all remaining --');
// Any FFFD still between word chars with surrounding spaces → em-dash
repRe(/\uFFFD/g, () => '\u2014', 'remaining FFFD → em-dash');

// =============================================================
// WRITE & REPORT
// =============================================================
const after = (html.match(/\uFFFD/g) || []).length;
console.log(`\nTotal replacements: ${total}`);
console.log(`U+FFFD remaining:   ${after}`);

fs.writeFileSync(FILE, html, 'utf8');
console.log('Done — trainer_pro.html updated.');
