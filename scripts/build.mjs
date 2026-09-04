#!/usr/bin/env node
// Propagates content/site-data.mjs into index.html, cv.html, and the 4
// llm/* mirror pages. Run after editing content/site-data.mjs, then
// review `git diff` before committing/deploying. See UPDATE-GUIDE.md.
//
// No npm dependencies — Node built-ins only.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ABOUT, SOCIALS, SKILLS, JOBS, CERTS, LANGUAGES, EDUCATION, TRAITS, NOW_PLAYING } from "../content/site-data.mjs";
import { aboutCvParagraph, jobLocationText } from "./lib/content.mjs";
import { replaceMarker } from "./lib/markers.mjs";
import { validateSiteData } from "./lib/validate-content.mjs";
import { renderIndexMirror, renderIndexNoscript } from "./templates/mirror-index.mjs";
import { renderCvMirror, renderCvNoscript } from "./templates/mirror-cv.mjs";
import { buildIndexJsonLd, buildCvJsonLd, jsonLdScript } from "./templates/jsonld.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_ROOT = join(ROOT, "public");
const path = (p) => join(PUBLIC_ROOT, p);
const read = (p) => readFileSync(path(p), "utf8");
const write = (p, content) => writeFileSync(path(p), content);

// -------- small formatters matching the hand-written array/object style
// already used in index.html / cv.html (compact, unquoted object keys) --------

function tupleRow(arr) {
  return "    " + JSON.stringify(arr) + ",";
}

function tupleBlock(rows) {
  return rows.map(tupleRow).join("\n");
}

// -------- index.html --------

function buildIndexHtml() {
  let html = read("index.html");

  const aboutBody = `  const ABOUT_EN = \`${ABOUT.en}\`;\n\n  const ABOUT_RU = \`${ABOUT.ru}\`;`;
  html = replaceMarker(html, "ABOUT", aboutBody);

  const indexSkills = SKILLS.filter((s) => s.contexts.includes("index"));
  const skillsBody =
    `  const SKILLS_EN = [\n${tupleBlock(indexSkills.map((s) => [s.key.en, s.val]))}\n  ];\n\n` +
    `  const SKILLS_RU = [\n${tupleBlock(indexSkills.map((s) => [s.key.ru, s.val]))}\n  ];`;
  html = replaceMarker(html, "SKILLS", skillsBody);

  const indexSocials = SOCIALS.filter((s) => s.contexts.includes("index"));
  const socialsBody = `  const SOCIALS = [\n${tupleBlock(indexSocials.map((s) => [s.label, s.href, s.display]))}\n  ];`;
  html = replaceMarker(html, "SOCIALS", socialsBody);

  const nowPlayingBody = `  const NP_ENDPOINT = ${JSON.stringify(NOW_PLAYING.endpoint)};\n  const NP_POLL_MS = ${JSON.stringify(NOW_PLAYING.pollMs)};`;
  html = replaceMarker(html, "NOWPLAYING", nowPlayingBody);

  // The live page's head JSON-LD isn't re-rendered by the RU/EN toggle
  // today; keep that behavior — always the English version (matches
  // cv.html's precedent).
  const jsonLdBody = jsonLdScript(buildIndexJsonLd("en"));
  html = replaceMarker(html, "JSONLD", jsonLdBody, { style: "html" });

  // <noscript> fallback for non-JS clients that fetch this page directly
  // — same "always English" reasoning as the JSON-LD block above.
  const noscriptBody = renderIndexNoscript("en");
  html = replaceMarker(html, "NOSCRIPT", noscriptBody, { style: "html" });

  write("index.html", html);
}

// -------- cv.html --------

function certRow(c) {
  return `    {yr:${JSON.stringify(c.yr)}, name:${JSON.stringify(c.name)}},`;
}

