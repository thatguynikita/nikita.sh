// Renders llm/cv.html (lang='en') and llm/ru/cv.html (lang='ru'), and the
// <noscript> fallback embedded in the live cv.html for clients that fetch
// it directly without executing JS (which is where all the real content
// normally comes from — see #termBody in cv.html).

import { PERSON, SOCIALS, SKILLS, JOBS, CERTS, LANGUAGES, EDUCATION, LICENSE_CONTENT } from "../../content/site-data.mjs";
import { escapeHtml } from "../lib/html.mjs";
import { aboutCvParagraph, jobWhenLine } from "../lib/content.mjs";
import { buildCvJsonLd, jsonLdScript } from "./jsonld.mjs";
import { siteUrl, mirrorUrl, displayUrl, locales, defaultLocale, isDefaultLocale, mirrorRelPath, mirrorRootRelPath, otherLocales, languageName } from "../lib/site-urls.mjs";

const UI = {
  en: {
    title: "Nikita Chernozipunnikov — CV",
    description: "Nikita Chernozipunnikov — DevOps / SRE CV. 11 years experience: VK, EPAM Anywhere, Assaia, Deutsche Telekom, ventx, Devexperts.",
    langsAria: "language versions",
    links: "Links",
    about: "About",
    experience: "Experience",
    education: "Education",
    certifications: "Certifications",
    languages: "Languages",
    skills: "Skills",
    tech: "tech:",
    back: "← back",
    // Rendered once per other locale and joined; the wrap point differs
    // per language, which is why this is a per-locale template rather
    // than one shared helper.
    otherVersion: (name, href, label) => `${name} version: <a href="${href}">${label}</a>`,
    notice: (live, others, back) =>
      `This is a plain-HTML mirror of ${live},\n    published for crawlers and AI agents that don't execute JavaScript. Content matches the\n    live site. Humans should visit ${live}\n    for the live version. ${others} ·\n    ${back}`,
    license: ({ year, holder, name, url }) =>
      `© ${year} ${holder}. Content licensed <a href="${url}">${name}</a> — view and share with attribution, no commercial use, no derivatives.`,
  },
  ru: {
    title: "Никита Чернозипунников — резюме",
    description: "Никита Чернозипунников — резюме DevOps / SRE. 11 лет опыта: VK, EPAM Anywhere, Assaia, Deutsche Telekom, ventx, Devexperts.",
    langsAria: "языковые версии",
    links: "Ссылки",
    about: "О себе",
    experience: "Опыт работы",
    education: "Образование",
    certifications: "Сертификаты",
    languages: "Языки",
    skills: "Навыки",
    tech: "стек:",
    back: "← назад",
    otherVersion: (name, href, label) => `${name} version:\n    <a href="${href}">${label}</a>`,
    notice: (live, others, back) =>
      `Это статическая HTML-версия ${live},\n    опубликованная для краулеров и AI-агентов, которые не выполняют JavaScript. Контент\n    соответствует живому сайту. Для интерактивной версии посетите\n    ${live}. ${others} · ${back}`,
    license: ({ year, holder, name, url }) =>
      `© ${year} ${holder}. Контент распространяется по лицензии <a href="${url}">${name}</a> — можно просматривать и делиться с указанием авторства, без коммерческого использования и без производных работ.`,
  },
};

function langsList(lang) {
  // Self first, then every other locale in config order — relative
  // hrefs, unlike the index mirror's absolute ones. Matches the markup
  // these pages have always had.
  const order = [lang, ...otherLocales(lang).map((l) => l.code)];
  return order
    .map((code) => {
      const l = locales.find((x) => x.code === code);
      return `<li><a href="${mirrorRelPath(lang, code, "cv.html")}" hreflang="${code}">${l.label}</a></li>`;
    })
    .join("\n    ");
}

// Page chrome for a locale this file has no entry for — a fork that adds
// { code: "de" } to site.config.mjs before translating these — falls back
// to the default locale rather than crashing on UI[lang].x. The result is
// an untranslated page, which is visibly wrong and therefore fixable; a
// TypeError during the build is neither.
const uiFor = (lang) => UI[lang] ?? UI[defaultLocale.code] ?? UI.en;

function noticeText(lang) {
  const U = uiFor(lang);
  const live = siteUrl("cv.html");
  const liveLink = `<a href="${live}">${displayUrl(live)}</a>`;
  // English language names on purpose, on every locale's page — see the
  // matching note in mirror-index.mjs.
  const others = otherLocales(lang)
    .map((l) =>
      U.otherVersion(
        languageName(l.code, "en"),
        mirrorRelPath(lang, l.code, "cv.html"),
        displayUrl(mirrorUrl(l.code, "cv.html"))
      )
    )
    .join(" ");
  const back = `<a href="index.html">${U.back}</a>`;
  // With one locale `others` is empty, which would leave the notice
  // reading "... for the live version.  · ← back".
  return others
    ? U.notice(liveLink, others, back)
    : U.notice(liveLink, others, back).replace(/\s*·\s*/, " ").replace(/\s{2,}/g, " ");
}

