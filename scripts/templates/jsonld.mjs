// JSON-LD builders shared by the mirror pages and live cv.html.
// Always produced via plain JS objects + JSON.stringify — a hand-typed
// JSON-LD block can go silently invalid on a missing comma; a generated
// one can't, by construction.

import { PERSON, SOCIALS, JOBS, CERTS, EDUCATION, JSONLD } from "../../content/site-data.mjs";
import { siteUrl, host, localeCodes } from "../lib/site-urls.mjs";

// WebSite+Person graph used by llm/index.html + llm/ru/index.html.
export function buildIndexJsonLd(lang) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl("")}#website`,
        "name": host,
        "url": siteUrl(""),
        "inLanguage": localeCodes,
      },
      {
        "@type": "Person",
        "@id": `${siteUrl("")}#owner`,
        "name": PERSON.name[lang],
        "jobTitle": PERSON.jobTitle[lang],
        "url": siteUrl(""),
        "image": siteUrl(PERSON.photoPath),
        "email": `mailto:${PERSON.email}`,
        "address": { "@type": "PostalAddress", "addressLocality": PERSON.addressLocality[lang], "addressCountry": PERSON.addressCountry },
        "knowsAbout": JSONLD.knowsAbout[lang],
        "knowsLanguage": JSONLD.knowsLanguage,
        "sameAs": SOCIALS.filter((s) => s.sameAs).map((s) => s.href),
        "seeks": { "@type": "Demand", "name": JSONLD.demandName },
      },
    ],
  };
}

// ProfilePage+Person used by cv.html (always the English version — the
// live page's <head> JSON-LD isn't re-rendered by the RU/EN toggle today,
// matching that existing behavior) and llm/cv.html + llm/ru/cv.html.
export function buildCvJsonLd(lang) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "@id": `${siteUrl("")}#owner`,
      "name": PERSON.name[lang],
      "jobTitle": PERSON.jobTitle[lang],
      "url": siteUrl(""),
      "image": siteUrl(PERSON.photoPath),
      "email": `mailto:${PERSON.email}`,
      "address": { "@type": "PostalAddress", "addressLocality": PERSON.addressLocality[lang], "addressCountry": PERSON.addressCountry },
      "alumniOf": { "@type": "EducationalOrganization", "name": EDUCATION.university[lang] },
      "sameAs": SOCIALS.filter((s) => s.contexts.includes("cv") && s.sameAs).map((s) => s.href),
      "seeks": { "@type": "Demand", "name": JSONLD.demandName },
      "knowsLanguage": JSONLD.knowsLanguage,
      "knowsAbout": JSONLD.knowsAbout[lang],
      "hasCredential": CERTS.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        "name": c.name,
        "dateCreated": c.yr,
      })),
      "hasOccupation": JOBS.filter((j) => j.inOccupationHighlights).map((j) => ({
        "@type": "Occupation",
        "name": j.title[lang],
        "hiringOrganization": {
          "@type": "Organization",
          "name": j.org.name,
          ...(j.org.url ? { url: j.org.url } : {}),
        },
      })),
    },
  };
}

export function jsonLdScript(obj) {
  return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
}
