#!/usr/bin/env node
// Propagates content/site-data.mjs into index.html, cv.html, and the 4
// llm/* mirror pages. Run after editing content/site-data.mjs, then
// review `git diff` before committing/deploying. See UPDATE-GUIDE.md.
//
// No npm dependencies — Node built-ins only.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ABOUT, SOCIALS, SKILLS, JOBS, CERTS, LANGUAGES, EDUCATION, TRAITS, NOW_PLAYING, PAGES } from "../content/site-data.mjs";
import { aboutCvParagraph, jobLocationText } from "./lib/content.mjs";
import { replaceMarker } from "./lib/markers.mjs";
import { validateSiteData } from "./lib/validate-content.mjs";
import { loadLocales } from "./lib/locales.mjs";
import { renderIndexMirror, renderIndexNoscript } from "./templates/mirror-index.mjs";
import { renderCvMirror, renderCvNoscript } from "./templates/mirror-cv.mjs";
import { buildIndexJsonLd, buildCvJsonLd, jsonLdScript } from "./templates/jsonld.mjs";
import { renderHead } from "./templates/head.mjs";
import { renderI18n } from "./templates/i18n.mjs";
import { renderLocalesBlock } from "./templates/locales-block.mjs";
import { renderTerminalBlock } from "./templates/terminal-block.mjs";
import { renderFooter, renderFooterBack, renderBackLink, renderTopbarLabel, renderTermTitle, renderGameTitle } from "./templates/footer.mjs";
import { renderRobotsTxt } from "./templates/robots-txt.mjs";
import { renderLlmsTxt } from "./templates/llms-txt.mjs";
import { renderWebmanifest } from "./templates/webmanifest.mjs";
import { renderSitemapXml } from "./templates/sitemap-xml.mjs";
import { siteUrl, mirrorUrl, mirrorPath, mirrorDir, localeCodes, defaultLocale } from "./lib/site-urls.mjs";
import { SITE } from "../site.config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_ROOT = join(ROOT, "public");
const path = (p) => join(PUBLIC_ROOT, p);

// What the GENERATED:I18N marker comment tells a reader to edit.
const I18N_SOURCE = "content/locales/*.mjs";

// GENERATED:LOCALES comes from the locale list, not the strings.
const LOCALES_SOURCE = "site.config.mjs";
const CONFIG_SOURCE = "site.config.mjs";
const read = (p) => readFileSync(path(p), "utf8");
const write = (p, content) => writeFileSync(path(p), content);
const exists = (p) => existsSync(path(p));

// -------- small formatters matching the hand-written array/object style
// already used in index.html / cv.html (compact, unquoted object keys) --------

// `{en:"x", ru:"y"}` for however many locales there are. cv.html's
// hand-authored render() indexes these by locale code, so the shape has
// to follow site.config.mjs rather than a hardcoded pair.
function localeMap(render) {
  return `{${localeCodes.map((c) => `${c}:${render(c)}`).join(", ")}}`;
}

function tupleRow(arr, indent = 2) {
  return "  ".repeat(indent) + JSON.stringify(arr) + ",";
}

function tupleBlock(rows, indent = 2) {
  return rows.map((r) => tupleRow(r, indent)).join("\n");
}

// -------- index.html --------

