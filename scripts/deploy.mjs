#!/usr/bin/env node
// Deploys the static site to Yandex Object Storage via the `yc` CLI.
// Zero npm dependencies — shells out to `yc storage s3api put-object`,
// same tool the manual workflow in docs/UPDATE-GUIDE.md already used.
//
// Usage:
//   node scripts/deploy.mjs --dry-run                  # preview, no network calls, no bucket needed
//   node scripts/deploy.mjs --bucket my-bucket          # deploy for real
//   NIKITASH_BUCKET=my-bucket node scripts/deploy.mjs   # --bucket falls back to this env var
//
// Always uploads the full fixed manifest below (not "files changed since
// last deploy") — git only knows local history, not what's actually live
// in the bucket, and the site is small enough that a full upload is fast
// regardless.

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
  const args = { dryRun: false, bucket: null, profile: process.env.YC_PROFILE || null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--bucket") args.bucket = argv[++i];
    else if (argv[i] === "--profile") args.profile = argv[++i];
  }
  if (!args.bucket) args.bucket = process.env.NIKITASH_BUCKET || null;
  return args;
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
  const manifest = buildManifest();

  if (args.dryRun) {
    console.log(`Dry run — ${manifest.length} file(s) would be uploaded to bucket "${args.bucket || "<bucket not set>"}":\n`);
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
