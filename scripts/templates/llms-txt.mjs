/* ================================================================
   scripts/templates/llms-txt.mjs — public/llms.txt (llmstxt.org).

   Split of responsibilities: the prose a human writes lives in
   LLMS_TXT in content/site-data.mjs; everything with a URL, a locale
   or a link list in it is derived here. That matters most for the
   mirror sections — a fork with one locale, or with mirrors switched
   off, must not advertise /llm/ru/ pages that were never generated.
   ================================================================ */

import { SITE } from "../../site.config.mjs";
import { PERSON, SOCIALS, LLMS_TXT } from "../../content/site-data.mjs";
import { siteUrl, mirrorUrl, host, locales, defaultLocale, languageName, languageEndonym } from "../lib/site-urls.mjs";

// "Nikita Chernozipunnikov / Никита Чернозипунников" — the person's
// name in every locale the site is published in, so a crawler matching
// on either spelling finds the same file.
function titleLine() {
  const names = locales.map((l) => PERSON.name[l.code]).filter(Boolean);
  return `# ${[...new Set(names)].join(" / ")}`;
}

// Explains what /llm/ is. Only true when mirrors are on, so it's built
// rather than authored — see the header note.
function mirrorParagraph() {
  // Exonyms here (this paragraph is English prose on an English
  // default site), endonyms in the section headings below.
  const langs = locales.map((l) => languageName(l.code));
  const list =
    langs.length === 1 ? langs[0] : `${langs.slice(0, -1).join(", ")} and ${langs[langs.length - 1]}`;
  const intro = `The homepage (${host}) is an interactive JS terminal, available in\n${list}.`;
  if (!SITE.mirrors.enabled) return intro;
  return `${intro} Plain-HTML mirrors with the same content are\npublished below for crawlers/agents that don't execute JavaScript.`;
}

export function renderLlmsTxt() {
  const out = [];

  out.push(titleLine());
  out.push("");
  out.push(LLMS_TXT.summary.map((line) => `> ${line}`).join("\n"));
  out.push("");
  out.push(LLMS_TXT.facts.map((f) => `- ${f.label}: ${f.value}`).join("\n"));
  out.push(`- Contact: ${PERSON.email}`);
  out.push("");
  out.push(mirrorParagraph());
  out.push("");
  out.push(LLMS_TXT.note);

  // One section per locale, pointing at that locale's mirror. Skipped
  // entirely when mirrors are off — there'd be nothing to link to.
  if (SITE.mirrors.enabled) {
    for (const l of locales) {
      out.push("");
      out.push(`## ${languageEndonym(l.code)}`);
      const labels = uiFor(l.code);
      out.push(`- [${labels.profile}](${mirrorUrl(l.code, "")})`);
      out.push(`- [${labels.cv}](${mirrorUrl(l.code, "cv.html")})`);
    }
  }

  out.push("");
  out.push("## Live site (interactive, JS required)");
  out.push(`- [Homepage](${siteUrl("")})`);
  out.push(`- [CV](${siteUrl("cv.html")})`);

  // Same `sameAs` flag the JSON-LD uses, so the two never disagree,
  // narrowed to the résumé's contact set: llms.txt is a professional
  // brief, so it gets the profiles cv.html shows, not the extra
  // personal ones the terminal lists.
  const profiles = SOCIALS.filter((s) => s.sameAs && s.contexts.includes("cv"));
  if (profiles.length) {
    out.push("");
    out.push(`## ${LLMS_TXT.elsewhereHeading}`);
    for (const s of profiles) out.push(`- [${s.label}](${s.href})`);
  }

  return out.join("\n") + "\n";
}

// Link labels per locale. Falls back to the default locale's wording,
// then to English, for any locale not listed — so adding a locale to
// site.config.mjs produces a correct (if untranslated) file rather than
// a crash or the word "undefined".
const UI = {
  en: { profile: "Profile", cv: "CV" },
  ru: { profile: "Профиль", cv: "Резюме" },
};

const uiFor = (code) => UI[code] ?? UI[defaultLocale.code] ?? UI.en;
