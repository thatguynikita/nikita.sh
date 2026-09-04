#!/usr/bin/env node
// Asserts that every i18n key the pages actually ask for resolves in
// every locale.
//
//   npm run test:i18n
//
// scripts/lib/locales.mjs already checks the locale files against each
// other: they must all carry the same keys. That says nothing about
// whether those are the keys the pages use. A t('terraform.usge') typo,
// or a TIME_BUCKETS id renamed without touching the locale files,
// passes both that check and the build's drift check, and shows up as
// the literal text "undefined" in the terminal.
//
// Two kinds of reference are checked:
//
//   1. Literal keys — t('kubectl.help'). Extracted from the page source.
//
//   2. Computed keys — t('whoami.timeQuip.' + bucket.id) and friends.
//      These can't be read off the source, so instead the *id lists*
//      that feed them are read out of the structures they live in, and
//      each id is checked against the prefix. That's the case this file
//      exists for: those id lists are the dispatch keys and timing
//      structure that PR 6b deliberately kept out of the locale files,
//      which means nothing else relates the two halves.
//
// If one of the extraction patterns below stops matching (the structure
// was renamed or reshaped), that is itself a failure — silently checking
// nothing would be worse than a red build.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { loadLocales } from "./lib/locales.mjs";
import { localeCodes } from "./lib/site-urls.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// Which locale section each page's I18N block is filled from — the same
// mapping build.mjs uses when it renders GENERATED:I18N.
const PAGES = {
  "public/index.html": "terminal",
  "public/cv.html": "cv",
  "public/404.html": "notFound",
};

// Computed-key families: a key prefix, and how to find the ids that get
// appended to it. `list` must match exactly once; `ids` pulls the ids
// out of that match.
const COMPUTED = [
  {
    what: "TIME_BUCKETS ids",
    page: "public/index.html",
    prefix: "whoami.timeQuip",
    list: /const TIME_BUCKETS = \[([\s\S]*?)\];/,
    ids: /id:'([^']+)'/g,
  },
  {
    what: "PERSONAS.recruiter.commands",
    page: "public/index.html",
    prefix: "ssh.personas.recruiter",
    list: /commands: \[([^\]]*)\]/,
    ids: /'([^']+)'/g,
  },
  {
    what: "SSH_FAILURE_STEPS.first keys",
    page: "public/index.html",
    prefix: "ssh.failure.first",
    list: /first: \[([\s\S]*?)\],\n/,
    ids: /key:'([^']+)'/g,
  },
  {
    what: "SSH_FAILURE_STEPS.persistent keys",
    page: "public/index.html",
    prefix: "ssh.failure.persistent",
    list: /persistent: \[([\s\S]*?)\],\n/,
    ids: /key:'([^']+)'/g,
  },
];

// Line comments only — the block comments in these files never contain
// anything that parses as a t() call, and stripping them properly would
// mean tracking string state.
const stripComments = (src) => src.replace(/^\s*\/\/.*$/gm, "");

const resolve = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

const locales = await loadLocales();
const problems = [];

function check(page, key, origin) {
  const section = PAGES[page];
  for (const code of localeCodes) {
    const value = resolve(locales[code][section], key);
    if (value === undefined) {
      problems.push(`  ${code}.mjs: no "${section}.${key}" — asked for by ${origin}`);
    }
  }
}

let literalCount = 0;
for (const page of Object.keys(PAGES)) {
  const src = read(page);

  // t('a.b.c') / t("a.b.c") / t(`a.b.c`), where the whole key is the
  // literal: the closing quote must be followed by `)` or `,`, so a
  // computed key like t('whoami.timeQuip.' + bucket.id) isn't mistaken
  // for a literal one. Comments are stripped first, or t()'s own doc
  // comment gets read as a call site.
  for (const m of stripComments(src).matchAll(/\bt\(\s*(['"`])([A-Za-z0-9_.$]+)\1\s*[),]/g)) {
    literalCount++;
    check(page, m[2], `t('${m[2]}') in ${page}`);
  }

  for (const c of COMPUTED.filter((c) => c.page === page)) {
    const block = src.match(c.list);
    if (!block) {
      problems.push(`  ${page}: could not find ${c.what} — the extraction pattern in ${"scripts/check-i18n-refs.mjs"} needs updating`);
      continue;
    }
    const ids = [...block[1].matchAll(c.ids)].map((m) => m[1]);
    if (!ids.length) {
      problems.push(`  ${page}: found ${c.what} but no ids in it — extraction pattern needs updating`);
      continue;
    }
    for (const id of ids) check(page, `${c.prefix}.${id}`, `${c.what}`);
  }
}

// help's descriptions are looked up by command name, from a table whose
// rows are the commands themselves.
const indexSrc = read("public/index.html");
const helpBlock = indexSrc.match(/const HELP_ROWS = \[([\s\S]*?)\];/);
if (!helpBlock) {
  problems.push("  public/index.html: could not find HELP_ROWS — extraction pattern needs updating");
} else {
  const cmds = [...helpBlock[1].matchAll(/\["([^"]+)"/g)].map((m) => m[1]);
  if (!cmds.length) problems.push("  public/index.html: HELP_ROWS has no rows — extraction pattern needs updating");
  for (const cmd of cmds) check("public/index.html", `help.${cmd}`, "HELP_ROWS");
}

// cv.html merges SECTIONS and the generated locale maps into UI, so its
// keys aren't reached through t() — they're spread wholesale. Nothing to
// resolve per-key there beyond what loadLocales() already checked.

if (problems.length) {
  console.error(`${problems.length} unresolved i18n reference(s):\n`);
  console.error(problems.join("\n"));
  console.error(
    "\nEither the key is misspelled at the call site, or it needs adding to\n" +
      "every file in content/locales/. A key that doesn't resolve renders as\n" +
      "the literal text \"undefined\"."
  );
  process.exit(1);
}

const computedCount = COMPUTED.length + 1;
console.log(
  `All i18n references resolve in ${localeCodes.length} locale(s): ` +
    `${literalCount} literal t() keys, ${computedCount} computed key families.`
);