function buildIndexHtml() {
  let html = read("index.html");

  html = replaceMarker(html, "HEAD", renderHead("index", { pagePath: "", mirrorFile: "" }), { style: "html" });

  // Locale maps rather than ABOUT_EN/ABOUT_RU consts, so index.html
  // indexes by locale code and a third language needs no new identifier
  // and no new `lang === 'ru' ? … : …` at the call site.
  const aboutBody =
    "  const ABOUT_TEXT = {\n" +
    localeCodes.map((c) => `    ${c}: \`${ABOUT[c]}\`,`).join("\n\n") +
    "\n  };";
  html = replaceMarker(html, "ABOUT", aboutBody);

  const indexSkills = SKILLS.filter((s) => s.contexts.includes("index"));
  const skillsBody =
    "  const SKILLS_ROWS = {\n" +
    localeCodes
      .map((c) => `    ${c}: [\n${tupleBlock(indexSkills.map((s) => [s.key[c], s.val]), 3)}\n    ],`)
      .join("\n\n") +
    "\n  };";
  html = replaceMarker(html, "SKILLS", skillsBody);

  const indexSocials = SOCIALS.filter((s) => s.contexts.includes("index"));
  const socialsBody = `  const SOCIALS = [\n${tupleBlock(indexSocials.map((s) => [s.label, s.href, s.display]))}\n  ];`;
  html = replaceMarker(html, "SOCIALS", socialsBody);

  html = replaceMarker(html, "I18N", renderI18n(LOCALES, "terminal"), { source: I18N_SOURCE });
  html = replaceMarker(html, "LOCALES", renderLocalesBlock(), { source: LOCALES_SOURCE });
  html = replaceMarker(html, "TERMINAL", renderTerminalBlock(), { source: CONFIG_SOURCE });
  html = replaceMarker(html, "FOOTER", renderFooter(), { style: "html" });
  html = replaceMarker(html, "TERMTITLE", renderTermTitle("bash — 80×24"), { style: "html", source: CONFIG_SOURCE });
  html = replaceMarker(html, "GAMETITLE", renderGameTitle(), { style: "html", source: CONFIG_SOURCE });
  html = replaceMarker(html, "TOPBAR_LABEL", renderTopbarLabel(), { style: "html", source: CONFIG_SOURCE });

  const nowPlayingBody = `  const NP_ENDPOINT = ${JSON.stringify(NOW_PLAYING.endpoint)};\n  const NP_POLL_MS = ${JSON.stringify(NOW_PLAYING.pollMs)};`;
  html = replaceMarker(html, "NOWPLAYING", nowPlayingBody);

  // The live page's head JSON-LD isn't re-rendered by the language
  // toggle today; keep that behavior — always the default locale
  // (matches cv.html's precedent).
  const jsonLdBody = jsonLdScript(buildIndexJsonLd(defaultLocale.code));
  html = replaceMarker(html, "JSONLD", jsonLdBody, { style: "html" });

  // <noscript> fallback for non-JS clients that fetch this page directly
  // — same "always the default locale" reasoning as the JSON-LD above.
  const noscriptBody = renderIndexNoscript(defaultLocale.code);
  html = replaceMarker(html, "NOSCRIPT", noscriptBody, { style: "html" });

  write("index.html", html);
}

// -------- cv.html --------

function certRow(c) {
  return `    {yr:${JSON.stringify(c.yr)}, name:${JSON.stringify(c.name)}},`;
}

function languageRow(l) {
  return (
    `    {name:${localeMap((c) => JSON.stringify(l.name[c]))}, filled:${l.filled}, ` +
    `sub:${localeMap((c) => JSON.stringify(l.sub[c]))}},`
  );
}

function skillDetailedRow(s) {
  return `    {key:${localeMap((c) => JSON.stringify(s.key[c]))}, val:${JSON.stringify(s.val)}},`;
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
  lines.push(`      dates:${localeMap((c) => JSON.stringify(job.dates[c]))}, span:${localeMap((c) => JSON.stringify(job.span[c]))},`);
  lines.push(`      co:${JSON.stringify(job.org.name)}, loc:${localeMap((c) => JSON.stringify(jobLocationText(job, c)))},`);
  lines.push(`      title:${localeMap((c) => JSON.stringify(job.title[c]))},`);
  lines.push(`      bullets:{`);
  for (const c of localeCodes) {
    lines.push(`        ${c}:[\n${bullets(c).map((b) => `          ${JSON.stringify(b)},`).join("\n")}\n        ],`);
  }
  lines.push(`      },`);
  lines.push(`      tech: ${JSON.stringify(job.tech)},`);
  lines.push(`    },`);
  return lines.join("\n");
}

