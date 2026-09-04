// Renders llm/index.html (lang='en') and llm/ru/index.html (lang='ru').

import { PERSON, SOCIALS, SKILLS, LICENSE_CONTENT } from "../../content/site-data.mjs";
import { escapeHtml } from "../lib/html.mjs";
import { aboutParagraph } from "../lib/content.mjs";
import { buildIndexJsonLd, jsonLdScript } from "./jsonld.mjs";
import { siteUrl, mirrorUrl, host, displayUrl, locales, isDefaultLocale, mirrorRootRelPath, otherLocales, languageName } from "../lib/site-urls.mjs";

const UI = {
  en: {
    title: "Nikita Chernozipunnikov — DevOps / SRE",
    description: "Nikita Chernozipunnikov — DevOps / SRE Systems Engineer, 11 years experience. AWS, OpenStack, Kubernetes, Docker, Linux.",
    langsAria: "language versions",
    about: "About",
    skills: "Skills",
    skillsBreakdown: 'Full skill breakdown: <a href="cv.html#skills">cv.html#skills</a>',
    contact: "Contact",
    resume: "Full résumé",
    resumeLine: (href, label) => `<a href="${href}">${label}</a> — full work history, education, certifications, and languages.`,
    notice: (live, others) =>
      `This is a plain-HTML mirror of ${live},\n    published for crawlers and AI agents that don't execute JavaScript. Content\n    matches the live site. Humans should visit ${live}\n    for the interactive version. ${others}`,
    license: ({ year, holder, name, url }) =>
      `© ${year} ${holder}. Content licensed <a href="${url}">${name}</a> — view and share with attribution, no commercial use, no derivatives.`,
  },
  ru: {
    title: "Никита Чернозипунников — DevOps / SRE",
    description: "Никита Чернозипунников — DevOps / SRE, системный инженер, 11 лет опыта. AWS, OpenStack, Kubernetes, Docker, Linux.",
    langsAria: "языковые версии",
    about: "О себе",
    skills: "Навыки",
    skillsBreakdown: 'Полный список навыков: <a href="cv.html#skills">cv.html#skills</a>',
    contact: "Контакты",
    resume: "Полное резюме",
    resumeLine: (href, label) => `<a href="${href}">${label}</a> — полный опыт работы, образование, сертификаты и языки.`,
    notice: (live, others) =>
      `Это статическая HTML-версия ${live},\n    опубликованная для краулеров и AI-агентов, которые не выполняют JavaScript.\n    Контент соответствует живому сайту. Для интерактивной версии посетите\n    ${live}. ${others}`,
    license: ({ year, holder, name, url }) =>
      `© ${year} ${holder}. Контент распространяется по лицензии <a href="${url}">${name}</a> — можно просматривать и делиться с указанием авторства, без коммерческого использования и без производных работ.`,
  },
};

/**
 * "<Language> version: <link>" for every locale but this one, in config
 * order. Deliberately always named in English, on both the EN and the
 * RU mirror, exactly as the hand-written pages had it: these pages
 * exist for crawlers, and an English language name is the one a crawler
 * of any locale is most likely to recognise.
 */
function otherVersionsHtml(lang, file, urlOf) {
  return otherLocales(lang)
    .map((l) => {
      const url = urlOf(l.code);
      return `${languageName(l.code, "en")} version: <a href="${url}">${displayUrl(mirrorUrl(l.code, file))}</a>`;
    })
    .join(" ");
}

function noticeText(lang) {
  const live = siteUrl("");
  const liveLink = `<a href="${live}">${host}</a>`;
  const others = otherVersionsHtml(lang, "", (code) => mirrorUrl(code, ""));
  return UI[lang].notice(liveLink, others);
}

// Default locale -> the live page; every other locale -> its mirror
// (the live site switches language client-side on one URL, so a mirror
// is the only distinct per-language URL that exists).
function alternateLinks(file) {
  return [
    ...locales.map((l) => {
      const href = isDefaultLocale(l.code) ? siteUrl(file) : mirrorUrl(l.code, file);
      return `<link rel="alternate" hreflang="${l.code}" href="${href}">`;
    }),
    `<link rel="alternate" hreflang="x-default" href="${siteUrl(file)}">`,
  ].join("\n");
}