function languageRow(l) {
  return (
    `    {name:{en:${JSON.stringify(l.name.en)}, ru:${JSON.stringify(l.name.ru)}}, filled:${l.filled}, ` +
    `sub:{en:${JSON.stringify(l.sub.en)}, ru:${JSON.stringify(l.sub.ru)}}},`
  );
}

function skillDetailedRow(s) {
  return `    {key:{en:${JSON.stringify(s.key.en)}, ru:${JSON.stringify(s.key.ru)}}, val:${JSON.stringify(s.val)}},`;
}

function traitRow(t) {
  return "      " + JSON.stringify(t) + ",";
}

// cv.html's render() still reads the old flat {co, loc:{en,ru}} shape —
// derive it from the canonical `org` field rather than touching that
// (untouched, hand-authored) rendering logic.
function legacyJobRow(job) {
  const bullets = (lang) => {
    const core = job.bullets[lang];
    return job.playfulBullet ? [...core, job.playfulBullet[lang]] : core;
  };
  const lines = [];
  lines.push(`    {`);
  lines.push(`      dates:{en:${JSON.stringify(job.dates.en)}, ru:${JSON.stringify(job.dates.ru)}}, span:{en:${JSON.stringify(job.span.en)}, ru:${JSON.stringify(job.span.ru)}},`);
  lines.push(`      co:${JSON.stringify(job.org.name)}, loc:{en:${JSON.stringify(jobLocationText(job, "en"))}, ru:${JSON.stringify(jobLocationText(job, "ru"))}},`);
  lines.push(`      title:{en:${JSON.stringify(job.title.en)}, ru:${JSON.stringify(job.title.ru)}},`);
  lines.push(`      bullets:{`);
  lines.push(`        en:[\n${bullets("en").map((b) => `          ${JSON.stringify(b)},`).join("\n")}\n        ],`);
  lines.push(`        ru:[\n${bullets("ru").map((b) => `          ${JSON.stringify(b)},`).join("\n")}\n        ],`);
  lines.push(`      },`);
  lines.push(`      tech: ${JSON.stringify(job.tech)},`);
  lines.push(`    },`);
  return lines.join("\n");
}

function buildCvHtml() {
  let html = read("cv.html");

  const cvSocials = SOCIALS.filter((s) => s.contexts.includes("cv"));
  const socialsBody = `  const SOCIALS = [\n${tupleBlock(cvSocials.map((s) => [s.label, s.href]))}\n  ];`;
  html = replaceMarker(html, "SOCIALS", socialsBody);

  const jobsBody = `  const JOBS = [\n${JOBS.map(legacyJobRow).join("\n")}\n  ];`;
  html = replaceMarker(html, "JOBS", jobsBody);

  const certsBody = `  const CERTS = [\n${CERTS.map(certRow).join("\n")}\n  ];`;
  html = replaceMarker(html, "CERTS", certsBody);

  const languagesBody = `  const LANGUAGES = [\n${LANGUAGES.map(languageRow).join("\n")}\n  ];`;
  html = replaceMarker(html, "LANGUAGES", languagesBody);

  const cvSkills = SKILLS.filter((s) => s.contexts.includes("cv"));
  const skillsBody = `  const SKILLS = [\n${cvSkills.map(skillDetailedRow).join("\n")}\n  ];`;
  html = replaceMarker(html, "SKILLS", skillsBody);

  const aboutCvBody = `  const ABOUT_CV_EN = \`${aboutCvParagraph("en")}\`;\n  const ABOUT_CV_RU = \`${aboutCvParagraph("ru")}\`;`;
  html = replaceMarker(html, "ABOUT_CV", aboutCvBody);

  const traitsBody =
    `  const TRAITS = {\n    en:[\n${TRAITS.en.map(traitRow).join("\n")}\n    ],\n    ru:[\n${TRAITS.ru.map(traitRow).join("\n")}\n    ],\n  };`;
  html = replaceMarker(html, "TRAITS", traitsBody);

  const eduBody =
    `  const EDUCATION_BODY_EN = \`<b>${EDUCATION.university.en}</b> &mdash; ${EDUCATION.place.en}, ${EDUCATION.year}<br>\n        <span class="dim">${EDUCATION.field.en}</span>\`;\n` +
    `  const EDUCATION_BODY_RU = \`<b>${EDUCATION.university.ru}</b> &mdash; ${EDUCATION.place.ru}, ${EDUCATION.year}<br>\n        <span class="dim">${EDUCATION.field.ru}</span>\`;`;
  html = replaceMarker(html, "EDUCATION_BODY", eduBody);

  // The live page's head JSON-LD isn't re-rendered by the RU/EN toggle
  // today; keep that behavior — always the English version.
  const jsonLdBody = jsonLdScript(buildCvJsonLd("en"));
  html = replaceMarker(html, "JSONLD", jsonLdBody, { style: "html" });

  // <noscript> fallback for non-JS clients that fetch this page directly
  // — same "always English" reasoning as the JSON-LD block above.
  const noscriptBody = renderCvNoscript("en");
  html = replaceMarker(html, "NOSCRIPT", noscriptBody, { style: "html" });

  write("cv.html", html);
}