function buildCvHtml() {
  let html = read("cv.html");

  html = replaceMarker(html, "HEAD", renderHead("cv", { pagePath: "cv.html", mirrorFile: "cv.html" }), { style: "html" });

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

  // Locale maps rather than ABOUT_CV_EN/ABOUT_CV_RU consts: cv.html now
  // indexes these by locale code, so a third language needs no new
  // identifier and no new call site.
  const aboutCvBody =
    "  const ABOUT_CV = {\n" +
    localeCodes.map((c) => `    ${c}: \`${aboutCvParagraph(c)}\`,`).join("\n") +
    "\n  };";
  html = replaceMarker(html, "ABOUT_CV", aboutCvBody);

  const traitsBody =
    "  const TRAITS = {\n" +
    localeCodes.map((c) => `    ${c}:[\n${TRAITS[c].map(traitRow).join("\n")}\n    ],`).join("\n") +
    "\n  };";
  html = replaceMarker(html, "TRAITS", traitsBody);

  const eduBody =
    "  const EDUCATION_BODY = {\n" +
    localeCodes
      .map(
        (c) =>
          `    ${c}: \`<b>${EDUCATION.university[c]}</b> &mdash; ${EDUCATION.place[c]}, ${EDUCATION.year}<br>\n        <span class="dim">${EDUCATION.field[c]}</span>\`,`
      )
      .join("\n") +
    "\n  };";
  html = replaceMarker(html, "EDUCATION_BODY", eduBody);

  html = replaceMarker(html, "I18N", renderI18n(LOCALES, "cv"), { source: I18N_SOURCE });
  html = replaceMarker(html, "LOCALES", renderLocalesBlock(), { source: LOCALES_SOURCE });
  html = replaceMarker(html, "TERMINAL", renderTerminalBlock(), { source: CONFIG_SOURCE });
  html = replaceMarker(html, "FOOTER", renderFooter(), { style: "html" });
  html = replaceMarker(html, "FOOTER_BACK", renderFooterBack(), { style: "html", source: CONFIG_SOURCE });
  html = replaceMarker(html, "BACKLINK", renderBackLink(), { style: "html", source: CONFIG_SOURCE });
  html = replaceMarker(html, "TERMTITLE", renderTermTitle("open cv.html"), { style: "html", source: CONFIG_SOURCE });

  // The live page's head JSON-LD isn't re-rendered by the language
  // toggle today; keep that behavior — always the default locale.
  const jsonLdBody = jsonLdScript(buildCvJsonLd(defaultLocale.code));
  html = replaceMarker(html, "JSONLD", jsonLdBody, { style: "html" });

  // <noscript> fallback for non-JS clients that fetch this page directly
  // — same "always the default locale" reasoning as the JSON-LD above.
  const noscriptBody = renderCvNoscript(defaultLocale.code);
  html = replaceMarker(html, "NOSCRIPT", noscriptBody, { style: "html" });

  write("cv.html", html);
}

// -------- 404.html --------
// Previously untouched by the build (it had no markers at all). It now
// carries GENERATED:HEAD so its icon/manifest paths pick up basePath and
// its title/description come from PAGES like every other page. Nothing
// else in it is generated — the cat scene and its UI strings stay
// hand-authored.

