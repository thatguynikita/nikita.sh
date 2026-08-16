#!/usr/bin/env node
// Deploys the static site to Yandex Object Storage via the `yc` CLI.
// Zero npm dependencies — shells out to `yc storage s3api put-object`,
// same tool the manual workflow in docs/UPDATE-GUIDE.md already used.
//
// Usage:
//   node scripts/deploy.mjs --dry-run                        # preview everything, no network calls, no bucket needed
//   node scripts/deploy.mjs --bucket my-bucket                # deploy the full manifest
//   node scripts/deploy.mjs --bucket my-bucket index.html cv.html
//                                                               # deploy only these files
//   NIKITASH_BUCKET=my-bucket node scripts/deploy.mjs llm/index.html
//                                                               # --bucket falls back to this env var
//
// With no file arguments, uploads the full fixed manifest below (not
// "files changed since last deploy") — git only knows local history, not
// what's actually live in the bucket, and the site is small enough that a
// full upload is fast regardless. Pass specific paths (repo-relative,
// same as they appear in --dry-run output) to deploy just those instead
// — each one is still validated against the manifest below, so this
// narrows *which* of the deployable files get pushed, it can't be used
// to deploy something outside the allowlist (e.g. content/site-data.mjs).

import { readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// -------- manifest: explicit allowlist, not a blocklist --------
// content/, scripts/, docs/, spotify/, README.md, .claude/, .git etc.
// can never end up here by accident.

const ROOT_FILES = [
  "index.html",
  "cv.html",
  "theme.css",
  "theme.js",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "llms.txt",
];

const DIRS = ["assets", "llm"];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(join(ROOT, dir), { recursive: true })) {
    if (name.split(/[\\/]/).some((part) => part.startsWith("."))) continue; // .DS_Store etc.
    const full = join(ROOT, dir, name);
    if (statSync(full).isDirectory()) continue;
    out.push(relative(ROOT, full).split("\\").join("/"));
  }
  return out;
}

function buildManifest() {
  const files = [...ROOT_FILES];
  for (const dir of DIRS) files.push(...walk(dir));
  return files.sort();
}

// -------- content-type table --------
// This is the part that replaces picking it by hand — the exact mistake
// that caused the llms.txt charset-garbling bug docs/UPDATE-GUIDE.md
// mentions: S3-compatible storage doesn't infer charset from extension.

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

function contentTypeFor(key) {
  const ext = extname(key).toLowerCase();
  const type = CONTENT_TYPES[ext];
  if (!type) {
    console.warn(`warning: no content-type mapping for "${ext}" (${key}) — falling back to application/octet-stream`);
    return "application/octet-stream";
  }
  return type;
}

// -------- args --------

function parseArgs(argv) {
  const args = { dryRun: false, bucket: null, profile: process.env.YC_PROFILE || null, files: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--bucket") args.bucket = argv[++i];
    else if (argv[i] === "--profile") args.profile = argv[++i];
    else if (argv[i].startsWith("--")) {
      console.error(`Error: unknown flag "${argv[i]}".`);
      process.exit(1);
    } else {
      args.files.push(argv[i].replace(/^\.\//, "").split("\\").join("/"));
    }
  }
  if (!args.bucket) args.bucket = process.env.NIKITASH_BUCKET || null;
  return args;
}

// Narrows the full manifest down to just the requested files, if any were
// given — erroring out (not silently skipping) on anything not in the
// manifest, so this can't become a backdoor around the allowlist.
function selectFiles(fullManifest, requested) {
  if (!requested.length) return fullManifest;
  const manifestSet = new Set(fullManifest);
  const invalid = requested.filter((f) => !manifestSet.has(f));
  if (invalid.length) {
    console.error(`Error: not in the deployable manifest: ${invalid.join(", ")}`);
    console.error("Run with --dry-run (no file arguments) to see every deployable path.");
    process.exit(1);
  }
  return requested;
}

function warnIfDirty() {
  try {
    const out = execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" });
    if (out.trim()) {
      console.warn("warning: working tree has uncommitted changes — deploying what's on disk, not necessarily what's committed.\n");
    }
  } catch {
    // not a git repo / git unavailable — nothing to warn about
  }
}

// -------- run --------

function main() {
  const args = parseArgs(process.argv.slice(2));
  const fullManifest = buildManifest();
  const manifest = selectFiles(fullManifest, args.files);
  const selectionNote = args.files.length ? ` (${manifest.length} of ${fullManifest.length} deployable files selected)` : "";

  if (args.dryRun) {
    console.log(`Dry run${selectionNote} — ${manifest.length} file(s) would be uploaded to bucket "${args.bucket || "<bucket not set>"}":\n`);
    for (const key of manifest) {
      console.log(`  ${key.padEnd(40)} -> ${contentTypeFor(key)}`);
    }
    console.log("\nNo network calls made.");
    return;
  }

  if (!args.bucket) {
    console.error("Error: no bucket specified. Pass --bucket <name> or set NIKITASH_BUCKET.");
    process.exit(1);
  }

  warnIfDirty();

  console.log(`Deploying ${manifest.length} file(s)${selectionNote} to bucket "${args.bucket}":\n`);

  const results = { ok: [], failed: [] };
  for (const key of manifest) {
    const contentType = contentTypeFor(key);
    const body = join(ROOT, key);
    const cmd = ["storage", "s3api", "put-object", "--body", body, "--bucket", args.bucket, "--key", key, "--content-type", contentType];
    if (args.profile) cmd.push("--profile", args.profile);

    try {
      execFileSync("yc", cmd, { stdio: "pipe" });
      console.log(`  uploaded  ${key}`);
      results.ok.push(key);
    } catch (err) {
      console.error(`  FAILED    ${key}: ${err.stderr ? err.stderr.toString().trim() : err.message}`);
      results.failed.push(key);
    }
  }

  console.log(`\n${results.ok.length} uploaded, ${results.failed.length} failed.`);
  if (results.failed.length) {
    console.error("Failed keys: " + results.failed.join(", "));
    process.exit(1);
  }
}

main();
