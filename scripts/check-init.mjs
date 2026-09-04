#!/usr/bin/env node
// Checks that `npm run init`'s config rewriter produces a file that is
// still valid, still fully commented, and actually says what it was
// told to say.
//
//   npm run test:init
//
// This exists because init.mjs is the one script a forker runs before
// they know anything about the repo, on the one file whose comments are
// the documentation. If it mangles site.config.mjs, it does so on their
// very first command, and they have no way to tell what went wrong.
//
// The prompts themselves aren't tested — they're a thin wrapper. What's
// tested is applyConfig(), which is where the damage would happen.

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { applyConfig, defaultLocaleRow } from "./lib/write-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const original = readFileSync(join(ROOT, "site.config.mjs"), "utf8");

const problems = [];
const check = (label, cond, detail = "") => {
  if (!cond) problems.push(`  ${label}${detail ? " — " + detail : ""}`);
};

const CASES = [
  {
    name: "a different domain, two languages, everything on",
    answers: {
      baseUrl: "https://jane.example",
      basePath: "",
      terminalHost: "jane.dev",
      locales: [defaultLocaleRow("en"), defaultLocaleRow("de")],
      mirrorsEnabled: true,
      gameEnabled: true,
      gameUrl: "https://example.com/game",
      gameTitle: "Some Game",
      deployTarget: "aws",
      deployBucket: "jane-bucket",
    },
  },
  {
    name: "a GitHub project page, English only, everything off",
    answers: {
      baseUrl: "https://jane.github.io",
      basePath: "/portfolio",
      terminalHost: "jane.dev",
      locales: [defaultLocaleRow("en")],
      mirrorsEnabled: false,
      gameEnabled: false,
      gameUrl: "https://example.com/game",
      gameTitle: "Some Game",
      deployTarget: "yandex",
      deployBucket: "",
    },
  },
];

const dir = mkdtempSync(join(tmpdir(), "init-check-"));
try {
  for (const { name, answers } of CASES) {
    let written;
    try {
      written = applyConfig(original, answers);
    } catch (err) {
      problems.push(`  ${name}: applyConfig threw — ${err.message}`);
      continue;
    }

    // It has to still parse, and still export what the build imports.
    const file = join(dir, `${name.replace(/\W+/g, "-")}.mjs`);
    writeFileSync(file, written);
    let SITE;
    try {
      ({ SITE } = await import(pathToFileURL(file).href));
    } catch (err) {
      problems.push(`  ${name}: the rewritten config doesn't parse — ${err.message}`);
      continue;
    }

    const a = answers;
    check(`${name}: baseUrl`, SITE.baseUrl === a.baseUrl, `got ${SITE.baseUrl}`);
    check(`${name}: basePath`, SITE.basePath === a.basePath, `got ${JSON.stringify(SITE.basePath)}`);
    check(`${name}: terminalHost`, SITE.terminalHost === a.terminalHost, `got ${SITE.terminalHost}`);
    check(
      `${name}: locales`,
      JSON.stringify(SITE.locales.map((l) => l.code)) === JSON.stringify(a.locales.map((l) => l.code)),
      `got ${SITE.locales.map((l) => l.code).join(",")}`
    );
    check(`${name}: every locale keeps its shape`, SITE.locales.every((l) => l.code && l.ogLocale && l.label));
    // The two `enabled:` keys are one block apart and easy to confuse.
    check(`${name}: mirrors.enabled`, SITE.mirrors.enabled === a.mirrorsEnabled, `got ${SITE.mirrors.enabled}`);
    check(`${name}: game.enabled`, SITE.game.enabled === a.gameEnabled, `got ${SITE.game.enabled}`);
    check(`${name}: game.url`, SITE.game.url === a.gameUrl);
    check(`${name}: game.title`, SITE.game.title === a.gameTitle);
    check(`${name}: deploy.target`, SITE.deploy.target === a.deployTarget);
    check(`${name}: deploy.bucket`, SITE.deploy.bucket === a.deployBucket);
    // Untouched keys must survive.
    check(`${name}: themeColor untouched`, SITE.themeColor === "#060a08", `got ${SITE.themeColor}`);
    check(`${name}: mirrors.path untouched`, SITE.mirrors.path === "llm", `got ${SITE.mirrors.path}`);

    // The comments are the documentation — losing them is the failure
    // mode a "does it still parse" check would miss entirely.
    const commentsBefore = (original.match(/^\s*\/\//gm) || []).length;
    const commentsAfter = (written.match(/^\s*\/\//gm) || []).length;
    check(
      `${name}: keeps every explanatory comment`,
      commentsAfter === commentsBefore,
      `${commentsBefore} before, ${commentsAfter} after`
    );
  }

  // Re-running init with the current values must be a no-op.
  {
    const { SITE } = await import(pathToFileURL(join(ROOT, "site.config.mjs")).href);
    const same = applyConfig(original, {
      baseUrl: SITE.baseUrl,
      basePath: SITE.basePath,
      terminalHost: SITE.terminalHost,
      locales: SITE.locales,
      mirrorsEnabled: SITE.mirrors.enabled,
      gameEnabled: SITE.game.enabled,
      gameUrl: SITE.game.url,
      gameTitle: SITE.game.title,
      deployTarget: SITE.deploy.target,
      deployBucket: SITE.deploy.bucket,
    });
    check("re-running init with unchanged answers rewrites nothing", same === original);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (problems.length) {
  console.error(`${problems.length} problem(s) rewriting site.config.mjs:\n`);
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`site.config.mjs rewriting is sound (${CASES.length} configurations, comments preserved, idempotent).`);
