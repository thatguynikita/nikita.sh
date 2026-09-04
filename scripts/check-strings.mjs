#!/usr/bin/env node
// Asserts that every string recorded in tests/golden-strings.json still
// exists somewhere — either still in the page, or in a locale file it
// was migrated into.
//
//   npm run test:strings
//
// This is the safety net the drift check cannot be. `npm run build`
// only proves the build is idempotent; it is perfectly happy to
// regenerate a page with a line missing. This proves no user-visible
// string vanished or got garbled while being moved.
//
// Strings that legitimately changed shape (a `${x}` interpolation
// becoming a "{x}" placeholder) go in EXPECTED_CHANGES below, with the
// replacement and a reason — so the exceptions are reviewable rather
// than invisible.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { harvestStrings, collectLocaleStrings } from "./lib/harvest-strings.mjs";
import { localeCodes } from "./lib/site-urls.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// old string -> { to, why }. `to` must itself be present, so a typo in
// the replacement fails the check rather than silently excusing it.
const EXPECTED_CHANGES = {
  "cat: ${f}: No such file or directory": {
    to: "cat: {file}: No such file or directory",
    why: "t() moved from varargs to named params",
  },
  "cat: ${f}: Нет такого файла или каталога": {
    to: "cat: {file}: Нет такого файла или каталога",
    why: "t() moved from varargs to named params",
  },
  'theme set to <span class="glow">${n}</span>': {
    to: 'theme set to <span class="glow">{name}</span>',
    why: "t() moved from varargs to named params",
  },
  'тема изменена на <span class="glow">${n}</span>': {
    to: 'тема изменена на <span class="glow">{name}</span>',
    why: "t() moved from varargs to named params",
  },
  'command not found: <span class="accent">${b}</span>': {
    to: 'command not found: <span class="accent">{command}</span>',
    why: "t() moved from varargs to named params",
  },
  'команда не найдена: <span class="accent">${b}</span>': {
    to: 'команда не найдена: <span class="accent">{command}</span>',
    why: "t() moved from varargs to named params",
  },
};

// Literals that genuinely no longer exist and shouldn't. The harvest is
// deliberately over-broad — it takes every literal, including ones that
// are code rather than copy — so this is where those land, each with a
// reason. A user-visible string should never appear here; it belongs in
// EXPECTED_CHANGES or is a bug.
const EXPECTED_REMOVALS = {
  function: "t() no longer accepts function values, so its `typeof v === 'function'` test is gone. Not copy.",
};

const golden = JSON.parse(read("tests/golden-strings.json"));

// Everything a string could legitimately have moved into.
const haystack = new Set();
for (const page of Object.keys(golden.pages)) {
  for (const s of harvestStrings(read(page))) haystack.add(s);
}
for (const code of localeCodes) {
  const mod = await import(new URL(`../content/locales/${code}.mjs`, import.meta.url));
  for (const s of collectLocaleStrings(mod.default)) haystack.add(s);
}

const missing = [];
for (const [page, strings] of Object.entries(golden.pages)) {
  for (const s of strings) {
    if (haystack.has(s)) continue;
    if (s in EXPECTED_REMOVALS) continue;
    const change = EXPECTED_CHANGES[s];
    if (change && haystack.has(change.to)) continue;
    missing.push({ page, s, change });
  }
}

if (missing.length) {
  console.error(`${missing.length} string(s) from tests/golden-strings.json no longer exist:\n`);
  for (const { page, s, change } of missing) {
    console.error(`  [${page}] ${JSON.stringify(s)}`);
    if (change) console.error(`    expected to become ${JSON.stringify(change.to)} (${change.why}) — but that isn't there either`);
  }
  console.error(
    "\nEither the string was dropped/garbled, or the change was intentional.\n" +
      "If intentional: add it to EXPECTED_CHANGES (reworded) or\n" +
      "EXPECTED_REMOVALS (deleted, and not copy) in scripts/check-strings.mjs,\n" +
      "or re-record the snapshot with `node scripts/harvest-strings.mjs` and\n" +
      "review that diff."
  );
  process.exit(1);
}

const total = Object.values(golden.pages).reduce((n, a) => n + a.length, 0);
console.log(`All ${total} strings from tests/golden-strings.json accounted for (snapshot ref: ${golden.ref}).`);