// See the matching helper in mirror-index.mjs.
function alternateLinks(file) {
  // Nothing to declare with one locale — a self-referencing hreflang
  // plus an x-default pointing at the same page is noise, and the live
  // pages' <head> already makes the same call (see head.mjs).
  if (locales.length < 2) return "";
  // Leading newline rather than a trailing one: the call site appends
  // this to the canonical link's line, so returning "" leaves no blank
  // line behind in a single-locale build.
  return ["", 
    ...locales.map((l) => {
      const href = isDefaultLocale(l.code) ? siteUrl(file) : mirrorUrl(l.code, file);
      return `<link rel="alternate" hreflang="${l.code}" href="${href}">`;
    }),
    `<link rel="alternate" hreflang="x-default" href="${siteUrl(file)}">`,
  ].join("\n");
}

const licenseText = (lang) => uiFor(lang).license(LICENSE_CONTENT);

function renderJob(job, lang, U) {
  const bullets = job.bullets[lang].map((b) => `      <li>${escapeHtml(b)}</li>`).join("\n");
  return `  <div class="job">
    <div class="when">${escapeHtml(jobWhenLine(job, lang))}</div>
    <div class="title">${escapeHtml(job.title[lang])}</div>
    <ul>
${bullets}
    </ul>
    <div class="stack">${U.tech} ${escapeHtml(job.tech)}</div>
  </div>`;
}

// Shared building blocks for both the full llm/cv.html mirror and the
// live cv.html's <noscript> fallback — kept as named fragments (not one
// flat string) so each caller can compose only the pieces it needs, in
// the order it needs, without regex-stripping the other's markup.
function buildCvFragments(lang) {
  const U = uiFor(lang);
  const name = PERSON.name[lang];

  const linksRow = SOCIALS.filter((s) => s.contexts.includes("cv") && s.sameAs)
    .map((s) => `<a href="${s.href}" rel="me noopener noreferrer">${escapeHtml(s.label)}</a>`)
    .join(" ·\n      ");

  const skillsRowsHtml = SKILLS.filter((s) => s.contexts.includes("cv"))
    .map((s) => `    <tr><th>${escapeHtml(s.key[lang])}</th><td>${escapeHtml(s.val)}</td></tr>`)
    .join("\n");

  const certsHtml = CERTS.map((c) => `    <li>${escapeHtml(c.yr)} — ${escapeHtml(c.name)}</li>`).join("\n");

  const languagesHtml = LANGUAGES.map((l) => `    <tr><th>${escapeHtml(l.name[lang])}</th><td>${escapeHtml(l.sub[lang])}</td></tr>`).join("\n");

  const jobsHtml = JOBS.map((j) => renderJob(j, lang, U)).join("\n\n");

  return {
    header: `  <h1>${escapeHtml(name)}</h1>
  <p class="role">${PERSON.roleTagline[lang]}</p>
  <p class="meta">${PERSON.metaLine[lang]}</p>`,

    // See the matching note in mirror-index.mjs.
    langs: locales.length < 2 ? "" : `  <ul class="langs" aria-label="${U.langsAria}">
    ${langsList(lang)}
  </ul>`,

    resume: `  <table>
    <tr><th>Email</th><td><a href="mailto:${PERSON.email}">${PERSON.email}</a></td></tr>
    <tr><th>${U.links}</th><td>
      ${linksRow}
    </td></tr>
  </table>

  <h2>${U.about}</h2>
  <p>
${escapeHtml(aboutCvParagraph(lang))}
  </p>

  <h2>${U.experience}</h2>

${jobsHtml}

  <h2>${U.education}</h2>
  <p>${escapeHtml(EDUCATION.university[lang])} — ${escapeHtml(EDUCATION.place[lang])}, ${EDUCATION.year}<br>
  ${escapeHtml(EDUCATION.field[lang])}</p>

  <h2>${U.certifications}</h2>
  <ul>
${certsHtml}
  </ul>

  <h2>${U.languages}</h2>
  <table>
${languagesHtml}
  </table>

  <h2 id="skills">${U.skills}</h2>
  <table>
${skillsRowsHtml}
  </table>`,

    notices: `  <p class="notice">
    ${noticeText(lang)}
  </p>
  <p class="notice license">
    ${licenseText(lang)}
  </p>`,
  };
}

export function renderCvMirror(lang) {
  const stylesheetHref = mirrorRootRelPath(lang, "style.css");
  // See the matching comment in mirror-index.mjs: EN defers to the live
  // cv.html, RU self-canonicalizes since there's no distinct live RU URL.
  const canonicalHref = isDefaultLocale(lang) ? siteUrl("cv.html") : mirrorUrl(lang, "cv.html");
  const U = uiFor(lang);
  const f = buildCvFragments(lang);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(U.title)}</title>
<meta name="description" content="${escapeHtml(U.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonicalHref}">${alternateLinks("cv.html")}
<link rel="stylesheet" href="${stylesheetHref}">

${jsonLdScript(buildCvJsonLd(lang))}
</head>
<body>
<main>
${f.header}

${f.langs}

${f.resume}

${f.notices}
</main>
</body>
</html>
`;
}

// <noscript> fallback for the live cv.html — just the substantive resume
// content (name/role/meta + the full resume table-through-skills block).
// Deliberately omits the langs switcher and the "this is a mirror" /
// license notices: cv.html already has its own real (non-generated)
// language toggle and footer, so repeating those here would just be
// dead weight for the one audience — non-JS clients — this is for.
export function renderCvNoscript(lang) {
  const f = buildCvFragments(lang);
  return `<noscript>
${f.header}

${f.resume}
</noscript>`;
}
