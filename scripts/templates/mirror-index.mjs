// Renders llm/index.html (lang='en') and llm/ru/index.html (lang='ru').

import { PERSON, SOCIALS, SKILLS, LICENSE_CONTENT } from "../../content/site-data.mjs";
import { escapeHtml } from "../lib/html.mjs";
import { aboutParagraph } from "../lib/content.mjs";
import { buildIndexJsonLd, jsonLdScript } from "./jsonld.mjs";

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
  },
};

function noticeText(lang) {
  return lang === "ru"
    ? `Это статическая HTML-версия <a href="https://nikita.sh/">nikita.sh</a>,\n    опубликованная для краулеров и AI-агентов, которые не выполняют JavaScript.\n    Контент соответствует живому сайту. Для интерактивной версии посетите\n    <a href="https://nikita.sh/">nikita.sh</a>. English version: <a href="https://nikita.sh/llm/">nikita.sh/llm/</a>`
    : `This is a plain-HTML mirror of <a href="https://nikita.sh/">nikita.sh</a>,\n    published for crawlers and AI agents that don't execute JavaScript. Content\n    matches the live site. Humans should visit <a href="https://nikita.sh/">nikita.sh</a>\n    for the interactive version. Russian version: <a href="https://nikita.sh/llm/ru/">nikita.sh/llm/ru/</a>`;
}

function licenseText(lang) {
  const { holder, year, name, url } = LICENSE_CONTENT;
  return lang === "ru"
    ? `© ${year} ${holder}. Контент распространяется по лицензии <a href="${url}">${name}</a> — можно просматривать и делиться с указанием авторства, без коммерческого использования и без производных работ.`
    : `© ${year} ${holder}. Content licensed <a href="${url}">${name}</a> — view and share with attribution, no commercial use, no derivatives.`;
}

export function renderIndexMirror(lang) {
  const U = UI[lang];
  const stylesheetHref = lang === "ru" ? "../style.css" : "style.css";
  const name = lang === "ru" ? PERSON.nameRu : PERSON.nameEn;
  // EN defers to the live (JS-rendered) homepage, since it's the same
  // content; RU has no distinct live URL to defer to (the live site
  // switches language client-side on the same URL), so it self-canonicalizes
  // instead of wrongly pointing at the English live page — canonical is for
  // same-content duplicates, not cross-language relationships (that's what
  // hreflang, below, is for).
  const canonicalHref = lang === "ru" ? "https://nikita.sh/llm/ru/" : "https://nikita.sh/";

  const skillsRows = SKILLS.filter((s) => s.contexts.includes("index")).map((s) => [s.key[lang], escapeHtml(s.val)]);
  const contactRows = SOCIALS.filter((s) => s.contexts.includes("index")).map((s) => [
    s.label,
    `<a href="${s.href}"${s.key === "email" ? "" : ' rel="me noopener noreferrer"'}>${escapeHtml(s.display)}</a>`,
  ]);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(U.title)}</title>
<meta name="description" content="${escapeHtml(U.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonicalHref}">
<link rel="alternate" hreflang="en" href="https://nikita.sh/">
<link rel="alternate" hreflang="ru" href="https://nikita.sh/llm/ru/">
<link rel="alternate" hreflang="x-default" href="https://nikita.sh/">
<link rel="stylesheet" href="${stylesheetHref}">

${jsonLdScript(buildIndexJsonLd(lang))}
</head>
<body>
<main>
  <h1>${escapeHtml(name)}</h1>
  <p class="role">${PERSON.roleTagline[lang]}</p>
  <p class="meta">${PERSON.metaLine[lang]}</p>

  <ul class="langs" aria-label="${U.langsAria}">
    <li><a href="https://nikita.sh/llm/" hreflang="en">EN</a></li>
    <li><a href="https://nikita.sh/llm/ru/" hreflang="ru">RU</a></li>
  </ul>

  <h2>${U.about}</h2>
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
  </table>

  <h2>${U.resume}</h2>
  <p>${U.resumeLine("cv.html", `nikita.sh/llm/${lang === "ru" ? "ru/" : ""}cv.html`)}</p>

  <p class="notice">
    ${noticeText(lang)}
  </p>
  <p class="notice license">
    ${licenseText(lang)}
  </p>
</main>
</body>
</html>
`;
}