function buildNotFoundHtml() {
  let html = read("404.html");
  // No canonical/OG/Twitter: it's noindex and served at arbitrary URLs,
  // so there's no single URL for it to claim or to share.
  html = replaceMarker(html, "HEAD", renderHead("notFound", { noindex: true, shareable: false }), { style: "html" });
  html = replaceMarker(html, "I18N", renderI18n(LOCALES, "notFound"), { source: I18N_SOURCE });
  html = replaceMarker(html, "LOCALES", renderLocalesBlock(), { source: LOCALES_SOURCE });
  html = replaceMarker(html, "TERMINAL", renderTerminalBlock(), { source: CONFIG_SOURCE });
  html = replaceMarker(html, "FOOTER", renderFooter(), { style: "html" });
  html = replaceMarker(html, "FOOTER_BACK", renderFooterBack(), { style: "html", source: CONFIG_SOURCE });
  html = replaceMarker(html, "BACKLINK", renderBackLink(), { style: "html", source: CONFIG_SOURCE });
  html = replaceMarker(html, "TERMTITLE", renderTermTitle("bash — 404"), { style: "html", source: CONFIG_SOURCE });
  write("404.html", html);
}

// -------- llm/* mirrors (fully regenerated) --------

function buildMirrors() {
  // Off is a supported configuration, not a degraded one: the live
  // pages already stop advertising hreflang alternates (head.mjs) and
  // llms.txt/sitemap.xml already stop listing mirror URLs (PR 3), so
  // the only thing left to do here is not write the files. The
  // <noscript> fallbacks come out of these same templates and are
  // unaffected — they never reference a mirror URL.
  if (!SITE.mirrors.enabled) {
    // Not just "don't write them": a fork clones this repo with the
    // original site's mirror pages already committed, and skipping would
    // leave them on disk, in the deploy manifest, and live — in whatever
    // language and about whoever the original was.
    pruneMirrorLocales({ all: true });
    console.log(`mirrors: disabled in site.config.mjs — public/${SITE.mirrors.path}/ not generated`);
    return;
  }

  pruneMirrorLocales();

  for (const code of localeCodes) {
    // A locale's mirror directory doesn't exist until something creates
    // it, and adding a locale to site.config.mjs is exactly the moment
    // nothing has. Without this the first build after that edit dies
    // with a bare ENOENT naming a path the forker never typed.
    mkdirSync(path(mirrorDir(code)), { recursive: true });
    write(mirrorPath(code, "index.html"), renderIndexMirror(code));
    write(mirrorPath(code, "cv.html"), renderCvMirror(code));
  }
}

// Removes mirror directories for locales that are no longer configured.
// A fork clones this repo with public/llm/ru/ already in it; dropping ru
// from site.config.mjs would otherwise leave those pages on disk, in the
// deploy manifest, and live on the site — stale content in a language
// the site no longer claims to speak.
//
// Deliberately narrow: only directories directly under the mirror path,
// only ones that aren't a configured locale, and only ones that look
// like generated mirrors (they contain an index.html). llm/style.css is
// hand-authored and sits outside any locale directory, so it's never a
// candidate.
function pruneMirrorLocales({ all = false } = {}) {
  const root = path(SITE.mirrors.path);
  if (!existsSync(root)) return;

  // With mirrors switched off, remove the two pages the default locale
  // keeps at the mirror root too. Only those two: llm/style.css is
  // hand-authored, so the build doesn't get to delete it.
  if (all) {
    for (const file of ["index.html", "cv.html"]) {
      const full = join(root, file);
      if (existsSync(full)) {
        rmSync(full);
        console.log(`mirrors: removed public/${SITE.mirrors.path}/${file}`);
      }
    }
  }

  const keep = all ? new Set() : new Set(localeCodes);
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || keep.has(entry.name)) continue;
    const dir = join(root, entry.name);
    if (!existsSync(join(dir, "index.html"))) continue;
    rmSync(dir, { recursive: true });
    console.log(`mirrors: removed public/${SITE.mirrors.path}/${entry.name}/ — "${entry.name}" is not in site.config.mjs's locales`);
  }
}

// -------- robots.txt / llms.txt / site.webmanifest --------
// Fully regenerated, like the mirrors. Nothing in them is stateful, so
// they're a plain render of site.config.mjs + content/site-data.mjs.

function buildMetaFiles() {
  write("robots.txt", renderRobotsTxt());
  write("llms.txt", renderLlmsTxt());
  write("site.webmanifest", renderWebmanifest());
}