const licenseText = (lang) => UI[lang].license(LICENSE_CONTENT);

// Shared building blocks for both the full llm/index.html mirror and the
// live index.html's <noscript> fallback — kept as named fragments (not one
// flat string) so each caller can compose only the pieces it needs, in the
// order it needs, without regex-stripping the other's markup. Mirrors the
// buildCvFragments pattern in mirror-cv.mjs.
function buildIndexFragments(lang) {
  const U = UI[lang];
  const name = PERSON.name[lang];

  const skillsRows = SKILLS.filter((s) => s.contexts.includes("index")).map((s) => [s.key[lang], escapeHtml(s.val)]);
  const contactRows = SOCIALS.filter((s) => s.contexts.includes("index")).map((s) => [
    s.label,
    `<a href="${s.href}"${s.key === "email" ? "" : ' rel="me noopener noreferrer"'}>${escapeHtml(s.display)}</a>`,
  ]);

  return {
    // Kept apart so renderIndexNoscript can skip the <h1> — the live
    // index.html already has a permanent, always-present
    // <h1 class="sr-only"> of its own (added for screen readers/SEO
    // regardless of JS state), so repeating one inside <noscript> would
    // put two <h1>s in the parsed HTML whenever JS doesn't execute.
    // renderIndexMirror (the standalone /llm/ page, which has no other
    // heading) still uses both.
    nameHeading: `  <h1>${escapeHtml(name)}</h1>`,
    roleMeta: `  <p class="role">${PERSON.roleTagline[lang]}</p>
  <p class="meta">${PERSON.metaLine[lang]}</p>`,

    langs: `  <ul class="langs" aria-label="${U.langsAria}">
${locales.map((l) => `    <li><a href="${mirrorUrl(l.code, "")}" hreflang="${l.code}">${l.label}</a></li>`).join("\n")}
  </ul>`,

    content: `  <h2>${U.about}</h2>
  <p>
${escapeHtml(aboutParagraph(lang))}
  </p>

  <h2>${U.skills}</h2>
  <table>
${skillsRows.map(([k, v]) => `    <tr><th>${escapeHtml(k)}</th><td>${v}</td></tr>`).join("\n")}
  </table>
  <p>${U.skillsBreakdown}</p>

  <h2>${U.contact}</h2>
  <table>
${contactRows.map(([k, v]) => `    <tr><th>${escapeHtml(k)}</th><td>${v}</td></tr>`).join("\n")}
  </table>`,

    resumePointer: `  <h2>${U.resume}</h2>
  <p>${U.resumeLine("cv.html", displayUrl(mirrorUrl(lang, "cv.html")))}</p>`,

    notices: `  <p class="notice">
    ${noticeText(lang)}
  </p>
  <p class="notice license">
    ${licenseText(lang)}
  </p>`,
  };
}

export function renderIndexMirror(lang) {
  const U = UI[lang];
  const stylesheetHref = mirrorRootRelPath(lang, "style.css");
  // EN defers to the live (JS-rendered) homepage, since it's the same
  // content; RU has no distinct live URL to defer to (the live site
  // switches language client-side on the same URL), so it self-canonicalizes
  // instead of wrongly pointing at the English live page — canonical is for
  // same-content duplicates, not cross-language relationships (that's what
  // hreflang, below, is for).
  const canonicalHref = isDefaultLocale(lang) ? siteUrl("") : mirrorUrl(lang, "");
  const f = buildIndexFragments(lang);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(U.title)}</title>
<meta name="description" content="${escapeHtml(U.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonicalHref}">
${alternateLinks("")}
<link rel="stylesheet" href="${stylesheetHref}">

${jsonLdScript(buildIndexJsonLd(lang))}
</head>
<body>
<main>
${f.nameHeading}
${f.roleMeta}

${f.langs}

${f.content}

${f.resumePointer}

${f.notices}
</main>
</body>
</html>
`;
}

// <noscript> fallback for the live index.html — header + the substantive
// About/Skills/Contact content only. Omits the langs switcher and the
// mirror/license notices, matching cv.html's noscript precedent (dead
// weight for the one audience — non-JS clients — this is for).
export function renderIndexNoscript(lang) {
  const f = buildIndexFragments(lang);
  return `<noscript>
${f.roleMeta}

${f.content}
</noscript>`;
}
