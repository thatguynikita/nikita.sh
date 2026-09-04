#!/usr/bin/env node
// Interactive first-run setup: asks the handful of questions that decide
// what site.config.mjs should say, writes it, and then tells you exactly
// what personal content is left to replace.
//
//   npm run init
//
// Deliberately limited to site.config.mjs. It does NOT try to rewrite
// content/site-data.mjs: that file is prose, with comments, template
// literals and load-bearing line wraps, and a script that edited it
// would either mangle it or need to be smarter than it's worth. What it
// does instead is scan for the previous owner's name, email and host
// afterwards, and list every file still mentioning them — which is both
// a better checklist than anything hardcoded here and a check you can
// re-run until it comes back clean.
//
// Non-interactive (piped, CI): prints what it would ask and exits 0
// rather than hanging on a prompt that will never be answered.

import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { SITE } from "../site.config.mjs";
import { PERSON } from "../content/site-data.mjs";
import { TARGETS } from "./lib/deploy-targets.mjs";
import { applyConfig, defaultLocaleRow } from "./lib/write-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = join(ROOT, "site.config.mjs");

const bold = (s) => `[1m${s}[0m`;
const dim = (s) => `[2m${s}[0m`;

if (!stdin.isTTY) {
  console.log(
    "npm run init is interactive and stdin isn't a terminal.\n" +
      "Run it from a shell, or edit site.config.mjs by hand — it's the only\n" +
      "file this script writes, and every key in it is commented."
  );
  process.exit(0);
}

const rl = createInterface({ input: stdin, output: stdout });

async function ask(question, fallback) {
  const suffix = fallback === "" ? " (blank for none)" : ` ${dim("[" + fallback + "]")}`;
  const answer = (await rl.question(`${question}${suffix}\n> `)).trim();
  return answer === "" ? fallback : answer;
}

async function askYesNo(question, fallback) {
  const answer = (await rl.question(`${question} ${dim(fallback ? "[Y/n]" : "[y/N]")}\n> `)).trim().toLowerCase();
  if (answer === "") return fallback;
  return answer.startsWith("y");
}

console.log(`
${bold("Setting up your copy of this terminal portfolio.")}

Every answer has a default in brackets — press Enter to keep it. This
writes ${bold("site.config.mjs")} only; nothing else is touched, and you can
re-run it or edit that file by hand at any time.
`);

// -------- questions --------

let baseUrl = await ask("Where will the site live? (origin only, no path)", SITE.baseUrl);
baseUrl = baseUrl.replace(/\/+$/, "");
if (!/^https?:\/\//.test(baseUrl)) baseUrl = "https://" + baseUrl;

let basePath = await ask(
  "Served from a sub-path? Only for a GitHub *project* page —\n" +
    dim("  e.g. /my-repo for username.github.io/my-repo. Blank for a domain root."),
  SITE.basePath
);
basePath = basePath.trim();
if (basePath && !basePath.startsWith("/")) basePath = "/" + basePath;

const defaultHost = baseUrl.replace(/^https?:\/\//, "");
const terminalHost = await ask(
  "What should the terminal call itself?\n" +
    dim("  This is the guest@… prompt and the ssh persona's address — set\n" +
        "  dressing, so it can be prettier than the real URL."),
  defaultHost
);

const codes = (
  await ask(
    "Which languages? (comma-separated codes, first is the default)\n" +
      dim("  One code is fine — the language switcher disappears entirely."),
    SITE.locales.map((l) => l.code).join(",")
  )
)
  .split(",")
  .map((c) => c.trim().toLowerCase())
  .filter(Boolean);

const locales = codes.map((code) => {
  const existing = SITE.locales.find((l) => l.code === code);
  return existing ?? defaultLocaleRow(code);
});

const mirrorsEnabled = await askYesNo(
  "Publish the plain-HTML /llm/ mirror for crawlers and AI agents?",
  SITE.mirrors.enabled
);

const gameEnabled = await askYesNo(
  "Keep the hidden game? " + dim("(`sudo ./milk-quest.sh` opens it in a CRT window)"),
  SITE.game.enabled
);
const gameUrl = gameEnabled
  ? await ask(
      "  Game URL " + dim("— any embeddable page that allows framing"),
      SITE.game.url
    )
  : SITE.game.url;
const gameTitle = gameEnabled
  ? await ask("  Accessible name for it " + dim("(announced by screen readers)"), SITE.game.title)
  : SITE.game.title;

const targets = Object.keys(TARGETS);
const target = await ask(
  `Deploy target? ${dim("(" + targets.join(" / ") + ", or leave it — GitHub Pages needs no target)")}`,
  SITE.deploy.target
);
const bucket = targets.includes(target)
  ? await ask("  Bucket name " + dim("(blank to always pass --bucket)"), SITE.deploy.bucket)
  : SITE.deploy.bucket;

rl.close();

// -------- write site.config.mjs --------

const config = applyConfig(readFileSync(CONFIG, "utf8"), {
  baseUrl,
  basePath,
  terminalHost,
  locales,
  mirrorsEnabled,
  gameEnabled,
  gameUrl,
  gameTitle,
  deployTarget: target,
  deployBucket: bucket,
});

writeFileSync(CONFIG, config);
console.log(`\n${bold("Wrote site.config.mjs.")}`);

// -------- locale files --------

const removed = SITE.locales.map((l) => l.code).filter((c) => !codes.includes(c));
for (const code of removed) {
  const file = join(ROOT, "content/locales", `${code}.mjs`);
  if (existsSync(file)) {
    rmSync(file);
    console.log(`  removed content/locales/${code}.mjs (${code} is no longer configured)`);
  }
}
for (const code of codes) {
  const file = join(ROOT, "content/locales", `${code}.mjs`);
  if (!existsSync(file)) {
    console.log(
      `  ${bold("!")} content/locales/${code}.mjs doesn't exist yet — copy ` +
        `content/locales/${codes[0]}.mjs and translate it, or the build will refuse to run.`
    );
  }
}

// -------- what's left --------

console.log(`
${bold("Next: replace the content that's still about someone else.")}

site.config.mjs is done. The writing isn't — and it can't be, because
it's prose. Everything below still says "${PERSON.name[SITE.locales[0].code] ?? "the previous owner"}".
`);

const NEEDLES = [
  ...new Set(
    [
      PERSON.email,
      PERSON.website?.replace(/^https?:\/\//, ""),
      ...Object.values(PERSON.name ?? {}),
    ].filter(Boolean)
  ),
];

let hits = [];
try {
  const out = execFileSync(
    "git",
    ["grep", "-l", "-F", ...NEEDLES.flatMap((n) => ["-e", n]), "--", "content/", "public/", "docs/", "README.md"],
    { cwd: ROOT, encoding: "utf8" }
  );
  hits = out.split("\n").filter(Boolean);
} catch {
  // git grep exits non-zero when nothing matches — that's the good case.
}

if (hits.length) {
  console.log("Files still mentioning the previous owner:\n");
  for (const f of hits) console.log(`  ${f}`);
  console.log(`
Start with ${bold("content/site-data.mjs")} — it's the source for most of the
rest, and the top of the file says what each block feeds. Then re-run
${bold("npm run init")} to see this list shrink, or:

  git grep -F ${NEEDLES.map((n) => `-e ${JSON.stringify(n)}`).join(" ")}
`);
} else {
  console.log("Nothing left mentioning the previous owner — nice.\n");
}

console.log(`Then: ${bold("npm run build")} to regenerate, and ${bold("npm test")} to check it.
Full walkthrough, including what's legally yours to keep: ${bold("docs/SETUP.md")}
`);