// -------- llm/* mirrors (fully regenerated) --------

function buildMirrors() {
  write("llm/index.html", renderIndexMirror("en"));
  write("llm/ru/index.html", renderIndexMirror("ru"));
  write("llm/cv.html", renderCvMirror("en"));
  write("llm/ru/cv.html", renderCvMirror("ru"));
}

// -------- sitemap.xml lastmod bump --------
// Bumps <lastmod> only for the sitemapped URLs whose backing file
// actually changed in the working tree vs the last commit — git's diff
// is the source of truth, no separate cache file needed.

const SITEMAP_URLS = [
  { url: "https://nikita.sh/", file: "public/index.html" },
  { url: "https://nikita.sh/cv.html", file: "public/cv.html" },
  { url: "https://nikita.sh/llm/", file: "public/llm/index.html" },
  { url: "https://nikita.sh/llm/cv.html", file: "public/llm/cv.html" },
  { url: "https://nikita.sh/llm/ru/", file: "public/llm/ru/index.html" },
  { url: "https://nikita.sh/llm/ru/cv.html", file: "public/llm/ru/cv.html" },
];

function changedFiles() {
  try {
    const out = execFileSync("git", ["status", "--porcelain", "--", ...SITEMAP_URLS.map((u) => u.file)], {
      cwd: ROOT,
      encoding: "utf8",
    });
    return new Set(
      out
        .split("\n")
        .filter(Boolean)
        .map((line) => line.slice(3).trim())
    );
  } catch {
    return new Set(); // not a git repo / git unavailable — skip lastmod bump
  }
}

function bumpSitemap() {
  const changed = changedFiles();
  if (changed.size === 0) return;

  let xml = read("sitemap.xml");
  const today = new Date().toISOString().slice(0, 10);
  let bumped = [];

  for (const { url, file } of SITEMAP_URLS) {
    if (!changed.has(file)) continue;
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    const re = new RegExp(`(<loc>${escapedUrl}</loc>\\s*<lastmod>)[^<]+(</lastmod>)`);
    if (re.test(xml)) {
      xml = xml.replace(re, `$1${today}$2`);
      bumped.push(url);
    }
  }

  if (bumped.length) {
    write("sitemap.xml", xml);
    console.log(`sitemap.xml: bumped lastmod -> ${today} for:\n  ${bumped.join("\n  ")}`);
  }
}

// -------- run --------

// Fail before writing anything: a shape error in site-data.mjs (a plain
// string where a locale map belongs, or vice versa) generates wrong-but-
// consistent output that the drift check would happily accept.
validateSiteData();

buildIndexHtml();
buildCvHtml();
buildMirrors();
bumpSitemap();
console.log("Build complete.");
