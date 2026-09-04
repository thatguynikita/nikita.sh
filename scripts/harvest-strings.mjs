#!/usr/bin/env node
// Records tests/golden-strings.json — every string literal in the three
// pages' inline <script>, at a given git ref (default: HEAD).
//
//   node scripts/harvest-strings.mjs [ref]
//
// Re-run this ONLY when deliberately adding or rewording user-visible
// copy, and review the resulting diff: that diff is the list of strings
// you changed, which is exactly what a reviewer wants to see.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { harvestStrings } from "./lib/harvest-strings.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["public/index.html", "public/cv.html", "public/404.html"];
const ref = process.argv[2] || "HEAD";
// Record the resolved sha, not "HEAD" — the snapshot has to say which
// commit it describes for the diff to mean anything later.
const sha = execFileSync("git", ["rev-parse", ref], { cwd: ROOT, encoding: "utf8" }).trim();

const golden = {};
for (const page of PAGES) {
  const source = execFileSync("git", ["show", `${ref}:${page}`], { cwd: ROOT, encoding: "utf8" });
  golden[page] = harvestStrings(source);
}

const out = join(ROOT, "tests/golden-strings.json");
writeFileSync(out, JSON.stringify({ ref: sha, pages: golden }, null, 2) + "\n");
console.log(
  `tests/golden-strings.json written from ${ref} (${sha}):\n` +
    PAGES.map((p) => `  ${p}: ${golden[p].length} strings`).join("\n")
);