// -------- sitemap.xml --------
// The URL set is derived from site.config.mjs rather than hand-listed,
// so it stays correct when the domain, the locale list or
// mirrors.enabled change. Order matches the previous hand-written file
// (live pages first, then mirrors).

const SITEMAP_ENTRIES = [
  { url: siteUrl(""), file: "public/index.html" },
  {
    url: siteUrl("cv.html"),
    file: "public/cv.html",
    image: { loc: siteUrl(PAGES.cv.sitemapImage.file), title: PAGES.cv.sitemapImage.title },
  },
  ...(SITE.mirrors.enabled
    ? localeCodes.flatMap((code) => [
        { url: mirrorUrl(code, ""), file: `public/${mirrorPath(code, "index.html")}`, alternateFile: "" },
        { url: mirrorUrl(code, "cv.html"), file: `public/${mirrorPath(code, "cv.html")}`, alternateFile: "cv.html" },
      ])
    : []),
];

// -------- lastmod --------
// <lastmod> is the one thing in the generated output that isn't a pure
// function of the sources: "when did this page last change" is a fact
// about history, not about the current content.
//
// So it's carried forward from the sitemap already in the tree, and
// only bumped to today for URLs whose backing file is dirty in the
// working tree right now (git's diff is the source of truth; no
// separate cache file). That keeps the property the whole build relies
// on — running the build twice produces the same bytes — while still
// dating a page the day you actually change it.
//
// Note this rules out the more obvious-looking `git log -1 --format=%cs
// -- <file>`: the commit that changes index.html is the same commit
// that carries the regenerated sitemap.xml, so the date to write is one
// the build cannot know yet. CI would then regenerate a different date
// than the one committed and fail the drift check on every content
// commit. The working-tree check reads the same intent a moment
// earlier, while the answer is still knowable.

function existingLastmods() {
  if (!exists("sitemap.xml")) return new Map();
  const xml = read("sitemap.xml");
  const map = new Map();
  const re = /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
  for (const m of xml.matchAll(re)) map.set(m[1], m[2]);
  return map;
}

function changedFiles() {
  try {
    const out = execFileSync("git", ["status", "--porcelain", "--", ...SITEMAP_ENTRIES.map((u) => u.file)], {
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
    return new Set(); // not a git repo / git unavailable — keep existing dates
  }
}

function buildSitemap() {
  const previous = existingLastmods();
  const changed = changedFiles();
  const today = new Date().toISOString().slice(0, 10);
  const bumped = [];

  const entries = SITEMAP_ENTRIES.map((e) => {
    // A URL with no previous date is new to the sitemap, so today is
    // both the best answer and the only one available.
    const lastmod = changed.has(e.file) || !previous.has(e.url) ? today : previous.get(e.url);
    if (lastmod !== previous.get(e.url)) bumped.push(e.url);
    return { ...e, lastmod };
  });

  write("sitemap.xml", renderSitemapXml(entries));

  if (bumped.length) {
    console.log(`sitemap.xml: lastmod -> ${today} for:\n  ${bumped.join("\n  ")}`);
  }
}

// -------- run --------

// Fail before writing anything: a shape error in site-data.mjs (a plain
// string where a locale map belongs, or vice versa) generates wrong-but-
// consistent output that the drift check would happily accept.
// Reported as a message, not a stack trace: this is the first command a
// forker runs, and 70 lines of node internals underneath the answer is
// not a good introduction.
try {
  validateSiteData();
} catch (err) {
  console.error(`\n${err.message}\n`);
  process.exit(1);
}

// Loads content/locales/*.mjs and fails if any locale disagrees with the
// default one's key set — before a page is written with "undefined" in it.
const LOCALES = await loadLocales();

buildIndexHtml();
buildCvHtml();
buildNotFoundHtml();
buildMirrors();
buildMetaFiles();
buildSitemap();
console.log("Build complete.");
